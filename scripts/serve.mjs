import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { arquivosPublicos } from './public-files.mjs';

const arquivos = new Set(await arquivosPublicos());
const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml', '.woff2': 'font/woff2', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };
const porta = Number(process.env.PORT || 3000);
createServer(async (req, res) => {
  try {
    const caminho = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1) || 'index.html';
    const encontrado = arquivos.has(caminho);
    const arquivo = encontrado ? caminho : '404.html';
    const corpo = await readFile(new URL(`../${arquivo}`, import.meta.url));
    res.writeHead(encontrado ? 200 : 404, {
      'Content-Type': tipos[extname(arquivo)] || 'application/octet-stream',
      'Content-Length': corpo.length,
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'DENY',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    });
    res.end(req.method === 'HEAD' ? undefined : corpo);
  } catch {
    res.writeHead(400); res.end('Requisição inválida.');
  }
}).listen(porta, '127.0.0.1', () => console.log(`Servidor local: http://127.0.0.1:${porta}`));
