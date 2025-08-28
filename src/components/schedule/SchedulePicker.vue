<template>
  <template v-if="isOpen">
    <RadioGroupRoot v-model="mode" class="schedule-picker__mode">
      <RadioGroupItem value="group">
        <i-tabler-users/>
        Группа
      </RadioGroupItem>
      <RadioGroupItem value="teacher">
        <i-tabler-school/>
        Преподаватель
      </RadioGroupItem>
      <RadioGroupItem value="room">
        <i-tabler-door/>
        Аудитория
      </RadioGroupItem>
    </RadioGroupRoot>

    <div class="schedule-picker__select" :class="mode">
      <template v-if="mode === 'group'">
        <UiSelect
            v-model="selectedGroup.form"
            :options="Object.entries(GROUP_FORMS).map(([key, value]) => ({label: getReadableGroupForm(value), value: key}))"
            placeholder="Форма обучения"
        />
        <UiSelect
            v-model="selectedGroup.year"
            :options="Array(5).fill(0).map((_, i) => ({label: (i + 1).toString(), value: i + 1}))"
            placeholder="Курс"
        />
        <UiSelect
            v-model="selectedGroup.id"
            :options="store.groups?.map?.(g => ({label: g.name, value: g.id})) || []"
            placeholder="Группа"
            :disabled="!store.groups?.length"
            :loading="isLoadingGroups"
            :filter="filterGroups"
        >
          <template #option="{ label, value }: SelectOption<string>">
            <div class="group-option">
              {{ label }}
              <small v-if="store.settings.groupDetails">{{ store.getGroupById(value)?.details }}</small>
            </div>
          </template>
        </UiSelect>
      </template>

      <UiSelect v-model="store.teacher" :options="teachers" placeholder="Преподаватель" v-else-if="mode === 'teacher'"/>
      <UiSelect v-model="store.room" :options="rooms" placeholder="Аудитория" v-else-if="mode === 'room'">
        <template #option="{ label, value }: SelectOption<Room>">
          <div class="room-option">
            {{ label }}
            <small v-if="value.capacity">
              {{ value.capacity }} чел.
            </small>
          </div>
        </template>
      </UiSelect>
    </div>
  </template>

  <button class="schedule-picker__closed" @click="isOpen = true" :disabled="!isOnline" v-else>
    <template v-if="isOnline">
      <i-tabler-users v-if="store.activeGroup"/>
      <i-tabler-school v-else-if="store.teacher"/>
      <i-tabler-door v-else-if="store.room"/>
    </template>
    <i-tabler-wifi-off v-else/>

    <span v-if="store.activeGroup">
      <span v-for="part in [`${store.activeGroup.year} курс`, store.activeGroup.name]">{{ part }}</span>
    </span>
    <span v-else-if="store.teacher">{{ store.teacher.name }}</span>
    <span v-else-if="store.room">Аудитория {{ store.room.name }}</span>
  </button>
</template>

<script setup lang="ts">
import {computed, reactive, ref, watch} from 'vue'
import UiSelect from '../global/UISelect.vue'
import {RadioGroupItem, RadioGroupRoot} from 'reka-ui'
import {useStore} from '@/store.ts'
import {GROUP_FORMS} from '@/constants.ts'
import {getReadableGroupForm} from '@/util.ts'
import {getGroups} from '@/api.ts'
import {useOnline} from '@vueuse/core'
import type {SelectOption} from '@/components/global/UISelect.vue'
import type {Room} from '@/types.ts'

const store = useStore()

const mode = ref<'group' | 'teacher' | 'room'>()
const isOpen = ref(false)

if (store.activeGroup?.id) {
  mode.value = 'group'
} else if (store.teacher) {
  mode.value = 'teacher'
} else if (store.room) {
  mode.value = 'room'
} else {
  mode.value = 'group'
  isOpen.value = true
}

const selectedGroup = reactive({...store.group})
const isLoadingGroups = ref(false)
const isOnline = useOnline()

watch(isOnline, val => {
  if (!val) isOpen.value = false
})

async function loadGroups() {
  if (!(selectedGroup.form && selectedGroup.year)) return
  isLoadingGroups.value = true
  store.groups = await getGroups({form: selectedGroup.form, year: selectedGroup.year})
  isLoadingGroups.value = false
}

function filterGroups(options: SelectOption<string>[], search: string) {
  if (!search) return options
  return options.filter(({value}) => {
    const group = store.getGroupById(value)
    if (!group) return
    return [group.name.toLowerCase(), group.details?.toLowerCase()].some(s => s?.includes(search.toLowerCase().trim()))
  })
}

watch(() => [selectedGroup.form, selectedGroup.year], (_, oldValue) => {
  // Don't reset group ID if this is the first load
  if (oldValue) selectedGroup.id = undefined
  loadGroups()
}, {immediate: true})

watch(() => selectedGroup.id, (id) => {
  if (id) {
    const group = store.groups?.find(g => g.id === id)
    store.group = {...group}
  }
})

const teachers = computed(() => store.teachers.map((teacher) => ({label: teacher.name, value: teacher})))
const rooms = computed(() => {
  if (!store.rooms) return []
  return store.rooms
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(r => ({label: r.name, value: r}))
})

watch(() => [store.activeGroup, store.teacher, store.room], (value) => {
  if (value.filter(Boolean).length) isOpen.value = false
})

watch(() => [store.teacher, store.room], values => {
  if (values.some(Boolean)) {
    store.groups = []
    selectedGroup.id = undefined
    selectedGroup.form = undefined
    selectedGroup.year = undefined
    selectedGroup.name = undefined
  }
})
</script>

<style lang="sass" scoped>
@mixin mobile
  @media (width < 660px)
    @content

@mixin desktop
  @media (width >= 660px)
    @content

.schedule-picker
  &__mode
    display: flex
    justify-content: flex-end
    flex: 1

    @include mobile
      justify-content: flex-start

    button
      display: flex
      flex-direction: column
      align-items: center
      font-size: 14px
      font-weight: 500
      color: var(--text-secondary)
      position: relative
      transition: color .2s

      @include mobile
        flex-direction: row
        gap: 8px

      &:hover
        color: var(--text)

      &[data-state='checked']
        color: var(--accent)

      .icon
        --icon-size: 18px

      &:not(:first-child)
        margin-inline-start: 32px

        &:before
          content: ""
          width: 1px
          height: 32px
          background-color: var(--text-secondary)
          opacity: .3
          display: block
          position: absolute
          left: -16px
          top: 50%
          transform: translate(-50%, -50%) skewX(-15deg)
          pointer-events: none

          @include mobile
            height: 16px

  &__select
    display: flex
    background-color: var(--bg-card)
    border: 1px solid var(--border)
    box-shadow: var(--shadow)
    border-radius: 12px
    margin-inline-start: auto

    @include mobile
      margin-inline-start: 0
      width: 100%

    :deep(.select[data-disabled])
      opacity: .5

    &.group
      display: flex

      @include mobile
        flex-wrap: wrap

      :deep(.select)
        position: relative

        &:first-child
          width: 12em

          @include mobile
            width: 50%

        &:nth-child(2)
          width: 7em

          @include mobile
            width: 50%

        &:nth-child(3)
          width: 18em

          @include mobile
            width: 100%

        &:not(:first-child)::before
          content: ''
          display: block
          width: 1px
          height: 50%
          background-color: var(--border)
          position: absolute
          left: 0
          top: 25%
          z-index: 1

        @include mobile
          &:last-child::before
            width: calc(100% - 24px)
            height: 1px
            margin-inline: 12px
            top: 0

    @include desktop
      &.teacher
        width: 20em

      &.room
        width: 12em

    :deep(.select)
      height: 50px
      font-size: 14px
      font-weight: 500

      &:only-child
        width: 100%

      input
        padding-inline: 16px 32px

      .icon
        --icon-size: 14px
        right: 9px
        color: var(--text-secondary)

  &__closed
    display: flex
    align-items: flex-start
    gap: 8px
    background: var(--bg-card)
    color: var(--text-secondary)
    border: 1px solid var(--border)
    box-shadow: var(--shadow)
    font-size: 14px
    font-weight: 500
    padding: 8px 12px
    border-radius: 12px
    transition: color .2s
    margin-block: 8px 7px
    text-align: start

    @include mobile
      margin-bottom: -24px

    &:hover
      color: var(--text)

    .icon
      --icon-size: 18px

    > span
      align-self: center

      > span
        &:not(:first-child)::before
          content: '/'
          margin-inline: 8px
          opacity: .5

.group-option
  small
    display: block
    margin-top: 2px
    font-size: 11px
    line-height: 1.3
    color: var(--text-secondary)

.room-option
  display: flex
  justify-content: space-between
  align-items: center
  gap: 8px

  small
    color: var(--text-secondary)
    font-size: 12px
    font-weight: 500
    flex-shrink: 0
</style>