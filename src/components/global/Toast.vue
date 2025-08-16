<template>
  <div class="toast" :class="type">
    <i-tabler-circle-check-filled v-if="type === 'success'"/>
    <i-tabler-circle-x-filled v-else-if="type === 'error'"/>
    <i-tabler-exclamation-circle-filled v-else-if="type === 'warning'"/>
    <i-tabler-info-circle-filled v-else/>
    <div class="toast__text">
      {{ text }}
    </div>
    <button class="toast__close" @click="closeToast(id)">
      <i-tabler-x/>
    </button>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount} from 'vue'
import {closeToast} from '@/composables/toasts.ts'
import type {ToastNotification} from '@/composables/toasts.ts'

const props = withDefaults(defineProps<ToastNotification>(), {
  duration: 5000,
  type: 'success'
})

const timeout = ref<number>()

onMounted(() => {
  if (props.duration !== null) timeout.value = setTimeout(() => {
    closeToast(props.id)
  }, props.duration)
})

onBeforeUnmount(() => {
  clearTimeout(timeout.value)
})
</script>

<style lang="sass" scoped>
.toast
  padding: 12px 4px 12px 16px
  width: 100%
  max-width: 400px
  display: flex
  align-items: center
  gap: 8px
  background-color: var(--bg-card)
  border: 1px solid var(--border)
  box-shadow: var(--shadow)
  border-radius: 16px
  pointer-events: all
  --icon-color: var(--accent)

  @include mobile
    max-width: 100%

  &.success
    --icon-color: var(--accent-green)

  &.error
    --icon-color: var(--accent-red)

  &.warning
    --icon-color: var(--accent-orange)

  &:not(:last-child)
    margin-bottom: 1rem

  .icon:not(:last-child)
    color: var(--icon-color)
    --icon-size: 22px

  &__text
    flex: 1
    font-weight: 500
    font-size: 14px

  &__close
    padding: 12px
    flex-shrink: 0
    color: var(--text-secondary)

    &:hover
      opacity: .7

    .icon
      --icon-size: 18px
</style>