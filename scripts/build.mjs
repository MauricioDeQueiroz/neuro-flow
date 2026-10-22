import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { arquivosPublicos } from './public-files.mjs';

const raiz = fileURLToPath(new URL('../', import.meta.url));
const destino = resolve(raiz, 'dist');
const arquivos = await arquivosPublicos();
await mkdir(destino, { recursive: true });
// Não apaga conteúdo desconhecido nem o deixa passar silenciosamente para publicação.
for (const item of await readdir(destino, { recursive: true, withFileTypes: true })) {
  if (item.isDirectory()) continue;
  const caminho = resolve(item.parentPath, item.name).slice(destino.length + 1);
  if (!item.isFile() || !arquivos.includes(caminho)) {
    throw new Error(`Arquivo não permitido em dist/: ${caminho}. Revise-o antes de gerar novamente.`);
  }
}
for (const arquivo of arquivos) {
  await mkdir(dirname(resolve(destino, arquivo)), { recursive: true });
  await copyFile(resolve(raiz, arquivo), resolve(destino, arquivo));
}
// Uma URL nova a cada mudança impede combinar HTML atual com CSS/JS em cache.
const pagina = resolve(destino, 'index.html');
let html = await readFile(pagina, 'utf8');
for (const arquivo of ['assets/css/tailwind.css', 'assets/js/main.js']) {
  const conteudo = await readFile(resolve(destino, arquivo));
  const versao = createHash('sha256').update(conteudo).digest('hex').slice(0, 16);
  html = html.replaceAll(`="${arquivo}"`, `="${arquivo}?v=${versao}"`);
}
await writeFile(pagina, html);
console.log(`Pacote estático: ${arquivos.length} arquivos em dist/. CSS previamente compilado; nada publicado.`);
