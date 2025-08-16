import {ref} from 'vue'

export interface ToastNotification {
  id: string
  text?: string | Error | any
  duration: number | null
  type?: 'info' | 'success' | 'error' | 'warning'
}

export const toasts = ref<ToastNotification[]>([])

export function notify(item: Partial<ToastNotification>) {
  if (item.text instanceof Error && item.text.message) item.text = item.text.message
  const notification: ToastNotification = {id: window.crypto.randomUUID(), type: 'info', duration: 5000, ...item}
  toasts.value.unshift(notification)
}

export function closeToast(id: string) {
  const index = toasts.value.findIndex((notification) => notification.id === id)

  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}
