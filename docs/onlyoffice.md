# Editor de Modelo — ONLYOFFICE Docs

O SollAI real usa o **ONLYOFFICE Docs** (Document Server) como editor de
documentos — é o que aparece nas telas de "Modelo Personalizado" e
"Ver Documento" (ribbon "Lar / Inserir / Layout / ...", "Mesa", "Ligação",
"Alterações percebidas" — tradução PT-BR do OnlyOffice).

O clone conecta no **mesmo editor**, rodando localmente via Docker.

## Subir o Document Server

```bash
docker run -d --name onlyoffice-ds --restart unless-stopped -p 8082:80 \
  -e JWT_ENABLED=false \
  -e ALLOW_PRIVATE_IP_ADDRESS=true \
  -e ALLOW_META_IP_ADDRESS=true \
  onlyoffice/documentserver
```

As três variáveis são necessárias neste setup local:

- `JWT_ENABLED=false` — sem isso o editor recusa o documento com
  `errorCode -20` ("token de segurança não formado corretamente"), pois
  o servidor exige um JWT assinado que não geramos aqui.
- `ALLOW_PRIVATE_IP_ADDRESS=true` / `ALLOW_META_IP_ADDRESS=true` — sem
  isso o Document Server bloqueia (SSRF protection) o download do
  `.docx` em `host.docker.internal` com `errorCode -4` ("Erro ao baixar
  arquivo"), porque esse endereço resolve para uma faixa de IP privada.

Aguarde o container ficar saudável (a primeira vez baixa a imagem, ~5GB):

```bash
docker logs -f onlyoffice-ds   # espere aparecer "documentserver ... started"
curl http://localhost:8082/healthcheck   # deve responder "true"
```

**Depois do healthcheck responder `true`, espere mais ~30s** antes de
abrir o editor — o serviço interno de coautoria (`docservice`, porta
8000 dentro do container) ainda está subindo; abrir cedo demais mostra
"Perda de conexão" (nginx loga `connect() failed ... 127.0.0.1:8000`
nesse intervalo). Depois que sobe, fica estável.

## Rodar o clone

```bash
npm run dev   # fixo na porta 5175 (vite.config.ts)
```

Abra **Processos Inteligentes → Modelos Personalizados → Editar**.

### Como a integração funciona

- `ModeloEditorModal.tsx` carrega `http://localhost:8082/web-apps/apps/api/documents/api.js`
  e instancia `new DocsAPI.DocEditor(...)`.
- O componente que hospeda o editor (`OnlyOfficeEditor`) é isolado com
  `React.memo` e nunca re-renderiza depois do mount — o DocsAPI substitui
  a `<div>` alvo por um iframe assim que carrega, e se o React tentasse
  reconciliar essa div depois (por causa do estado "carregando/pronto" do
  componente pai, por exemplo), a reconciliação quebrava com
  `NotFoundError: insertBefore ... not a child of this node`.
- O documento aberto é `public/modelos/termo-referencia.docx` — o
  Document Server (dentro do container) busca esse arquivo em
  `http://host.docker.internal:5175/modelos/termo-referencia.docx`, por
  isso o Vite precisa estar acessível na rede (`server.host: true`),
  numa porta fixa (5175) e com esse host liberado
  (`server.allowedHosts`) — por padrão o Vite responde 403 a um `Host:`
  que não reconhece.
- Sem `callbackUrl` configurado (não há backend), o **salvamento não
  persiste** — a edição funciona normalmente na sessão (testado: digitar,
  formatar, etc.), mas fechar o editor descarta as alterações. Para
  persistir de verdade, seria preciso um endpoint de callback que
  recebesse o `.docx` editado do Document Server.

### Gerar/atualizar o .docx de exemplo

```bash
python -m pip install python-docx
python scripts/gerar_modelo_docx.py
```

Regenera `public/modelos/termo-referencia.docx` a partir do mesmo
conteúdo de `MODELO_TEMPLATE` (`src/mocks/index.ts`) — mantenha os dois
sincronizados se o modelo mudar.

## Se o Document Server não estiver rodando

O editor mostra um aviso ("Document Server indisponível") em vez de
quebrar a tela — suba o container e reabra o modelo.
