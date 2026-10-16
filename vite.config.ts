import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5175,
    strictPort: true,
  },
  css: {
    preprocessorOptions: {
      // Vite 5 usa por defecto la API legacy de Sass (deprecada); se fuerza la moderna.
      scss: { api: 'modern-compiler' },
    },
  },
})
