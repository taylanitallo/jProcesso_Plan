import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // porta fixa + acessível pela rede (necessário para o container do
    // OnlyOffice Document Server buscar o .docx via host.docker.internal)
    host: true,
    port: 5175,
    strictPort: true,
    // sem isso o Vite responde 403 ao Host: host.docker.internal:5175 usado
    // pelo Document Server (proteção contra DNS rebinding)
    allowedHosts: ['host.docker.internal', 'localhost'],
  },
})
