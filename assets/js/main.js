/* =============================================================================
   main.js — JS mínimo da landing page.
   Menu mobile · FAQ · reveal no scroll · vídeo · pixels · UTM · contagem regressiva.

   >>> AS TRÊS CONSTANTES ABAIXO SÃO AS ÚNICAS QUE VOCÊ PRECISA EDITAR AQUI. <<<
   Enquanto estiverem com [PREENCHER...], nada é disparado e nenhum link quebrado
   é seguido — a página funciona normalmente, só não mede e não vende.
   ============================================================================= */

var CHECKOUT_URL   = '[PREENCHER_LINK_CHECKOUT]';   // ex.: https://pay.kiwify.com.br/xxxxxxx
var META_PIXEL_ID  = '[PREENCHER_META_PIXEL_ID]';   // ex.: 123456789012345
var GA4_ID         = '[PREENCHER_GA4_ID]';          // ex.: G-XXXXXXXXXX

(function () {
  'use strict';

  var docEl = document.documentElement;

  /** Um valor só é considerado configurado se não for mais um placeholder. */
  function configurado(valor) {
    return typeof valor === 'string' && valor.length > 0 && valor.indexOf('PREENCHER') === -1;
  }

  var reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------------
     1. RASTREAMENTO — Meta Pixel e GA4.
     Os scripts só são injetados quando há ID real: sem isso a página não faria
     requisição quebrada nem poluiria o console durante o desenvolvimento.
     ------------------------------------------------------------------------ */
  function iniciarMetaPixel() {
    if (!configurado(META_PIXEL_ID)) return;

    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function iniciarGA4() {
    if (!configurado(GA4_ID)) return;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID);
  }

  /** Dispara o mesmo evento nos dois pixels, ignorando o que não estiver ativo. */
  function rastrear(eventoMeta, eventoGa4, parametros) {
    if (window.fbq && configurado(META_PIXEL_ID)) {
      window.fbq(eventoMeta === 'InitiateCheckout' ? 'track' : 'trackCustom', eventoMeta, parametros || {});
    }
    if (window.gtag && configurado(GA4_ID)) {
      window.gtag('event', eventoGa4, parametros || {});
    }
  }

  /* ---------------------------------------------------------------------------
     2. CHECKOUT + UTM.
     Os parâmetros de campanha que chegam na URL (utm_source, utm_medium,
     utm_campaign, e também src/sck usados por afiliados) são repassados ao
     checkout — sem isso a venda de afiliado não é atribuída a ninguém.
     ------------------------------------------------------------------------ */
  var PARAMETROS_REPASSADOS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'src', 'sck', 'ref', 'aff', 'gclid', 'fbclid'
  ];

  function montarUrlCheckout() {
    if (!configurado(CHECKOUT_URL)) return null;

    var entrada = new URLSearchParams(window.location.search);
    var destino;

    try {
      destino = new URL(CHECKOUT_URL, window.location.origin);
    } catch (e) {
      return null;
    }

    PARAMETROS_REPASSADOS.forEach(function (chave) {
      var valor = entrada.get(chave);
      if (valor && !destino.searchParams.has(chave)) {
        destino.searchParams.set(chave, valor);
      }
    });

    return destino.toString();
  }

  function prepararBotoes() {
    var urlCheckout = montarUrlCheckout();

    // Botões que levam direto ao checkout externo.
    document.querySelectorAll('.js-checkout').forEach(function (botao) {
      if (urlCheckout) {
        botao.setAttribute('href', urlCheckout);
        botao.setAttribute('rel', 'noopener');
      } else {
        // Sem link real, o botão não navega para lugar nenhum nem finge que sim.
        botao.setAttribute('aria-disabled', 'true');
        botao.addEventListener('click', function (evento) {
          evento.preventDefault();
          console.warn('[landing] CHECKOUT_URL ainda não foi preenchido em assets/js/main.js');
        });
      }
    });

    // Todos os CTAs — inclusive os que só rolam a página até a seção de preço.
    document.querySelectorAll('.js-cta').forEach(function (botao) {
      botao.addEventListener('click', function () {
        var origem = botao.getAttribute('data-cta-origem') || 'desconhecida';

        if (botao.classList.contains('js-checkout') && urlCheckout) {
          rastrear('InitiateCheckout', 'begin_checkout', { origem: origem });
        } else {
          rastrear('ClickCTA', 'select_promotion', { origem: origem });
        }
      });
    });
  }

  /* ---------------------------------------------------------------------------
     3. MENU MOBILE
     ------------------------------------------------------------------------ */
  function prepararMenu() {
    var botao = document.getElementById('menu-toggle');
    var painel = document.getElementById('menu-mobile');
    if (!botao || !painel) return;

    function fechar() {
      painel.classList.add('hidden');
      botao.setAttribute('aria-expanded', 'false');
      botao.setAttribute('aria-label', 'Abrir menu de navegação');
    }

    botao.addEventListener('click', function () {
      var aberto = botao.getAttribute('aria-expanded') === 'true';
      if (aberto) {
        fechar();
      } else {
        painel.classList.remove('hidden');
        botao.setAttribute('aria-expanded', 'true');
        botao.setAttribute('aria-label', 'Fechar menu de navegação');
      }
    });

    // Fecha ao escolher um destino, para não cobrir a seção recém-aberta.
    painel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', fechar);
    });

    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
        fechar();
        botao.focus();
      }
    });
  }

  /* ---------------------------------------------------------------------------
     4. FAQ — accordion acessível (aria-expanded + painel associado).
     ------------------------------------------------------------------------ */
  function prepararFaq() {
    document.querySelectorAll('.js-faq').forEach(function (botao) {
      var painel = document.getElementById(botao.getAttribute('aria-controls'));
      var icone = botao.querySelector('.js-faq-icone');
      if (!painel) return;

      botao.addEventListener('click', function () {
        var aberto = botao.getAttribute('aria-expanded') === 'true';
        botao.setAttribute('aria-expanded', aberto ? 'false' : 'true');
        painel.classList.toggle('hidden', aberto);
        if (icone) {
          icone.style.transform = aberto ? 'rotate(0deg)' : 'rotate(45deg)';
        }
      });
    });
  }

  /* ---------------------------------------------------------------------------
     5. REVEAL — entrada de seção no scroll (fade + translateY discreto).
     ------------------------------------------------------------------------ */
  function prepararReveal() {
    var alvos = document.querySelectorAll('.reveal');

    if (reduzirMovimento || !('IntersectionObserver' in window)) {
      alvos.forEach(function (alvo) { alvo.classList.add('is-visible'); });
      return;
    }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          observador.unobserve(entrada.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    alvos.forEach(function (alvo) { observador.observe(alvo); });
  }

  /* ---------------------------------------------------------------------------
     6. VÍDEO (VSL) — facade clicável.
     O iframe do YouTube/Vimeo só é criado no clique: carregá-lo de saída
     custaria ~1MB e derrubaria o LCP da dobra.
     ------------------------------------------------------------------------ */
  function prepararVideo() {
    var caixa = document.getElementById('video-vsl');
    if (!caixa) return;

    var botao = caixa.querySelector('.js-play-video');
    if (!botao) return;

    botao.addEventListener('click', function () {
      var id = caixa.getAttribute('data-video-id');
      var provedor = caixa.getAttribute('data-video-provider') || 'youtube';

      if (!configurado(id)) {
        console.warn('[landing] data-video-id ainda não foi preenchido no #video-vsl (index.html)');
        return;
      }

      var src = provedor === 'vimeo'
        ? 'https://player.vimeo.com/video/' + encodeURIComponent(id) + '?autoplay=1'
        : 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';

      var iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = 'Vídeo de apresentação do ebook';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.className = 'absolute inset-0 h-full w-full';
      iframe.setAttribute('frameborder', '0');

      caixa.innerHTML = '';
      caixa.appendChild(iframe);

      rastrear('PlayVSL', 'video_start', { origem: 'hero' });
    });
  }

  /* ---------------------------------------------------------------------------
     7. CONTAGEM REGRESSIVA — só com prazo REAL.
     A seção #escassez nasce com class="hidden" e data-deadline="". Sem uma data
     ISO futura preenchida ali, ela nunca aparece. Regra do CLAUDE.md: nunca uma
     contagem regressiva que não corresponda à realidade.
     ------------------------------------------------------------------------ */
  function prepararContagem() {
    var secao = document.getElementById('escassez');
    if (!secao) return;

    var iso = (secao.getAttribute('data-deadline') || '').trim();
    if (!iso) return;

    var fim = new Date(iso).getTime();
    if (isNaN(fim) || fim <= Date.now()) return;

    var saida = document.getElementById('contador');
    if (!saida) return;

    secao.classList.remove('hidden');

    function atualizar() {
      var restante = fim - Date.now();

      if (restante <= 0) {
        secao.classList.add('hidden');
        clearInterval(intervalo);
        return;
      }

      var dias = Math.floor(restante / 86400000);
      var horas = Math.floor((restante % 86400000) / 3600000);
      var minutos = Math.floor((restante % 3600000) / 60000);
      var segundos = Math.floor((restante % 60000) / 1000);

      saida.textContent = (dias > 0 ? dias + 'd ' : '') +
        String(horas).padStart(2, '0') + 'h ' +
        String(minutos).padStart(2, '0') + 'm ' +
        String(segundos).padStart(2, '0') + 's';
    }

    atualizar();
    var intervalo = setInterval(atualizar, 1000);
  }

  /* ---------------------------------------------------------------------------
     8. Detalhes finais
     ------------------------------------------------------------------------ */
  function prepararRodape() {
    var ano = document.getElementById('ano-atual');
    if (ano) ano.textContent = String(new Date().getFullYear());
  }

  /** Aviso no console enquanto a página ainda estiver em rascunho. */
  function avisarPendencias() {
    var faltando = [];
    if (!configurado(CHECKOUT_URL))  faltando.push('CHECKOUT_URL');
    if (!configurado(META_PIXEL_ID)) faltando.push('META_PIXEL_ID');
    if (!configurado(GA4_ID))        faltando.push('GA4_ID');

    if (docEl.getAttribute('data-modo') === 'producao' && faltando.length) {
      console.warn('[landing] modo produção com pendências: ' + faltando.join(', ') + '. Ver PREENCHER.md');
    }
  }

  function iniciar() {
    iniciarMetaPixel();
    iniciarGA4();
    prepararBotoes();
    prepararMenu();
    prepararFaq();
    prepararReveal();
    prepararVideo();
    prepararContagem();
    prepararRodape();
    avisarPendencias();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
