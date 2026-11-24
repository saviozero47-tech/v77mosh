import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const entries = [
  'index.html',
  'style.css',
  'js',
  'assets',
  'MUSICAS SHOW',
  'stems',
];

for (const entry of entries) {
  const src = join(root, entry);
  if (existsSync(src)) {
    cpSync(src, join(dist, entry), { recursive: true });
  }
}

console.log('Build dist/ concluido com sucesso.');
