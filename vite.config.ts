import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      writeBundle() {
        // Copy manifest.json to dist folder
        copyFileSync('public/manifest.json', 'dist/manifest.json');

        // Copy icon files to dist folder
        copyFileSync('public/icon16.png', 'dist/icon16.png');
        // copyFileSync('public/icon48.png', 'dist/icon48.png');
        // copyFileSync('public/icon128.png', 'dist/icon128.png');
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  base: './', // This is crucial for Chrome extensions
});
