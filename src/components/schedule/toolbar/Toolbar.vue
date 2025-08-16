<template>
  <ToolbarRoot class="toolbar">
    <ToolbarButton @click="() => scrollToDate()" v-if="store.days">Сегодня</ToolbarButton>

    <ToolbarButton aria-label="Тема" @click="theme = theme === 'light' ? 'dark' : 'light'">
      <i-tabler-moon v-if="theme === 'light'"/>
      <!-- the sun icon is visually smaller and has to be scaled up -->
      <i-tabler-sun style="transform: scale(1.15)" v-else/>
    </ToolbarButton>

    <AddToHomeScreen/>

    <ToolbarSettings v-if="store.days"/>
  </ToolbarRoot>
</template>

<script setup lang="ts">
import {
  ToolbarButton,
  ToolbarRoot
} from 'reka-ui'
import {scrollToDate} from '@/util.ts'
import {useLocalStorage} from '@vueuse/core'
import {watch} from 'vue'
import {useStore} from '@/store.ts'

const store = useStore()
const theme = useLocalStorage<'light' | 'dark'>('theme', 'light')

watch(theme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme)
})
</script>

<style lang="sass" scoped>
.toolbar
  display: flex
  align-items: center
  background-color: var(--bg-card)
  border: 1px solid var(--border)
  box-shadow: var(--shadow)
  border-radius: 12px
  position: fixed
  bottom: 24px
  right: max(calc((100% - var(--container-width)) / 2), var(--container-padding))

  :deep(> button)
    padding: 12px 16px
    font-size: 14px
    font-weight: 600
    position: relative
    transition: color .2s

    &:hover, &[data-state='open']
      color: var(--accent)

    &:not(:last-child)::after
      content: ''
      position: absolute
      width: 1px
      height: 16px
      background-color: var(--border)
      right: 0
      top: 50%
      transform: translateY(-50%)

    &:has(.icon:only-child)
      padding-inline: 14px

    .icon
      --icon-size: 18px
</style>