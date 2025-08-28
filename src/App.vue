<template>
  <header class="container">
    <h1>Расписание РГГУ</h1>
    <SchedulePicker/>
  </header>

  <Schedule/>

  <footer class="container">
    <div class="links">
      <a href="https://t.me/rsuhspace" target="_blank">
        <i-tabler-brand-telegram/>
        Телеграм-канал
      </a> /
      <a href="https://pay.cloudtips.ru/p/b955b5ee" target="_blank">
        <i-tabler-heart-dollar/>
        Задонатить
      </a> /
      <a href="https://github.com/rsuhspace/rsuh.space" target="_blank">
        <i-tabler-brand-github/>
        GitHub
      </a>
    </div>
    <div>
      <small>v{{ version }}</small>
      <small v-if="commit"> ({{ commit.slice(0, 7) }})</small>
    </div>
  </footer>

  <Toaster/>
</template>

<script setup lang="ts">
import SchedulePicker from './components/schedule/SchedulePicker.vue'
import {useRegisterSW} from 'virtual:pwa-register/vue'
import Toaster from '@/components/global/Toaster.vue'
import {notify} from '@/composables/toasts.ts'
import {onMounted} from 'vue'

useRegisterSW({
  onRegisteredSW(_url: string, r: ServiceWorkerRegistration | undefined) {
    r && setInterval(async () => {
      await r.update()
    }, 60 * 60 * 1000)
  }
})

const version = APP_VERSION
const commit = import.meta.env.VITE_COMMIT_SHA

onMounted(() => {
  const lastVersion = localStorage.getItem('version')
  if (lastVersion !== version) {
    localStorage.setItem('version', version)
    notify({
      text: `Обновлено до версии ${version}!`,
    })
  }
})
</script>

<style lang="sass" scoped>
header
  display: flex
  justify-content: space-between
  align-items: center
  flex-wrap: wrap
  gap: 16px 32px
  padding-block: 32px

  h1
    margin-block: 0
    margin-inline-end: auto

footer
  color: var(--text-secondary)
  margin-block: 8px 44px
  @include trim-margins

  > div
    margin-block: 12px

  .links
    display: flex
    align-items: center
    flex-wrap: wrap
    gap: 8px

  a
    display: flex
    align-items: center
    gap: 6px
    color: var(--accent)
    text-decoration: none
    font-size: 15px
    font-weight: 500

    &:hover
      opacity: .7
</style>