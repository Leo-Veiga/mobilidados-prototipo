/* Ficha metodológica: lê dados/metodologia/ (cópia de docs/ficha/ do repositório de indicadores).
   - conceitos.md: conceitos comuns, um por seção "## Título {#ancora}"
   - fontes.csv: id;nome;detalhe;link
   - <indicador>.md: campos no topo (entre ---) e seções em Markdown simples
   Só roda no build (Node). */
import fs from 'node:fs';
import path from 'node:path';
import { TEMAS } from './organizacao';

const PASTA = path.join(process.cwd(), 'dados', 'metodologia');

export type Polaridade = 'maior-melhor' | 'menor-melhor' | 'equidade' | 'neutra';

export interface Fonte { id: string; nome: string; detalhe: string; link: string }
export interface Secao { titulo: string; ancora: string; html: string }
export interface Ficha {
  id: string;
  titulo: string;
  tema: string;
  resumo: string;
  codigos: string[];
  unidade: string;
  polaridade: Polaridade;
  abrangencia: string;
  serie: string;
  atualizacao: string;
  fontes: string[];
  conceitos: string[];
  detalhe: string;
  /** Ficha ainda não escrita: aparece só com título e resumo */
  pendente: boolean;
  secoes: Secao[];
}

const ler = (arq: string) => fs.readFileSync(path.join(PASTA, arq), 'utf-8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
const lista = (s = '') => s.split(',').map(x => x.trim()).filter(Boolean);
const ancora = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---- Markdown simples: parágrafos, listas, tabelas, **negrito**, *itálico*, `código` e [links](url)
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s: string): string {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) =>
      u.startsWith('#') ? `<a href="${u}">${t}</a>` : `<a href="${u}" target="_blank" rel="noopener">${t}</a>`);
}

function markdown(md: string): string {
  const html: string[] = [];
  const blocos = md.trim().split(/\n{2,}/);
  for (const b of blocos) {
    const linhas = b.split('\n');
    if (linhas.every(l => l.trim().startsWith('|'))) {
      const celulas = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const alinh = celulas(linhas[1]).map(c => (c.endsWith(':') ? ' class="num"' : ''));
      const cab = celulas(linhas[0]).map((c, i) => `<th${alinh[i]}>${inline(c)}</th>`).join('');
      const corpo = linhas.slice(2).map(l => `<tr>${celulas(l).map((c, i) => `<td${alinh[i]}>${inline(c)}</td>`).join('')}</tr>`).join('');
      html.push(`<div class="tabela"><table><thead><tr>${cab}</tr></thead><tbody>${corpo}</tbody></table></div>`);
    } else if (/^(\d+\.|-) /.test(linhas[0])) {
      const tag = /^\d/.test(linhas[0]) ? 'ol' : 'ul';
      // Itens podem continuar na linha seguinte (recuada)
      const itens: string[] = [];
      for (const l of linhas) if (/^(\d+\.|-) /.test(l)) itens.push(l.replace(/^(\d+\.|-) /, '')); else itens[itens.length - 1] += ' ' + l.trim();
      html.push(`<${tag}>${itens.map(i => `<li>${inline(i)}</li>`).join('')}</${tag}>`);
    } else {
      html.push(`<p>${inline(linhas.join(' '))}</p>`);
    }
  }
  return html.join('\n');
}

/** Divide em seções "## Título {#ancora}" */
function secoes(md: string, prefixo = ''): Secao[] {
  return md.split(/^## /m).slice(1).map(s => {
    const [cab, ...resto] = s.split('\n');
    const m = cab.match(/^(.*?)\s*\{#([\w-]+)\}\s*$/);
    const titulo = (m ? m[1] : cab).trim();
    return { titulo, ancora: prefixo + (m ? m[2] : ancora(titulo)), html: markdown(resto.join('\n')) };
  });
}

function lerFicha(arq: string): Ficha {
  const txt = ler(arq);
  const m = txt.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`Ficha sem campos no topo: ${arq}`);
  const c: Record<string, string> = {};
  for (const l of m[1].split('\n')) {
    const i = l.indexOf(':');
    if (i > 0) c[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  }
  const id = arq.replace(/\.md$/, '');
  return {
    id, titulo: c.titulo, tema: c.tema, resumo: c.resumo ?? '', codigos: lista(c.codigos), unidade: c.unidade,
    polaridade: c.polaridade as Polaridade, abrangencia: c.abrangencia, serie: c.serie,
    atualizacao: c.atualizacao, fontes: lista(c.fontes), conceitos: lista(c.conceitos),
    detalhe: c.detalhe ?? '', pendente: c.pendente === 'sim', secoes: secoes(m[2], `${id}-`),
  };
}

export const conceitos: Secao[] = secoes(ler('conceitos.md'));

export const fontes: Fonte[] = ler('fontes.csv').trim().split('\n').slice(1).map(l => {
  const [id, nome, detalhe, link] = l.split(';');
  return { id, nome, detalhe, link };
});

export const fichas: Ficha[] = fs.readdirSync(PASTA)
  .filter(a => a.endsWith('.md') && a !== 'conceitos.md')
  .map(lerFicha)
  .sort((a, b) => ordem(a) - ordem(b));

/** Ordem das fichas = ordem dos temas e indicadores do site (TEMAS); fichas sem indicador no site vão para o fim */
function ordem(f: Ficha): number {
  const todos = TEMAS.flatMap(t => t.indicadores);
  const i = todos.findIndex(ind => cobre(f, ind.principal));
  return i < 0 ? 9999 : i;
}

function cobre(f: Ficha, codigo: string): boolean {
  return f.codigos.some(p => (p.endsWith('*') ? codigo.startsWith(p.slice(0, -1)) : codigo === p));
}

/** Ficha de um código do catálogo (os códigos da ficha aceitam * no fim, ex.: PNT_*) */
export function fichaDoCodigo(codigo: string): Ficha | undefined {
  return fichas.find(f => cobre(f, codigo));
}

/** Endereço da ficha no site */
export const enderecoFicha = (f: Ficha) => `/metodologia/#${f.id}`;

/** Link para o detalhe técnico no GitHub */
export const URL_DETALHE = 'https://github.com/mobilidados/mobilidados-indicadores/blob/main/docs/';
