export const GROUP_FORMS = {
  '1': '1-Б-З',
  '2': '1-Б-ЗДОТ',
  '3': '1-Б-О',
  '4': '1-Б-ОЗ',
  '5': '1-М-З',
  '6': '1-М-ЗДОТ',
  '7': '1-М-О',
  '8': '1-М-ОЗ',
  '9': '2-Б-З',
  '10': '2-Б-ЗДОТ',
  '11': '2-Б-ОЗ',
  '12': '1-М-ОЗДОТ'
} as const

export const TIME_SLOTS = [
  {start: '08:45', end: '10:05'},
  {start: '10:15', end: '11:35'},
  {start: '12:10', end: '13:30'},
  {start: '13:40', end: '15:00'},
  {start: '15:35', end: '16:55'},
  {start: '17:05', end: '18:25'},
  {start: '18:50', end: '20:10'},
  {start: '20:20', end: '21:40'}
] as const

export const LECTURE_TYPES = {
  'сем': 'Семинар',
  'лек': 'Лекция',
  'экзамен': 'Экзамен',
} as const

export const DATE_FORMAT = 'DD.MM.YYYY'