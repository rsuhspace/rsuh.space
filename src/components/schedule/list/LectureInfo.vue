<template>
  <div class="lecture">
    <div class="lecture__main" @click="showDetails = !showDetails">
      <div class="lecture__info">
        <div class="lecture__info-items">
        <span class="lecture__type" :data-type="lecture.type.toLowerCase()">
          {{ LECTURE_TYPES[lecture.type.toLowerCase() as keyof typeof LECTURE_TYPES] ?? lecture.type }}
        </span>
          <span>{{ abbreviateName(lecture.teacher_name) }}</span>
        </div>
        <span class="lecture__room">{{ lecture.room }}</span>
      </div>

      <p class="lecture__title">
        <i-tabler-bookmark-filled v-if="isImportant"/>
        <span>{{ lecture.name }}</span>
        <small v-if="subgroup && !(store.teacher || store.room)"> ({{ subgroup }})</small>
        <i-tabler-align-justified v-if="store.notes[lecture.id]?.note"/>
      </p>
    </div>

    <div class="lecture__details" v-if="showDetails">
      <div v-if="courseEnd">
        <i-tabler-calendar/>
        <span>Окончание курса: {{ dayjs(courseEnd, DATE_FORMAT).format('D MMMM') }}</span>
      </div>

      <template v-if="(store.teacher || store.room) && lecture.groups?.length">
        <div v-if="lecture.groups.length === 1">
          <i-tabler-users/>
          Группа: {{ lecture.groups[0] }}
        </div>
        <template v-else>
          <div>
            <i-tabler-users-group/>
            Группы:<br>
          </div>
          <span v-for="group in lecture.groups">{{ group }}<br></span>
        </template>
      </template>

      <div v-if="store.getRoomByName(lecture.room)">
        <i-tabler-users-group/>
        <span>Вместимость аудитории: {{ store.getRoomByName(lecture.room)!.capacity }} чел.</span>
      </div>

      <button
          class="lecture__important-toggle"
          :class="{active: isImportant}"
          @click="store.setNote(lecture.id, {important: !isImportant})"
      >
        <i-tabler-bookmark v-if="!isImportant"/>
        <i-tabler-bookmark-filled v-else/>
        <span>Отметить пару как важную</span>
      </button>

      <div>
        <i-tabler-align-justified/>
        <UITextarea
            placeholder="Заметка..."
            :rows="1"
            :model-value="store.notes[lecture.id]?.note || ''"
            @update:model-value="store.setNote(lecture.id, {note: $event})"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {Lecture} from '@/types.ts'
import {abbreviateName} from '@/util.ts'
import {DATE_FORMAT, LECTURE_TYPES} from '@/constants.ts'
import {computed, ref} from 'vue'
import {useStore} from '@/store.ts'
import dayjs from 'dayjs'

const props = defineProps<{
  lecture: Lecture
}>()

const store = useStore()
const showDetails = ref(false)

const subgroup = computed(() => {
  return [
    props.lecture.group ? `группа: ${props.lecture.group}` : '',
    props.lecture.subgroup ? `подгруппа: ${props.lecture.subgroup}` : ''
  ].filter(Boolean).join(', ')
})

const courseEnd = computed(() => {
  if (!store.days) return
  if (!store.activeGroup) return

  const days = Object.entries(store.days).filter(([, day]) =>
      Object.values(day).flat().some(lecture =>
          lecture.name === props.lecture.name && lecture.subgroup === props.lecture.subgroup
      )
  )

  return days.sort((a, b) => dayjs(a[0]).diff(dayjs(b[0]))).at(-1)?.[0]
})

const isImportant = computed(() => store.notes[props.lecture.id]?.important)
</script>

<style lang="sass" scoped>
.lecture
  &:not(:last-child)
    border-bottom: 1px solid var(--border)

  &__main
    padding-block: 12px
    padding-inline-end: 10px
    cursor: pointer
    transition: opacity .1s

    &:hover
      opacity: .75

  &__info
    display: flex
    gap: 1em
    color: var(--text-secondary)
    font-size: 11.5px
    font-weight: 600
    letter-spacing: .03em
    margin-bottom: 4px

    &-items
      text-transform: uppercase
      flex: 1

      span:not(:first-child)::before
        content: '/'
        opacity: .6
        margin-inline: 3px

      span[data-type]
        color: var(--accent)

        &[data-type='сем']
          color: var(--accent-orange)

        &[data-type='лек']
          color: var(--accent-green)

        &[data-type='спец']
          color: var(--accent-red)

        &[data-type='экзамен']
          background: var(--accent)
          color: var(--bg-card)
          padding: 0 4px
          border-radius: 3px

  &__title
    font-weight: 600
    line-height: 1.4
    margin: 0
    font-size: 14px

    small
      font-size: 13px
      color: var(--text-secondary)

    .icon
      display: inline-block
      --icon-size: 14px
      vertical-align: -.1em

      &:first-child
        color: var(--accent-red)
        margin-inline-end: 2px

      &:last-child
        color: var(--text-secondary)
        margin-inline-start: 2px

  &__details
    font-weight: 500
    font-size: 13.5px
    color: var(--text-secondary)
    padding-bottom: 12px
    @include trim-margins

    > div, > button
      display: flex
      align-items: flex-start
      gap: 6px
      margin-block: 8px

      .icon
        --icon-size: 18px

      span
        align-self: center

      textarea
        flex: 1
        color: var(--text)

        &::placeholder
          opacity: .6

    button:hover
      color: var(--text)

  &__important-toggle.active .icon
    color: var(--accent-red)
</style>