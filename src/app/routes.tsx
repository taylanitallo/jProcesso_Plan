import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/shell/AppLayout'
import { RequireAuth } from './RequireAuth'
import { LoginPage } from '../modules/auth/LoginPage'
import { HomePage } from '../modules/home/HomePage'
import { ConsultaPage } from '../modules/chat/ConsultaPage'
import { ArtefatoPage } from '../modules/chat/ArtefatoPage'
import { ResearchPage } from '../modules/chat/ResearchPage'
import { AnalisadoresPage } from '../modules/analisadores/AnalisadoresPage'
import { CatalogoItensPage } from '../modules/catalogo/CatalogoItensPage'
import { RegistroNecessidadePage } from '../modules/necessidades/RegistroNecessidadePage'
import { ProcessosInteligentesPage } from '../modules/processos/ProcessosInteligentesPage'
import { DashboardProcessoPage } from '../modules/processos/DashboardProcessoPage'
import { StatusArtefatosPage } from '../modules/processos/StatusArtefatosPage'
import { ProcessosWorkflowPage } from '../modules/processos/ProcessosWorkflowPage'
import { ModeloPersonalizadoPage } from '../modules/processos/ModeloPersonalizadoPage'
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

      { path: 'Consulta', element: <ConsultaPage /> },
      { path: 'Artefato', element: <ArtefatoPage /> },
      { path: 'Research', element: <ResearchPage /> },
      { path: 'AnalisadoresProcesso', element: <AnalisadoresPage /> },

      { path: 'CatalogoItens', element: <CatalogoItensPage /> },
      { path: 'RegistroNecessidade', element: <RegistroNecessidadePage /> },
      { path: 'processosinteligentes', element: <ProcessosInteligentesPage /> },
      { path: 'DashboardProcesso', element: <DashboardProcessoPage /> },
      { path: 'StatusArtefatos', element: <StatusArtefatosPage /> },
      { path: 'ProcessosWorkflow', element: <ProcessosWorkflowPage /> },
      { path: 'ModeloPersonalizado', element: <ModeloPersonalizadoPage /> },

      { path: 'SollAcademy', element: <SollAcademyPage /> },
      { path: 'Normativa', element: <NormativaPage /> },

      { path: 'GerenciarUsuarios', element: <GerenciarUsuariosPage /> },
      { path: 'TipoEnvolvidoAssinatura', element: <TipoEnvolvidoAssinaturaPage /> },
      { path: 'GerenciarUnidadeSetor', element: <GerenciarUnidadeSetorPage /> },
      { path: 'RelatorioUso', element: <RelatorioUsoPage /> },

      { path: '*', element: <Navigate to="/Home" replace /> },
    ],
  },
])
