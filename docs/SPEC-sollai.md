# SollAI — mapa real do sistema (app.sollai.com.br)

Capturado por navegação autenticada (Playwright headless) em 2026-09-03.
O clone reproduz esta estrutura/telas/copy com a **identidade visual do Geração Tech**
(tokens em `src/index.css`). Login mock aceita qualquer credencial bem-formada.

## Shell / TopBar

- Barra fixa branca translúcida. Esquerda: logo (ícone árvore-circuito + "SollAi").
- Após o logo, quando dentro de um módulo: **ícones de contexto** do módulo ativo
  (ex.: Consulta = balança, Artefato = livro, Research = lupa, base = cilindro DB).
- Centro: banner de aviso do contrato — `⚠ Seu contrato encerra em 5 dias. Entre em contato com nossa equipe para renovação.` (amarelo claro).
- Direita: sino de notificações com badge (`18`) + avatar (menu do usuário).
- Fundo geral das páginas internas: azul bem claro (`#e8eef9`-ish).
- Rodapé: `© 2026 Grupo Negócios Públicos.` (algumas telas: `© 2025 SollAI | Inteligencia Artificial .`).

### Menu do usuário (dropdown do avatar)

Itens: **Dados** · **Dados da Instituição** · **Mudar senha** · **Método de trabalho** ·
Gerenciar Usuários (`/GerenciarUsuarios`) · Gerenciar Envolvidos em Assinaturas (`/TipoEnvolvidoAssinatura`) ·
Gerenciar Unidade/Setor (`/GerenciarUnidadeSetor`) · Relatório de Uso (`/RelatorioUso`) ·
Falar com o suporte (link externo) · **Sair**.

Modais:
- **Redefina sua senha**: Senha atual · Nova senha · Confirme a nova senha → botão `Salvar alterações`.
- **Atualize seu perfil** (Dados): Nome · E-mail · Telefone · Celular · Data de Nascimento → `Salvar atualizações`.
- **Atualize os dados da sua instituição**: upload "Clique para enviar o logo — PNG ou JPG, até 5MB" ·
  "Logo do sistema (SollAI) — PNG ou JPG, até 5MB" · CNPJ · … → `Salvar atualizações`.
- **Método de trabalho.**: link "Manual do Usuário.".

### Notificações (popover do sino)

Tabs `Não lidas` / `Todas`; botão `Marcar todas como lidas`; lista de itens.

## Home  (`/Home`)

- Ícone circular gradiente centralizado.
- H1 `Bem vindo à SollAI!` · subtítulo `O que deseja fazer hoje?`.
- **4 cards** (grid 2 col):
  1. **SollAI Chat** — "Consultas inteligentes, geração automática de documentos e analisadores especializados para ganhar tempo e decidir com segurança."
  2. **Orientação Técnica** — *bloqueado/cinza* — "IA potencializada pela inteligência humana do nosso corpo técnico especializado."
  3. **SollAI Academy** — "Trilhas personalizadas com IA para acelerar seu domínio nas compras públicas."
  4. **Processos Inteligentes** — "Mais controle e eficiência na gestão dos seus processos de licitação, com IA, modelos próprios e fluxos de trabalho automatizados"

### SollAI Chat (2º nível, mesmo `/Home`)  → 3 cards

- **Consulta Inteligente** → `/Consulta`
- **Artefato** → `/Artefato`
- **Research** → `/Research`

### Processos Inteligentes (2º nível)  → 4 cards

- **Catálogo de Itens** — "Gerencie seus itens ligados ao CatMat/CatSer." → `/CatalogoItens`
- **Registro de Necessidades** — "Registre demandas do setor para contratação." → `/RegistroNecessidade`
- **Analisadores de Processos** — "Analise processos de licitação com analisadores especializados em IA." → `/AnalisadoresProcesso`
- **Processos Inteligentes** — → `/processosinteligentes`

## Consulta  (`/Consulta`)

Layout 2 colunas.
- **Painel Histórico** (~360px, branco): título `Histórico` + botão redondo teal `+`.
  Tabs pill: `Consulta` (ativo, gradiente teal→azul) · `Artefato` · `Research`.
  Busca `Pesquisar no histórico...`. Lista: ícone + título truncado por item.
  Rodapé: `Total Consultas: 1/Ilimitado` + barra full-width gradiente `Ilimitado`.
- **Área principal**: bolha IA (avatar gradiente, borda-esquerda teal) `Como posso ajudá-lo hoje?`.
  Rodapé fixo: textarea grande `Digite sua pergunta aqui...` + botão `Enviar Pergunta` (ícone avião, desabilitado quando vazio).
- Seção `Referências da pesquisa` aparece após resposta.

## Artefato  (`/Artefato`)

Mesmo shell (tabs Consulta/Artefato/Research). Rodapé `Total Artefatos: 0/Ilimitado`.
Wizard passo 1 — bolha IA `Escolha a legislação: (Baseado em qual lei deseja a resposta).`
Radios:
- `14.133 - DE 1º DE ABRIL DE 2021 - Lei de Licitações e Contratos Administrativos.`
- `13.303 - DE 30 DE JUNHO DE 2016 - Dispõe sobre o estatuto jurídico da empresa pública...`
- `Sistema S`
Botão `Próximo` (outline azul, canto inf. dir.).

## Research  (`/Research`)  e  Analisadores  (`/AnalisadoresProcesso`)

Mesmo wizard. Research tem tabs; Analisadores não (só busca + lista), rodapé `Total Analisadores: 0/Ilimitado`.
Passo 1 — `O que deseja fazer hoje? Selecione uma função na qual eu possa atuar para você.`
Radios:
- Análise Comparativa e Crítica
- Analisador de Impugnações de Edital
- Analisador de Pedidos de Esclarecimento
- Analisador de Recursos
- Analisador de Despacho Jurídico
- Analisador de Certidões em Processos Licitatórios
- Analisador de Contrarrazões
Botão `Próximo`. Research rodapé `Total Researchs: 0/Ilimitado`.

## Catálogo de Itens  (`/CatalogoItens`)

- H1 `Catálogo de Itens` · sub `Configure os itens cadastrados para seus processos!`.
- Toolbar: `+ Novo Item` (azul) · `+ Importar CatMat/CatSer` (verde) · busca `Buscar` · `+ Importar Excel` (roxo, à direita).
- Tabela: `CÓDIGO · REFERÊNCIA · NOME ITEM · TIPO DE ITEM · ORIGEM DO ITEM · AÇÕES`.
- Vazio: ícone `+`, `Nenhum item encontrado`, `Crie ou importe seu primeiro item voltado aos processos inteligentes!`.
- Paginação « » · `Registros encontrados: 0`.

## Registro de Necessidades  (`/RegistroNecessidade`)

- H1 `Registros de Necessidade` · sub `Visualize registros e itens cadastrados`.
- Tabs sup. dir.: `Meus Registros` (ativo) · `Solicitações de Preenchimento`.
- Toolbar: `+ Novo Registro` (azul) · `+ Importar PCA/PNCP` (verde) · busca `Buscar por Nome / Descrição` · `+ Importar Excel` (roxo).
- Tabela: `NOME · SETOR · ITENS UTILIZADOS · ATIVO · INCLUSÃO · DATA DESEJADA · AÇÕES`.
- Vazio: `Nenhum registro encontrado` / `Tente ajustar o filtro.`.

## Processos Inteligentes  (`/processosinteligentes`)

- H1 `Processos Inteligentes` · sub `Gerencie e acompanhe seus processos de forma inteligente`.
- Linha de botões: `Dashboard` (azul, chart) · `Agenda` (grafite, calendário) · `Revisões` (âmbar) ·
  `Aprovações` (verde) · `Assinaturas` (roxo) · card `TOTAL DE PROCESSOS  0 / Ilimitado` (outline).
- Botão full-width outline: `STATUS INDIVIDUAL DE CADA ARTEFATO`.
- Card tabela: toolbar `+ Novo ▾` (split azul) · busca `Buscar por Nome` · botão filtro (funil).
- Colunas: `ID · NÚMERO · TIPO · NOME · PROPRIETÁRIO · INTEGRANTES · DATA DE INCLUSÃO · STATUS · AÇÕES`.
- Linha exemplo: `1 · 1 · Pregão - Bens e Serviços · PERMANENTE · AL(avatar) · — · 16/12/2025 · Ativo(badge) · [Detalhes](verde) ⋮`.
- Paginação pills « [1] » · `Registros encontrados: 1`.

### Wizard "Novo Processo" (+ Novo)

Campos: Número do Processo · Legislação · Tipo de Processo · Nome do Processo · Lote Único · Descrição do Processo.
Seções do processo: Artefato · Histórico · Status · Upload.
**Mapa de Risco**: Diretrizes de Risco · Registro de Risco · Planos de Ação.
- Etapa 1 - Identificação dos Riscos (colunas: ITEM DA COLUNA · DESCRIÇÃO · REFERÊNCIA)
- Etapa 2 - Avaliação do Risco (Escala de Probabilidade [Nível/Probabilidade] · Escala de Impacto Qualitativo [Impacto] · Escala de Impacto Quantitativo)
- Etapa 3 - Resposta ao Risco

_(Dashboard, modais Agenda/Revisões/Aprovações/Assinaturas e Status Individual: detalhar em 2ª passada.)_

## SollAI Academy  (`/SollAcademy`)

- Hero navy: H1 `A melhor capacitação em licitações do Brasil` +
  `Aulas exclusivas com especialistas renomados, cobrindo tudo que você precisa: licitações, contratos, pregão, governança e muito mais. Comece sua trilha de aprendizado agora mesmo.`
  Boxes dir.: `Minhas Trilhas` [Acessar] · `Todas as Categorias` [Ver tudo].
- Carrossel destaque (3 cards, setas ‹ ›).
- Rails por categoria (cada: título + `Ver tudo ›` + cards de curso com thumb gradiente/título sobreposto, corpo com título + descrição + `Autor: Negócios Públicos`):
  `A fase preparatória` · `Contratos` · `Lei 13.303/16 – Estatais` ·
  `Lei de Licitações e contratos – 14.133/2021` · `Obras e serviços de engenharia` ·
  `Patrimônio Público` · `SollAI Explica` · `TCU, CGU e Controle Interno`.
- Faixa navy final: `Aproveite todo o potencial da Soll Academy` / `Transforme seu conhecimento e alcance novos patamares na sua carreira`.

## Normativa  (`/Normativa`)

- Painel esq.: `Normativas` / `Envie suas normativas para a IA utilizar` + botão teal `+`.
  Busca `Pesquisar normativas...`. `2 normas enviadas`.
  Itens: ícone arquivo + nome + badge verde `PROCESSADO` (ex.: `DECRETO_120_2023_0000001.pdf`, `INSTRUÇÃO NORMATIVA TCE-CE Nº 01.2...`).
- Modal upload: `Envie a sua Normativa.` · `Selecionar Arquivo` · `Limite de arquivos até 800 MB.` · `Enviar`.
- Direita: canvas de detalhe (vazio).

## Gerenciar Usuários  (`/GerenciarUsuarios`)

- H1 `Gerenciamento de Usuários` · sub `Gerencie permissões e acesso dos usuários do sistema`.
- Tabs pill: `Gerenciamento de Usuários` (ativo) · `Assinatura Eletrônica`.
- Card resumo: bullets com check verde — `SollAI Chat: 0 de 3` · `Processos Inteligentes: 0 de 3` ·
  `SollAI Academy: 0 de 3` · `Analisadores Processo: 0 de 3`. Dir.: `Total de Usuários  0 de 3` + `+ Novo Usuário`.
- Card usuário (borda esq. âmbar): avatar · `ALEF MATHEUS TEIXEIRA DE SOUSA` · badge `👑 Gestor de Contrato` ·
  ações lápis + certificado · faixa `ℹ Este usuário possui todas as permissões`.
- `Nenhum usuário encontrado!`.

## Envolvidos em Assinaturas  (`/TipoEnvolvidoAssinatura`)

- H1 `Categorias de Assinantes` · sub `Gerencie as categorias que identificam a função de cada assinante envolvido ao artefato.`
- `+ Nova Categoria` (azul).
- Tabela `CATEGORIA DE ASSINANTE · AÇÕES` (ação: `Detalhes` verde + lixeira vermelha).
- **23 registros** (4 páginas). Pág 1: Agente de Contratação · Agente de Planejamento da Contratação ·
  Assessor Jurídico · Autoridade Superior · Comissão de Ética ou Integridade · Corregedoria · Equipe de Apoio.
  _(restante: ver `d-categorias.txt`.)_

## Unidade/Setor  (`/GerenciarUnidadeSetor`)

- H1 `Gerenciamento de Unidade e Setor` · sub `Gerencie os Unidades e Setores da instituição`.
- Tabs sup. dir.: `Unidades` (ativo) · `Setores`.
- Card: eyebrow `UNIDADES` · título `Unidades da instituição` · `+ Nova Unidade`.
- Vazio: `Nenhuma unidade cadastrada` / `Registre as unidades da instituição.`.

## Relatório de Uso  (`/RelatorioUso`)

- Título centralizado `Relatório de Uso`.
- Tabs pill: `Consultas` (ativo) · `Artefatos` · `Researchs` · `Processos`.
- Card `Filtrar por Período`: `Data Inicial` (‹) · `Data Final` (›) · `Filtrar` (azul, funil).
- Card `Consultas` + menu ⋮: tabela `LEGISLAÇÃO · FORMATO · PERGUNTA · USUÁRIO · DATA`.
  Ex.: `14.133 · Parecer Técnico · ESTOU COM UM PROJETO... · ALEF MATHEUS TEIXEIRA DE SOUSA · 01/09/2026 às 01:33`.
- `Registros encontrados: 1`.

## Orientação Técnica

Card bloqueado na Home; sem rota (não navega).
