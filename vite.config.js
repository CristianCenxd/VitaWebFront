import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://vitaweb.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
