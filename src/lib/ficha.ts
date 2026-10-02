/* Ficha da cidade (protótipo): reúne, para uma capital, os valores que vão para o PDF.
   Só cálculos sobre a base — nenhum texto livre. Toda frase do PDF é um modelo fixo
   preenchido com estes valores, para não haver conteúdo inventado. */
import { capitais, indicadoresCapitais, meta } from './dados';
import { rotulo, unidade } from './indicadores';
import type { Capital } from './tipos';

/** Temas das seções da ficha, por código da planilha (ordem = ordem no PDF) */
export const TEMAS: { titulo: string; codigos: string[] }[] = [
  { titulo: 'Segurança viária: mortes', codigos: ['TX_MORT_TOT', 'TX_MORT_PED', 'TX_MORT_CICL', 'TX_MORT_MOTO', 'TX_MORT_AUTO', 'PERC_MORTE_NEGROS'] },
  { titulo: 'Segurança viária: internações', codigos: ['TX_INTERN_TOT', 'TX_INTERN_PED', 'TX_INTERN_CIC', 'TX_INTERN_MOTO', 'TX_INTERN_AUTO'] },
  { titulo: 'Transporte de média e alta capacidade', codigos: ['PNT', 'PNT_ATE_1/2', 'PNT_1/2_1', 'PNT_1_3', 'PNT_ACIMA_3', 'PNT_MULHERES_NEGRAS', 'PNT_MULHERES_1SM'] },
  { titulo: 'Infraestrutura cicloviária', codigos: ['PNB', 'PNB_ATE_1/2', 'PNB_1/2_1', 'PNB_1_3', 'PNB_ACIMA_3', 'PNB_MULHERES_NEGRAS', 'PNB_MULHERES_1SM', 'PNB_MULHERES_ATE_2SM', 'TMA_INFRA_CICLO'] },
  { titulo: 'Deslocamentos e divisão modal', codigos: ['TEMPO_MED', 'PERC_ACIMA_1H', 'PERC_A PE', 'PERC_A PÉ', 'PERC_BICI', 'PERC_TRANSP_COLETIVO', 'PERC_TRANSP_IND_MOTO'] },
  { titulo: 'Motorização, emissões e custo', codigos: ['TX_MOTO', 'kgCO2/hab', 'gMP/hab', 'TARIFAxSM', 'TARIFAX RENDA_DOM_NEGRA'] },
  { titulo: 'Entorno dos domicílios', codigos: ['PERC_CALÇADAS', 'PERC_RAMPAS'] },
];

/** Indicadores com série longa o bastante para um gráfico de evolução na ficha */
export const SERIES_GRAFICO = ['TX_MORT_TOT', 'TX_INTERN_TOT', 'TX_MOTO', 'PNT'];

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

export interface DadosFicha {
  capital: Capital;
  dadosAtualizadosEm: string;
  geradaEm: string;
  secoes: { titulo: string; linhas: LinhaIndicador[] }[];
  semDado: string[];
  series: SerieGrafico[];
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
    dadosAtualizadosEm: meta.geradoEm,
    geradaEm: new Date().toISOString().slice(0, 10),
  };
}
