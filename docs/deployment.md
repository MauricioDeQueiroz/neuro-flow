# Publicação estática e portátil

O GitHub Pages já hospeda a prévia de revisão. A atualização do mesmo link foi
autorizada pelo responsável; a hospedagem comercial, domínio e DNS continuam
pendentes. Os passos abaixo também permitem preparar o pacote para outros provedores.

## Prévia no GitHub Pages

Endereço mantido: https://mauriciodequeiroz.github.io/neuro-flow/.
O fluxo `.github/workflows/pages.yml` executa `npm test` e `npm run build` em Node 22
e envia apenas `dist/` ao Pages. Esses comandos usam apenas módulos nativos do Node;
o fluxo não precisa instalar dependências. O CSS é compilado localmente e versionado;
o fluxo não o recompila. A origem de publicação em Settings → Pages deve ser
**GitHub Actions**, substituindo a publicação anterior da raiz de `main`.

Após cada push autorizado em `main`, acompanhe o fluxo na aba Actions e confira
o endereço quando o deploy concluir. Há também execução manual por workflow_dispatch.
O rascunho e o noindex permanecem ativos; o checkout múltiplo continua bloqueado.
Não use esta prévia como lançamento comercial; a escolha do provedor final permanece
pendente. As regras de `vercel.json` não se aplicam ao GitHub Pages.

Referência: [fluxos personalizados do Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Pacote público

Requisitos: Node.js 22 ou superior e npm. Não há servidor de aplicação em produção.

```bash
npm ci
npm test
npm run css
npm run build
npm run dev
```

`npm run dev` serve apenas arquivos públicos em `http://127.0.0.1:3000` (porta
configurável por `PORT`), sem baixar `serve` via npx. É um servidor de desenvolvimento,
sem TLS, compressão ou cache de produção. `npm run build` copia o CSS já compilado
e os demais arquivos permitidos para `dist/`; não publica nem recompila CSS.
Versione `assets/css/tailwind.css` após alterar HTML, JS ou o fonte CSS.

Publique **somente o conteúdo de `dist/`**. Não publique a raiz do repositório,
`.git`, `.claude`, `.env`, documentação, scripts, testes, package.json ou node_modules.
O empacotador recusa arquivos inesperados em `dist/`, sem apagá-los. Se houver erro,
revise o arquivo apontado; não copie um diretório com conteúdo antigo sem revisão.
Ao adicionar novos tipos de recurso público, atualize `scripts/public-files.mjs`.

`404.html` deve ser entregue com status **404**, inclusive em caminhos aninhados.
Não configure fallback de SPA que responda `index.html` com 200 para qualquer URL.
Os caminhos da página são relativos e permitem instalação em subdiretório; as URLs
absolutas de canonical, compartilhamento e sitemap precisam refletir esse caminho.

## Classificação das configurações

| Configuração | Classe | Uso |
|---|---|---|
| HTML, assets, robots.txt, sitemap.xml | A — independente | Arquivos estáticos; URLs finais ainda pendentes |
| scripts/build.mjs e dist/ | A — independente | Empacotamento por lista permitida |
| vercel.json | B — específica, opcional | Empacota sem compilar CSS; publica dist; configura headers e cache apenas se Vercel for escolhida |
| .nojekyll | B — específica, opcional | Desabilita Jekyll no GitHub Pages; inofensiva nos demais |
| Domínio, TLS, redirects, compressão, HSTS | C — publicação | Dependem do servidor/CDN escolhido |
| Cache immutable anterior em imagens com nomes estáveis | E — problemática, corrigida localmente | Substituído por revalidação; não altera caches remotos já existentes |
| Comando anterior npx serve . | E — problemática, substituída | Download não fixado e exposição da raiz no servidor de desenvolvimento |

Não foi necessário remover arquivos por classificá-los como desnecessários (D).
`cleanUrls` é conveniência opcional da Vercel; as âncoras da página não dependem dela.

## Camadas de segurança

- **Aplicação:** checkout exige URL HTTPS absoluta e sem credenciais; apenas parâmetros
  permitidos são repassados, sem sobrescrever os do destino. Entrada da campanha não
  define o destino. Não há inserção de conteúdo externo por innerHTML. IDs de vídeo
  e pixels são validados. Pixels só iniciam após permissão explícita nesta aba.
- **Servidor HTTP:** MIME correto, headers abaixo, status 404 real, exclusão de arquivos
  privados, compressão Brotli/gzip e estratégia de cache. O servidor local verifica
  apenas parte disso. A presença de vercel.json não comprova respostas de produção.
- **DNS/TLS/CDN:** certificado válido, renovação, redirect HTTP → HTTPS, domínio canônico
  e proteção operacional. Nada disso foi configurado ou verificado remotamente.
- **Provedor:** traduzir regras para o serviço escolhido e conferir as respostas reais.

Headers recomendados, com uma candidata a CSP inicialmente em **Report-Only**:

```text
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cache-Control: public, max-age=0, must-revalidate
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' https://connect.facebook.net https://www.googletagmanager.com; style-src 'self'; img-src 'self' data: https://www.facebook.com https://*.google-analytics.com https://*.googletagmanager.com; font-src 'self'; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.facebook.com; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'
```

A CSP candidata não usa unsafe-inline/unsafe-eval e não bloqueia recursos enquanto
estiver em Report-Only. Sem endpoint de relatório, confira mensagens no console.
Valide vídeo dos dois provedores e todas as integrações realmente habilitadas antes
de convertê-la em `Content-Security-Policy`. Fontes e imagens locais não requerem CDN.
Navegar ao checkout por link não exige liberar sua origem em connect-src/frame-src.
Não substitua estes headers por meta tags. Não foi ativado HSTS: só definir após
confirmar HTTPS estável; não adicionar preload/includeSubDomains sem auditoria do domínio.
Referência: [OWASP HTTP Headers](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html).

Para Cloudflare Pages/Netlify, traduza os headers para `_headers` **no pacote público**
quando o serviço for escolhido; o empacotador atual não copia esse arquivo.
Na hospedagem Nginx, configure headers com `always`, tipos MIME, compressão, raiz em
dist e `try_files $uri $uri/ =404` (com error_page para 404.html). Configure o bloco
para o domínio/caminho escolhido e teste também respostas de erro.
Veja [Cloudflare headers](https://developers.cloudflare.com/pages/configuration/headers/).

## Cache e verificação remota

O build versiona as URLs do CSS e do JavaScript em `dist/index.html` com `?v=` e
um hash do conteúdo. A versão só muda quando o recurso muda, evitando que o HTML
novo use CSS/JS de uma publicação anterior ainda no cache. Os nomes dos arquivos e
as referências do HTML fonte local são preservados. O HTML em si ainda está sujeito
ao cache do provedor; uma aba já aberta precisa ser recarregada para receber a versão.

HTML, CSS, JS, imagens e fontes usam nomes estáveis: revalide com ETag/Last-Modified;
`max-age=0, must-revalidate` permite armazenar, mas exige verificar atualização.
Só adote cache longo/immutable para nomes com versão/hash. URLs já armazenadas com a
regra antiga de um ano podem exigir novos nomes ou invalidação no provedor anterior.
Recursos externos têm cache definido pelos respectivos provedores.

Depois de publicar com autorização, verificar pelo ambiente que efetivamente entrega:
status/Content-Type/headers de `/`, assets e caminho inexistente; redirect HTTP;
certificado; ausência de arquivos privados; compressão; cache e renovação de assets.
Repetir os testes de navegador, Lighthouse e validações de PREENCHER.md na URL final.

## Opções de hospedagem

Consulta às fontes oficiais em 21/10/2026; confirmar condições ao contratar.

| Opção | Adequação e custo | Operação e ressalvas |
|---|---|---|
| Cloudflare Pages | Candidata inicial para este pacote estático; há plano gratuito com limites | CDN/TLS e configuração de headers; revisar termos comerciais da conta, limites e política de uso antes de escolher |
| Netlify | Alternativa simples; Free admite projetos comerciais | Créditos/limites podem pausar o site; revisar também badge em novos projetos Free |
| Vercel Pro | Compatível; plano comercial pago | Configuração opcional já preparada; Hobby é restrito a uso pessoal não comercial |
| Nginx/hospedagem estática tradicional | Compatível; custo varia por fornecedor | Mais controle, mas exige manutenção de TLS, headers, cache e compressão |
| GitHub Pages | Não recomendado para esta página comercial | Política restringe sites destinados principalmente a facilitar transações comerciais; headers também têm menos controle |

A preferência técnica por Cloudflare Pages ou Netlify é uma recomendação, não decisão
de produto. Não é preciso migrar framework ou criar backend para usar qualquer opção.
Fontes: [Cloudflare limites](https://developers.cloudflare.com/pages/platform/limits/),
[Netlify uso comercial](https://www.netlify.com/blog/introducing-netlify-free-plan/),
[Netlify créditos](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/),
[Netlify badge](https://docs.netlify.com/manage/projects/powered-by-netlify-badge/),
[Vercel Hobby](https://vercel.com/docs/plans/hobby),
[GitHub Pages limites de uso](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Privacidade antes de habilitar pixels

O painel permite recusar, aceitar e retirar permissão, sem bloquear a navegação.
A preferência fica em sessionStorage desta aba; sem armazenamento, vale apenas na página.
Retirar permissão recarrega a página para interromper provedores já inicializados.
Isso não apaga cookies preexistentes nem dados já enviados aos provedores. Os eventos
medem visitas, cliques e início de checkout; não representam compra concluída.

Ainda é necessário fornecer política real, identificar responsável, finalidades,
retenção e tratamento por terceiros, conferir configurações das contas GA4/Meta e
validar a adequação da escolha agrupada às finalidades efetivamente usadas. Não há
certificação de conformidade LGPD nesta auditoria. Referência:
[ANPD — guia de cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais).
