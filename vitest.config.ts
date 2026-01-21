import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Environnement de test
    environment: 'node',

    // Variables globales (describe, it, expect, etc.)
    globals: true,

    // Pattern pour trouver les fichiers de test
    include: ['__tests__/simple.test.ts'],

    // Exclusions
    exclude: ['node_modules', '.next', '__tests__/api/**', '__tests__/lib/**', '__tests__/prompts/**'],

    // Timeout par défaut pour les tests
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
