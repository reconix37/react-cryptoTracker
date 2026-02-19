import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/crypto': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const targetPath = url.searchParams.get('path');
          url.searchParams.delete('path');
          return `/${targetPath}${url.search}`;
        }
      }
    }
  },
  preview: {
    port: 3000,
    host: true,
    proxy: {
      '/api/crypto': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const targetPath = url.searchParams.get('path');
          url.searchParams.delete('path');
          return `/${targetPath}${url.search}`;
        }
      }
    }
  }
})