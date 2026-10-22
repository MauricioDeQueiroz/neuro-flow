# Instruções de desenvolvimento

## Projeto e fontes de contexto

Landing page de página única para uma coleção de 11 ebooks cristãos, com seleção
livre e combos de 5 e 11, conduzindo futuramente a um checkout externo que represente
os títulos escolhidos. A integração múltipla ainda está pendente. A persona específica e os dados comerciais ainda
dependem de informações do usuário; exemplos e placeholders não são requisitos confirmados.

- `README.md`: arquitetura atual, comandos, validação e limitações conhecidas.
- `SPEC.md`: requisitos de produto, integrações, critérios de aceite e escopo da v1.
  Leia antes de alterações relevantes.
- `PREENCHER.md`: conteúdo e configurações pendentes antes da publicação.
- `CLAUDE.md` e `.claude/`: referências históricas preservadas. As regras úteis
  foram consolidadas aqui; não transportar permissões ou instruções de ferramentas
  do Claude automaticamente. Havendo divergência de produto, registre e consulte o usuário.

## Arquitetura e convenções

- HTML5 em um único `index.html`, Tailwind CSS 4 e JavaScript puro em
  `assets/js/main.js`. Não há backend, banco de dados ou autenticação próprios.
- `assets/css/input.css` é o fonte; `assets/css/tailwind.css` é gerado, carregado
  pela página e versionado. Use `npm run css` após alterar o fonte ou introduzir
  classes Tailwind em HTML/JS. Não editar o CSS gerado manualmente nem usar Play CDN.
- Fontes em `assets/fonts/` e imagens em `assets/img/`. O deploy estático não
  compila CSS; `vercel.json` é opcional para a Vercel. GitHub Pages hospeda a prévia;
  o provedor comercial continua pendente.
  `npm run build` empacota apenas arquivos públicos em `dist/`, sem compilar CSS.
  Nunca publicar a raiz do repositório; ver `docs/deployment.md`. Next.js é apenas uma possibilidade
  futura, não uma migração aprovada.
- Preserve IDs de seções, links âncora, classes `js-*`, atributos `data-*` e
  associações ARIA. Siga os nomes em português e a organização por funções
  `preparar*` do JavaScript existente; reaproveite funções e componentes CSS.
- Prefira utilitários Tailwind; CSS próprio apenas para necessidades justificadas,
  como os componentes visuais existentes. Mantenha JS mínimo e guardas para
  elementos ausentes, placeholders e configurações inválidas.
- Pixels exigem IDs válidos e permissão explícita; preserve a recusa e a retirada.
- Preserve a passagem dos parâmetros permitidos de campanha/afiliado ao checkout,
  sem sobrescrever os já definidos no destino, e o carregamento do vídeo no clique.

## Identidade visual e movimento

- Referência aprovada: DronyX — Military Tech. Cores exatas: fundo `#111111`,
  superfície `#212121`, destaque `#524CFF`, texto `#FFFFFF`. Não adicionar outra cor de destaque.
- Títulos em Play 700; corpo em Inter, com arquivos locais 400/600/700. Ao introduzir
  outro peso, providencie seu arquivo e `@font-face`; não presuma que já esteja disponível.
- Preserve cantos diagonais, badges quadrados arredondados, glow radial, CTAs pill
  com ícone `+`, variantes azul/branca e seção de contraste com fundo accent.
  Cards de benefícios: duas colunas em desktop, uma em mobile.
- Accent sobre fundo escuro fica reservado a texto grande; rótulos e legendas
  devem manter contraste AA. Não alterar a identidade visual para resolver tarefas não relacionadas.
- Anime apenas `transform` e `opacity`, com movimento discreto e função clara:
  clique em cerca de 150 ms, escala 0,97–0,98; microinterações em 150–250 ms;
  entradas em 300–400 ms com deslocamento de 8–16 px. Use `ease-out` na entrada,
  `ease-in` na saída e respeite `prefers-reduced-motion`.

## Conteúdo e regras de negócio

- Tom acolhedor, inspirador e direto, baseado em esperança, propósito e comunidade.
  Expresse benefícios como possibilidades, sem medo, culpa ou sensacionalismo.
- Nunca fabricar depoimentos, avaliações, números, credenciais, resultados ou urgência.
  Mantenha placeholders identificados e informe o dado ausente. Depoimentos exigem autorização de uso.
- Garantia, reembolso, bônus, entrega e formas de pagamento devem refletir condições
  reais fornecidas pelo usuário. Não prometer cura, milagre ou resultado garantido;
  preserve os avisos de que o material não substitui acompanhamento profissional.
- Contagem regressiva só com prazo e motivo reais; preserve as proteções de
  `data-oculto-em-producao`. Trocar `data-modo` não preenche conteúdo nem libera indexação.
- Ao editar o FAQ, sincronize perguntas/respostas visíveis e JSON-LD. Só ativar
  dados de produto com informações reais e completas.
- Captura de leads é opcional e não está implementada; área de membros, entrega
  automática, blog e testes A/B estão fora da v1. Não implementar por inferência.

## Segurança e limites de alteração

- Verifique `git status` antes de editar e preserve alterações existentes. Faça
  mudanças pequenas, restritas à solicitação, sem remover funcionalidades ou
  refatorar módulos não relacionados. Evite dependências novas e funcionalidades duplicadas.
- Não expor credenciais, tokens ou valores de `.env`, nem inserir segredos em
  arquivos públicos. Valide entradas e URLs ao alterar integrações; preserve
  mecanismos de proteção, autenticação/autorização se introduzidos futuramente.
- Não executar operações destrutivas nem alterar schemas/dados sem autorização
  explícita e avaliação de compatibilidade, caso um banco seja introduzido.
- Não alterar configurações sensíveis sem necessidade. Deploy de produção exige
  confirmação explícita; commits e push somente quando solicitados.

## Fluxo de trabalho e validação

1. Compreenda a solicitação, leia os arquivos envolvidos, confira implementações
   existentes e dependências. Planeje antes de mudanças estruturais ou novas seções;
   não dependa de um modo específico da interface para planejar.
2. Preserve a arquitetura, as convenções e a experiência existente. Registre
   conflitos que dependam de decisão do usuário, sem resolvê-los por suposição.
3. Revise o diff e execute verificações proporcionais. Para JS, use
   `node --check assets/js/main.js`; para estilos/classes, recompile o CSS.
   Execute `npm test` (sintaxe e regressões com node:test). Auditoria opcional de
   navegador: `npm run test:browser`, conforme README. O fluxo do Pages executa
   `npm test` antes de publicar somente `dist/`. Não há lint atualmente.
4. Para alterações visuais/comportamentais, confira os fluxos afetados e larguras
   320, 375, 414, 768, 1024, 1280 e 1440 px; evite overflow de 320 a 1920 px.
   Use dimensões fluidas, preserve `width`/`height` intrínsecos das imagens e
   alvos de toque de pelo menos 44×44 px.
5. Confira SEO e acessibilidade afetados conforme `SPEC.md`: headings, metadados,
   JSON-LD, alt, contraste, teclado, foco visível e movimento reduzido. Antes de
   publicar, siga `PREENCHER.md`, inclusive Lighthouse mobile: Performance ≥90,
   SEO ≥95, Acessibilidade ≥95 e Boas Práticas ≥95.
6. Responda em português brasileiro, informe arquivos alterados, decisões relevantes,
   riscos e validações executadas. Não afirmar testes não executados; métricas
   históricas não comprovam o estado atual. Declare limitações e pendências.
