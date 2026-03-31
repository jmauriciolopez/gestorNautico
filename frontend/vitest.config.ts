import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      enabled: true,
      headless: true, // Forzar headless para el entorno de ejecución
      provider: playwright(), // Usar el factory como requiere Vitest 4.x
      instances: [
        { browser: 'chromium' },
      ],
    },
    globals: true,
  },
});
