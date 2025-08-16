export interface Group {
  form: string
  year: number
  id: string
  name: string
  details: string
}

export interface Teacher {
  id: string
  name: string
}

export interface Room {
  id: string
  name: string
  capacity: number
}

export interface Schedule {
  [date: string]: {
    [number: number]: Lecture[]
  }
}

// One of the hardships of making a schedule app is not being able to use the word "class" for, uh, classes.
export interface Lecture {
  room: string
  date: string
  group_id: string
  groups?: string[]
  id: string
  group?: string
  subgroup?: string
  name: string
  number: number
  teacher_name: string
  time: string
  type: 'сем' | 'лек' | 'спец' | 'экзамен' | (string & {})
  week_day: string
}