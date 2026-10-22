# Auditoria técnica — 21/10/2026

Escopo: landing page estática e documentação local, com correções autorizadas de
baixo risco. Arquitetura, paleta, fontes, condições comerciais e placeholders
preservados. Sem deploy, DNS, serviços remotos, compra, commit ou push.

Na entrada, `PREENCHER.md` e `SPEC.md` já estavam modificados; `AGENTS.md` e `README.md`
já existiam como arquivos não rastreados. As alterações existentes foram preservadas;
foram acrescentadas apenas atualizações relacionadas aos comportamentos corrigidos.
`CLAUDE.md` e configurações históricas não foram alterados.

## Estado geral após as correções

| Área | Estado | Alcance |
|---|---|---|
| Segurança | Precisa melhorar antes de publicar | Correções locais concluídas; TLS/headers remotos e configurações de terceiros não verificados |
| Integridade | Adequado nos cenários locais | Recursos, menu, FAQ, checkout simulado, fallback e 404 verificados |
| Performance | Adequado em laboratório | Medições abaixo; não há dados reais de visitantes |
| SEO | Precisa melhorar | noindex intencional; domínio, metadados e dados comerciais pendentes |
| Acessibilidade | Adequado nas verificações realizadas | axe, Lighthouse, teclado em fluxos afetados e revisão de foco; não equivale a certificação WCAG |
| Responsividade | Adequado nas larguras testadas | 320, 375, 414, 768, 1024, 1280, 1440 e 1920 px |
| Qualidade de código | Adequado | JS nativo, regressões simples e build público; sem novas dependências de runtime |
| Produção | Precisa melhorar | Conteúdo/checkout/políticas/domínio e validação final ainda faltam |
| Independência de hospedagem | Adequado | dist contém arquivos estáticos; Vercel é opção, não requisito |

Não foi confirmado problema P0. Isso não comprova ausência de vulnerabilidades.

## Problemas encontrados e correções

| Prioridade | Evidência e localização antes da correção | Impacto | Correção e risco |
|---|---|---|---|
| P1 | `montarUrlCheckout`, main.js: URL aceitava protocolos arbitrários e endereço relativo | Uma configuração indevida podia executar javascript ou navegar a destino impróprio; parâmetros de campanha não controlavam o destino | Exigir HTTPS absoluto e sem credenciais; manter lista permitida e valores do destino. Risco baixo: checkout HTTP/relativo passa a ser recusado |
| P1 | `iniciar()` iniciava GA4/Meta apenas por existir um ID | Carregamento de medição sem escolha do visitante | Permissão explícita, recusa e retirada; IDs validados; painel só com IDs válidos. Risco baixo/moderado: altera o momento de disparo e exige política real antes do uso |
| P1 | Script inline no head adicionava `.js`; CSS escondia `.reveal` mesmo se main.js falhasse | Conteúdo podia ficar invisível | Remover script inline; ocultar apenas entradas fora da primeira tela após preparar observador. Risco baixo |
| P1 | Respostas do FAQ tinham `hidden` no HTML e dependiam de JS para abrir | Respostas e aviso sobre acompanhamento profissional inacessíveis sem script | Respostas visíveis no HTML; JS habilita accordion. Risco baixo; conteúdo/JSON-LD preservados |
| P2 | Menu mobile dependia inteiramente de JS; teste de fallback inicial revelou soma de layout shifts 0,33 com script atrasado 1500 ms | Navegação sem JS e estabilidade durante carregamento | details/summary nativo com os mesmos IDs e aparência; JS complementa Escape, fechamento e ARIA. Repetição do cenário: 0. Risco baixo |
| P2 | `vercel.json` tinha `outputDirectory: .`; `dev` executava `npx serve .` | Pacote sem lista explícita de arquivos; download não fixado no desenvolvimento. Não foi confirmado vazamento em produção | Build com lista permitida para dist e servidor local limitado aos arquivos públicos. Risco baixo; novo comando de empacotamento documentado |
| P2 | Imagens com nomes estáveis recebiam `immutable` por um ano na configuração opcional Vercel | Trocas de imagens podiam manter conteúdo antigo | Revalidação em todos os arquivos de nomes estáveis. Risco baixo; pode aumentar verificações HTTP; caches remotos antigos exigem atenção |
| P2 | npm audit: 5 entradas de severidade alta na cadeia de desenvolvimento, envolvendo braces e source-map-js | DoS de ferramentas ao processar entrada maliciosa; não são bibliotecas executadas no navegador | Override compatível de @parcel/watcher 2.6.0 e source-map-js 1.2.2 no lockfile. Zero alertas após ajuste. CLI/Tailwind mantidos em 4.3.3; compilação e watch verificados |
| P2 | `font-medium` no menu, sem Inter 500 local | Peso solicitado sem arquivo correspondente | Usar Inter 600 existente, sem download de fonte adicional. Risco baixo; pequena diferença de peso |
| P2 | Outline externo nos botões do FAQ dentro de clip-path; ícones ainda animavam com movimento reduzido | Foco cortado e preferência de movimento incompleta | Outline interno e transição removida sob reduced-motion. Risco baixo |
| P2 | Botão de vídeo tinha texto visível ausente do aria-label | Nome incompatível com comandos por voz; apontado por Lighthouse | Nome acessível passa a incluir “Assista antes de decidir”. Risco baixo |
| P2 | Sem documento 404 próprio; apenas nosniff/referrer-policy na configuração opcional | Tratamento de erro e proteções HTTP incompletos | 404 mínima; X-Frame-Options e Permissions-Policy; candidata a CSP Report-Only. Eficácia remota não comprovada; HSTS fica pendente do domínio |
| P2 | Ausência de regressões automatizadas | Falhas de checkout/atribuição e fallback podiam passar despercebidas | node:test sem dependências extras; auditoria opcional em Chromium com ferramentas externas ao projeto |
| P3 | `href="#"` em CTAs não configurados; clique inválido era contado como CTA | Salto ao topo sem JS e evento sem intenção válida de compra | Link sem href, aria-disabled até configuração válida; não emitir evento do checkout inválido. Risco baixo |

Não foi encontrado uso de entrada externa como HTML. O único `innerHTML = ''` era
limpeza constante, **não DOM XSS confirmado**; foi substituído por replaceChildren.
URLs de vídeo seguem origens fixas e IDs com formato validado. Não foi encontrado
redirect configurável por parâmetro de campanha. Rel noopener é aplicado ao checkout.

## Validações e evidências

Ambiente: Node 22.22.2, npm 10.9.7, Chromium local do Playwright (revisão 1217),
Playwright Core 1.64.1, axe-core 4.14.0, Lighthouse 13.5.0, html-validate 11.17.0.
As ferramentas de navegador foram instaladas em `/tmp/neuro-flow-audit`, fora do projeto.

| Verificação | Resultado e limitações |
|---|---|
| `npm test` | 6 testes passaram: HTTPS/credenciais, campanhas/destino, consentimento/eventos, recusa anterior, integridade HTML/JSON-LD/recursos e lista pública; inclui node --check |
| `npm run css` | Compilação concluída com Tailwind 4.3.3; repetição produziu CSS idêntico byte a byte; CSS gerado versionado |
| `npm run css:watch` | Inicialização e recompilação após mudança de timestamp do fonte passaram com watcher atualizado |
| `npm run build` | 17 arquivos públicos em dist; documentação/configurações/dependências ficam de fora |
| `html-validate index.html 404.html` | Sem erros detectados |
| `npm run test:browser` | Oito larguras, recursos carregados, sem overflow/corte dos textos verificados; menu/FAQ, Enter/Escape e foco, reduced-motion, fallback sem JS/script bloqueado, script atrasado, vídeo sob demanda e produção |
| axe | Zero violações detectadas nas tags WCAG A/AA selecionadas; também verificado painel de preferências ativo. Não substitui leitor de tela ou auditoria manual completa |
| Checkout | URL e eventos testados com destino sintético; navegação interceptada localmente, sem acessar plataforma real nem comprar |
| Pixels | Nenhuma requisição antes da permissão; dois carregamentos tentados após aceitar; recusa/retirada e recarga testadas com provedores bloqueados. IDs apenas na resposta de teste/VM, nunca no site |
| Serviço externo indisponível | Bloqueio do player não impede FAQ; pixels indisponíveis não impedem consentimento/recusa |
| 404/arquivos privados | Servidor local responde 404 para URL inexistente, .git/config, .env, README.md, package.json e fonte CSS |
| `npm audit`, `npm audit --omit=dev` | Zero vulnerabilidades reportadas na consulta após as correções; antes eram cinco entradas altas de desenvolvimento |
| `npm outdated --json` | Nenhum pacote desatualizado informado para as dependências diretas consultadas |
| Busca limitada por segredos | 26 blobs históricos e arquivos locais, com padrões de chaves privadas, GitHub/AWS; nenhum candidato detectado. Histórico também analisado por atribuições de credenciais. Não é scanner completo nem prova de ausência |
| Revisão visual | Primeira tela inspecionada em capturas mobile/desktop; sem redesenho da paleta ou dos componentes |
| `git diff --check` | Sem erros de whitespace na revisão |

Os comandos opcionais estão em README.md. Relatórios Lighthouse JSON e capturas
ficaram em `/tmp/neuro-flow-audit`; não entram no pacote público. O servidor local
foi verificado diretamente por HTTP, sem pressupor que vercel.json esteja aplicado.

## Performance

Medições Lighthouse mobile locais, em rascunho, com servidor Python estático para
ambas as versões e as mesmas quatro categorias. Antes: arquivos da aplicação do
HEAD inicial (`a078002`), que não tinham alterações locais na entrada. Depois:
pacote dist atual. São execuções de laboratório pontuais, sujeitas a variação de
CPU/rede; não demonstram ganho estatisticamente significativo nem desempenho real.

| Métrica | Antes | Depois |
|---|---:|---:|
| Performance | 98 | 97 |
| Acessibilidade | 100 | 100 |
| Boas Práticas | 100 | 100 |
| SEO | 66 | 66 |
| LCP | 2,26 s | 2,19 s |
| CLS | 0,00  | 0,00  |
| TBT | 0,00 ms | 133,00 ms |

Não há INP de campo disponível; TBT não é INP. Performance/Acessibilidade/Boas Práticas
atingem as metas locais, mas SEO permanece abaixo de 95. O noindex/nofollow é um
bloqueio intencional do rascunho; metadados e dados definitivos também continuam
pendentes. Não foi removido esse bloqueio para melhorar artificialmente a nota.
Não foram executados PageSpeed Insights, Search Console, Rich Results Test nem
Facebook Sharing Debugger em domínio real.

As tentativas iniciais de Lighthouse no servidor Node de desenvolvimento falharam
com ERR_ABORTED; a causa não foi isolada. As medições válidas acima foram feitas com
Python sobre arquivos estáticos, não sobre aquele servidor. Navegação e interações
em Chromium, assim como respostas HTTP do servidor Node, passaram separadamente.

Imagens existentes já são leves (aproximadamente 7–44 KB) e usam dimensões intrínsecas;
não foram recomprimidas nem alteradas. Play/Inter permanecem locais com swap e dois
preloads na primeira tela. Vídeo permanece sob demanda, JS defer e sem framework.
Não há justificativa mensurável para adicionar AVIF/srcset a estes placeholders agora.

## Segurança e privacidade pendentes

- A CSP é candidata em Report-Only; não deve ser descrita como bloqueio já ativo.
  Os scripts inline executáveis foram removidos; ainda é preciso validar origens dos
  provedores reais antes de impor CSP. Sem endpoint configurado, observar console.
- X-Frame-Options, nosniff, Permissions-Policy e Referrer-Policy foram preparados na
  configuração opcional; só respostas do servidor escolhido comprovam aplicação.
- TLS, HSTS, redirecionamentos, DNS, CDN, compressão e cache em produção não verificados.
  HSTS preload/includeSubDomains não foram habilitados.
- Recusar impede novos carregamentos; retirar recarrega para parar scripts iniciados.
  Cookies anteriores e dados já enviados não são apagados. Política de privacidade,
  retenção, finalidades e configurações Meta/GA4 exigem dados e revisão do responsável.
- Não há alegação de conformidade LGPD ou WCAG completa.

## Hospedagem e decisões pendentes

Sem dependência obrigatória da Vercel. O pacote contém HTML/CSS/JS/fontes/imagens
estáticos. `vercel.json` é adaptador opcional; `.nojekyll` é opcional para Jekyll.
Classificação das configurações, equivalências de headers, cache e comparação das
opções estão em [deployment.md](deployment.md).

Recomendação técnica: avaliar Cloudflare Pages e Netlify primeiro; Vercel comercial
requer plano compatível, e Nginx exige mais manutenção. GitHub Pages não é recomendado
para uma página dedicada a transações comerciais, conforme política oficial citada
no guia. Nenhuma plataforma foi configurada.

Prioridades do responsável antes de publicar:

1. Definir persona, produto/promessa, preço, garantia, bônus e forma de entrega real.
2. Fornecer checkout HTTPS, vídeo/transcrição, imagens, autor e depoimentos autorizados.
3. Preencher FAQ e JSON-LD juntos, dados legais, suporte e políticas reais.
4. Definir domínio/provedor e IDs de rastreamento, revisando privacidade antes da ativação.
5. Revisar todos os placeholders e sitemap/canonical/OG; só então mudar produção e
   liberar indexação separadamente. O noindex atual foi preservado de propósito.
6. Testar checkout e integrações reais sem compra, validar dados estruturados e prévias,
   repetir Lighthouse e revisão de teclado/leitor de tela na URL final antes de anunciar.

A menção de entrega por área de membros continua ambígua frente ao escopo da v1;
exige decisão comercial sobre serviço externo, não criação inferida de infraestrutura.
Não foram criados formulário de leads, backend, autenticação, área de membros ou blog.

## Arquivos alterados/criados nesta auditoria

Alterados: `.gitignore`, `index.html`, `assets/js/main.js`, `assets/css/input.css`,
`assets/css/tailwind.css`, `package.json`, `package-lock.json`, `vercel.json`,
`AGENTS.md`, `README.md`, `SPEC.md`, `PREENCHER.md`.

Criados: `404.html`, `scripts/public-files.mjs`, `scripts/build.mjs`,
`scripts/serve.mjs`, `scripts/check-browser.mjs`, `tests/landing.test.mjs`,
`docs/deployment.md`, `docs/auditoria.md`. `dist/` foi gerado e permanece ignorado.

Os riscos materiais são a nova exigência de HTTPS no checkout, o adiamento de
medição até a permissão, o empacotamento por lista permitida e a necessidade de
traduzir/validar regras HTTP no serviço escolhido. Todos estão documentados e os
fluxos locais foram testados; as integrações reais continuam pendentes.

## Pendências da revisão independente — 21/10/2026

Registradas a pedido do responsável para correção futura. **Nenhuma das três
correções abaixo foi aplicada.** As evidências desta revisão complementam as
validações anteriores; testes aprovados não excluem estes cenários.

- [ ] **P1 — Retirada de consentimento falha quando a recusa não pode ser persistida.**
  Em `assets/js/main.js`, `prepararPrivacidade` ignora o erro de `sessionStorage.setItem`
  ao recusar e recarrega a página. Se a permissão anterior continuar armazenada,
  a inicialização volta a liberar os pixels. Reprodução em Chromium, com IDs somente
  na resposta interceptada de teste: valor anterior `permitido`, gravação lançando
  `QuotaExceededError`, clique em “Retirar permissão”; tentativas de carregar provedores
  aumentaram de 2 para 4 e o estado voltou a “Medição permitida nesta aba”.
  Validar na correção: a retirada deve prevalecer mesmo com falha de armazenamento,
  sem reiniciar provedores por causa da permissão antiga. O risco surge ao habilitar IDs.

- [ ] **P2 — Recolher o FAQ após carregamento lento desloca conteúdo já em leitura.**
  As respostas começam abertas em `index.html` e `prepararFaq`, em `assets/js/main.js`,
  recolhe todas ao iniciar. Reprodução em 375×812 px: atrasar o script em 2,5 segundos
  e rolar até o FAQ aos 500 ms. O estado atual apresentou deslocamento acumulado de
  aproximadamente 0,412; o anterior apresentou 0. O teste existente de script atrasado
  cobre a primeira tela, mas não a leitura antecipada do FAQ.
  Validar na correção: preservar o acesso sem JavaScript e evitar recolher conteúdo
  que o visitante já está lendo; acrescentar cobertura para esse cenário.

- [ ] **P2 — Nova geração de dist rejeita caminhos válidos no Windows.**
  Em `scripts/build.mjs`, o caminho relativo calculado com `resolve(...).slice(...)`
  é comparado diretamente com a lista de `scripts/public-files.mjs`, que usa `/`.
  Com dist já preenchido, `assets\css\tailwind.css` não corresponde a
  `assets/css/tailwind.css`. O algoritmo foi reproduzido em memória com `path.win32`
  e rejeitou esse arquivo como não permitido; não houve execução em Windows real.
  Validar na correção: normalizar separadores e verificar duas gerações consecutivas,
  preservando a rejeição de arquivos inesperados.

A revisão não identificou dependência obrigatória de provedor. Três novas medições
comparativas da primeira tela deram Performance 98 nas duas versões; não confirmaram
uma regressão geral de performance. Esses resultados não invalidam o problema
específico de deslocamento do FAQ descrito acima.
