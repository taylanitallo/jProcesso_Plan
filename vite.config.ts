import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

/**
 * Endpoint de dev para anexos: o navegador não consegue entregar um File
 * ao Document Server do OnlyOffice (que busca o documento por URL, de dentro
 * do container). Este middleware recebe o arquivo por POST, grava em
 * public/uploads/ e devolve a URL — que o DS já consegue baixar.
 */
function uploadsPlugin(): Plugin {
  const dir = resolve(__dirname, 'public/uploads')
  return {
    name: 'dev-uploads',
    configureServer(server) {
      server.middlewares.use('/__upload', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        const nomeBruto = decodeURIComponent(req.headers['x-file-name']?.toString() || 'arquivo')
        const nome = `${Date.now()}-${nomeBruto.replace(/[^\w.-]+/g, '_')}`
        const chunks: Buffer[] = []
        req.on('data', (c: Buffer) => chunks.push(c))
        req.on('end', () => {
          try {
            mkdirSync(dir, { recursive: true })
            writeFileSync(resolve(dir, nome), Buffer.concat(chunks))
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ url: `/uploads/${nome}` }))
          } catch {
            res.statusCode = 500
            res.end()
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), uploadsPlugin()],
  server: {
    // porta fixa + acessível pela rede (necessário para o container do
    // OnlyOffice Document Server buscar o .docx via host.docker.internal)
    host: true,
    port: 5175,
    strictPort: true,
    // sem isso o Vite responde 403 ao Host: host.docker.internal:5175 usado
    // pelo Document Server (proteção contra DNS rebinding)
    allowedHosts: ['host.docker.internal', 'localhost'],
    // proxy p/ as APIs públicas de compras (evita CORS no browser).
    // Em produção usar um backend/edge equivalente.
    proxy: {
      '/pncp-api': {
        target: 'https://pncp.gov.br',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/pncp-api/, ''),
      },
      '/compras-api': {
        target: 'https://dadosabertos.compras.gov.br',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/compras-api/, ''),
      },
    },
  },
})
