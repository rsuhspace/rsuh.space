<template>
  <div class="copy">
    <div class="copy__text">
      <span>{{ text }}</span>
    </div>

    <button :class="{copied: isCopied}" @click="copy">
      <i-tabler-copy v-if="!isCopied"/>
      <i-tabler-check v-else/>
    </button>
  </div>
</template>

<script setup lang="ts">
import useCopy from '@/composables/useCopy.ts'

const props = defineProps<{
  text: string
}>()

const {copy, isCopied} = useCopy(() => props.text)
</script>

<style lang="sass" scoped>
.copy
  display: flex
  gap: 4px
  height: 44px
  border-radius: 12px
  overflow: hidden
  margin-block: 12px

  &__text
    flex: 1
    overflow: auto
    white-space: nowrap
    user-select: all
    padding: 12px
    padding-inline-end: 8px
    font-size: 13px
    font-weight: 500
    font-family: 'Roboto Mono', monospace
    @include hide-scrollbar

  button
    display: grid
    place-items: center
    flex-shrink: 0
    aspect-ratio: 1
    position: relative

    &::before
      content: ''
      width: 1px
      height: 50%
      background-color: var(--border)
      position: absolute
      left: 0

    &:hover, &.copied
      color: var(--accent)
</style>