import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(resolve(process.env.AUDIT_TOOLS_DIR || '/tmp/neuro-flow-audit', 'package.json'));
const { chromium } = require('playwright-core');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true, args: ['--no-sandbox'] });
const base = process.env.AUDIT_URL || 'http://127.0.0.1:3000';
try {
  const pagina = await browser.newPage({ reducedMotion: 'reduce' });
  const erros = [];
  pagina.on('pageerror', (e) => erros.push(e.message));
  for (const largura of [320, 375, 414, 768, 1024, 1280, 1440, 1920]) {
    await pagina.setViewportSize({ width: largura, height: 900 });
    await pagina.goto(base);
    await pagina.evaluate(() => document.fonts.ready);
    assert.equal(await pagina.locator('[data-ebook]').count(), 11);
    const esperado = largura >= 1024 ? 3 : largura >= 640 ? 2 : 1;
    assert.equal(await pagina.locator('[data-ebook][aria-hidden="false"]').count(), esperado);
    assert.equal(await pagina.locator('#catalogo-pausa').count(), 0);
    await pagina.locator('#catalogo-proximo').click();
    const alinhamento = await pagina.evaluate(() => {
      const viewport = document.getElementById('catalogo-viewport').getBoundingClientRect();
      const itens = [...document.querySelectorAll('[data-ebook][aria-hidden="false"]')].map((e) => e.getBoundingClientRect());
      return { primeiro: Math.abs(itens[0].left - viewport.left), ultimo: itens.at(-1).right - viewport.right,
        documento: document.documentElement.scrollWidth, largura: innerWidth };
    });
    assert.ok(alinhamento.primeiro < 2 && alinhamento.ultimo < 2, JSON.stringify(alinhamento));
    assert.ok(alinhamento.documento <= largura, JSON.stringify(alinhamento));
    await pagina.locator('#catalogo-anterior').click();
    // Seleção de cinco títulos: navegar primeiro, sem focar cards fora da vista.
    for (let numero = 1; numero <= 5; numero++) {
      const card = pagina.locator('#ebook-' + String(numero).padStart(2, '0'));
      while (await card.getAttribute('aria-hidden') === 'true') await pagina.locator('#catalogo-proximo').click();
      await card.locator('button').click();
    }
    assert.match(await pagina.locator('#catalogo-quantidade').textContent(), /5 ebooks/);
    assert.match(await pagina.locator('#catalogo-incentivo').textContent(), /combo/);
    await pagina.locator('[data-filtro="medo"]').click();
    assert.ok(await pagina.locator('#catalogo-vazio').isVisible());
    assert.match(await pagina.locator('#catalogo-quantidade').textContent(), /5 ebooks/);
    // Classificação de teste apenas no DOM; fonte real permanece sem temas inventados.
    await pagina.locator('#ebook-01').evaluate((e) => e.dataset.temas = 'tentacao medo');
    await pagina.locator('#ebook-02').evaluate((e) => e.dataset.temas = 'medo');
    await pagina.locator('[data-filtro="medo"]').click();
    assert.equal(await pagina.locator('[data-ebook]:not([hidden])').count(), 2);
    await pagina.locator('[data-filtro="tentacao"]').click();
    assert.equal(await pagina.locator('[data-ebook]:not([hidden])').count(), 1);
    await pagina.locator('[data-filtro="todos"]').click();
    await pagina.locator('#catalogo-completo').click();
    assert.equal(await pagina.locator('#catalogo-selecionados li').count(), 11);
    assert.match(await pagina.locator('#catalogo-incentivo').textContent(), /Coleção completa/);
    await pagina.locator('#catalogo-selecionados button').first().click();
    assert.match(await pagina.locator('#catalogo-quantidade').textContent(), /10 ebooks/);
    await pagina.locator('#catalogo-limpar').click();
    assert.match(await pagina.locator('#catalogo-quantidade').textContent(), /Nenhum/);
    await pagina.locator('#catalogo-viewport').focus();
    await pagina.keyboard.press('ArrowRight');
    assert.match(await pagina.locator('#catalogo-posicao').textContent(), /^2/);
    console.log(JSON.stringify({ largura, alinhamento: true, filtros: true, selecao: '0/5/10/11', teclado: true }));
  }
  // Foco permanece no mesmo card ao passar de três colunas para uma.
  await pagina.setViewportSize({ width: 1440, height: 900 });
  await pagina.goto(base);
  await pagina.locator('#ebook-03 button').focus();
  await pagina.setViewportSize({ width: 375, height: 900 });
  assert.equal(await pagina.locator('#ebook-03').getAttribute('aria-hidden'), 'false');
  assert.equal(await pagina.locator('#ebook-03 button').evaluate((e) => e === document.activeElement), true);
  // Gesto lateral não exige bibliotecas nem altera a seleção.
  await pagina.locator('#catalogo-viewport').evaluate((e) => {
    const inicio = new Touch({ identifier: 1, target: e, clientX: 250, clientY: 100 });
    const fim = new Touch({ identifier: 1, target: e, clientX: 100, clientY: 105 });
    e.dispatchEvent(new TouchEvent('touchstart', { touches: [inicio], bubbles: true }));
    e.dispatchEvent(new TouchEvent('touchend', { changedTouches: [fim], bubbles: true }));
  });
  assert.match(await pagina.locator('#catalogo-posicao').textContent(), /^4/);
  const semJs = await browser.newPage({ javaScriptEnabled: false });
  await semJs.goto(base);
  assert.equal(await semJs.locator('[data-ebook]').count(), 11);
  assert.equal(await semJs.locator('#catalogo-controles').isVisible(), false);
  assert.ok(await semJs.locator('#ebook-11').isVisible());
  await semJs.close();
  const auto = await browser.newPage({ viewport: { width: 375, height: 900 } });
  await auto.clock.install();
  await auto.goto(base);
  await auto.locator('#catalogo-viewport').scrollIntoViewIfNeeded();
  await auto.waitForTimeout(150);
  const inicio = await auto.locator('#catalogo-posicao').textContent();
  await auto.clock.fastForward(5600);
  assert.notEqual(await auto.locator('#catalogo-posicao').textContent(), inicio);
  await auto.locator('[data-ebook][aria-hidden="false"]').first().hover();
  const parado = await auto.locator('#catalogo-posicao').textContent();
  await auto.clock.fastForward(11000);
  assert.equal(await auto.locator('#catalogo-posicao').textContent(), parado);
  await auto.mouse.move(0, 0);
  await auto.clock.fastForward(5600);
  assert.notEqual(await auto.locator('#catalogo-posicao').textContent(), parado);
  // Cliques não desligam definitivamente a reprodução: ela volta ao sair do conteúdo.
  await auto.locator('[data-ebook][aria-hidden="false"] button').first().click();
  await auto.mouse.move(0, 0);
  const aposClique = await auto.locator('#catalogo-posicao').textContent();
  await auto.clock.fastForward(5600);
  assert.notEqual(await auto.locator('#catalogo-posicao').textContent(), aposClique);
  await auto.locator('#catalogo-viewport').focus();
  await auto.keyboard.press('ArrowRight');
  const porTeclado = await auto.locator('#catalogo-posicao').textContent();
  await auto.clock.fastForward(11000);
  assert.equal(await auto.locator('#catalogo-posicao').textContent(), porTeclado);
  await auto.locator('#catalogo-viewport').evaluate((e) => e.blur());
  await auto.emulateMedia({ reducedMotion: 'reduce' });
  await auto.clock.fastForward(11000);
  assert.equal(await auto.locator('#catalogo-posicao').textContent(), porTeclado);
  await auto.close();
  assert.deepEqual(erros, []);
  console.log('Autoplay, pausa, retomada, foco, movimento reduzido e fallback sem JS: aprovados.');
} finally { await browser.close(); }
