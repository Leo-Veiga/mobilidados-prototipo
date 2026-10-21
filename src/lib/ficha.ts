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

/** Cartões de destaque no topo da ficha: valor mais recente comparado com a mediana das capitais */
export const DESTAQUES = ['TX_MORT_TOT', 'TEMPO_MED', 'PNT', 'TX_MOTO'];

/** Indicadores de um ano só (Censo 2022): gráfico comparando a capital com as demais */
export const COMPARACOES_GRAFICO = ['TEMPO_MED', 'PERC_ACIMA_1H'];

export interface LinhaIndicador {
  codigo: string;
  nome: string;
  unidade: string;
  valor: number;
  ano: number;
  /** Posição entre as capitais com dado naquele ano, do melhor para o pior (1 = melhor);
      0 = fora da comparação (PNT sem TMA). Sem significado quando avaliacao é null. */
  posicao: number;
  totalComDado: number;
  /** Mediana das capitais com dado no mesmo ano (menos sensível a valores extremos que a média) */
  mediana: number;
  /** Melhor ou pior que a mediana; null = indicador sem avaliação */
  avaliacao: Avaliacao;
}

export interface SerieGrafico {
  codigo: string;
  nome: string;
  unidade: string;
  /** Valor da capital e mediana das capitais com dado no mesmo ano */
  pontos: { ano: number; valor: number; mediana: number }[];
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
  destaques: LinhaIndicador[];
  series: SerieGrafico[];
  comparacoes: ComparacaoGrafico[];
}

function mediana(v: number[]): number {
  const o = [...v].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
}

/** Qual sentido é melhor em cada indicador (avaliação aprovada em 21/10/2026).
    Indicador fora da lista fica sem avaliação (ex.: % de negros entre as mortes, que depende do perfil da população). */
const MENOR_MELHOR = [
  'TX_MORT_TOT', 'TX_MORT_PED', 'TX_MORT_CICL', 'TX_MORT_MOTO', 'TX_MORT_AUTO',
  'TX_INTERN_TOT', 'TX_INTERN_PED', 'TX_INTERN_CIC', 'TX_INTERN_MOTO', 'TX_INTERN_AUTO',
  'TEMPO_MED', 'PERC_ACIMA_1H', 'PERC_TRANSP_IND_MOTO', 'TX_MOTO', 'kgCO2/hab', 'gMP/hab', 'TARIFAxSM',
];
const MAIOR_MELHOR = [
  'PNT', 'PNT_RESP_ATE_1/2', 'PNT_RESP_1/2_1', 'PNT_RESP_1_3', 'PNT_RESP_ACIMA_3', 'PNT_MULHERES_NEGRAS',
  'PNB', 'PNB_RESP_ATE_1/2', 'PNB_RESP_1/2_1', 'PNB_RESP_1_3', 'PNB_RESP_ACIMA_3', 'PNB_MULHERES_NEGRAS', 'TMA_INFRA_CICLO',
  'PERC_A PE', 'PERC_A PÉ', 'PERC_BICI', 'PERC_TRANSP_COLETIVO', 'PERC_CALÇADAS', 'PERC_RAMPAS',
];

export type Avaliacao = 'melhor' | 'pior' | 'igual' | null;

/** Valor da capital comparado com a mediana, segundo o sentido que é melhor no indicador */
/** 1 = maior é melhor, -1 = menor é melhor, 0 = sem avaliação */
const sentido = (codigo: string) => (MENOR_MELHOR.includes(codigo) ? -1 : MAIOR_MELHOR.includes(codigo) ? 1 : 0);

function avaliar(codigo: string, valor: number, med: number): Avaliacao {
  if (!sentido(codigo)) return null;
  if (valor === med) return 'igual';
  return (valor - med) * sentido(codigo) > 0 ? 'melhor' : 'pior';
}

/** PNT e recortes: capitais sem TMA têm 0 e ficam fora da mediana e da posição */
const SO_COM_TMA = (codigo: string) => codigo.startsWith('PNT');

/** Valores das capitais no ano, só os que entram na comparação */
function comparaveis(codigo: string, ano: number): number[] {
  return Object.values(indicadoresCapitais[codigo])
    .map(s => s[ano])
    .filter((v): v is number => typeof v === 'number' && (!SO_COM_TMA(codigo) || v > 0));
}

/** Comparação de um indicador entre as capitais, no último ano com dado da capital escolhida */
function linha(codigo: string, slug: string): LinhaIndicador | null {
  const serie = indicadoresCapitais[codigo]?.[slug];
  if (!serie || !Object.keys(serie).length) return null;
  const ano = Math.max(...Object.keys(serie).map(Number));
  const valor = serie[ano];
  const doAno = comparaveis(codigo, ano);
  const ranqueada = !SO_COM_TMA(codigo) || valor > 0;
  return {
    codigo, nome: rotulo(codigo).replace('₂', '2'), unidade: unidade(codigo), valor, ano,
    posicao: ranqueada ? 1 + doAno.filter(v => (v - valor) * (sentido(codigo) || 1) > 0).length : 0,
    totalComDado: doAno.length,
    mediana: mediana(doAno),
    avaliacao: avaliar(codigo, valor, mediana(doAno)),
  };
}

/** A capital ao lado da mediana e dos extremos entre as capitais, no último ano com dado dela */
function comparacao(codigo: string, slug: string): ComparacaoGrafico | null {
  const l = linha(codigo, slug);
  if (!l) return null;
  const doAno = capitais
    .map(c => ({ nome: c.nome, valor: indicadoresCapitais[codigo][c.slug]?.[l.ano] }))
    .filter((x): x is { nome: string; valor: number } => typeof x.valor === 'number')
    .sort((a, b) => (b.valor - a.valor) * (sentido(codigo) || 1));
  // Do melhor para o pior (sem avaliação: do maior para o menor)
  const [primeiro, ultimo] = [doAno[0], doAno[doAno.length - 1]];
  const [r1, r2] = sentido(codigo) ? ['Melhor', 'Pior'] : ['Maior', 'Menor'];
  const barras = [
    { rotulo: 'Esta capital', valor: l.valor, destaque: true },
    { rotulo: 'Mediana das capitais', valor: l.mediana, destaque: false },
    ...(l.posicao === 1 ? [] : [{ rotulo: `${r1}: ${primeiro.nome}`, valor: primeiro.valor, destaque: false }]),
    ...(l.posicao === l.totalComDado ? [] : [{ rotulo: `${r2}: ${ultimo.nome}`, valor: ultimo.valor, destaque: false }]),
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
      pontos: Object.keys(s).map(Number).sort((a, b) => a - b).map(ano => ({
        ano, valor: s[ano],
        mediana: mediana(comparaveis(codigo, ano)),
      })),
    };
  }).filter(s => s.pontos.length >= 3 && s.pontos.some(p => p.valor > 0)); // sem gráfico zerado (PNT sem TMA)

  return {
    capital, secoes, semDado, series,
    destaques: DESTAQUES.map(c => linha(c, slug)).filter((l): l is LinhaIndicador => l !== null),
    comparacoes: COMPARACOES_GRAFICO.map(c => comparacao(c, slug)).filter((x): x is ComparacaoGrafico => x !== null),
    valores: valoresFicha('capitais', slug),
    dadosAtualizadosEm: meta.geradoEm,
    geradaEm: new Date().toISOString().slice(0, 10),
  };
}
