<template>
  <div class="schedule-table">
    <WeekPicker v-model="weekStart" :min="dateRange.start" :max="dateRange.end"/>

    <div class="schedule-table__table">
      <table>
        <thead>
        <tr>
          <th/>
          <th v-for="date in weekDays" :key="date.format(DATE_FORMAT)" :class="{today: date.isSame(dayjs(), 'day')}">
            {{ date.format('D MMMM, dd') }}
          </th>
        </tr>
        </thead>

        <tbody v-if="weekDays.some(date => store.days?.[date.format(DATE_FORMAT)])">
        <tr v-for="(slot, index) in TIME_SLOTS">
          <th>
            <time>{{ slot.start }}</time>
            –
            <time>{{ slot.end }}</time>
            <br>

            <small>{{ index + 1 }}-я пара</small>
          </th>

          <ScheduleTableCell
              v-for="date in weekDays"
              :key="date.format(DATE_FORMAT)"
              :lectures="store.days?.[date.format(DATE_FORMAT)]?.[index + 1] || []"
          />
        </tr>
        </tbody>

        <tbody v-else>
        <tr class="empty">
          <td colspan="7">Нет расписания</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useStore} from '@/store.ts'
import {computed, ref, watch} from 'vue'
import dayjs from 'dayjs'
import {DATE_FORMAT, TIME_SLOTS} from '@/constants.ts'
import ScheduleTableCell from '@/components/schedule/table/ScheduleTableCell.vue'
import {useEventListener} from '@vueuse/core'
import {clampDate} from '@/util.ts'

const store = useStore()
const weekStart = ref(dayjs().startOf('week'))

const weekDays = computed(() => Array(6).fill(0).map((_, i) => weekStart.value.add(i, 'day')))
const dateRange = computed(() => {
  if (!store.days) return {start: dayjs(), end: dayjs()}

  const dates = Object.keys(store.days).sort((a, b) => dayjs(a, DATE_FORMAT).diff(dayjs(b, DATE_FORMAT)))
  return {
    start: dayjs(dates[0], DATE_FORMAT).startOf('day'),
    end: dayjs(dates[dates.length - 1], DATE_FORMAT).endOf('day')
  }
})

watch(dateRange, range => {
  weekStart.value = clampDate(weekStart.value, range.start, range.end).startOf('week')
}, {immediate: true})

useEventListener('scroll-to-date', e => {
  weekStart.value = clampDate(
      dayjs(e.detail, DATE_FORMAT).startOf('week'),
      dateRange.value.start,
      dateRange.value.end
  ).startOf('week')
})
</script>

<style lang="sass" scoped>
.schedule-table
  width: 100vw
  margin-inline: min(calc((100vw - var(--container-width)) / -2), calc(var(--container-padding) * -1))
  padding-inline: 24px

  &__table
    width: calc(100% + 48px)
    overflow: auto
    @include hide-scrollbar
    margin-inline: -24px
    padding-inline: 24px
    margin-block: 32px

  table
    width: 100%
    border-collapse: collapse
    table-layout: fixed
    font-size: 14px
    min-width: 1200px

    td, th
      text-align: start
      border: 1px solid var(--border)
      vertical-align: top

    th
      background-color: var(--bg-card)

      &.today
        color: var(--accent)

      &:first-child
        width: 120px
        padding: 12px 8px

      small
        font-weight: 400
        font-size: 12px
        margin-top: 4px

    thead
      th
        padding: 10px

        &:first-child
          width: 120px

    tbody
      tr
        // A dirty hack to make cells fill the height of the row
        height: 1px

        &:not(:has(.lecture)):not(:has(~ tr .lecture)):not(.empty)
          display: none

        &:nth-child(even) td
          background-color: var(--table-stripe-bg)

        &.empty td
          text-align: center
          padding: 24px
          font-weight: 500

    .empty td
      color: var(--text-secondary)
</style>