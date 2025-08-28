<template>
  <DialogRoot>
    <DialogTrigger as-child v-if="$slots.trigger">
      <slot name="trigger"/>
    </DialogTrigger>

    <DialogPortal>
      <Transition name="fade">
        <DialogOverlay class="dialog__overlay"/>
      </Transition>
      <Transition name="fade">
        <DialogContent class="dialog__content" :aria-describedby="undefined">
          <header>
            <DialogTitle>{{ title }}</DialogTitle>
            <DialogClose>
              <i-tabler-x/>
            </DialogClose>
          </header>

          <div class="dialog__body">
            <slot/>
          </div>
        </DialogContent>
      </Transition>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import {DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, DialogTrigger} from 'reka-ui'
import {ref} from 'vue'

defineProps<{
  title: string
}>()

const isOpen = ref(false)

defineExpose({
  open() {
    isOpen.value = true
  }
})
</script>

<style lang="sass" scoped>
.dialog
  &__overlay
    position: fixed
    inset: 0
    background-color: rgba(0, 0, 0, 0.05)
    backdrop-filter: blur(3px)

  &__content
    background-color: var(--bg-card)
    border: 1px solid var(--border)
    box-shadow: var(--shadow)
    border-radius: 16px
    padding: 16px 24px
    position: fixed
    inset: 0
    margin: auto
    width: min(550px, calc(100vw - 40px))
    height: fit-content
    max-height: calc(100vh - 40px)
    overflow: auto

    header
      display: flex
      align-items: flex-start
      gap: 24px

      h2
        flex: 1
        margin-block: 0
        align-self: center

      button
        color: var(--text-secondary)
        padding: 12px
        margin-top: 0
        margin-inline-end: -12px
        flex-shrink: 0
        transition: color .2s

        &:hover
          color: var(--text)

  &__body
    font-size: 15px
    font-weight: 500
    line-height: 1.5

    :deep(a)
      color: var(--accent)
      text-decoration: none
</style>