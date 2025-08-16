import {ref} from 'vue'
import dayjs from 'dayjs'
import {useEventListener} from '@vueuse/core'

export const now = ref(dayjs())

useEventListener(document, 'visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    now.value = dayjs()
  }
})
