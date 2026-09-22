import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project under /reto4-rh-uveg/
export default defineConfig({
  plugins: [react()],
  base: '/reto4-rh-uveg/',
})
