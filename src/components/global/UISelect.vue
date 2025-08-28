<template>
  <ComboboxRoot
      as-child
      v-model:open="isOpen"
      :disabled="disabled"
      :reset-search-term-on-blur="false"
      :reset-search-term-on-select="false"
      :ref="'rootEl'"
  >
    <div class="select" @focusout="onFocusOut">
      <ComboboxAnchor class="select__anchor">
        <ComboboxInput
            v-model="search"
            :placeholder="placeholder"
            @focus="isOpen = true"
            :display-value="(val: T) => getOptionByValue(val)?.label || ''"
            @keydown="onKeyDown"
        />
        <Spinner v-if="loading"/>
        <i-tabler-chevron-down v-else-if="!isOpen"/>
        <i-tabler-chevron-up v-else/>
      </ComboboxAnchor>

      <Transition name="fade">
        <ComboboxContent position="popper" class="select__options" :side-offset="4" :collision-padding="8"
                         @focus-outside.prevent v-if="filteredOptions.length">
          <!-- Volar complains unless we specify the ref like this. No idea why. -->
          <ComboboxViewport :ref="'viewportEl'">
            <button
                class="select__option"
                role="option"
                v-for="(option, i) in filteredOptions"
                :key="option.value!.toString()"
                @click="selectOption(option)"
                @pointerenter="highlightedIndex = i"
                tabindex="-1"
                :data-highlight="highlightedIndex === i"
                :aria-selected="modelValue === option.value"
                :data-state="modelValue === option.value ? 'checked' : 'unchecked'"
            >
              <slot name="option" v-bind="option">
                {{ option.label }}
              </slot>
            </button>
          </ComboboxViewport>
        </ComboboxContent>
      </Transition>
    </div>
  </ComboboxRoot>
</template>

<script lang="ts">
import {type AcceptableValue} from 'reka-ui'

export interface SelectOption<T extends AcceptableValue = AcceptableValue> {
  value: T
  label: string
}
</script>

<script setup lang="ts" generic="T extends AcceptableValue">
import {
  ComboboxRoot,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxViewport
} from 'reka-ui'
import {computed, nextTick, onMounted, ref, watch} from 'vue'
import Spinner from '@/components/global/Spinner.vue'
import {useEventListener} from '@vueuse/core'

const props = defineProps<{
  options: SelectOption<T>[]
  modelValue?: T
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  filter?: (options: SelectOption<T>[], query: string) => SelectOption<T>[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const rootEl = ref()
const isOpen = ref(false)
const search = ref('')
const justOpened = ref(false)

function getOptionByValue(value: T | undefined): SelectOption<T> | undefined {
  if (!value) return
  return props.options.find(option =>
      option.value === value ||
      (typeof option.value === 'object' && typeof value === 'object' && JSON.stringify(option.value) === JSON.stringify(value))
  )
}

onMounted(() => {
  if (props.modelValue) {
    const option = getOptionByValue(props.modelValue)
    if (option) {
      search.value = option.label
    }
  }
})

watch(() => props.options, () => {
  if (getOptionByValue(props.modelValue)) {
    search.value = getOptionByValue(props.modelValue)?.label || ''
  } else {
    search.value = ''
  }
}, {immediate: true})

const filteredOptions = computed(() => {
  if (justOpened.value) return props.options
  if (props.filter) return props.filter(props.options, search.value)
  else return props.options.filter(option => {
    return option.label.toLowerCase().includes(search.value.toLowerCase().trim())
  })
})

watch(search, () => {
  justOpened.value = false
})

function selectOption(option: SelectOption<T>) {
  emit('update:modelValue', option.value)
  search.value = option.label
  isOpen.value = false
}

// Reka UI's ComboboxItem makes large lists lag on update, and virtual lists don't support dynamic item height,
// so we re-implement some of the functionality here.
const highlightedIndex = ref(0)

const viewportEl = ref()

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = (highlightedIndex.value + 1) % filteredOptions.value.length
    scrollToHighlighted()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = (highlightedIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length
    scrollToHighlighted()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (filteredOptions.value[highlightedIndex.value]) {
      selectOption(filteredOptions.value[highlightedIndex.value])
    }
  }
}

function scrollToHighlighted() {
  if (!viewportEl.value) return
  const highlightedElement = viewportEl.value.$el.children[highlightedIndex.value]
  if (highlightedElement) {
    highlightedElement.scrollIntoView({
      block: justOpened.value ? 'center' : 'nearest'
    })
  }
}

watch(isOpen, (value) => {
  if (value) {
    justOpened.value = true
    highlightedIndex.value = filteredOptions.value.findIndex(option => option.value === props.modelValue) || 0
    nextTick(scrollToHighlighted)
  } else {
    if (props.modelValue) {
      search.value = getOptionByValue(props.modelValue)?.label || ''
    }
  }
})

watch(filteredOptions, () => {
  if (highlightedIndex.value >= filteredOptions.value.length) {
    highlightedIndex.value = filteredOptions.value.length - 1
  }
})

function onFocusOut(e: FocusEvent) {
  if (!rootEl.value?.$el.nextElementSibling.contains(e.relatedTarget)) {
    isOpen.value = false
  }
}

useEventListener(document, 'focusin', e => {
  if (!rootEl.value.$el.nextElementSibling.contains(e.target)) isOpen.value = false
})
</script>

<style lang="sass" scoped>
.select
  // The base is mostly unstyled and can be customized as needed
  &__anchor
    width: 100%
    height: 100%
    position: relative

    input
      width: 100%
      height: 100%
      outline: none

      &::placeholder
        color: var(--text-secondary)
        opacity: .8

    .icon
      position: absolute
      top: 50%
      translate: 0 -50%
      right: 0
      pointer-events: none

:deep(.select__options)
  width: var(--reka-combobox-trigger-width)
  max-height: min(500px, var(--reka-combobox-content-available-height))
  background-color: var(--bg-card)
  border-radius: 12px
  border: 1px solid var(--border)
  padding-inline: 4px
  z-index: 1

  .select__option
    width: 100%
    padding: 8px 12px
    border-radius: 8px
    font-size: 14px
    font-weight: 500
    text-align: start

    &:first-child
      margin-top: 4px

    &:last-child
      margin-bottom: 4px

    &:hover, &[data-highlight='true']
      background-color: var(--bg)

    &[data-state='checked']
      color: var(--accent)
</style>