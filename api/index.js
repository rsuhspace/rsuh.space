const TIME_SLOTS = {
  '1': {start: '08:45', end: '10:05'},
  '2': {start: '10:15', end: '11:35'},
  '3': {start: '12:10', end: '13:30'},
  '4': {start: '13:40', end: '15:00'},
  '5': {start: '15:35', end: '16:55'},
  '6': {start: '17:05', end: '18:25'},
  '7': {start: '18:50', end: '20:10'},
  '8': {start: '20:20', end: '21:40'}
}

const BASE_URL_V2 = process.env.API_URL

async function proxyRequest(event) {
  const fetch = (await import('node-fetch')).default

  const params = event.queryStringParameters
  const method = params.method.replace(/^(\/v2)?\//, '')
  delete params.method
  let body = event.body ? atob(event.body) : undefined

  const data = await fetch(`${BASE_URL_V2}/${method}${Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : ''}`, {
    method: event.httpMethod,
    headers: {
      'Content-Type': event.headers['Content-Type']
    },
    body
  })
  return await data.json()
}

async function generateICS(event) {
  const {createEvents} = (await import('ics')).default

  const query = event.queryStringParameters
  delete query.method
  delete query.ics

  const formData = new FormData()
  for (const key in query) {
    formData.append(key, query[key])
  }
  formData.append('intervalMode', '4')
  formData.append('menuMode', query.teacher ? 'teacher' : 'flow')

  const data = await (await fetch(`${BASE_URL_V2}/Get_Schedule_Table`, {
    method: 'POST',
    body: formData
  })).json()

  const calendarName = data.item
  const knownLectureTypes = ['лек', 'сем', 'экзамен']
  const lectureTypes = query.types?.split(',') || [...knownLectureTypes, 'other']

  const eventList = []
  for (const day of data.tblData) {
    const date = day.date.split(' ')[0].split('.').map(Number).reverse()

    for (const lesson of day.pairs) {
      const time = TIME_SLOTS[lesson.pair.toString()]
      const startTime = time.start.split(':').map(Number)
      const endTime = time.end.split(':').map(Number)

      for (const flow of lesson.flows) {
        if (
            !lectureTypes.includes(flow.lessontype) &&
            !(!knownLectureTypes.includes(flow.lessontype) && lectureTypes.includes('other'))
        ) {
          continue
        }

        const lessonObject = {
          start: [...date, startTime[0] - 3, startTime[1]],
          startInputType: 'utc',
          end: [...date, endTime[0] - 3, endTime[1]],
          title: flow.subject,
          location: `Аудитория: ${flow.room}`,
          description: [flow.teacher ? `Преподаватель: ${flow.teacher}` : '', `Тип занятия: ${flow.lessontype}`].filter(Boolean).join('\n'),
          groups: [flow.flow || data.item],
          calName: calendarName || 'Расписание РГГУ'
        }

        const sameLesson = eventList.find(l =>
            l.title === lessonObject.title
            && l.start.join('-') === lessonObject.start.join('-')
            && l.teacher === lessonObject.teacher
            && l.location === lessonObject.location
        )
        if (sameLesson) {
          sameLesson.groups.push(flow.flow || data.item)
        } else {
          eventList.push(lessonObject)
        }
      }
    }
  }

  for (const event of eventList) {
    if (event.groups) {
      event.description += `\n\n`
      if (event.groups.length === 1) event.description += `Группа: ${event.groups[0]}`
      else event.description += `Группы:\n${event.groups.join('\n')}`
      delete event.groups
    }
  }

  const icsData = createEvents(eventList)
  return icsData.value
}

module.exports.handler = async function (event) {
  try {
    const query = event.queryStringParameters
    let method = query.method || ''

    let isCalendar = false
    if (method.endsWith('.ics') || query.ics === 'true') {
      isCalendar = true
      method = method?.replace(/\.ics$/, '')
    }

    if (isCalendar && method.endsWith('/Get_Schedule_Table')) {
      return {
        statusCode: 200,
        body: await generateICS(event),
      }
    }

    const data = await proxyRequest(event)

    return {
      statusCode: 200,
      body: method.startsWith('/v2/') ? JSON.stringify({status: 'success', data}) : data
    }
  } catch (e) {
    console.error(e)
    return {
      statusCode: 500,
      body: JSON.stringify(e)
    }
  }
}