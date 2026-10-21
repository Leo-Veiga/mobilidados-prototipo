/* Ficha da cidade (protótipo): reúne, para uma capital, os valores que vão para o PDF.
   Só cálculos sobre a base — nenhum texto livre. Toda frase do PDF é um modelo fixo
   preenchido com estes valores, para não haver conteúdo inventado. */
import { capitais, dadosFicha as valoresFicha, indicadoresCapitais, meta } from './dados';
import { rotulo, unidade } from './indicadores';
import type { Capital, ValorAno } from './tipos';

export { TEMAS } from './temas';
import { TEMAS } from './temas';

/** Indicadores com série longa o bastante para um gráfico de evolução na ficha */
export const SERIES_GRAFICO = ['TX_MORT_TOT', 'TX_INTERN_TOT', 'TX_MOTO', 'PNT', 'kgCO2/hab'];

/** Indicadores de um ano só (Censo 2022): gráfico comparando a capital com as demais */
export const COMPARACOES_GRAFICO = ['TEMPO_MED', 'PERC_ACIMA_1H'];

export interface LinhaIndicador {
  codigo: string;
  nome: string;
  unidade: string;
  valor: number;
  ano: number;
  /** Posição entre as capitais com dado naquele ano (1 = maior valor) */
  posicao: number;
  totalComDado: number;
  /** Mediana das capitais com dado no mesmo ano (menos sensível a valores extremos que a média) */
  mediana: number;
}

export interface SerieGrafico {
  codigo: string;
  nome: string;
  unidade: string;
  pontos: { ano: number; valor: number }[];
}

export interface ComparacaoGrafico {
  codigo: string;
  nome: string;
  unidade: string;
  ano: number;
  /** Esta capital, mediana, maior e menor valor entre as capitais, do maior para o menor */
  barras: { rotulo: string; valor: number; destaque: boolean }[];
}

export interface DadosFicha {
  capital: Capital;
  /** População, área, densidade, perfil e renda: valor mais recente, com o ano */
  valores: Record<string, ValorAno>;
  dadosAtualizadosEm: string;
  geradaEm: string;
  secoes: { titulo: string; linhas: LinhaIndicador[] }[];
  semDado: string[];
  series: SerieGrafico[];
  comparacoes: ComparacaoGrafico[];
}

function mediana(v: number[]): number {
  const o = [...v].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
}

/** Comparação de um indicador entre as capitais, no último ano com dado da capital escolhida */
function linha(codigo: string, slug: string): LinhaIndicador | null {
  const serie = indicadoresCapitais[codigo]?.[slug];
  if (!serie || !Object.keys(serie).length) return null;
  const ano = Math.max(...Object.keys(serie).map(Number));
  const valor = serie[ano];
  const doAno = Object.values(indicadoresCapitais[codigo])
    .map(s => s[ano])
    .filter((v): v is number => typeof v === 'number');
  return {
    codigo, nome: rotulo(codigo).replace('₂', '2'), unidade: unidade(codigo), valor, ano,
    posicao: 1 + doAno.filter(v => v > valor).length,
    totalComDado: doAno.length,
    mediana: mediana(doAno),
  };
}

/** A capital ao lado da mediana e dos extremos entre as capitais, no último ano com dado dela */
function comparacao(codigo: string, slug: string): ComparacaoGrafico | null {
  const l = linha(codigo, slug);
  if (!l) return null;
  const doAno = capitais
    .map(c => ({ nome: c.nome, valor: indicadoresCapitais[codigo][c.slug]?.[l.ano] }))
    .filter((x): x is { nome: string; valor: number } => typeof x.valor === 'number')
    .sort((a, b) => b.valor - a.valor);
  const maior = doAno[0], menor = doAno[doAno.length - 1];
  const barras = [
    { rotulo: 'Esta capital', valor: l.valor, destaque: true },
    { rotulo: 'Mediana das capitais', valor: l.mediana, destaque: false },
    ...(l.posicao === 1 ? [] : [{ rotulo: `Maior: ${maior.nome}`, valor: maior.valor, destaque: false }]),
    ...(l.posicao === l.totalComDado ? [] : [{ rotulo: `Menor: ${menor.nome}`, valor: menor.valor, destaque: false }]),
  ].sort((a, b) => b.valor - a.valor);
  return { codigo, nome: l.nome, unidade: l.unidade, ano: l.ano, barras };
}

export function dadosFicha(slug: string): DadosFicha | null {
  const capital = capitais.find(c => c.slug === slug);
  if (!capital) return null;
  const secoes = TEMAS.map(t => ({
    titulo: t.titulo,
    linhas: t.codigos.map(c => linha(c, slug)).filter((l): l is LinhaIndicador => l !== null),
  })).filter(s => s.linhas.length);

  // Indicadores existentes na base para outras capitais, mas sem dado para esta
  const semDado = TEMAS.flatMap(t => t.codigos)
    .filter(c => indicadoresCapitais[c] && !indicadoresCapitais[c][slug])
    .map(rotulo);

  const series = SERIES_GRAFICO.map(codigo => {
    const s = indicadoresCapitais[codigo]?.[slug] ?? {};
    return {
      codigo, nome: rotulo(codigo).replace('₂', '2'), unidade: unidade(codigo),
      pontos: Object.keys(s).map(Number).sort((a, b) => a - b).map(ano => ({ ano, valor: s[ano] })),
    };
  }).filter(s => s.pontos.length >= 3);

  return {
    capital, secoes, semDado, series,
    comparacoes: COMPARACOES_GRAFICO.map(c => comparacao(c, slug)).filter((x): x is ComparacaoGrafico => x !== null),
    valores: valoresFicha('capitais', slug),
    dadosAtualizadosEm: meta.geradoEm,
    geradaEm: new Date().toISOString().slice(0, 10),
  };
}
