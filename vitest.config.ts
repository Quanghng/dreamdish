import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Environnement de test
    environment: 'node',

    // Variables globales (describe, it, expect, etc.)
    globals: true,

    // Fichier de setup exécuté avant chaque fichier de test
    setupFiles: ['./__tests__/setup.ts'],

    // Pattern pour trouver les fichiers de test
    include: ['__tests__/**/*.test.ts'],

    // Exclusions
    exclude: ['node_modules', '.next'],

    // Configuration de la couverture de code
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/**/*.ts', 'app/api/**/*.ts'],
      exclude: ['**/*.test.ts', '**/node_modules/**'],
    },

    // Timeout par défaut pour les tests
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
