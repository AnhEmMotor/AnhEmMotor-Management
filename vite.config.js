import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss(), svgLoader({ defaultImport: 'component' })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@domain': fileURLToPath(new URL('./src/core/domain', import.meta.url)),
      '@application': fileURLToPath(new URL('./src/core/application', import.meta.url)),
      '@infrastructure': fileURLToPath(new URL('./src/core/infrastructure', import.meta.url)),
      '@presentation': fileURLToPath(new URL('./src/presentation', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/presentation/components', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/presentation/views', import.meta.url)),
      '@stores': fileURLToPath(new URL('./src/core/application/stores', import.meta.url)),
      '@composables': fileURLToPath(new URL('./src/presentation/composables', import.meta.url)),
      '@constants': fileURLToPath(new URL('./src/core/domain/constants', import.meta.url)),
      '@router': fileURLToPath(new URL('./src/presentation/router', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vendor-core'
            }
            return 'vendor-libs'
          }
          if (id.includes('.svg') || id.includes('src/components/icons')) {
            return 'app-icons'
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
