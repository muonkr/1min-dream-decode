import { defineConfig } from '@apps-in-toss/web-framework/config'

export default defineConfig({
  appName: 'dreamdecode',
  brand: {
    displayName: '1분꿈해몽',
    primaryColor: '#2563eb',
    icon: 'https://raw.githubusercontent.com/muonkr/1min-dream-decode/main/public/icon.png',
  },
  permissions: [],
  navigationBar: {
    withBackButton: true,
  },
  web: {
    host: 'localhost',
    port: 5174,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
})
