<template>
  <Teleport to="body">
    <TransitionGroup class="toaster" tag="div" name="toast">
      <Toast
          v-for="toast in toasts"
          :key="toast.id"
          v-bind="toast"
          :id="toast.id"
      />
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import Toast from './Toast.vue'
import {toasts} from '@/composables/toasts.ts'
</script>

<style lang="sass" scoped>
.toaster
  display: flex
  justify-content: flex-end
  flex-direction: column
  gap: 16px
  position: fixed
  top: 0
  right: 0
  padding: 15px
  padding-inline-end: 48px
  width: calc(400px + 48px + 15px)
  height: calc(100% - 72px)
  overflow: hidden
  z-index: 10001
  pointer-events: none

  @include mobile
    width: 100%
    padding-inline: 16px

  .toast
    &-move,
    &-enter-active,
    &-leave-active
      transition: transform .3s ease, opacity .3s ease

    &-enter-from,
    &-leave-to
      opacity: 0
      transform: translateX(50px)

      @include mobile
        transform: scale(.96)

    &-leave-active
      position: absolute
      max-width: 400px
      right: 48px

      @include mobile
        max-width: calc(100% - 32px)
        right: 16px

  [dir="rtl"] &
    left: 0
    right: unset

    .toast
      &-enter-from,
      &-leave-to
        transform: translateX(-50px)
</style>
