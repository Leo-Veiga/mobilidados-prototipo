/*
 * Ajuste pós-build para hospedagem estática simples (GitHub Pages).
 *
 * O Next.js grava os arquivos de pré-carregamento de navegação em subpastas
 *   capitais/recife/__next.capitais/$d$slug/__PAGE__.txt
 * mas o navegador os pede com pontos no nome:
 *   capitais/recife/__next.capitais.$d$slug.__PAGE__.txt
 * Servidores como o da Vercel fazem essa tradução; o GitHub Pages não.
 * Este script cria uma cópia de cada arquivo no formato com pontos.
 */
import { copyFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SAIDA = 'out';

function* arquivos(dir) {
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) yield* arquivos(p);
    else yield p;
  }
}

function* pastasNext(dir) {
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (nome === '_next' || !statSync(p).isDirectory()) continue;
    if (nome.startsWith('__next.')) yield p;
    else yield* pastasNext(p);
  }
}

let copias = 0;
for (const pasta of pastasNext(SAIDA)) {
  const pai = join(pasta, '..');
  for (const arq of arquivos(pasta)) {
    const nomePlano = relative(pai, arq).split(sep).join('.');
    copyFileSync(arq, join(pai, nomePlano));
    copias++;
  }
}
console.log(`pos-build: ${copias} arquivos de pré-carregamento copiados para o formato do GitHub Pages`);
