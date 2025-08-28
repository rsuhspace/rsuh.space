<template>
  <ToolbarButton aria-label="Добавить на главный экран" @click="onNativePromptClick" v-if="shouldShow && nativePrompt">
    <i-tabler-home-plus/>
  </ToolbarButton>

  <template v-else-if="shouldShow">
    <Dialog title="Добавить на главный экран">
      <template #trigger>
        <ToolbarButton aria-label="Добавить на главный экран" v-if="shouldShow">
          <i-tabler-home-plus/>
        </ToolbarButton>
      </template>

      <template v-if="mobilePlatform === 'android'">
        <ol>
          <li>Откройте rsuh.space в Google Chrome</li>
          <li>Откройте меню браузера (<i-tabler-dots-vertical/>)</li>
          <li>Нажмите «<i-tabler-device-mobile-share/> Добавить на главный экран»</li>
        </ol>
      </template>

      <template v-else-if="mobilePlatform === 'ios'">
        <ol>
          <li>Откройте rsuh.space в Safari</li>
          <li>Нажмите «Поделиться» (<i-tabler-share-2/>)</li>
          <li>Выберите «На экран "Домой"»</li>
        </ol>
      </template>
    </Dialog>
  </template>
</template>

<script setup lang="ts">
import {ToolbarButton} from 'reka-ui'
import {onBeforeMount, ref} from 'vue'
import {notify} from '@/composables/toasts.ts'

const shouldShow = ref(false)
let waitForNativePrompt = false
const nativePrompt = ref<BeforeInstallPromptEvent>()

// I know desktop browsers support this too, but I don't think it would be useful there

const mobilePlatform = (() => {
  const ua = navigator.userAgent
  if (/android/i.test(ua)) {
    return 'android'
  } else if ((/iPad|iPhone|iPod/.test(ua)) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios'
  }
})()

if ('onbeforeinstallprompt' in window) {
  waitForNativePrompt = true
  window.addEventListener('beforeinstallprompt', (event) => {
    if (!mobilePlatform) return
    event.preventDefault()
    nativePrompt.value = event
    shouldShow.value = true
  })
}

onBeforeMount(async () => {
  if (window.matchMedia('(display-mode: standalone)').matches) return
  if (mobilePlatform && !waitForNativePrompt) shouldShow.value = true
})

async function onNativePromptClick() {
  await nativePrompt.value?.prompt()
  nativePrompt.value?.userChoice.then(({outcome}) => {
    if (outcome === 'accepted') {
      shouldShow.value = false
      notify({
        type: 'success',
        text: 'Приложение добавлено на главный экран',
      })
    }
  })
}
</script>

<style lang="sass" scoped>
ol
  padding-inline-start: 1em

  li
    margin-block: 8px

    .icon
      display: inline-block
      --icon-size: 1em
      vertical-align: -.15em
</style>