import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(root, 'index.html'),
        product: resolve(root, 'product.html'),
        security: resolve(root, 'security.html'),
        install: resolve(root, 'install.html')
      }
    }
  }
});
