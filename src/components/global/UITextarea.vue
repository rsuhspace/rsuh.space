<template>
  <textarea :rows="rows" v-model="input" ref="textarea"/>
</template>

<script setup lang="ts">
import {useTextareaAutosize} from '@vueuse/core'
import {watch} from 'vue'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
  rows?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const {textarea, input} = useTextareaAutosize({
  styleProp: props.rows ? 'minHeight' : 'height'
})

input.value = props.modelValue

watch(input, (value) => {
  emit('update:modelValue', value)
})
</script>

<style lang="sass" scoped>
textarea
  resize: none
</style>