# PREENCHER — o que falta antes de publicar

A página está **completa em estrutura, design e comportamento**, mas em **modo rascunho**: tudo que ainda
depende de informação real aparece contornado em azul, com uma etiqueta `FALTA: ...` dizendo o que entra ali.

Use este arquivo como checklist. Ele está na ordem em que as coisas aparecem na página.

---

## Como funciona o modo rascunho

No topo do `index.html`:

```html
<html lang="pt-BR" data-modo="rascunho">
```

| Valor | O que acontece |
|---|---|
| `rascunho` | Contornos azuis + etiquetas `FALTA:` + faixa de aviso no topo. Seções sem dado real (depoimentos, escassez) ficam **visíveis**, para você apresentar onde a informação entraria. |
| `producao` | Contornos, etiquetas e faixa somem. Blocos marcados com `data-oculto-em-producao` **desaparecem** da página. |

⚠️ **Trocar para `producao` não apaga os textos `[PREENCHER: ...]` escritos no HTML.** Esses são texto de
verdade e precisam ser substituídos à mão — é justamente o que este arquivo lista. O comando abaixo mostra
tudo que ainda falta trocar:

```bash
grep -rn "PREENCHER" index.html assets/js/main.js robots.txt sitemap.xml
```

Só publique quando esse comando não retornar mais nada.

---

## 🔴 Bloqueadores — sem estes a página não pode ir ao ar

### 0. Liberar a indexação no Google
- **Onde:** `index.html`, no `<head>`.
- Hoje está `<meta name="robots" content="noindex, nofollow">`, de propósito: enquanto a página estiver
  hospedada no GitHub Pages para revisão, ela não deve ser indexada em estado de rascunho.
- **Ao publicar no domínio final, troque por:** `<meta name="robots" content="index, follow">`
- Esquecer disso é o erro mais caro da lista: a página vai ao ar e o Google simplesmente a ignora.

### 1. Link de checkout
- **Onde:** `assets/js/main.js`, linha ~15 → `var CHECKOUT_URL = '[PREENCHER_LINK_CHECKOUT]';`
- Cole a URL do produto na Hotmart / Kiwify / Eduzz / Stripe.
- Enquanto for placeholder, os botões "Comprar agora" e "Quero meu exemplar" **não navegam** (de propósito:
  melhor um botão inerte do que um que leva a lugar nenhum) e avisam no console.
- Os UTMs que chegam na URL (`utm_source`, `utm_campaign`, `src`, `sck`, `ref`…) são repassados
  automaticamente para o checkout — importante se houver afiliados.

### 2. Nome do ebook
- **Onde:** aparece em 8 pontos do `index.html` como `[NOME DO EBOOK]` — `<title>`, Open Graph, Twitter Card,
  logo do menu, seção `#solucao` e rodapé.
- Substitua todos de uma vez: `sed -i 's/\[NOME DO EBOOK\]/Seu Título Aqui/g' index.html`

### 3. Promessa central
- **Onde:** `#hero` (o `<h1>`), `<title>`, `meta description`, OG/Twitter e `#cta-final`.
- Uma frase sobre o que a pessoa vai **sentir e viver**, não sobre o que o ebook contém.
- Sem garantir resultado: possibilidade e caminho, nunca certeza ou prazo fixo.

### 4. Preço, parcelamento e formas de pagamento
- **Onde:** seção `#preco` do `index.html`.
- Depois de definir, **descomente o JSON-LD de `Product`** no `<head>` e preencha `price`. Publicar com preço
  inventado dá erro no Rich Results Test e engana o comprador.

### 5. Garantia — prazo e condições reais
- **Onde:** seção `#garantia`, mais três menções ao prazo (`#hero`, `#cta-final`, FAQ nº 5).
- O texto precisa descrever exatamente o que será cumprido: prazo em dias corridos, se é incondicional, por
  onde se pede e em quanto tempo o dinheiro volta.

### 6. Persona — define todo o copy
- **Onde:** seções `#dor`, `#agitacao` e `#beneficios`.
- Preencha antes a seção 2 do `SPEC.md`: quem é, dor principal, objeção mais comum.
- Regras de tom (do `CLAUDE.md`): acolhedor e direto, a partir de esperança e propósito — **nunca** medo ou
  culpa, nunca "sua vida vai mudar em 7 dias".

---

## Conteúdo

### 7. Vídeo de apresentação (VSL)
- **Onde:** `index.html`, `<div id="video-vsl" ... data-video-id="[PREENCHER_ID_DO_VIDEO]">`
- Cole só o **ID** do vídeo, não a URL inteira:
  - YouTube `https://youtu.be/dQw4w9WgXcQ` → `data-video-id="dQw4w9WgXcQ"`
  - Vimeo → troque também `data-video-provider="youtube"` por `"vimeo"`.
- O iframe só carrega quando a pessoa clica em Play — carregar de saída custaria ~1MB e derrubaria a
  velocidade da primeira tela.
- **Transcrição:** preencha o `<details>` logo abaixo do vídeo. Conta como acessibilidade **e** como conteúdo
  indexável pelo Google.

### 8. Depoimentos reais
- **Onde:** seção `#depoimentos`.
- Regra inegociável: nada de depoimento inventado, "adaptado" ou de banco de imagens. Peça autorização de uso
  a cada pessoa.
- A seção está marcada com `data-oculto-em-producao`: enquanto não houver depoimentos reais, ela **some
  sozinha** em produção. Quando tiver os depoimentos, remova esse atributo da tag `<section>`.
- Se tiver menos de 4, apague os blocos que sobrarem — não preencha por preencher.

### 9. Sobre o autor
- **Onde:** seção `#autor` (bio) + `assets/img/autor.webp` (foto).
- Só credenciais verdadeiras e verificáveis.

### 10. Oferta e bônus
- **Onde:** seção `#oferta`.
- Liste apenas o que será realmente entregue. Se não houver bônus, apague os blocos — não invente valor.

### 11. FAQ
- **Onde:** seção `#faq`, 8 perguntas.
- As perguntas já estão escritas; faltam as respostas específicas do produto (a nº 7, sobre acompanhamento
  pastoral/médico/psicológico, já está respondida e não precisa mudar).
- ⚠️ Ao editar uma resposta, **atualize também o JSON-LD `FAQPage` no `<head>`**. O Google exige que o texto
  do dado estruturado seja idêntico ao visível na página.

### 12. Rodapé — dados legais
- **Onde:** `<footer>` do `index.html`.
- Razão social, CNPJ, e-mail de suporte, horário de atendimento, links de política de privacidade e termos.

---

## Imagens

Todas as imagens em `assets/img/` são placeholders gerados. **Mantenha as mesmas dimensões** ao substituir —
elas estão declaradas no HTML para evitar que o layout "pule" durante o carregamento (CLS).

| Arquivo | Dimensão | Uso |
|---|---|---|
| `capa-ebook.webp` | 800×1000 | Capa na seção `#solucao` |
| `autor.webp` | 560×700 | Foto na seção `#autor` |
| `video-capa.webp` | 1280×720 | Frame de abertura da VSL |
| `og-image.jpg` | 1200×630 | Preview ao compartilhar no WhatsApp/Instagram/Telegram |
| `favicon.svg` | 64×64 | Ícone da aba |
| `apple-touch-icon.png` | 180×180 | Ícone ao salvar na tela inicial do iPhone |

Se mudar alguma dimensão, atualize os atributos `width`/`height` correspondentes no `index.html`.

> `assets/fonts/` não precisa de nada: as fontes Play e Inter já estão autohospedadas, reduzidas aos
> caracteres do português e aos pesos em uso. Não apague — a página depende delas.

---

## Rastreamento e domínio

### 13. Pixels
- **Onde:** `assets/js/main.js`, linhas ~16–17.
```js
var META_PIXEL_ID  = '[PREENCHER_META_PIXEL_ID]';   // ex.: 123456789012345
var GA4_ID         = '[PREENCHER_GA4_ID]';          // ex.: G-XXXXXXXXXX
```
- Enquanto forem placeholders, **nenhum script de rastreamento é carregado** — a página não faz requisição
  quebrada nem polui o console.
- Eventos já implementados:
  | Ação | Meta Pixel | GA4 |
  |---|---|---|
  | Carregar a página | `PageView` | `page_view` |
  | Clicar em qualquer CTA interno | `ClickCTA` | `select_promotion` |
  | Clicar em ir para o checkout | `InitiateCheckout` | `begin_checkout` |
  | Dar play na VSL | `PlayVSL` | `video_start` |
- Teste com **Meta Pixel Helper** e **GA4 DebugView** depois de preencher.

### 14. Domínio final
Três trechos estão **comentados** de propósito, porque uma URL com placeholder é pior que nenhuma — o Google
trata como canonical inválido e a prévia do link quebra no WhatsApp. Ao definir o domínio, descomente e troque:

| Arquivo | O que descomentar |
|---|---|
| `index.html` | bloco do `<link rel="canonical">` |
| `index.html` | bloco de `og:url` + `og:image` + `twitter:image` (5 linhas) |
| `robots.txt` | a linha `Sitemap:` |
| `sitemap.xml` | trocar `[PREENCHER-DOMINIO]` e atualizar `<lastmod>` |

Depois disso, teste em:
- **Google Rich Results Test** — valida o JSON-LD.
- **Facebook Sharing Debugger** — força o recarregamento da prévia e mostra como o link vai aparecer.

---

## Escassez — só se for real

A seção `#escassez` nasce **oculta** e vazia:

```html
<section id="escassez" class="hidden" data-deadline="" data-oculto-em-producao>
```

- **Se não houver prazo real:** não faça nada. Ela nunca aparece. O ideal é apagar a seção inteira.
- **Se houver prazo real** (lote com data de fim, bônus por tempo limitado): preencha
  `data-deadline="2026-10-31T23:59:59-03:00"`, escreva o motivo verdadeiro do prazo e remova o
  `data-oculto-em-producao`. O contador aparece e se esconde sozinho quando a data passa.

Regra do `CLAUDE.md`: **nunca** uma contagem regressiva ou "últimas vagas" que não corresponda à realidade.

---

## Comandos

```bash
# rodar localmente
npx serve .

# recompilar o CSS (só é necessário se você editar assets/css/input.css
# ou usar uma classe Tailwind nova no index.html)
npm run css

# recompilar automaticamente enquanto edita
npm run css:watch

# publicar (só com confirmação explícita)
vercel --prod
```

> `assets/css/tailwind.css` é gerado e **precisa ser versionado** — é ele que a página carrega.
> O `node_modules/` existe só para rodar o compilador na sua máquina; ele não vai para o deploy.

---

## Checklist final antes de publicar

- [ ] `grep -rn "PREENCHER" index.html assets/js/main.js robots.txt sitemap.xml` não retorna nada
- [ ] `data-modo="producao"` no `<html>`
- [ ] Todos os CTAs levam ao checkout certo (testar o clique de verdade)
- [ ] Pixels disparando (Meta Pixel Helper + GA4 DebugView)
- [ ] Nenhum depoimento, número ou urgência fabricados
- [ ] Sem rolagem horizontal em 320, 375, 414, 768, 1024, 1280 e 1440px
- [ ] Navegação completa só pelo teclado (Tab/Enter), com foco sempre visível
- [ ] Lighthouse mobile: Performance ≥ 90, SEO ≥ 95, Acessibilidade ≥ 95
- [ ] JSON-LD sem erros no Google Rich Results Test
- [ ] Preview do link testado no Facebook Sharing Debugger e no WhatsApp

> **Linha de base já medida** (com os placeholders, antes do seu conteúdo entrar):
> Lighthouse mobile **100 / 100 / 100 / 100** — Performance, Acessibilidade, Boas Práticas e SEO;
> LCP 1,8s · CLS 0 · TBT 0ms. Zero overflow de 320px a 1920px.
>
> Textos e imagens reais mexem nesses números — meça de novo antes de publicar. Os dois pontos que mais
> costumam derrubar: **imagem pesada** (exporte a capa e a foto do autor em WebP, no tamanho da tabela acima)
> e **scripts extras** colados no `<head>` (chat, remarketing, pop-up de saída).
