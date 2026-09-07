# Integração com as APIs públicas de compras

O sistema já está desenhado para trocar os **mocks** por chamadas reais sem
mexer na UI. Toda a lógica de acesso a dados externos vive em `src/services/`
e usa os **nomes de campo canônicos** das APIs do governo.

## Fontes

| API | Base | Auth | Uso |
| --- | --- | --- | --- |
| PNCP – API | `https://pncp.gov.br/api/pncp` | Token (escrita) | Publicar PCA, itens, contratações |
| PNCP – Consulta | `https://pncp.gov.br/api/consulta` | Não | Leitura de PCA/contratações publicadas |
| Compras.gov.br – Dados Abertos | `https://dadosabertos.compras.gov.br` | Não | CATMAT/CATSER, PGC, pesquisa de preços |

## `src/services/` — o que trocar

### `catalogoService.ts`  (CATMAT / CATSER)

Mock hoje. Endpoints reais (Dados Abertos):

- Material: `/modulo-material/1_consultarGrupoMaterial`, `2_consultarClasseMaterial`,
  `3_consultarPdmMaterial`, `4_consultarItemMaterial`,
  `6_consultarMaterialUnidadeFornecimento`
- Serviço: `/modulo-servico/1_consultarSecaoServico` … `5_consultarSubClasseServico`,
  `6_consultarItemServico`, `7_consultarUndMedidaServico`

Mapa de campos (`CatalogoItemRef` ↔ API ↔ store `useCatalogo`):

| `CatalogoItemRef` | API dados abertos | store `CatalogoItem` |
| --- | --- | --- |
| `codigoItemCatalogo` | `codigoItem` / `codigoServico` | `codigo` |
| `descricaoItem` | `descricaoItem` / `nomeServico` | `nome` |
| `materialOuServico` | módulo (material/servico) | `tipo` (`Material`/`Serviço`) |
| `grupo` / `classe` / `pdm` | `nomeGrupo` / `nomeClasse` / `nomePdm` | — |
| `secao` / `divisao` / `subclasse` | idem serviço | — |
| `unidadeFornecimento` | `siglaUnidadeFornecimento` / `siglaUnidadeMedida` | `unidade` |
| `informacaoComplementar` | descrição detalhada | `especificacao` |

### `pcaService.ts`  (Plano de Contratação Anual)

**Leitura já é REAL** — API do PNCP via proxy `/pncp-api` (dev: `vite.config.ts`;
produção: um backend/edge equivalente). Fallback automático p/ mock quando o
proxy não existe (build sem dev-server) ou a rede falha.

- Órgão:   `GET /api/pncp/v1/orgaos/{cnpj}` → `razaoSocial`.
- Unidades: `GET /api/pncp/v1/orgaos/{cnpj}/unidades` → `codigoUnidade`,
  `nomeUnidade`, `municipio.nome`, `municipio.uf.siglaUF`.
- Itens:   `GET /api/pncp/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens`
  `?pagina&tamanhoPagina` → array de itens (204 = sequencial vazio).
  Campos: `descricao`, `quantidade`, `valorUnitario`, `valorTotal`,
  `unidadeFornecimento`, `classificacaoSuperiorNome`, `categoriaItemPcaNome`,
  `codigoUnidade`, `nomeUnidade`, `dataPublicacaoPncp`.
- **Não há** endpoint GET de cabeçalho do PCA (só `POST`); o cabeçalho
  (`PcaCabecalho`) é derivado dos itens do sequencial.
- `pcaService` varre os sequenciais 1..30 em paralelo e mantém em cache
  (`cnpj|ano`) os itens de cada PCA.
- **Escrita** (módulo futuro "Criar PCA"): PNCP
  `POST /v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens` (até 2000 itens/req),
  `PATCH`/`DELETE` no mesmo path.

Campos do item do PCA (PNCP `IncluirPlanoContratacaoItemDTO`):
`numeroItem`, `materialOuServico`, `categoriaItemId`, `criterioJulgamentoId`,
`aplicabilidadeMargemPreferencia`, `exigenciaConteudoNacional`, `descricao`,
`informacaoComplementar`, `unidadeFornecimento`, `valorUnitarioEstimado`,
`quantidadeEstimada`.

### `precosService.ts`  (Pesquisa de Preços — módulo futuro)

Mock hoje, ainda não consumido na UI.

- Dados Abertos `/modulo-pesquisa-preco/1_consultarMaterial` e
  `/3_consultarServico` `?codigoItemCatalogo&codigoUasg&estado&dataCompraInicio&dataCompraFim`
  → `idCompra`, `precoUnitario`, `quantidade`, `nomeFornecedor`, `niFornecedor`.
- `/2_` e `/4_` variantes "detalhe".

## Como ligar de verdade

1. No método do service, trocar o corpo por `fetch(<endpoint>)` mantendo a
   assinatura e o tipo de retorno.
2. Mapear a resposta da API para o tipo canônico de `src/services/types.ts`.
3. A UI (`ImportarCatMatModal`, `ImportarPcaModal`, futuro módulo de preços)
   não muda.
