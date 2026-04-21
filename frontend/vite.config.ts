import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const beepOnErrorPlugin = (): any => ({
  name: 'beep-on-error',
  configureServer(server: any) {
    const originalError = server.config.logger.error;
    server.config.logger.error = (msg: string, options: any) => {
      process.stdout.write('\x07'); // Terminal beep
      originalError(msg, options);
    };
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), beepOnErrorPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
