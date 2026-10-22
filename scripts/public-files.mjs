import { readdir } from 'node:fs/promises';

// Lista permitida: documentação, configurações e arquivos privados nunca entram.
export async function arquivosPublicos() {
  const arquivos = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', '.nojekyll',
    'assets/css/tailwind.css', 'assets/js/main.js'];
  for (const [pasta, extensao] of [['img', /\.(webp|avif|png|jpg|svg)$/], ['fonts', /\.woff2$/]]) {
    for (const item of await readdir(new URL(`../assets/${pasta}/`, import.meta.url), { withFileTypes: true })) {
      if (item.isFile() && extensao.test(item.name)) arquivos.push(`assets/${pasta}/${item.name}`);
    }
  }
  return arquivos.sort();
}
