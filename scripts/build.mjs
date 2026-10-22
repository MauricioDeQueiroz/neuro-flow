import { copyFile, mkdir, readdir } from 'node:fs/promises';
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
console.log(`Pacote estático: ${arquivos.length} arquivos em dist/. CSS previamente compilado; nada publicado.`);
