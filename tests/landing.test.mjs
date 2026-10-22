import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { arquivosPublicos } from '../scripts/public-files.mjs';

const codigo = await readFile(new URL('../assets/js/main.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function elemento(atributos = {}, classes = []) {
  const eventos = {};
  const conjunto = new Set(classes);
  return { atributos, eventos, style: {}, textContent: '',
    classList: { add: (c) => conjunto.add(c), remove: (c) => conjunto.delete(c),
      contains: (c) => conjunto.has(c), toggle(c, ligado) { ligado ? conjunto.add(c) : conjunto.delete(c); } },
    setAttribute(k, v) { atributos[k] = v; }, getAttribute: (k) => atributos[k] ?? null,
    removeAttribute(k) { delete atributos[k]; },
    addEventListener(k, f) { (eventos[k] ||= []).push(f); },
    click() { for (const f of eventos.click || []) f({ preventDefault() {} }); },
    querySelector() { return null; }
  };
}
function executar({ checkout, busca = '', pixels = false, armazenado, catalogoPendente = false } = {}) {
  const botao = elemento({ 'data-cta-origem': 'preco' }, ['js-checkout', 'js-cta']);
  const ids = Object.fromEntries(['preferencias-rastreamento', 'aceitar-rastreamento',
    'recusar-rastreamento', 'estado-rastreamento'].map((id) => [id, elemento()]));
  if (catalogoPendente) {
    ids['catalogo-ebooks'] = elemento({ 'data-checkout-pendente': '' });
    ids['catalogo-ebooks'].hasAttribute = (k) => k === 'data-checkout-pendente';
  }
  const scripts = [];
  const armazenamento = new Map(armazenado ? [['landing-preferencia-medicao', armazenado]] : []);
  const window = { location: { search: busca, reload() { window.recarregou = true; } },
    matchMedia: () => ({ matches: false }), innerHeight: 800 };
  const document = { documentElement: elemento({ 'data-modo': 'rascunho' }), readyState: 'complete',
    querySelectorAll: (q) => ['.js-checkout', '.js-cta'].includes(q) ? [botao] : [],
    getElementById: (id) => ids[id] || null, createElement: () => elemento(),
    head: { appendChild: (s) => scripts.push(s) },
    getElementsByTagName: () => [{ parentNode: { insertBefore: (s) => scripts.push(s) } }] };
  let fonte = codigo;
  if (checkout !== undefined) fonte = fonte.replace("'[PREENCHER_LINK_CHECKOUT]'", JSON.stringify(checkout));
  if (pixels) fonte = fonte.replace("'[PREENCHER_META_PIXEL_ID]'", "'1234567890'")
    .replace("'[PREENCHER_GA4_ID]'", "'G-TEST1234'");
  vm.runInNewContext(fonte, { window, document, URL, URLSearchParams, console,
    sessionStorage: { getItem: (k) => armazenamento.get(k), setItem: (k, v) => armazenamento.set(k, v) } });
  return { botao, ids, scripts, window, armazenamento };
}

test('checkout aceita apenas HTTPS absoluto sem credenciais', () => {
  for (const checkout of [undefined, '', '/pagar', '//example.com', 'http://example.com',
    'javascript:alert(1)', 'data:text/html,teste', 'https://usuario:senha@example.com']) {
    const { botao } = executar({ checkout });
    assert.equal(botao.getAttribute('href'), null);
    assert.equal(botao.getAttribute('aria-disabled'), 'true');
  }
});

test('catálogo pendente não usa um checkout genérico que ignora a seleção', () => {
  const { botao } = executar({ checkout: 'https://checkout.example/pagar', catalogoPendente: true });
  assert.equal(botao.getAttribute('href'), null);
  assert.equal(botao.getAttribute('aria-disabled'), 'true');
});

test('campanhas permitidas são codificadas sem mudar destino nem sobrescrever parâmetros', () => {
  const { botao } = executar({ checkout: 'https://checkout.example/pagar?ref=original',
    busca: '?ref=invasor&utm_source=a%26b&utm_campaign=%3Cscript%3E&redirect=https://evil.example&aff=parceiro' });
  const url = new URL(botao.getAttribute('href'));
  assert.equal(url.origin, 'https://checkout.example');
  assert.equal(url.pathname, '/pagar');
  assert.equal(url.searchParams.get('ref'), 'original');
  assert.equal(url.searchParams.get('utm_source'), 'a&b');
  assert.equal(url.searchParams.get('utm_campaign'), '<script>');
  assert.equal(url.searchParams.get('aff'), 'parceiro');
  assert.equal(url.searchParams.has('redirect'), false);
  assert.equal(botao.getAttribute('aria-disabled'), null);
});

test('pixels dependem de permissão explícita; aceitar não duplica scripts e recusar interrompe eventos', () => {
  const { ids, scripts, window, botao, armazenamento } = executar({ pixels: true, checkout: 'https://checkout.example' });
  assert.equal(scripts.length, 0);
  botao.click();
  assert.equal(window.dataLayer, undefined);
  ids['aceitar-rastreamento'].click();
  assert.equal(scripts.length, 2);
  ids['aceitar-rastreamento'].click();
  assert.equal(scripts.length, 2);
  botao.click();
  assert.equal(window.dataLayer.at(-1)[1], 'begin_checkout');
  const quantidade = window.dataLayer.length;
  ids['recusar-rastreamento'].click();
  botao.click();
  assert.equal(window.dataLayer.length, quantidade);
  assert.equal(window.recarregou, true);
  assert.equal(window['ga-disable-G-TEST1234'], true);
  assert.equal(window.fbq.queue.at(-1)[0], 'consent');
  assert.equal(window.fbq.queue.at(-1)[1], 'revoke');
  assert.equal(armazenamento.get('landing-preferencia-medicao'), 'recusado');
});

test('recusa anterior mantém pixels desligados', () => {
  const { scripts } = executar({ pixels: true, armazenado: 'recusado' });
  assert.equal(scripts.length, 0);
});

test('HTML: IDs, âncoras, recursos locais, FAQ visível e JSON-LD consistentes', async () => {
  const ativo = html.replace(/<!--[\s\S]*?-->/g, '');
  const ids = [...ativo.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size, 'IDs duplicados');
  assert.equal([...ativo.matchAll(/<h1\b/g)].length, 1);
  for (const [, destino] of ativo.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (destino.includes('[') || /^(?:mailto:|https?:)/.test(destino)) continue;
    if (destino.startsWith('#')) assert.ok(ids.includes(destino.slice(1)), destino);
    else await access(new URL('../' + destino, import.meta.url));
  }
  for (const [, id] of ativo.matchAll(/aria-controls="([^"]+)"/g)) assert.ok(ids.includes(id), id);
  const faq = JSON.parse(ativo.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const normalizar = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  for (let i = 0; i < faq.mainEntity.length; i++) {
    const resposta = ativo.match(new RegExp(`<div id="faq-${i + 1}"[^>]*>([\\s\\S]*?)</div>`))[1];
    assert.equal(normalizar(resposta), normalizar(faq.mainEntity[i].acceptedAnswer.text));
  }
  assert.doesNotMatch(ativo, /<script>(?!\s*<)/, 'Script inline executável');
});

test('pacote público exclui fontes CSS, documentação e arquivos de desenvolvimento', async () => {
  const arquivos = await arquivosPublicos();
  assert.ok(arquivos.includes('index.html'));
  assert.ok(arquivos.includes('404.html'));
  assert.ok(arquivos.includes('assets/css/tailwind.css'));
  assert.ok(arquivos.every((a) => !/\.md$|package|input\.css|\.env|\.git\//.test(a)));
  for (const arquivo of arquivos) await access(new URL('../' + arquivo, import.meta.url));
});
