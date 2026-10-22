# Coleção NEUROFLOW

Página estática para uma coleção de 11 ebooks cristãos. O visitante explora o catálogo,
consulta oferta, garantia e FAQ e segue para um checkout externo, com repasse dos
parâmetros permitidos de campanha e afiliado.

O projeto está em **modo rascunho**. Persona, nome do produto, preço, condições,
checkout, conteúdo final e domínio dependem de dados reais do responsável pelo produto.
Os exemplos da especificação não confirmam essas decisões.

## Documentação

| Arquivo | Responsabilidade |
|---|---|
| `AGENTS.md` | Instruções persistentes para o Codex |
| `SPEC.md` | Produto, requisitos, critérios de aceite e escopo |
| `PREENCHER.md` | Checklist de conteúdo e preparação da publicação |
| `docs/deployment.md` | Pacote público, segurança HTTP e opções de hospedagem |
| `docs/auditoria.md` | Achados, correções, evidências e limites da auditoria |
| `CLAUDE.md` e `.claude/` | Referência histórica do ambiente anterior |

As regras úteis do Claude foram consolidadas em `AGENTS.md`; as configurações
locais do Claude permanecem preservadas e não configuram o Codex. Não é necessário
criar instruções por subdiretório para a arquitetura atual.

## Arquitetura

```text
index.html                  Página única: 13 seções e rodapé
assets/css/input.css        Fonte Tailwind 4, fontes, tokens e componentes
assets/css/tailwind.css      CSS compilado e versionado usado pela página
assets/js/main.js           Interações e integrações no navegador
assets/fonts/               Play 700 e Inter 400/600/700 autohospedadas
assets/img/                 Imagens e ícones locais
package.json                Comandos e dependências de desenvolvimento
package-lock.json           Resolução das dependências
scripts/                    Empacotamento, servidor local e auditoria de navegador
tests/                      Regressões com node:test (sem dependências extras)
404.html                    Documento para páginas inexistentes
dist/                       Pacote público gerado, ignorado pelo Git
vercel.json                 Configuração opcional para Vercel: dist, headers e cache
robots.txt / sitemap.xml    Configuração de rastreamento e URLs
```

Não há backend, banco de dados, autenticação, API própria ou framework de estado.
HTML e atributos ARIA/data mantêm o estado das interações. O JavaScript prepara
menu mobile, FAQ, reveal, vídeo, pixels, checkout com UTM, contador e ano do rodapé.
Os componentes reutilizáveis são classes CSS e funções JavaScript.

Meta Pixel e GA4 só são iniciados com IDs válidos e permissão explícita do visitante.
O painel de preferências aparece apenas com IDs válidos, registra a escolha nesta aba
e permite recusa/retirada; detalhes e limitações em `docs/deployment.md`.
O vídeo YouTube/Vimeo é inserido no clique. Os links de compra são preparados a
partir de `CHECKOUT_URL`; sem configuração, o JavaScript bloqueia a navegação.
O catálogo possui filtros por tema, carrossel com pausa e seleção em memória.
Títulos/capas/temas ainda são provisórios; o aviso de filtro vazio é intencional.
`data-checkout-pendente` bloqueia o destino único legado até integrar a compra dos
itens selecionados. A seleção atual não calcula preço, não persiste após recarga
nem efetua compra. Cadastro dos títulos e regras: veja PREENCHER.md.
Pagamentos e entrega não são processados por este repositório.

## Desenvolvimento local

Requisitos: Node.js ≥22 e npm. `npm ci` instala as ferramentas nas versões do lockfile.
Não é necessário instalar dependências para apenas servir o pacote público já gerado.

```bash
npm ci
npm run dev        # servidor local em 127.0.0.1:3000, somente arquivos públicos
npm run css        # recompila e minifica o CSS
npm run css:watch  # recompila enquanto os fontes mudam
npm run build      # copia os arquivos públicos para dist/; não publica nem compila CSS
npm test           # sintaxe JS e testes com node:test
# Auditoria opcional de carrossel/filtros/seleção (ferramentas externas, ver abaixo)
npm run test:catalogo
```

Recompile após editar `input.css` ou introduzir classes Tailwind em HTML/JS.
Versione o CSS resultante junto da mudança. Não há compilação de CSS no deploy.
O Tailwind lê apenas os fontes HTML/JS declarados, evitando classes acidentais em docs/testes.
A atualização transitiva de `@parcel/watcher` para 2.6.0 está fixada por override para
eliminar a cadeia vulnerável de `braces`; `source-map-js` foi atualizado no lockfile.
Nenhuma dependência de runtime foi adicionada.

## Validação

- Revise o diff e use `git diff --check` para conferir whitespace.
- Para JavaScript, execute `node --check assets/js/main.js` e teste o comportamento
  afetado no navegador. A checagem de sintaxe não valida interações.
- Para layout, teclado, SEO, pixels e publicação, siga os critérios de `SPEC.md`
  e `PREENCHER.md`. Há testes locais de regressão e validação automatizada no fluxo
  de publicação do Pages. Não há lint atualmente.
- As métricas Lighthouse de `PREENCHER.md` são registros anteriores; meça novamente
  antes de publicar. Os resultados da auditoria atual e suas limitações estão em `docs/auditoria.md`.

## Publicação

O GitHub Pages hospeda a prévia para revisão em
https://mauriciodequeiroz.github.io/neuro-flow/. O provedor da versão comercial
continua pendente. `npm run build` gera `dist/` com uma lista permitida
que exclui documentação, configurações e arquivos privados. Publique apenas esse
pacote; `vercel.json` é uma opção, não dependência da aplicação. O `.nojekyll` também
não confirma hospedagem ativa. Veja `docs/deployment.md` para alternativas e headers.

Antes de publicar: completar conteúdo e configurações, revisar placeholders,
ajustar modo de produção e indexação separadamente e executar o checklist de
`PREENCHER.md`. Deploy exige confirmação explícita do usuário.

### Atualizar o link de revisão

O fluxo `.github/workflows/pages.yml` testa e publica somente `dist/` após um push
para `main`, sem mudar o endereço. A origem em Settings → Pages deve ser **GitHub
Actions**. Antes de enviar alterações de HTML, JS ou estilos, execute `npm run css`,
`npm test` e `npm run build`; inclua o CSS gerado no commit correspondente.
Confira a conclusão em Actions → Publicar prévia no GitHub Pages.

O build acrescenta uma versão baseada no conteúdo às URLs de CSS e JavaScript em
`dist/index.html`. Assim, quem já abriu o link recebe os recursos novos após uma
atualização, sem reutilizar CSS/JS antigos. O HTML fonte local permanece intacto.

A prévia continua em `data-modo="rascunho"`, com `noindex, nofollow` e checkout
bloqueado enquanto a integração múltipla estiver pendente. Não equivale ao lançamento
comercial. Testes, scripts e documentação ficam no repositório, fora do site servido.

## Limitações e decisões pendentes

- Compra e vídeo exigem JS; sem ele, conteúdo, menu mobile e respostas do FAQ ficam acessíveis.
- TLS, compressão, cache e headers precisam ser verificados no servidor escolhido.
  A CSP preparada é Report-Only e ainda exige validação com integrações reais.
- O controle de medição não apaga cookies anteriores nem dados já enviados. A política
  de privacidade e as configurações dos provedores ainda precisam de revisão.
- Rascunho mantém noindex; SEO, metadados e dados comerciais só podem ser finalizados
  depois de fornecer as informações reais.

Permanecem para decisão do usuário: persona, produto, plataforma de checkout,
entrega, condições comerciais, domínio e IDs de rastreamento. A eventual captura
de leads/e-mail marketing continua opcional. As referências históricas a campos
de captura não autorizam criar um formulário: a seção de contraste atual é o CTA final.

`SPEC.md` menciona PDF/área de membros como formato de entrega e exclui área de
membros/entrega automática da v1. É necessário definir a entrega do produto;
não se deve inferir a criação de infraestrutura própria a partir dessa menção.
Next.js para múltiplos produtos é apenas uma possibilidade futura.

## Auditorias opcionais no navegador

Playwright Core, axe, Lighthouse e html-validate foram instalados temporariamente
fora do projeto para a auditoria. Não são necessários para desenvolver ou publicar.
Para reproduzir em uma máquina com Chromium:

```bash
npm install --prefix /tmp/neuro-flow-audit --no-audit --no-fund --ignore-scripts playwright-core axe-core lighthouse html-validate
# Em outro terminal: npm run dev
AUDIT_TOOLS_DIR=/tmp/neuro-flow-audit CHROME_PATH=/caminho/do/chromium npm run test:browser
AUDIT_TOOLS_DIR=/tmp/neuro-flow-audit CHROME_PATH=/caminho/do/chromium npm run test:catalogo
/tmp/neuro-flow-audit/node_modules/.bin/html-validate index.html 404.html
# Lighthouse (opcional, requer também Python 3):
# Em outro terminal: python3 -m http.server 3002 --bind 127.0.0.1 --directory dist
CHROME_PATH=/caminho/do/chromium /tmp/neuro-flow-audit/node_modules/.bin/lighthouse http://127.0.0.1:3002/ --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=/tmp/lighthouse.json
```

As versões usadas estão registradas em `docs/auditoria.md`; o comando acima consulta
versões atuais. A auditoria automatizada não substitui revisão manual WCAG.
