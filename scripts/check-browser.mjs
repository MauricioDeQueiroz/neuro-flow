// Ferramentas de auditoria opcionais, instaladas fora das dependências do site.
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
const ferramentas = process.env.AUDIT_TOOLS_DIR || '/tmp/neuro-flow-audit';
const require = createRequire(resolve(ferramentas, 'package.json'));
const { chromium } = require('playwright-core');
const axe = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
const codigo = await readFile(new URL('../assets/js/main.js', import.meta.url), 'utf8');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH,
  headless: true, args: ['--no-sandbox'] });
const base = process.env.AUDIT_URL || 'http://127.0.0.1:3000';
const erros = [];
const resultados = [];
try {
  const pagina = await browser.newPage();
  pagina.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  pagina.on('pageerror', (e) => erros.push(e.message));
  pagina.on('response', (r) => { if (r.status() >= 400) erros.push(`${r.status()} ${r.url()}`); });
  for (const largura of [320, 375, 414, 768, 1024, 1280, 1440, 1920]) {
    await pagina.setViewportSize({ width: largura, height: 900 });
    await pagina.goto(base);
    await pagina.evaluate(() => document.fonts.ready);
    for (const alvo of await pagina.locator('.reveal').all()) await alvo.scrollIntoViewIfNeeded();
    await pagina.waitForTimeout(400);
    const layout = await pagina.evaluate(() => ({
      largura: innerWidth, documento: document.documentElement.scrollWidth,
      imagens: [...document.images].every((i) => i.complete && i.naturalWidth > 0),
      cortes: [...document.querySelectorAll('h1,h2,h3,p,.btn')].filter((e) => {
        if (!e.checkVisibility() || e.closest('[inert]')) return false;
        const r = e.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1;
      }).map((e) => e.tagName + ':' + e.textContent.trim().slice(0, 35))
    }));
    assert.ok(layout.documento <= largura, JSON.stringify(layout));
    assert.deepEqual(layout.cortes, [], JSON.stringify(layout));
    assert.ok(layout.imagens);
    const faq = pagina.locator('.js-faq').first();
    await faq.click();
    assert.equal(await faq.getAttribute('aria-expanded'), 'true');
    await pagina.locator('#faq-1').waitFor({ state: 'visible' });
    await faq.focus(); await pagina.keyboard.press('Enter');
    assert.equal(await faq.getAttribute('aria-expanded'), 'false');
    if (largura < 1024) {
      await pagina.locator('#menu-toggle').click();
      await pagina.locator('#menu-mobile').waitFor({ state: 'visible' });
      await pagina.keyboard.press('Escape');
      assert.equal(await pagina.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
      assert.equal(await pagina.evaluate(() => document.activeElement.id), 'menu-toggle');
    }
    await pagina.addScriptTag({ content: axe });
    const acessibilidade = await pagina.evaluate(() => axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }
    }));
    assert.deepEqual(acessibilidade.violations.map((v) => ({ id: v.id, alvos: v.nodes.map((n) => n.target) })), []);
    resultados.push({ largura, overflow: false, axeViolacoes: acessibilidade.violations.length });
  }
  assert.deepEqual(erros, []);
  // Sem JS e com main.js indisponível: conteúdo, menu e FAQ continuam legíveis.
  for (const cenario of ['sem-js', 'script-bloqueado']) {
    const contexto = await browser.newContext({ javaScriptEnabled: cenario !== 'sem-js', viewport: { width: 375, height: 812 } });
    if (cenario === 'script-bloqueado') await contexto.route('**/assets/js/main.js', (r) => r.abort());
    const p = await contexto.newPage(); await p.goto(base);
    assert.ok(await p.locator('#faq-7').isVisible());
    assert.equal(await p.locator('#menu-mobile').isVisible(), false);
    await p.locator('#menu-toggle').click();
    assert.ok(await p.locator('#menu-mobile').isVisible());
    assert.ok(await p.locator('h1').isVisible());
    assert.ok(await p.locator('#menu-toggle').isVisible());
    assert.equal(await p.locator('.js-checkout').first().getAttribute('href'), null);
    await contexto.close();
    resultados.push({ cenario, aprovado: true });
  }
  const lenta = await browser.newContext({ viewport: { width: 375, height: 812 } });
  await lenta.addInitScript(() => {
    window.deslocamentos = [];
    new PerformanceObserver((lista) => lista.getEntries().forEach((e) => {
      if (!e.hadRecentInput) window.deslocamentos.push(e.value);
    })).observe({ type: 'layout-shift', buffered: true });
  });
  await lenta.route('**/assets/js/main.js', async (r) => {
    await new Promise((f) => setTimeout(f, 1500)); await r.continue();
  });
  const pl = await lenta.newPage(); await pl.goto(base); await pl.waitForTimeout(400);
  const deslocamento = await pl.evaluate(() => window.deslocamentos.reduce((a, b) => a + b, 0));
  assert.ok(deslocamento <= 0.1, `Deslocamento com script atrasado: ${deslocamento}`);
  resultados.push({ cenario: 'script-atrasado-1500ms', somaLayoutShifts: deslocamento });
  await lenta.close();
  const contexto = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 375, height: 812 } });
  const p = await contexto.newPage();
  // Fixture isolada para a integração antiga: ela não representa o checkout múltiplo.
  await contexto.route(base + '/?**', async (r) => {
    const resposta = await r.fetch();
    return r.fulfill({ response: resposta, body: (await resposta.text()).replace('data-checkout-pendente', '') });
  });
  await contexto.route('**/assets/js/main.js', (r) => r.fulfill({ contentType: 'text/javascript', body: codigo.replace("'[PREENCHER_LINK_CHECKOUT]'", "'https://checkout.example/pagar?ref=original'") }));
  await p.goto(base + '/?utm_source=teste&ref=outro&url=https://evil.example');
  const url = new URL(await p.locator('.js-checkout').first().getAttribute('href'));
  assert.equal(url.origin, 'https://checkout.example');
  assert.equal(url.searchParams.get('ref'), 'original');
  assert.equal(url.searchParams.get('utm_source'), 'teste');
  assert.equal(url.searchParams.has('url'), false);
  assert.ok(await p.locator('#depoimentos .reveal').first().evaluate((e) => getComputedStyle(e).opacity === '1'));
  // Vídeos só são criados no clique; provedores externos indisponíveis não quebram o FAQ.
  await contexto.route(/youtube-nocookie|player.vimeo/, (r) => r.abort());
  await p.locator('#video-vsl').evaluate((e) => e.setAttribute('data-video-id', 'dQw4w9WgXcQ'));
  assert.equal(await p.locator('iframe').count(), 0);
  await p.locator('.js-play-video').click();
  assert.equal(await p.locator('iframe').count(), 1);
  await p.locator('.js-faq').first().click();
  assert.ok(await p.locator('#faq-1').isVisible());
  // Proteções de produção continuam escondendo prova social e prazo não autorizado.
  await p.evaluate(() => document.documentElement.setAttribute('data-modo', 'producao'));
  assert.equal(await p.locator('#depoimentos').isVisible(), false);
  assert.equal(await p.locator('#escassez').isVisible(), false);
  await contexto.route('https://checkout.example/**', (r) => r.fulfill({ contentType: 'text/html', body: '<title>Checkout simulado</title>' }));
  await p.locator('.js-checkout').first().click();
  await p.waitForURL('https://checkout.example/**');
  assert.equal(new URL(p.url()).searchParams.get('utm_source'), 'teste');
  await contexto.close();
  // IDs de teste existem apenas na resposta interceptada, nunca no site versionado.
  const privacidade = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const terceiros = [];
  await privacidade.route(/connect.facebook.net|googletagmanager.com/, (r) => {
    terceiros.push(r.request().url()); return r.abort();
  });
  await privacidade.route('**/assets/js/main.js', (r) => r.fulfill({ contentType: 'text/javascript',
    body: codigo.replace("'[PREENCHER_META_PIXEL_ID]'", "'1234567890'").replace("'[PREENCHER_GA4_ID]'", "'G-TEST1234'") }));
  const pp = await privacidade.newPage(); await pp.goto(base);
  assert.equal(terceiros.length, 0);
  await pp.locator('#recusar-rastreamento').click();
  assert.equal(terceiros.length, 0);
  await pp.locator('#aceitar-rastreamento').click();
  await pp.waitForTimeout(200);
  assert.equal(terceiros.length, 2);
  await pp.addScriptTag({ content: axe });
  const consentAxe = await pp.evaluate(() => axe.run(document.getElementById('preferencias-rastreamento')));
  assert.deepEqual(consentAxe.violations.map((v) => v.id), []);
  await Promise.all([pp.waitForNavigation(), pp.locator('#recusar-rastreamento').click()]);
  assert.equal(terceiros.length, 2);
  await privacidade.close();
  const faltante = await pagina.request.get(base + '/pagina-inexistente');
  assert.equal(faltante.status(), 404);
  for (const caminho of ['/.git/config', '/README.md', '/.env', '/package.json', '/assets/css/input.css']) {
    assert.equal((await pagina.request.get(base + caminho)).status(), 404, caminho);
  }
  console.log(JSON.stringify({ resultados, erros, checkout: 'HTTPS e campanhas validados com navegação interceptada, sem compra',
    fallback: 'sem JS e script bloqueado', producao: 'proteções preservadas', status404: true }, null, 2));
} finally { await browser.close(); }
