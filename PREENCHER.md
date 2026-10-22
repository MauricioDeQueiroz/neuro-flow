# PREENCHER — o que falta antes de publicar

A página possui estrutura, design e interações implementados, mas está em **modo rascunho**.
Blocos marcados com `data-pendente` aparecem contornados em azul, com uma etiqueta `FALTA: ...`.
Também há pendências em metadados e configurações sem marcador visual. A prontidão
para publicação depende de conteúdo real e das validações deste checklist.

Use este arquivo como checklist. Ele está na ordem em que as coisas aparecem na página.
As instruções de desenvolvimento estão em `AGENTS.md`; `CLAUDE.md` permanece como referência histórica.

## Link para revisão dos amigos

A prévia usa https://mauriciodequeiroz.github.io/neuro-flow/ e permanece em rascunho,
sem indexação e com compra bloqueada. O fluxo `.github/workflows/pages.yml` publica
somente `dist/` após push em `main`; instruções em `README.md` e `docs/deployment.md`.
Os bloqueadores abaixo se referem ao lançamento comercial, não à revisão do rascunho.

## Coleção de 11 ebooks — organização iniciada em 21/10/2026

O catálogo está em `index.html`, seção `#solucao`, com cards `#ebook-01` até
`#ebook-11`. Cada card contém título, capa, resumo e preço provisórios. Para completar:

- [ ] Preencher os 11 títulos, resumos, capas (com width/height intrínsecos), preços e extensão/formato de cada ebook.
- [ ] Definir `data-temas` por card: tokens separados por espaço, como `tentacao medo`.
  Valores disponíveis: `tentacao`, `medo`, `identidade`; um ebook pode ter vários.
  Todos começam vazios. Enquanto isso, filtros específicos mostram aviso de preparação.
  Ao criar outro tema, acrescentar seu botão no fieldset de filtros.
- [ ] Conferir quais títulos incluem exercícios/bônus; não presumir que todos têm 25 páginas.
- [ ] Definir preço individual, combo de 5, coleção de 11 e condições para outras quantidades.
- [ ] Integrar seleção e preços reais ao checkout e à entrega. **Preencher apenas
  CHECKOUT_URL não basta:** `data-checkout-pendente` mantém bloqueado o destino legado
  para evitar cobrar/entregar um único produto quando vários foram selecionados.
  Remover essa proteção somente com integração real implementada e validada.
- [ ] Atualizar FAQ/JSON-LD e condições de entrega/garantia de acordo com a operação real.
  O Product comentado é referência antiga de um único produto; não ativar para representar
  os 11 títulos como se fossem um ebook.

A seleção atual é demonstrativa e fica apenas na memória da página; recarregar a
limpa. Selecionar 5 ou 11 muda o incentivo por quantidade, sem calcular preço ou
prometer desconto. O carrossel avança automaticamente quando o mouse está fora dos cards/setas;
pausa sobre o conteúdo e retoma ao sair, sem botão de ativação. Toque, foco visível
por teclado, aba oculta e movimento reduzido também suspendem o avanço. A foto do autor e o card de preço mantêm
as bordas solicitadas. Os três problemas registrados na revisão independente
continuam pendentes; este trabalho não os corrige.

## Conteúdo incorporado de COPY AUTOR.pdf — 21/10/2026

- Apresentação da NEUROFLOW, incluindo o alcance mensal informado pelo responsável.
- Texto sobre adiar o recomeço, cinco benefícios, 25 páginas de fácil leitura,
  bônus de exercícios práticos e disponibilidade para download imediato.
- Suporte: oneuroflowlj@gmail.com; Instagram e TikTok: @neurofllow;
  atendimento das 08h às 18h. Prazo de resposta e dias de atendimento não informados.
- FAQ de entrega, aparelhos e contato atualizado junto ao JSON-LD.

O nome da marca não define o título do ebook nem a razão social. Preço mais acessível
foi mantido como observação geral sobre ebooks; não foi criada comparação de preço
específica deste produto. Formato do arquivo, plataforma de entrega, capítulos,
sexto benefício e possível segundo bônus continuam pendentes. Os cinco benefícios
recebidos descrevem o formato digital; benefícios específicos do conteúdo ainda
podem ser detalhados posteriormente.

O PDF menciona prints de comentários, mas não os fornece: frases de dor e depoimentos
permanecem como estavam. Não foram criadas citações nem coletadas imagens de seguidores.
Foto, capa, vídeo, nome/promessa do ebook, preço, garantia, checkout, domínio, IDs e
políticas não foram fornecidos e permanecem pendentes. As instruções abaixo são um
checklist de publicação; considere o preenchimento parcial registrado nesta seção.

---

## Como funciona o modo rascunho

No topo do `index.html`:

```html
<html lang="pt-BR" data-modo="rascunho">
```

| Valor | O que acontece |
|---|---|
| `rascunho` | Contornos azuis + etiquetas `FALTA:` + faixa de aviso no topo. Depoimentos ficam visíveis; escassez permanece oculta enquanto não houver prazo futuro válido. |
| `producao` | Contornos, etiquetas e faixa somem. Blocos marcados com `data-oculto-em-producao` **desaparecem** da página. |

⚠️ **Trocar para `producao` não apaga os textos `[PREENCHER: ...]` escritos no HTML.** Esses são texto de
verdade e precisam ser substituídos à mão — é justamente o que este arquivo lista.
Use a busca abaixo como triagem de placeholders, incluindo os que não contêm `PREENCHER`:

```bash
rg -n 'PREENCHER|\[[^]]+\]|SEU-DOMINIO' index.html assets/js/main.js robots.txt sitemap.xml
```

A busca também encontra comentários, referências a este guia e sintaxe JavaScript;
esses resultados não devem ser removidos indiscriminadamente. Ela não é uma validação
automática nem exaustiva. Revise os resultados e a página: não pode haver conteúdo
ou configuração de produção pendente. Comentários técnicos podem permanecer.

---

## 🔴 Bloqueadores — sem estes a página não pode ir ao ar

### 0. Liberar a indexação no Google
- **Onde:** `index.html`, no `<head>`.
- Hoje está `<meta name="robots" content="noindex, nofollow">`, de propósito: a página
  não deve ser indexada em estado de rascunho, independentemente da hospedagem usada para revisão.
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
- **Onde:** procure todas as ocorrências de `[NOME DO EBOOK]` no `index.html`, incluindo
  `<title>`, Open Graph, Twitter Card, logo do menu, seção `#solucao`, alt e rodapé,
  além dos blocos comentados que serão ativados.
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
- Regras de tom (do `AGENTS.md`): acolhedor e direto, a partir de esperança e propósito — **nunca** medo ou
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
- Recebido e inserido: depoimento do **Pr. Josué**, integralmente como enviado, sem
  atribuir o relato aos 11 ebooks. A expressão “essa prestação de ler a bíblia” foi
  preservada; não corrigir uma citação por suposição.
- Ainda falta registrar a autorização de uso e identificar qual ebook foi avaliado.
  Não foram fornecidos foto, cidade, igreja ou outras credenciais; não inferir.
- Os três espaços restantes continuam pendentes. O texto recebido está sem borda
  de pendência; apenas a informação faltante e os outros espaços ficam marcados.
- Regra inegociável: nada de depoimento inventado, "adaptado" ou de banco de imagens. Peça autorização de uso
  a cada pessoa.
- A seção está marcada com `data-oculto-em-producao`: enquanto não houver depoimentos reais, ela **some
  sozinha** em produção. Quando tiver os depoimentos, remova esse atributo da tag `<section>`.
- Se tiver menos de 4, apague os blocos que sobrarem — não preencha por preencher.

### 9. Sobre o autor
- **Onde:** seção `#autor` (bio) + `assets/img/autor.webp` (foto).
- A apresentação da NEUROFLOW já foi preenchida com o PDF; a imagem ainda falta.
- Só credenciais verdadeiras e verificáveis.

### 10. Oferta e bônus
- **Onde:** seção `#oferta`.
- Liste apenas o que será realmente entregue. Se não houver bônus, apague os blocos — não invente valor.

### 11. FAQ
- **Onde:** seção `#faq`, 8 perguntas.
- As perguntas já estão escritas; as respostas nº 1 e nº 3 já foram preenchidas; a nº 8 tem contato/horário, mas falta prazo de resposta.
- As demais ainda dependem do produto (a nº 7, sobre acompanhamento
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

A configuração opcional da Vercel agora exige revalidação de arquivos com nomes
estáveis, inclusive imagens. Configure a mesma estratégia no provedor escolhido;
headers no repositório não comprovam o cache remoto. Se uma versão antiga já tiver
sido publicada com cache anual, pode ser necessário versionar URLs ou invalidar o
cache anterior. Veja `docs/deployment.md`.

> `assets/fonts/` não precisa de nada: as fontes Play e Inter já estão autohospedadas, reduzidas aos
> caracteres do português e aos pesos 400/600/700 usados no corpo e Play 700 nos títulos. Não apague — a página depende delas.

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
- IDs válidos exibem o painel de preferências. Sem permissão explícita, nenhum pixel
  inicia; aceitar libera medição, recusar mantém desligada e retirar permissão recarrega
  a página. A escolha vale nesta aba. Isso não apaga cookies anteriores nem dados enviados.
- Antes de habilitar IDs reais, finalize a política de privacidade e revise finalidades,
  retenção e configurações dos provedores conforme `docs/deployment.md`.
- Teste com **Meta Pixel Helper** e **GA4 DebugView** depois de preencher, incluindo
  recusa, aceitação e retirada. Cliques não representam compras concluídas.

### 14. Domínio final
Três trechos estão **comentados** de propósito, porque uma URL com placeholder é pior que nenhuma — o Google
trata como canonical inválido e a prévia do link quebra no WhatsApp. Ao definir o domínio, descomente e troque:

| Arquivo | O que descomentar |
|---|---|
| `index.html` | bloco do `<link rel="canonical">` |
| `index.html` | bloco de `og:url`, `og:image`, suas dimensões/alt e `twitter:image` |
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

Regra preservada em `AGENTS.md`: **nunca** uma contagem regressiva ou "últimas vagas" que não corresponda à realidade.

---

## Comandos

```bash
# rodar localmente
npm run dev

# recompilar o CSS (só é necessário se você editar assets/css/input.css
# ou usar uma classe Tailwind nova no HTML/JS)
npm run css

# recompilar automaticamente enquanto edita
npm run css:watch

# testes locais sem dependências extras
npm test

# preparar apenas arquivos públicos, sem publicar
npm run build
```

> `assets/css/tailwind.css` é gerado e **precisa ser versionado** — é ele que a página carrega.
> O `node_modules/` existe só para desenvolvimento; ele não vai para o deploy.
> Nenhum provedor foi escolhido: publique somente `dist/`, com autorização explícita.
> Configurações de headers, TLS, cache e 404: veja `docs/deployment.md`.

---

## Checklist final antes de publicar

- [ ] Busca de placeholders revisada; conteúdo, links e configurações reais conferidos na página e nos metadados (comentários técnicos podem permanecer)
- [ ] `data-modo="producao"` no `<html>`
- [ ] Indexação liberada e URLs finais de canonical, compartilhamento e sitemap conferidas
- [ ] Todos os CTAs levam ao checkout certo (testar o clique de verdade)
- [ ] Política de privacidade real e preferências de medição revisadas; pixels só após permissão (Meta Pixel Helper + GA4 DebugView)
- [ ] Nenhum depoimento, número ou urgência fabricados
- [ ] Sem rolagem horizontal em 320, 375, 414, 768, 1024, 1280 e 1440px
- [ ] Navegação completa só pelo teclado (Tab/Enter), com foco sempre visível
- [ ] Lighthouse mobile: Performance ≥ 90, SEO ≥ 95, Acessibilidade ≥ 95, Boas Práticas ≥ 95
- [ ] JSON-LD sem erros no Google Rich Results Test
- [ ] Preview do link testado no Facebook Sharing Debugger e no WhatsApp

> **Registro histórico de medição** (com os placeholders, antes do conteúdo real;
> não reproduzido na auditoria nem na migração documental):
> Lighthouse mobile **100 / 100 / 100 / 100** — Performance, Acessibilidade, Boas Práticas e SEO;
> LCP 1,8s · CLS 0 · TBT 0ms. Zero overflow de 320px a 1920px.
>
> Textos e imagens reais mexem nesses números — meça de novo antes de publicar. Os dois pontos que mais
> costumam derrubar: **imagem pesada** (exporte a capa e a foto do autor em WebP, no tamanho da tabela acima)
> e **scripts extras** colados no `<head>` (chat, remarketing, pop-up de saída).
