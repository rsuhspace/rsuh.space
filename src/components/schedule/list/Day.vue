<template>
  <div class="day" :class="{today: isToday}" :data-date="date.format(DATE_FORMAT)">
    <time :datetime="date.toISOString()" class="day__date">{{ date.format('D MMMM, dd') }}</time>

    <div class="day__lectures">
      <TimeSlot v-for="(lectures, number) in timeSlots" :number="Number(number)" :lectures="lectures"/>

      <div class="day__empty" v-if="!Object.keys(timeSlots).length">Ничего</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {type Dayjs} from 'dayjs'
import {DATE_FORMAT} from '@/constants.ts'
import {computed} from 'vue'
import {useStore} from '@/store.ts'
import TimeSlot from '@/components/schedule/list/TimeSlot.vue'
import {now} from '@/composables/useNow.ts'

const props = defineProps<{
  date: Dayjs
}>()

const store = useStore()

const timeSlots = computed(() => {
  const items = store.days?.[props.date.format(DATE_FORMAT)] || []
  const result: Record<number, any> = {}
  const start = Number(Object.keys(items)[0]) >= 7 ? 7 : 1

  for (let i = start; i <= Number(Object.keys(items).at(-1)); i++) {
    result[i] = items[i] || []
  }

  return result
})

const isToday = computed(() => {
  return props.date.isSame(now.value, 'day')
})
</script>

<style lang="sass" scoped>
.day
  display: flex
  flex-direction: column
  height: 100%
  scroll-margin-top: 12px

  @media (width < 880px)
    width: 100vw
    margin-inline: calc(var(--container-padding) * -1)

  &__date
    display: block
    font-weight: 600
    font-size: 14px
    margin-bottom: 12px
    color: var(--text-secondary)

    @media (width < 880px)
      margin-inline: 16px

  &__lectures
    background-color: var(--bg-card)
    border: 1px solid var(--border)
    border-radius: 12px
    flex: 1

    @media (width < 880px)
      border-radius: 0
      border-inline: none

  &__empty
    display: grid
    place-items: center
    color: var(--text-secondary)
    font-size: 14px
    font-weight: 500
    height: 100%
    padding: 20px

  &.today &
    &__date
      color: var(--accent)

    &__lectures
      border-color: var(--accent)
</style>