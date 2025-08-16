/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/vue" />
/// <reference types="vite-plugin-pwa/client" />

declare global {
  const APP_VERSION: string

  interface WindowEventMap {
    'scroll-to-date': CustomEvent<string>
    'update-schedule': CustomEvent
    beforeinstallprompt: BeforeInstallPromptEvent
  }

  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed'
      platform: string
    }>;

    prompt(): Promise<void>
  }
}

export default {}