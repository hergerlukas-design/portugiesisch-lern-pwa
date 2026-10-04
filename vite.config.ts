import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the app under /<repo>/; set BASE_PATH there, default to root
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
})
