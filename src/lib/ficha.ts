/* Ficha da cidade (protótipo): reúne, para uma capital ou região metropolitana, os valores que vão para o PDF.
   Só cálculos sobre a base — nenhum texto livre. Toda frase do PDF é um modelo fixo
   preenchido com estes valores, para não haver conteúdo inventado. */
import { capitais, dadosFicha as valoresFicha, indicadoresPorNivel, meta, rms } from './dados';
import { rotulo, unidade } from './indicadores';
import type { Capital, Nivel, RegiaoMetropolitana, ValorAno } from './tipos';

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

/** Divisão modal da pesquisa OD mais recente (só regiões metropolitanas), em % */
export interface DivisaoModal {
  ano: number;
  modos: { nome: string; valor: number }[];
}

export interface DadosFicha {
  nivel: Nivel;
  /** A capital ou a região metropolitana */
  local: Capital | RegiaoMetropolitana;
  /** Só capitais: campos da aba Mobilidade */
  capital: Capital | null;
  titulo: string;
  sobretitulo: string;
  /** Grupo de comparação: "capitais" ou "RMs" */
  grupo: string;
  /** Endereço da página do local, relativo à raiz do site */
  caminho: string;
  modal: DivisaoModal | null;
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

/** Valores dos locais do nível no ano, só os que entram na comparação */
function comparaveis(nivel: Nivel, codigo: string, ano: number): number[] {
  return Object.values(indicadoresPorNivel[nivel][codigo])
    .map(s => s[ano])
    .filter((v): v is number => typeof v === 'number' && (!SO_COM_TMA(codigo) || v > 0));
}

/** Comparação de um indicador entre as capitais, no último ano com dado da capital escolhida */
function linha(nivel: Nivel, codigo: string, slug: string): LinhaIndicador | null {
  const serie = indicadoresPorNivel[nivel][codigo]?.[slug];
  if (!serie || !Object.keys(serie).length) return null;
  const ano = Math.max(...Object.keys(serie).map(Number));
  const valor = serie[ano];
  const doAno = comparaveis(nivel, codigo, ano);
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
function comparacao(nivel: Nivel, codigo: string, slug: string, grupo: string): ComparacaoGrafico | null {
  const l = linha(nivel, codigo, slug);
  if (!l) return null;
  const locais: { slug: string; nome: string }[] = nivel === 'capitais' ? capitais : rms.map(r => ({ slug: r.slug, nome: r.sigla }));
  const doAno = locais
    .map(c => ({ nome: c.nome, valor: indicadoresPorNivel[nivel][codigo][c.slug]?.[l.ano] }))
    .filter((x): x is { nome: string; valor: number } => typeof x.valor === 'number')
    .sort((a, b) => (b.valor - a.valor) * (sentido(codigo) || 1));
  // Do melhor para o pior (sem avaliação: do maior para o menor)
  const [primeiro, ultimo] = [doAno[0], doAno[doAno.length - 1]];
  const [r1, r2] = sentido(codigo) ? ['Melhor', 'Pior'] : ['Maior', 'Menor'];
  const barras = [
    { rotulo: nivel === 'capitais' ? 'Esta capital' : 'Esta RM', valor: l.valor, destaque: true },
    { rotulo: `Mediana das ${grupo}`, valor: l.mediana, destaque: false },
    ...(l.posicao === 1 ? [] : [{ rotulo: `${r1}: ${primeiro.nome}`, valor: primeiro.valor, destaque: false }]),
    ...(l.posicao === l.totalComDado ? [] : [{ rotulo: `${r2}: ${ultimo.nome}`, valor: ultimo.valor, destaque: false }]),
  ].sort((a, b) => b.valor - a.valor);
  return { codigo, nome: l.nome, unidade: l.unidade, ano: l.ano, barras };
}

/** Divisão modal ("a pé" aparece com e sem acento em versões da planilha) */
const MODOS = [['A pé', ['PERC_A PÉ', 'PERC_A PE']], ['Bicicleta', ['PERC_BICI']], ['Coletivo', ['PERC_TRANSP_COLETIVO']], ['Individual motorizado', ['PERC_TRANSP_IND_MOTO']]] as const;

function divisaoModal(nivel: Nivel, slug: string): DivisaoModal | null {
  const series = MODOS.map(([, cods]) => cods.map(c => indicadoresPorNivel[nivel][c]?.[slug]).find(Boolean) ?? {});
  const anos = Object.keys(series[0]).map(Number).filter(a => series.every(s => typeof s[a] === 'number'));
  if (!anos.length) return null;
  const ano = Math.max(...anos);
  return { ano, modos: MODOS.map(([nome], i) => ({ nome, valor: series[i][ano] })) };
}

export function dadosFicha(nivel: Nivel, slug: string): DadosFicha | null {
  const capital = nivel === 'capitais' ? capitais.find(c => c.slug === slug) ?? null : null;
  const rm = nivel === 'rms' ? rms.find(r => r.slug === slug) ?? null : null;
  const local = capital ?? rm;
  if (!local) return null;
  const ind = indicadoresPorNivel[nivel];
  const grupo = nivel === 'capitais' ? 'capitais' : 'RMs';
  const secoes = TEMAS.map(t => ({
    titulo: t.titulo,
    linhas: t.codigos.map(c => linha(nivel, c, slug)).filter((l): l is LinhaIndicador => l !== null),
  })).filter(s => s.linhas.length);

  // Indicadores existentes na base para outros locais do nível, mas sem dado para este
  const semDado = TEMAS.flatMap(t => t.codigos)
    .filter(c => ind[c] && !ind[c][slug])
    .map(rotulo);

  const series = SERIES_GRAFICO.map(codigo => {
    const s = ind[codigo]?.[slug] ?? {};
    return {
      codigo, nome: rotulo(codigo).replace('₂', '2'), unidade: unidade(codigo),
      pontos: Object.keys(s).map(Number).sort((a, b) => a - b).map(ano => ({
        ano, valor: s[ano],
        mediana: mediana(comparaveis(nivel, codigo, ano)),
      })),
    };
  }).filter(s => s.pontos.length >= 3 && s.pontos.some(p => p.valor > 0)); // sem gráfico zerado (PNT sem TMA)

  return {
    nivel, local, capital, grupo,
    titulo: capital ? `${capital.nome} (${capital.uf})` : rm!.nome,
    sobretitulo: capital ? 'FICHA DA CIDADE' : `FICHA DA REGIÃO METROPOLITANA · ${rm!.sigla}`,
    caminho: `/${nivel === 'capitais' ? 'capitais' : 'regioes-metropolitanas'}/${slug}/`,
    modal: rm ? divisaoModal(nivel, slug) : null,
    secoes, semDado, series,
    destaques: DESTAQUES.map(c => linha(nivel, c, slug)).filter((l): l is LinhaIndicador => l !== null),
    comparacoes: COMPARACOES_GRAFICO.map(c => comparacao(nivel, c, slug, grupo)).filter((x): x is ComparacaoGrafico => x !== null),
    valores: valoresFicha(nivel, slug),
    dadosAtualizadosEm: meta.geradoEm,
    geradaEm: new Date().toISOString().slice(0, 10),
  };
}
