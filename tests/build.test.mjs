import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { arquivosPublicos } from '../scripts/public-files.mjs';

test('build renova URL do recurso alterado, preservando fonte e versões estáveis', async () => {
  const raiz = await mkdtemp(join(tmpdir(), 'neuro-flow-build-'));
  try {
    for (const arquivo of [...await arquivosPublicos(), 'scripts/build.mjs', 'scripts/public-files.mjs']) {
      const destino = join(raiz, arquivo);
      await mkdir(dirname(destino), { recursive: true });
      await copyFile(new URL('../' + arquivo, import.meta.url), destino);
    }
    const fonte = await readFile(join(raiz, 'index.html'), 'utf8');
    const gerar = async () => {
      execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: raiz });
      return readFile(join(raiz, 'dist/index.html'), 'utf8');
    };
    const urlCss = (html) => html.match(/href="(assets\/css\/tailwind\.css\?v=[a-f0-9]+)"/)[1];
    const urlJs = (html) => html.match(/src="(assets\/js\/main\.js\?v=[a-f0-9]+)"/)[1];
    const inicial = await gerar();
    assert.ok(urlCss(inicial));
    assert.ok(urlJs(inicial));
    assert.equal(await gerar(), inicial, 'Build idêntico deve manter URLs e HTML');

    const css = join(raiz, 'assets/css/tailwind.css');
    await writeFile(css, (await readFile(css, 'utf8')) + '\n/* Alteração de teste. */\n');
    const atualizado = await gerar();
    assert.notEqual(urlCss(atualizado), urlCss(inicial), 'CSS novo exige outra URL de cache');
    assert.equal(urlJs(atualizado), urlJs(inicial), 'JS inalterado mantém a URL');

    const js = join(raiz, 'assets/js/main.js');
    await writeFile(js, (await readFile(js, 'utf8')) + '\n/* Alteração de teste. */\n');
    const final = await gerar();
    assert.notEqual(urlJs(final), urlJs(atualizado), 'JS novo exige outra URL de cache');
    assert.equal(urlCss(final), urlCss(atualizado));
    assert.equal(await readFile(join(raiz, 'index.html'), 'utf8'), fonte, 'Fonte local permanece intacto');
  } finally {
    await rm(raiz, { recursive: true, force: true });
  }
});
