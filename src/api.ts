import ky from 'ky'
import type {Group, Lecture, Room, Schedule, Teacher} from '@/types.ts'
import {md5} from 'js-md5'

const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL
})

export async function getGroups({form, year}: { form: string, year: number | string }): Promise<Group[]> {
  const formData = new FormData()
  formData.append('0', JSON.stringify({eduform: form, course: year.toString()}))
  const data: Array<{
    data: string
    direction: string
    id: string
    profile: string
  }> = await api.post(`Get_Flows_List`, {
    body: formData
  }).json()

  return data.map(g => ({
    id: g.id,
    name: g.data,
    details: [g.direction, g.profile].join(' › '),
    form,
    year: parseInt(year.toString())
  }))
}

export async function getTeachers(): Promise<Teacher[]> {
  const data: Array<{
    id: string
    data: string
  }> = await api.get('Get_Teachers_List').json()

  return data.map(t => ({
    id: t.id,
    name: t.data
  }))
}

export async function getRooms(): Promise<Room[]> {
  const data: Array<{
    id: string
    data: string
  }> = await api.post(`Get_Rooms_List`).json()

  return data.map(room => {
    let [name, capacity] = room.data.split(' - вместимость: ')
    capacity = capacity.split(',')[0]
    return {
      id: room.id,
      name,
      capacity: parseInt(capacity)
    }
  })
}

export async function getSchedule({group, teacher, room}: {
  group?: Group
  teacher?: Teacher
  room?: Room
} = {}): Promise<Schedule> {
  if (!group && !teacher && !room) throw new Error('No input')
  if ([group, teacher, room].filter(Boolean).length > 1) throw new Error('Too much input')

  const formData = new FormData()
  if (group) {
    formData.append('eduform', group.form)
    formData.append('course', group.year.toString())
    formData.append('flow', group.id)
    formData.append('intervalMode', '4')
    formData.append('menuMode', 'flow')
  } else if (teacher) {
    formData.append('teacher', teacher.id)
    formData.append('intervalMode', '4')
    formData.append('menuMode', 'teacher')
  } else if (room) {
    formData.append('room', room.id)
    formData.append('intervalMode', '4')
    formData.append('menuMode', 'room')
  }

  const data: {
    tblData: Array<{
      date: string
      pairs: Array<{
        pair: number
        flows: Array<{
          flow: string
          group?: string
          course?: string
          lessontype: string
          room: string
          subgroup: string
          subject: string
          teacher: string
        }>
      }>
    }>
  } = await api.post(`Get_Schedule_Table`, {
    body: formData
  }).json()

  const schedule: Schedule = {}

  // Things get a bit messy here. But it works.
  for (let day of data.tblData) {
    for (let pair of day.pairs) {
      for (let rawLecture of pair.flows) {
        const date = day.date.split(' ')[0]
        const number = Number(pair.pair)
        const type = rawLecture.lessontype
        const name = rawLecture.subject
        let flow = rawLecture.flow ? `${rawLecture.flow} / ${rawLecture.course} курс` : undefined
        const group = rawLecture.group && rawLecture.group !== '-' ? rawLecture.group : undefined
        const subgroup = rawLecture.subgroup && rawLecture.subgroup !== '-' ? rawLecture.subgroup : undefined
        const subgroupText = [group ? `группа ${group}` : '', subgroup ? `подгруппа ${subgroup}` : ''].filter(Boolean).join(', ')
        if (flow && subgroupText) flow += ` (${subgroupText})`

        if (!schedule[date]) schedule[date] = {}
        if (!schedule[date][number]) schedule[date][number] = []

        // API sometimes returns '-' instead of a room name, even when the room is known
        const roomName = room?.name || rawLecture.room || ''
        const teacherName = rawLecture.teacher || teacher?.name || ''

        const lecture: Lecture = {
          date,
          week_day: day.date.split(' ')[1],
          number,
          group_id: rawLecture.flow,
          groups: flow ? [flow] : [],
          group,
          subgroup,
          room: roomName,
          teacher_name: teacherName,
          type,
          name,
          time: '',
          id: md5(`${date}:${number}:${name}:${teacherName}:${subgroup}`)
        }

        const sameLecture = schedule[date][number].find(c =>
            c.name === name
            && c.teacher_name === lecture.teacher_name
            && c.room === lecture.room
        )
        if (sameLecture && flow) {
          sameLecture.groups?.push(flow)
        } else {
          schedule[date][number].push(lecture)
        }
      }
    }
  }

  return schedule
}