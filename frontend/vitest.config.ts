import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      // No necesitamos que sea headless durante el desarrollo si queremos ver, 
      // pero para CI/CD usualmente sí. Por ahora dejamos default.
      instances: [
        { browser: 'chromium' },
      ],
    },
    globals: true,
    environment: 'linkedom', // O 'jsdom', pero 'linkedom' es más rápido y suficiente para tests ligeros
  },
});
