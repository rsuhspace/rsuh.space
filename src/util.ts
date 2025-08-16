import dayjs, {type Dayjs} from 'dayjs'
import {DATE_FORMAT} from '@/constants.ts'
import {nextTick} from 'vue'

export function getReadableGroupForm(group: string) {
  const replaceRules = [
    {
      '1': null,
      '2': 'Второе высшее'
    },
    {
      'Б': 'Бак / спец',
      'М': 'Магистратура'
    },
    {
      'О': 'очная',
      'ОЗ': 'очно-заочная',
      'З': 'заочная',
      'ЗДОТ': 'дистанционная',
      'ОЗДОТ': 'очно-заочная дистанционная'
    } as const
  ]

  const parts: [keyof typeof replaceRules[0], keyof typeof replaceRules[1], keyof typeof replaceRules[2]] = group.split('-') as [any, any, any]
  const joinedString = parts.map((part, i) => {
    if (i === 1 && parts[0] === '2') return
    return replaceRules[i][part]
  }).filter(Boolean).join(', ')
  return joinedString.charAt(0).toUpperCase() + joinedString.slice(1)
}

export function abbreviateName(name: string) {
  if (name.split(' ').length === 3 && !name.includes('.')) {
    const nameParts = name.split(' ')
    return `${nameParts[0]} ${nameParts[1][0]}. ${nameParts[2][0]}.`
  }
  return name
}

export function formatDateRange(start: Dayjs, end: Dayjs) {
  let startFormat = 'D'
  let separator = '–'
  if (end.isAfter(start, 'month')) {
    startFormat = 'D MMMM'
    separator = ' – '
  }
  return `${start.format(startFormat)}${separator}${end.format('D MMMM')}`
}

export function scrollToDate(date?: Dayjs, options?: ScrollOptions) {
  if (!date) date = dayjs()
  if (date.weekday() === 6) date = date.add(1, 'day')

  window.dispatchEvent(new CustomEvent('scroll-to-date', {detail: date}))

  const element = document.querySelector(`[data-date="${date.format(DATE_FORMAT)}"]`)
  if (element) {
    nextTick(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        ...options
      })
    })
  }
}

export function clampDate(date: Dayjs, min: Dayjs, max: Dayjs) {
  return dayjs.max(dayjs.min(date, max), min)
}