import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import {fileURLToPath, URL} from 'url'
import {VitePWA} from 'vite-plugin-pwa'
import autoprefixer from 'autoprefixer'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    Components({
      resolvers: [
        IconsResolver()
      ],
    }),
    Icons({
      defaultClass: 'icon',
    }),
    VitePWA({
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**\/*.{js,css,html}']
      },
      manifest: {
        name: 'Расписание РГГУ',
        short_name: 'РГГУ',
        description: 'Расписание пар в РГГУ',
        theme_color: '#15171e',
        display_override: ['standalone'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          }
        ],
        related_applications: [{
          platform: 'webapp',
          url: 'https://rsuh.space/manifest.webmanifest'
        }]
      },
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      }
    })
  ],

  css: {
    postcss: {
      plugins: [
          autoprefixer()
      ]
    },
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/styles/mixins" as *;'
      },
      sass: {
        additionalData: '@use "@/styles/mixins" as *\n'
      }
    }
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },

  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version)
  },
})
