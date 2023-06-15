import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['assets/**/*.mp3'],
  base: './',
  build: {
    outDir: '../../dist/house-keeping',
  },
})
