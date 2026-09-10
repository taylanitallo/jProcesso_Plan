import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/shell/AppLayout'
import { RequireAuth } from './RequireAuth'
import { RequireCapability } from './RequireCapability'
import { LoginPage } from '../modules/auth/LoginPage'
import { HomePage } from '../modules/home/HomePage'
import { ResearchPage } from '../modules/chat/ResearchPage'
import { AnalisadoresPage } from '../modules/analisadores/AnalisadoresPage'
import { CatalogoItensPage } from '../modules/catalogo/CatalogoItensPage'
import { RegistroNecessidadePage } from '../modules/necessidades/RegistroNecessidadePage'
import { CriarPcaPage } from '../modules/pca/CriarPcaPage'
import { ProcessosInteligentesPage } from '../modules/processos/ProcessosInteligentesPage'
import { DashboardProcessoPage } from '../modules/processos/DashboardProcessoPage'
import { StatusArtefatosPage } from '../modules/processos/StatusArtefatosPage'
import { ProcessoDetailPage } from '../modules/processos/ProcessoDetailPage'
import { ProcessosWorkflowPage } from '../modules/processos/ProcessosWorkflowPage'
import { WorkflowDetailPage } from '../modules/processos/WorkflowDetailPage'
import { ModeloPersonalizadoPage } from '../modules/processos/ModeloPersonalizadoPage'
import { RevisaoProcessoPage } from '../modules/processos/RevisaoProcessoPage'
import { SollAcademyPage } from '../modules/academy/SollAcademyPage'
import { NormativaPage } from '../modules/normativa/NormativaPage'
import { GerenciarUsuariosPage } from '../modules/usuario/GerenciarUsuariosPage'
import { TipoEnvolvidoAssinaturaPage } from '../modules/usuario/TipoEnvolvidoAssinaturaPage'
import { GerenciarUnidadeSetorPage } from '../modules/usuario/GerenciarUnidadeSetorPage'
import { RelatorioUsoPage } from '../modules/usuario/RelatorioUsoPage'

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
      { index: true, element: <Navigate to="/Home" replace /> },
      { path: 'Home', element: <HomePage /> },

      { path: 'Consulta', element: <Navigate to="/Research" replace /> },
      { path: 'Artefato', element: <Navigate to="/Research" replace /> },
      { path: 'Research', element: <ResearchPage /> },
      { path: 'AnalisadoresProcesso', element: <AnalisadoresPage /> },

      { path: 'CatalogoItens', element: <CatalogoItensPage /> },
      { path: 'RegistroNecessidade', element: <RegistroNecessidadePage /> },
      { path: 'CriarPca', element: <CriarPcaPage /> },
      { path: 'processosinteligentes', element: <ProcessosInteligentesPage /> },
      { path: 'DashboardProcesso', element: <DashboardProcessoPage /> },
      { path: 'StatusArtefatos', element: <StatusArtefatosPage /> },
      { path: 'Processo/:id', element: <ProcessoDetailPage /> },
      { path: 'ProcessosWorkflow', element: <ProcessosWorkflowPage /> },
      { path: 'Workflow/:id', element: <WorkflowDetailPage /> },
      { path: 'ModeloPersonalizado', element: <ModeloPersonalizadoPage /> },
      { path: 'RevisaoProcesso/:id', element: <RevisaoProcessoPage /> },

      { path: 'SollAcademy', element: <SollAcademyPage /> },
      { path: 'Normativa', element: <NormativaPage /> },

      {
        path: 'GerenciarUsuarios',
        element: (
          <RequireCapability cap="gerenciarUsuarios">
            <GerenciarUsuariosPage />
          </RequireCapability>
        ),
      },
      {
        path: 'TipoEnvolvidoAssinatura',
        element: (
          <RequireCapability cap="gerenciarEnvolvidos">
            <TipoEnvolvidoAssinaturaPage />
          </RequireCapability>
        ),
      },
      {
        path: 'GerenciarUnidadeSetor',
        element: (
          <RequireCapability cap="gerenciarUnidadeSetor">
            <GerenciarUnidadeSetorPage />
          </RequireCapability>
        ),
      },
      {
        path: 'RelatorioUso',
        element: (
          <RequireCapability cap="relatorioUso">
            <RelatorioUsoPage />
          </RequireCapability>
        ),
      },

      { path: '*', element: <Navigate to="/Home" replace /> },
    ],
  },
])
