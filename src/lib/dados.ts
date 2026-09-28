/* Acesso aos dados gerados por scripts/gerar_dados.py (pasta src/data), usado nas páginas
   (no build). Componentes do navegador importam só o que precisam, para não pesar a página. */
import capitaisJson from '@/data/capitais.json';
import catalogoJson from '@/data/catalogo-indicadores.json';
import indicadoresCapitaisJson from '@/data/indicadores-capitais.json';
import metaJson from '@/data/meta.json';
import { rotulo, slugIndicador, unidade } from './indicadores';
import type { Capital, Catalogo, Indicadores } from './tipos';

export const capitais = capitaisJson as Capital[];
export const catalogo = catalogoJson as Catalogo;
export const indicadoresCapitais = indicadoresCapitaisJson as unknown as Indicadores;
export const meta = metaJson as { geradoEm: string; planilha: string };

export function capitalPorSlug(slug: string): Capital | undefined {
  return capitais.find(c => c.slug === slug);
}

/** Resumo de um indicador disponível para as capitais */
export interface InfoIndicador {
  codigo: string;
  slug: string;
  nome: string;
  unidade: string;
}

/** Indicadores com dados para as capitais, em ordem alfabética (População fica de fora: está na ficha) */
export const listaIndicadores: InfoIndicador[] = Object.keys(indicadoresCapitais)
  .filter(k => k !== 'POP' && Object.keys(indicadoresCapitais[k]).length)
  .map(codigo => ({ codigo, slug: slugIndicador(codigo), nome: rotulo(codigo), unidade: unidade(codigo) }))
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));

// Dois códigos da planilha não podem virar a mesma URL
const repetidos = listaIndicadores.filter((x, i) => listaIndicadores.findIndex(y => y.slug === x.slug) !== i);
if (repetidos.length) throw new Error('Indicadores com a mesma URL: ' + repetidos.map(r => r.codigo).join(', '));

export function indicadorPorSlug(slug: string): InfoIndicador | undefined {
  return listaIndicadores.find(i => i.slug === slug);
}

/** Valor mais recente de um indicador para um local: { ano, valor } */
export function ultimoValor(codigo: string, local: string): { ano: number; valor: number } | null {
  const serie = indicadoresCapitais[codigo]?.[local];
  if (!serie) return null;
  const ano = Math.max(...Object.keys(serie).map(Number));
  return { ano, valor: serie[ano] };
}
