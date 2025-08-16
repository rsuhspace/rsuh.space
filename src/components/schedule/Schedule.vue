<template>
  <main class="schedule">
    <div class="container">
      <template v-if="store.days && Object.keys(store.days)?.length">
        <ScheduleTable v-if="store.settings.view === 'table'"/>
        <template v-else>
          <Week v-for="week in scheduleWeeks" :start="week"/>
        </template>
      </template>

      <div class="schedule__empty" v-else-if="store.days">
        <i-tabler-calendar-off/>
        <p>Нет расписания</p>
      </div>

      <div class="welcome" v-else>
        <h2>👋</h2>
        <p>Привет! Выбери группу, преподавателя или аудиторию, чтобы посмотреть расписание</p>
      </div>

      <Toolbar/>

      <Transition name="fade">
        <div class="schedule__loading" v-if="isLoading">
          <Spinner/>
          Загружаем...
        </div>
      </Transition>
    </div>
  </main>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {getRooms, getSchedule, getTeachers} from '@/api.ts'
import {useStore} from '@/store.ts'
import type {Group} from '@/types.ts'
import Cookies from 'universal-cookie'
import dayjs, {Dayjs} from 'dayjs'
import {DATE_FORMAT} from '@/constants.ts'
import {scrollToDate} from '@/util.ts'
import {syncRef, useEventListener, useScrollLock} from '@vueuse/core'
import Toolbar from '@/components/schedule/toolbar/Toolbar.vue'
import {notify} from '@/composables/toasts.ts'

const store = useStore()
const cookies = new Cookies()
const isLoading = ref(false)
const scrollLock = useScrollLock(document.body)
syncRef(isLoading, scrollLock)

async function updateSchedule() {
  if (!window.navigator.onLine) return

  isLoading.value = true
  await Promise.all([
    getSchedule({
      group: store.activeGroup as Group | undefined,
      teacher: store.teacher,
      room: store.room
    }).then(store.setSchedule),
    // update rooms just in case
    getRooms().then(store.setRooms)
  ]).catch(() => {
    notify({
      type: 'error',
      text: 'Не удалось загрузить расписание'
    })
  })
  isLoading.value = false
}

watch(() => store.activeGroup, val => {
  if (val?.id) {
    store.room = undefined
    store.teacher = undefined
  }
})

watch(() => store.teacher, val => {
  if (val) {
    store.group = {}
    store.room = undefined
  }
})

watch(() => store.room, val => {
  if (val) {
    store.group = {}
    store.teacher = undefined
  }
})

if (!cookies.get('updated:teachers') || !store.teachers?.length) getTeachers().then(store.setTeachers)
if (!cookies.get('updated:rooms') || !store.teachers?.length) getRooms().then(store.setRooms)

watch(() => [store.activeGroup, store.teacher, store.room], (val, oldValue) => {
  if (!val.filter(Boolean).length) return

  if (!oldValue && !cookies.get('updated:schedule')) {
    updateSchedule()
  } else if (oldValue) {
    updateSchedule()
  }
}, {immediate: true})

const scheduleWeeks = computed(() => {
  if (!store.days) return []

  const weeks: Dayjs[] = []
  const days = Object.keys(store.days).sort((a, b) => dayjs(a, DATE_FORMAT).diff(dayjs(b, DATE_FORMAT)))
  const startDate = dayjs(days[0], DATE_FORMAT).startOf('week')
  const endDate = dayjs(days.at(-1), DATE_FORMAT).startOf('week')
  let date = startDate.clone()

  while (date.isBefore(endDate) || date.isSame(endDate)) {
    weeks.push(date.clone())
    date = date.add(1, 'week')
  }

  return weeks
})

useEventListener('update-schedule', updateSchedule)

onMounted(() => {
  if (store.days) scrollToDate(dayjs(), {behavior: 'instant'})
})
</script>

<style lang="sass" scoped>
.schedule
  &__loading
    display: flex
    justify-content: center
    align-items: center
    flex-direction: column
    gap: 12px
    font-weight: 500
    position: fixed
    inset: 0
    background-color: rgba(0, 0, 0, 0.05)
    backdrop-filter: blur(3px)
    z-index: 99

    .icon
      --icon-size: 32px
      --icon-thickness: 1.4

  &__empty
    text-align: center
    font-weight: 500
    margin-top: 30px
    color: var(--text-secondary)

    p
      margin-top: 16px

    .icon
      margin-inline: auto
      --icon-size: 32px
      --icon-thickness: 1.4

.welcome
  text-align: center
  font-size: 18px
  margin-block: 24px
  font-weight: 600
  color: var(--text-secondary)

  h2
    margin-block: 0 16px
    font-size: 32px
</style>