<template>
  <PopoverRoot :modal="false">
    <PopoverTrigger as-child>
      <ToolbarButton>
        <i-tabler-settings-2/>
      </ToolbarButton>
    </PopoverTrigger>

    <PopoverPortal>
      <Transition name="fade">
        <PopoverContent class="settings" side="top" :side-offset="8" align="end">
          <h4>Вид</h4>
          <RadioGroupRoot v-model="store.settings.view">
            <RadioGroupItem value="list">
              <i-tabler-list-numbers/>
            </RadioGroupItem>
            <RadioGroupItem value="table">
              <i-tabler-table/>
            </RadioGroupItem>
          </RadioGroupRoot>

          <Checkbox v-model="store.settings.weekDividers" v-if="store.settings.view === 'list'">
            Показывать недели
          </Checkbox>
          <Checkbox v-model="store.settings.groupDetails">
            Полные названия групп в списке
          </Checkbox>

          <button @click="updateSchedule">
            <i-tabler-reload/>
            Обновить расписание
          </button>

          <CalendarExportDialog v-if="store.activeGroup || store.teacher">
            <template #trigger>
              <button>
                <i-tabler-calendar-share/>
                Экспорт в календарь
              </button>
            </template>
          </CalendarExportDialog>
        </PopoverContent>
      </Transition>
    </PopoverPortal>
  </PopoverRoot>
</template>

<script setup lang="ts">
import {
  PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger, RadioGroupItem, RadioGroupRoot, ToolbarButton
} from 'reka-ui'
import {useStore} from '@/store.ts'
import CalendarExportDialog from '@/components/schedule/CalendarExportDialog.vue'

const store = useStore()

function updateSchedule() {
  window.dispatchEvent(new CustomEvent('update-schedule'))
}

</script>

<style lang="sass" scoped>
:deep(.settings)
  background-color: var(--bg-card)
  border: 1px solid var(--border)
  border-radius: 12px
  box-shadow: var(--shadow)
  padding: 12px
  font-size: 14px
  width: 220px
  @include trim-margins

  h4
    margin-block: 8px
    color: var(--text-secondary)

  [role='radiogroup']
    display: flex
    gap: 8px
    margin-top: 8px
    background-color: var(--bg)
    padding: 4px
    border-radius: 10px

    button
      display: flex
      justify-content: center
      flex: 1
      padding: 6px
      border-radius: 6px
      color: var(--text-secondary)
      box-shadow: var(--shadow)
      transition: color .2s, background-color .2s

      &:hover
        color: var(--text)

      &[data-state='checked']
        background-color: var(--bg-card)
        color: var(--text)

  > button:not([role])
    display: flex
    align-items: center
    justify-content: center
    gap: 6px
    width: 100%
    background-color: var(--bg)
    padding: 8px
    border-radius: 8px
    font-weight: 500
    margin-top: 12px
    transition: color .2s

    &:hover
      color: var(--accent)

    .icon
      --icon-size: 16px
</style>