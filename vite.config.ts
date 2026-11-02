import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // 개발 서버가 /api 요청을 전달할 백엔드 주소 (기본값: 로컬 백엔드)
  // 다른 백엔드에 연결하려면 .env.local 등에 API_PROXY_TARGET=http://<host>:8080 지정
  const env = loadEnv(mode, '.', '')
  const apiProxyTarget = env.API_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
