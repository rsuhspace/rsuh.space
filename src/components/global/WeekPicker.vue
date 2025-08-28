<template>
  <PopoverRoot class="week-picker" v-model:open="isOpen">
    <PopoverAnchor class="week-picker__controls">
      <button
          @click="emit('update:modelValue', modelValue.subtract(1, 'week'))"
          :disabled="min?.isSame(modelValue, 'week')"
      >
        <i-tabler-arrow-left/>
      </button>

      <PopoverTrigger>
        <i-tabler-calendar/>
        <span>{{ formatDateRange(modelValue, modelValue.endOf('week')) }}</span>
      </PopoverTrigger>

      <button
          @click="emit('update:modelValue', modelValue.add(1, 'week'))"
          :disabled="max?.isSame(modelValue, 'week')"
      >
        <i-tabler-arrow-right/>
      </button>
    </PopoverAnchor>

    <PopoverPortal>
      <Transition name="fade">
        <PopoverContent class="calendar" :side-offset="8">
          <div class="month">
            <button @click="monthStart = monthStart.subtract(1, 'month')" :disabled="min?.isSame(monthStart, 'month')">
              <i-tabler-chevron-left/>
            </button>
            <span>{{ monthStart.format('MMMM') }}</span>
            <button @click="monthStart = monthStart.add(1, 'month')" :disabled="max?.isSame(monthStart, 'month')">
              <i-tabler-chevron-right/>
            </button>
          </div>

          <div class="weekdays">
            <span v-for="day in ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']" :key="day">{{ day }}</span>
          </div>

          <button v-for="week in monthWeeks" :key="week[0]?.format(DATE_FORMAT)"
                  class="week"
                  :class="{active: week[0]?.isSame(modelValue, 'day')}"
                  @click="emit('update:modelValue', week[0])"
                  :disabled="min?.isAfter(week[0], 'week') || max?.isBefore(week[0], 'week')">
          <span
              class="day"
              v-for="day in week"
              :key="day.toISOString()"
              :class="{
                today: day.isSame(dayjs(), 'day'),
                active: week[0].isSame(modelValue, 'day'),
                weekend: day.weekday() === 6,
                'another-month': !day.isSame(monthStart, 'month')
              }"
          >
            {{ day.format('D') }}
          </span>
          </button>
        </PopoverContent>
      </Transition>
    </PopoverPortal>
  </PopoverRoot>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import dayjs, {type Dayjs} from 'dayjs'
import {formatDateRange} from '@/util.ts'
import {PopoverAnchor, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger} from 'reka-ui'
import {DATE_FORMAT} from '@/constants.ts'

const props = defineProps<{
  modelValue: Dayjs
  min?: Dayjs
  max?: Dayjs
}>()

const emit = defineEmits<{
  'update:modelValue': [Dayjs]
}>()

const isOpen = ref(false)
const monthStart = ref(props.modelValue.startOf('month'))

watch(isOpen, () => {
  if (isOpen.value) {
    monthStart.value = props.modelValue.startOf('month')
  }
})

watch(() => props.modelValue, () => {
  isOpen.value = false
})

const monthWeeks = computed(() => {
  const start = monthStart.value.startOf('week')
  const weeks: Dayjs[][] = []
  for (let i = 0; i < 6; i++) {
    const week: Dayjs[] = []
    for (let j = 0; j < 7; j++) {
      const date = dayjs(start).add(i * 7 + j, 'days')
      if (j === 0 && i !== 0 && !date.isSame(monthStart.value, 'month')) break
      week.push(date)
    }
    weeks.push(week)
  }

  return weeks
})
</script>

<style lang="sass" scoped>
.week-picker
  &__controls
    display: flex
    width: 310px
    background-color: var(--bg-card)
    border-radius: 12px
    border: 1px solid var(--border)

    button
      display: flex
      justify-content: center
      align-items: center
      gap: 8px
      padding: 10px
      font-size: 15px
      font-weight: 500
      position: relative
      transition: color .2s

      &:not(:disabled):hover
        color: var(--text-secondary)

      &:disabled
        opacity: .5
        cursor: default

      &:nth-child(2)
        flex: 1

      .icon
        --icon-size: 18px
        color: var(--text-secondary)

        &:only-child
          --icon-size: 20px
          color: inherit

      &:not(:first-child)::before
        content: ''
        position: absolute
        width: 1px
        height: 20px
        background-color: var(--border)
        left: 0

:deep(.calendar)
  width: var(--reka-popper-anchor-width)
  background-color: var(--bg-card)
  border-radius: 12px
  border: 1px solid var(--border)
  box-shadow: var(--shadow)
  padding: 10px

  .month
    display: flex
    align-items: center

    span
      flex: 1
      text-align: center
      font-size: 15px
      font-weight: 500
      text-transform: capitalize

    button
      padding: 4px
      border-radius: 6px

      &:not(:disabled):hover
        background-color: var(--bg)

      &:disabled
        opacity: .3
        cursor: default

      .icon
        --icon-size: 20px

  .weekdays
    display: flex

    span
      font-size: 13px
      color: var(--text-secondary)
      margin-block: 12px
      text-align: center
      flex: 1

  .week
    display: flex
    width: 100%
    border-radius: 10px
    transition: background-color .2s

    &:not(:disabled):hover
      background-color: var(--bg)

    &:disabled
      opacity: .3
      cursor: default

    &.active
      box-shadow: 0 0 0 1px var(--accent) inset

    span
      flex: 1
      display: grid
      place-items: center
      aspect-ratio: 1
      font-size: 15px
      font-weight: 500
      position: relative

      &.today
        color: var(--accent)
        font-weight: 600

        &::after
          content: ''
          width: 3px
          height: 3px
          border-radius: 50%
          background-color: var(--accent)
          position: absolute
          bottom: 6px

      &.weekend
        color: var(--accent-red)

      &.another-month
        color: var(--text-secondary)
        font-weight: 400
</style>