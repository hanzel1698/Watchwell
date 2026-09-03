import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this app from /watchwell/ (repo name). Adjust if the repo is renamed.
  base: '/watchwell/',
  plugins: [react(), tailwindcss()],
})
