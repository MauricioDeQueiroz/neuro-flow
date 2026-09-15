# CLAUDE.md — Projeto: Página de Vendas do Ebook [Nome]

## Visão geral
Landing page de vendas (one-page) para um ebook do nicho cristão. Objetivo: converter visitante em comprador.
A especificação completa de conteúdo e seções está em `SPEC.md` — leia antes de qualquer alteração relevante.

## Stack técnica
- HTML5 + Tailwind CSS + JavaScript puro
- **Tailwind é pré-compilado, não CDN.** O Play CDN é ~120KB de JS que compila no navegador: causa flash de
  conteúdo sem estilo e derruba o LCP, incompatível com a meta de Lighthouse ≥ 90 do `SPEC.md`. O fonte fica
  em `assets/css/input.css` e o arquivo que a página carrega é `assets/css/tailwind.css` (gerado, ~23KB,
  **versionado**). O `node_modules/` existe só para rodar o compilador local — não vai para o deploy.
- **Fontes autohospedadas** em `assets/fonts/` (Play 700 + Inter 400/600/700, já reduzidas ao conjunto de
  caracteres do português). O `<link>` da Google Fonts bloqueava o primeiro render em ~510ms.
- Sem build step no deploy (projeto estático) — se crescer para múltiplos produtos, avaliar Next.js
- Deploy: Vercel (ou Netlify). O `vercel.json` fixa `framework: null` e os headers de cache.

## Comandos
```bash
# servir localmente
npx serve .

# recompilar o CSS — obrigatório depois de editar input.css
# ou de usar uma classe Tailwind nova no index.html
npm run css
npm run css:watch   # recompila sozinho enquanto você edita

# deploy (Vercel CLI) — só com confirmação explícita do usuário
vercel --prod
```

> Esqueceu o `npm run css`? A classe nova simplesmente não existe no CSS e o elemento fica sem estilo.

## Convenções
- Um único `index.html`, CSS utilitário via Tailwind (evitar CSS customizado salvo exceções pontuais)
- JS mínimo: apenas para menu mobile, FAQ accordion, disparo de pixel e contagem regressiva (quando real)
- Nomes de seção em `id` (ex.: `#hero`, `#depoimentos`, `#oferta`) para permitir links âncora do menu

## Diretrizes de copywriting e tom de voz
- Tom: acolhedor, inspirador, direto — nunca sensacionalista ou agressivo
- Falar a partir de valores cristãos (esperança, propósito, comunidade), sem apelar para medo ou culpa
- Evitar promessas de resultado garantido ("sua vida vai mudar em 7 dias") — falar em possibilidade e caminho, não certeza
- Benefícios > características: sempre traduzir o que o ebook ensina para o que a pessoa vai *sentir/viver*

## Identidade visual / Design tokens
Referência aprovada pelo usuário: case "DronyX — Military Tech" (Yaryna Vorona, Behance). Paleta e tipografia
extraídas diretamente do slide "Project colors" do case — usar exatamente estes valores, não aproximar.

```css
:root {
  --color-bg: #111111;      /* Chinese Black — fundo principal da página */
  --color-surface: #212121; /* Raisin Black — cards, seções escuras alternadas */
  --color-accent: #524CFF;  /* Ultramarine Blue — CTA, ícones, seções cheias de destaque */
  --color-text: #FFFFFF;    /* White — texto sobre fundo escuro/accent */
}
```

- Tipografia de títulos: **Play** — ✅ verificado: cobre o subset `latin` (U+0000–00FF), então ã, ç, õ, á e ê
  renderizam normalmente. O fallback para Space Grotesk/Archivo continua na pilha, mas não é necessário.
  Só o peso 700 está autohospedado, porque é o único em uso.
- Tipografia de corpo: **Inter** (escolhido em vez da pilha de sistema, para renderizar igual em qualquer SO).
  Pesos autohospedados: 400, 600, 700.
- Ao usar um peso novo (ex.: `font-medium` = 500), baixe o arquivo correspondente para `assets/fonts/` e
  declare o `@font-face` — senão o navegador sintetiza e o texto sai distorcido.
- Padrões de layout do case a reproduzir:
  - Cantos diagonais cortados (clip-path) em cards, hero e divisores de seção — é a assinatura visual do design, não um detalhe opcional.
  - Badges quadrados com cantos arredondados, fundo `--color-accent`, ícone branco — usados para destacar cada feature/benefício.
  - Glow/brilho radial em `--color-accent` atrás da imagem principal do hero.
  - Botões CTA em formato pill, com ícone "+" à direita; duas variantes: fundo `--color-accent` com texto branco (CTA principal) e fundo branco com texto escuro (CTA secundário).
  - Seções de inversão de contraste: pelo menos uma seção (ex.: formulário/captura) com fundo `--color-accent` cheio e campos em branco — igual ao case.
  - Grid de 2 colunas para cards de benefícios em desktop, empilhando em 1 coluna no mobile.
- Contraste: `--color-accent` é a única cor de destaque — não introduzir uma segunda cor de acento. Diferenciação de hierarquia vem de tamanho, peso da fonte e uso de `--color-surface` vs `--color-bg`, não de mais cores.
- ⚠️ **Accent como cor de texto tem limite.** A tabela de contraste do `SPEC.md` valida *branco sobre accent*,
  mas o caso inverso não foi medido lá: `#524CFF` **sobre** `#111111` dá apenas **3,45:1**. Isso passa em AA
  para texto grande (≥24px, ou ≥18,66px em bold), mas **reprova para texto pequeno** (mínimo 4,5:1). Regra
  prática: accent em títulos grandes e em palavras destacadas dentro do `<h1>`, sim; em rótulo, legenda ou
  texto de apoio, não — usar branco e deixar a cor no traço/ícone ao lado.

## Motion & micro-interações (padrão Emil Kowalski)
Emil Kowalski mantém um skill oficial para Claude Code com essa filosofia de craft/animação:
`https://github.com/emilkowalski/skills` (pasta `skills/emil-design-eng`). Recomendado copiar essa pasta para
`.claude/skills/emil-design-eng/` no projeto (ou `~/.claude/skills/` se quiser em todos os projetos) para o
Claude Code aplicar automaticamente. Enquanto isso não é feito, seguir estas regras diretamente:

- Botões: leve scale down no `:active` (0.97–0.98) com transição de ~150ms.
- Easing: `ease-out` para elementos que entram/aparecem, `ease-in` para os que saem — nunca `linear`.
- Animar apenas `transform` e `opacity` (nunca `width`, `height`, `top`, `left` — custam performance/reflow).
- Duração padrão de micro-interações: 150–250ms; entradas de seção ao rolar a página: 300–400ms.
- Revelar seções no scroll com fade + leve translateY (8–16px), nunca movimento grande ou bounce exagerado.
- Motion só onde comunica algo (feedback de clique, confirmação de envio do formulário, entrada de seção) —
  nunca decorativo. Se a animação não ajuda a entender o que aconteceu, não animar.

## Regras éticas (não negociáveis)
- Nunca inventar depoimentos, números, avaliações ou provas sociais. Se não houver dado real, usar `[PREENCHER]` e sinalizar no plano.
- Nunca usar contagem regressiva ou "últimas vagas" que não correspondam à realidade.
- Toda alegação de transformação/resultado deve vir com linguagem responsável (não é conselho médico/psicológico, não promete cura ou milagre).
- Garantia e condições de reembolso devem refletir exatamente o que será cumprido.

## Fluxo de trabalho esperado do Claude Code
1. Para qualquer mudança estrutural ou nova seção: entrar em **Plan Mode** antes de editar.
2. Sempre checar `SPEC.md` para saber se um dado (depoimento, preço, link) já foi fornecido ou está pendente.
3. Ao terminar uma versão, checar responsividade nas larguras definidas em `SPEC.md` (320, 375, 414, 768, 1024, 1280, 1440px) — celular pequeno até notebook/desktop grande — antes de considerar concluído. Nunca usar larguras fixas em px em containers, imagens ou texto.
4. Antes de considerar concluído, checar SEO e acessibilidade conforme `SPEC.md` → seção 5 ("SEO" e "Acessibilidade"): meta tags, Open Graph, JSON-LD, hierarquia de headings, alt text, contraste, navegação por teclado.
5. Não fazer deploy em produção sem confirmação explícita do usuário.

## Estrutura de pastas
```
/
├── index.html
├── /assets
│   ├── /img
│   └── /video (se houver arquivo local)
├── SPEC.md
└── CLAUDE.md
```