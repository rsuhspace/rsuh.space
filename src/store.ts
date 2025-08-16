import {defineStore} from 'pinia'
import type {Group, Room, Schedule, Teacher} from '@/types.ts'
import dayjs from 'dayjs'
import Cookies from 'universal-cookie'

export const useStore = defineStore('schedule', {
  state() {
    return {
      groups: [] as Group[],
      teachers: [] as Teacher[],
      rooms: [] as Room[],
      group: {
        form: undefined,
        year: undefined,
        id: undefined,
        name: undefined,
      } as Partial<Group>,
      teacher: undefined as Teacher | undefined,
      room: undefined as Room | undefined,
      days: undefined as Schedule | undefined,
      notes: {} as {
        [id: string]: {
          note?: string
          important?: boolean
        }
      },
      settings: {
        view: 'list' as 'list' | 'table',
        weekDividers: true,
        groupDetails: true,
      }
    }
  },

  getters: {
    activeGroup(state) {
      if (state.group?.form && state.group?.year && state.group?.id) return state.group
    },
    getGroupById: (state) => (id: string) => state.groups.find(group => group.id === id),
    getRoomByName: (state) => (name: string) => state.rooms?.find(room => room.name === name),
    getRoomById: (state) => (id: string) => state.rooms?.find(room => room.id === id),
  },

  actions: {
    setSchedule(schedule: Schedule) {
      this.days = schedule
      setUpdateTimeCookie('updated:schedule')
    },
    setTeachers(teachers: Teacher[]) {
      this.teachers = teachers
      setUpdateTimeCookie('updated:teachers')
    },
    setRooms(rooms: Room[]) {
      this.rooms = rooms
      setUpdateTimeCookie('updated:rooms')
    },
    setNote(id: string, {note, important}: {note?: string, important?: boolean}) {
      if (!this.notes[id]) this.notes[id] = {}
      if (note !== undefined) this.notes[id].note = note
      if (important !== undefined) this.notes[id].important = important
      if (!(this.notes[id].note || this.notes[id].important)) {
        delete this.notes[id]
      }
    }
  },

  persist: true
})

function setUpdateTimeCookie(key: string) {
  // Schedule is usually updated around 22:30, so we set the cookie to expire at that time
  let now = dayjs().tz('Europe/Moscow')
  if (now.format('HH:mm') > '22:30') now = now.add(1, 'day')
  const expires = now.set('hour', 22).set('minute', 30).set('second', 0).set('millisecond', 0).toDate()

  const cookies = new Cookies()
  cookies.set(key, 1, {
    expires
  })
}