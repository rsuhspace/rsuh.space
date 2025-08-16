<template>
  <td>
    <div class="lectures">
      <div class="lecture" :data-type="lecture.type" v-for="lecture in lectures" :key="lecture.id">
        <h4>{{ lecture.name }}</h4>

        <p>
          {{
            [
              lecture.group ? `группа: ${lecture.group}` : '',
              lecture.subgroup ? `подгруппа: ${lecture.subgroup}` : ''
            ].filter(Boolean).join(', ')}}
        </p>

        <p>
          <i-tabler-square-filled style="color: var(--marker-color)"/>
          {{ LECTURE_TYPES[lecture.type.toLowerCase() as keyof typeof LECTURE_TYPES] ?? lecture.type }}
        </p>

        <p>
          <i-tabler-school/>
          {{ abbreviateName(lecture.teacher_name) }}
        </p>

        <p>
          <i-tabler-door/>
          Ауд. {{ lecture.room }}
        </p>
      </div>
    </div>
  </td>
</template>

<script setup lang="ts">
import type {Lecture} from '@/types.ts'
import {LECTURE_TYPES} from '@/constants.ts'
import {abbreviateName} from '@/util.ts'

defineProps<{
  lectures: Lecture[]
}>()
</script>

<style lang="sass" scoped>
td
  padding: 0
  height: inherit

  .lectures
    display: flex
    flex-direction: column
    height: 100%

  .lecture
    @include trim-margins
    padding: 8px 12px
    flex: 1
    height: 100%
    position: relative
    --marker-color: var(--accent)
    background-color: var(--accent-other-bg)

    &[data-type='сем']
      --marker-color: var(--accent-orange)
      background-color: var(--accent-orange-bg)

    &[data-type='лек']
      --marker-color: var(--accent-green)
      background-color: var(--accent-green-bg)

    &[data-type='спец']
      --marker-color: var(--accent-red)
      background-color: var(--accent-red-bg)

    &:not(:first-child)
      border-top: 1px solid var(--border)

    h4
      font-weight: 600
      margin-block: 0

    p
      display: flex
      align-items: center
      gap: 6px
      font-size: 13px
      font-weight: 500
      color: var(--text-secondary)
      margin-block: 6px

      &:empty
        display: none

      .icon
        --icon-size: 16px
</style>