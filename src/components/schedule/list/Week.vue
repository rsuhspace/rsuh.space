<template>
  <div class="week">
    <button @click="isOpen = !isOpen" class="week__toggle" v-if="store.settings.weekDividers">
      <span>
        {{ formatDateRange(weekDays[0], weekDays.at(-1)!) }}
        <i-tabler-chevron-down v-if="!isOpen"/>
        <i-tabler-chevron-up v-else/>
      </span>
    </button>

    <div class="week__days" v-if="isOpen || !store.settings.weekDividers">
      <Day v-for="date in weekDays" :date="date"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs, {Dayjs} from 'dayjs'
import Day from '@/components/schedule/list/Day.vue'
import {ref} from 'vue'
import {useEventListener} from '@vueuse/core'
import {DATE_FORMAT} from '@/constants.ts'
import {formatDateRange} from '@/util.ts'
import {useStore} from '@/store.ts'

const props = defineProps<{
  start: Dayjs
}>()

const store = useStore()
const weekDays = Array(6).fill(0).map((_, i) => props.start.add(i, 'days'))
const isOpen = ref(!props.start.isBefore(dayjs().startOf('week'), 'date'))

useEventListener('scroll-to-date', e => {
  if (weekDays.some(day => day.format(DATE_FORMAT) === e.detail)) {
    isOpen.value = true
  }
})
</script>

<style lang="sass" scoped>
.week
  margin-block: 32px

  &__toggle
    width: 100%
    margin-bottom: 24px
    position: relative
    isolation: isolate
    color: var(--text-secondary)
    transition: color .2s

    &:hover
      color: var(--accent)

    span
      display: flex
      align-items: center
      gap: 6px
      padding: 8px 12px 8px 16px
      background-color: var(--bg-card)
      border: 1px solid var(--border)
      border-radius: 8px
      width: fit-content
      margin-inline: auto
      font-size: 13px
      font-weight: 600
      box-shadow: 0 0 0 12px var(--bg)

      .icon
        --icon-size: 16px

    &::after
      content: ''
      position: absolute
      top: 50%
      left: 0
      right: 0
      height: 1px
      background-color: var(--border)
      transform: translateY(-50%)
      z-index: -1

  &__days
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr))
    gap: 24px 32px
</style>