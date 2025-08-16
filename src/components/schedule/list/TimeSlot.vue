<template>
  <div class="time-slot" :class="{now: isNow}">
    <div class="time-slot__info">
      <div class="time-slot__number">{{ number }}</div>
      <div class="time-slot__time">
        <time :datetime="time.start">{{ time.start }}</time>
        <time :datetime="time.end">{{ time.end }}</time>
      </div>
    </div>

    <div class="time-slot__lectures" v-if="lectures.length">
      <LectureInfo v-for="lecture in lectures" :key="lecture.id" :lecture="lecture"/>
    </div>

    <div class="time-slot__empty" v-else>Ничего</div>
  </div>
</template>

<script setup lang="ts">
import LectureInfo from '@/components/schedule/list/LectureInfo.vue'
import type {Lecture} from '@/types.ts'
import {TIME_SLOTS} from '@/constants.ts'
import {now} from '@/composables/useNow.ts'
import {computed} from 'vue'

const props = defineProps<{
  number: number
  lectures: Lecture[]
}>()

const time = TIME_SLOTS[props.number - 1]

const isNow = computed(() => {
  const currentTime = now.value.format('HH:mm')
  return currentTime >= time.start && currentTime < time.end
})
</script>

<style lang="sass" scoped>
.time-slot
  display: flex
  align-items: flex-start

  &:not(:last-child)
    border-bottom: 1px solid var(--border)

  &__info
    display: flex
    align-items: center
    gap: 8px
    color: var(--text-secondary)
    font-family: 'Roboto Mono', monospace
    padding: 12px

  &__number
    font-size: 26px
    font-weight: 600

  &__time
    time
      display: block
      font-size: 12px
      line-height: 1.5

  .today &.now &__info
    color: var(--accent)
    font-weight: 600

  &__lectures
    flex: 1

  &__empty
    align-self: center
    color: var(--text-secondary)
    opacity: .7
    font-size: 14px
    font-weight: 500
</style>