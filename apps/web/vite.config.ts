import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  
  plugins: [
    react(), 
    tailwindcss(),
    sentryVitePlugin({
      org: "sergtech",
      project: "unborked-frontend"
    })
  ],

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  server: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  build: {
    sourcemap: true
  }
});