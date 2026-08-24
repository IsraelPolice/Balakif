import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
        spotify: '/spotify.html',
        elections: '/pages/elections.html'
      }
    }
  },
  server: {
    host: true,
    port: 3000
  }
})