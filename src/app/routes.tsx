import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/shell/AppLayout'
import { RequireAuth } from './RequireAuth'
import { Placeholder } from '../components/common/Placeholder'
import { LoginPage } from '../modules/auth/LoginPage'
import { HomePage } from '../modules/home/HomePage'

const stub = (title: string, phase: number) => <Placeholder title={title} phase={phase} />

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <HomePage /> },

      // Fase 3 — SollAI Chat
      { path: 'chat', element: <Navigate to="/chat/consulta" replace /> },
      { path: 'chat/consulta', element: stub('Consulta', 3) },
      { path: 'chat/artefato', element: stub('Artefato', 3) },
      { path: 'chat/research', element: stub('Research', 3) },
      { path: 'chat/chat', element: stub('Chat', 3) },

      // Fase 4 — Processos Inteligentes
      { path: 'processos', element: stub('Processos Inteligentes', 4) },
      { path: 'processos/dashboard', element: stub('Dashboard de Processos', 4) },
      { path: 'processos/artefatos', element: stub('Status de Artefatos', 4) },
      { path: 'processos/workflow', element: stub('Fluxos de Trabalho', 4) },
      { path: 'processos/modelos', element: stub('Modelos Personalizados', 4) },

      // Fase 5 — módulos operacionais
      { path: 'catalogo', element: stub('Catálogo de Itens', 5) },
      { path: 'necessidades', element: stub('Registro de Necessidades', 5) },
      { path: 'normativa', element: stub('Normativa', 5) },
      { path: 'analisadores', element: stub('Analisadores de Processos', 5) },

      // Fase 6 — Academy
      { path: 'academy', element: stub('SollAI Academy', 6) },
      { path: 'academy/:trilhaId', element: stub('Trilha', 6) },

      // Fase 7 — menu de usuário
      { path: 'usuario/dados', element: stub('Meus dados', 7) },
      { path: 'usuario/instituicao', element: stub('Dados da instituição', 7) },
      { path: 'usuario/usuarios', element: stub('Gerenciar usuários', 7) },
      { path: 'usuario/envolvidos', element: stub('Envolvidos em assinaturas', 7) },
      { path: 'usuario/unidades', element: stub('Unidades / Setores', 7) },
      { path: 'usuario/relatorio', element: stub('Relatório de uso', 7) },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
