import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'

// https://vite.dev/config/
export default defineConfig({
  server: {
    hmr: false,
  },
  plugins: [react(), glsl()],
})
