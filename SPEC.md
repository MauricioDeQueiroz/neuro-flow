# SPEC — Página de Vendas: Ebook [Nicho Cristão]

## 1. Objetivo de negócio
Converter visitantes (vindos de tráfego pago/orgânico, redes sociais, WhatsApp) em compradores do ebook,
por meio de uma página única, persuasiva e honesta, que leva o visitante até o botão de checkout.

## 2. Público-alvo / persona
- Quem é: [ex.: mulheres cristãs, 25–45 anos, buscando crescimento espiritual / propósito / família]
- Dor principal: [ex.: dificuldade de manter uma rotina devocional consistente]
- Objeção mais comum: [ex.: "já tentei outros materiais e não funcionou"]
> Preencher com base em quem já comprou ou no perfil desejado — isso muda o copy inteiro.

## 3. Produto
- Nome do ebook: [definir]
- Formato de entrega: PDF / área de membros
- Preço: [definir] | Parcelamento: [definir]
- Bônus inclusos: [definir, se houver]
- Garantia: [ex.: 7 dias, reembolso incondicional]

## 4. Estrutura da página (seção → objetivo → gatilho mental)

| # | Seção | Objetivo | Gatilho mental |
|---|-------|----------|-----------------|
| 1 | Hero + vídeo de apresentação (VSL) | Capturar atenção em 5s, comunicar a promessa central | Curiosidade, clareza da promessa |
| 2 | Identificação da dor | Fazer o leitor se reconhecer no problema | Empatia / espelhamento |
| 3 | Agitação | Mostrar o custo de não resolver o problema | Aversão à perda |
| 4 | Apresentação da solução | Introduzir o ebook como o caminho | Autoridade / clareza |
| 5 | Benefícios (transformação) | Focar no "depois", não nas características | Desejo |
| 6 | Prova social | Depoimentos reais, prints, números reais | Prova social |
| 7 | Sobre o autor | Gerar confiança e conexão | Autoridade / similaridade |
| 8 | Oferta e bônus | Deixar claro o que está incluso | Ancoragem de valor |
| 9 | Preço e condições | Reduzir fricção na decisão | Ancoragem de preço |
| 10 | Garantia | Remover o risco da compra | Reversão de risco |
| 11 | Escassez/urgência (se real) | Motivar decisão agora | Escassez honesta — nunca contagem regressiva falsa |
| 12 | FAQ | Quebrar objeções finais | Redução de incerteza |
| 13 | CTA final | Última chance de conversão | Reforço da promessa |
| 14 | Rodapé | Dados legais, contato, suporte | Confiança |

**Regra inegociável:** nenhum depoimento, número, contagem regressiva ou "vaga limitada" pode ser fabricado.
Se não houver dado real ainda, a seção fica com placeholder marcado `[PREENCHER]` — não se inventa prova social.

## 5. Requisitos técnicos
- Stack: HTML + Tailwind CSS (CDN) + JavaScript puro (ou Next.js, se o projeto for crescer para várias páginas/produtos).
- Identidade visual: seguir os design tokens (cores, tipografia, estilo) definidos em `CLAUDE.md` → seção "Identidade visual / Design tokens".
- Performance: Lighthouse ≥ 90 em mobile.
- Pixels de rastreamento: Meta Pixel e GA4, com IDs em variáveis/placeholder.
- Botão de CTA: link externo para o checkout (Hotmart/Kiwify/Eduzz/outro — definir).
- Vídeo: embed responsivo (YouTube/Vimeo não listado, ou player HTML5 se for arquivo próprio).

### Responsividade — compatibilidade entre telas
A página precisa funcionar bem em qualquer tela, do celular pequeno até notebook/desktop grande.
Abordagem mobile-first: escrever o layout base pensando no celular e ampliar com breakpoints do Tailwind.

| Faixa | Largura de referência | Exemplos de dispositivo | Breakpoint Tailwind |
|-------|------------------------|---------------------------|----------------------|
| Celular pequeno | 320–374px | iPhone SE, Android compacto | base (sem prefixo) |
| Celular padrão | 375–427px | iPhone 12/13/14, Android médio | base (sem prefixo) |
| Celular grande | 428–639px | iPhone Pro Max, Android grande | base (sem prefixo) |
| Tablet retrato | 640–767px | iPad Mini, tablets Android | `sm:` |
| Tablet paisagem / notebook pequeno | 768–1023px | iPad, netbooks | `md:` |
| Notebook / desktop | 1024–1279px | laptops 13"–14" | `lg:` |
| Desktop grande | 1280–1535px | monitores widescreen | `xl:` |
| Desktop muito grande | 1536px+ | monitores 27"+, 4K | `2xl:` |

Regras:
- Nenhum overflow horizontal em nenhuma largura entre 320px e 1920px.
- Imagens e vídeo sempre fluidos (`max-width: 100%`, `height: auto`), nunca com largura fixa em pixels.
- Tipografia com escala responsiva (ex.: `text-base md:text-lg lg:text-xl`) — nunca um tamanho fixo único.
- Botões de CTA com área de toque mínima de 44x44px no mobile.
- Testar (manualmente ou via DevTools) nestas larguras antes de considerar concluído: 320px, 375px, 414px, 768px, 1024px, 1280px, 1440px.

### SEO — busca (Google) e canais de compartilhamento/indicação
Objetivo: cobrir 100% das práticas técnicas de on-page SEO controláveis pela página. Nota importante: nenhuma
técnica garante posição no Google — isso depende também de fatores fora da página (autoridade de domínio,
concorrência, tempo). O que dá pra garantir é que a página não perca pontos por falha técnica.

- **Meta tags**: `<title>` único e descritivo (≤60 caracteres, com a promessa central + palavra-chave do nicho);
  `<meta name="description">` persuasiva (≤155 caracteres); `<html lang="pt-BR">`; `<link rel="canonical">`.
- **Compartilhamento (canal de indicação)**: Open Graph completo (`og:title`, `og:description`,
  `og:image` 1200×630px, `og:type=website`, `og:locale=pt_BR`) + Twitter Card (`summary_large_image`) — é o que
  garante que o link fique bonito quando alguém reenvia no WhatsApp, Instagram ou Telegram.
- **Dados estruturados (JSON-LD, Schema.org)**: tipo `Product` (nome, descrição, preço, imagem) e `FAQPage`
  (reaproveitando as perguntas da seção 4, item FAQ) — habilita rich snippets no Google.
- **Hierarquia de headings**: um único `<h1>` com a promessa principal; `<h2>` por seção; `<h3>` para subitens;
  nunca pular nível (ex.: `h2` direto para `h4`).
- **Alt text**: toda imagem informativa com `alt` descritivo real; imagem puramente decorativa com `alt=""`.
- **Core Web Vitals**: imagens em WebP/AVIF com `width`/`height` fixos no HTML (evita layout shift/CLS);
  `loading="lazy"` em imagens abaixo da dobra; fontes com `font-display: swap`; nada de JS/CSS bloqueando o
  primeiro render.
- **robots.txt e sitemap.xml** simples na raiz do projeto.
- **Favicon** e `apple-touch-icon` configurados.
- **Links de afiliado/indicação**: a página deve funcionar normalmente recebendo parâmetros UTM
  (`utm_source`, `utm_medium`, `utm_campaign`) na URL, sem quebrar layout nem perder o disparo do pixel — importante
  se o ebook for divulgado por afiliados/parceiros.

### Acessibilidade (WCAG 2.1 nível AA)
- **Contraste de texto** — já validado para a paleta do design system (`CLAUDE.md`):
  - Branco sobre `--color-bg` (#111111): ~18.9:1 — muito acima do exigido.
  - Branco sobre `--color-surface` (#212121): ~16.1:1 — muito acima do exigido.
  - Branco sobre `--color-accent` (#524CFF): ~5.5:1 — passa AA (mín. 4.5:1) para texto normal e títulos, mas fica
    abaixo do AAA (7:1); reservar essa combinação para títulos, botões e blocos de texto médio/grande — evitar
    texto de apoio muito pequeno (abaixo de 14px) sobre o azul.
- **HTML semântico**: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` — não usar `<div>` genérica para tudo.
- **Ícones sem texto** (WhatsApp, Telegram, Viber, menu mobile): sempre com `aria-label` descritivo.
- **Formulário de captura**: `<label>` associado a cada campo (não depender só de placeholder); erros de
  validação anunciados de forma acessível.
- **Navegação por teclado**: todo elemento interativo alcançável via Tab, com estado de foco visível — nunca
  `outline: none` sem um substituto visual equivalente.
- **Vídeo de apresentação**: incluir legenda ou transcrição — ajuda acessibilidade e também é indexável pelo
  Google (ganho duplo: a11y + SEO).
- **`prefers-reduced-motion`**: reduzir ou remover animações de entrada para quem tem essa preferência ativada
  no sistema (ver seção "Motion & micro-interações" no `CLAUDE.md`).
- **Tipografia**: tamanho mínimo de 16px no corpo do texto, para não forçar zoom no mobile.

## 6. Integrações
- Checkout: [Hotmart / Kiwify / Eduzz / Stripe — definir]
- E-mail marketing (opcional, se houver captura de lead antes da oferta): [definir ferramenta]
- Analytics: GA4 + Meta Pixel


## 7. Conteúdo que o usuário (você) precisa fornecer antes da execução
- [ ] Link ou arquivo do vídeo de apresentação
- [ ] Depoimentos reais (texto, print ou vídeo)
- [ ] Capa do ebook / imagens
- [ ] Textos de "sobre o autor"
- [ ] Preço, condições de pagamento e link de checkout
- [ ] IDs de pixel (Meta/GA4), se já existirem

## 8. Critérios de aceite (Definition of Done)
- [ ] Página publicada em URL acessível (Vercel/Netlify)
- [ ] Testada e sem overflow horizontal em 320px, 375px, 414px, 768px, 1024px, 1280px e 1440px (ver tabela de breakpoints na seção 5)
- [ ] Todos os CTAs apontam para o checkout correto
- [ ] Pixels disparando corretamente (testado com Meta Pixel Helper / GA4 DebugView)
- [ ] Nenhum dado fabricado (depoimento, número, contagem regressiva falsa)
- [ ] Lighthouse mobile ≥ 90 em Performance, ≥ 95 em SEO e ≥ 95 em Acessibilidade
- [ ] Dados estruturados (JSON-LD) validados sem erros no Google Rich Results Test
- [ ] Preview de compartilhamento (Open Graph) testado no Facebook Sharing Debugger e/ou WhatsApp
- [ ] Navegação 100% possível apenas por teclado (Tab/Enter), com foco sempre visível

## 9. Fora de escopo (v1)
- Área de membros / entrega automática do produto
- Blog ou outras páginas do site
- Testes A/B automatizados