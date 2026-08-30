import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { sites } from '@openai/sites-vite-plugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.BACKEND_TARGET || 'http://localhost:3000'

  return {
    plugins: [react(), sites()],
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          // A deployed backend may scope its auth cookies to its own host.
          // Without this rewrite the browser drops them and every request
          // after login comes back 401.
          cookieDomainRewrite: 'localhost',
          rewrite: (path: string) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
