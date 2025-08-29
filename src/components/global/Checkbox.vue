<template>
  <CheckboxRoot class="checkbox" :value>
    <span class="checkbox__icon">
      <i-tabler-check/>
    </span>

    <span class="checkbox__text"><slot/></span>
  </CheckboxRoot>
</template>

<script setup lang="ts">
import {CheckboxRoot} from 'reka-ui'

// Only defining this for better TS support in JSX
defineProps<{
  value?: string
}>()
</script>

<style lang="sass" scoped>
.checkbox
  display: flex
  align-items: flex-start
  gap: 8px
  cursor: pointer
  margin-block: 12px
  text-align: start

  &__icon
    display: grid
    place-items: center
    width: 18px
    height: 18px
    border-radius: 6px
    box-shadow: 0 0 0 1.5px var(--border) inset
    flex-shrink: 0
    transition: box-shadow .1s, background-color .1s

    .icon
      color: var(--bg)
      --icon-size: 12px
      --icon-thickness: 2.4
      opacity: 0
      transition: opacity .1s

  &[data-state='checked'] &__icon
    box-shadow: none
    background-color: var(--accent)

    .icon
      opacity: 1

  &__text
    font-weight: 500
    align-self: center
</style>