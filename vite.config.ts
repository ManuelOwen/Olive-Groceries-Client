import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
/// <reference types="node" />
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 3000,
  },
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://groceries-api-m1sq.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // test configuration removed; move to vitest.config.ts if using Vitest
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
