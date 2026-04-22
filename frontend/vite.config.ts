import { defineConfig, loadEnv } from 'vite'
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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), beepOnErrorPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: env.VITE_HOST || '0.0.0.0',
      port: env.VITE_PORT ? parseInt(env.VITE_PORT) : 5173,
    },
    preview: {
      host: env.VITE_HOST || '0.0.0.0',
      port: env.VITE_PORT ? parseInt(env.VITE_PORT) : 4173,
    }
  };
});
