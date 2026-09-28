/** Valores de um indicador por ano: { "2019": 12.3, "2020": 11.8 } */
export type Serie = Record<string, number>;

/** Todas as séries de um nível: { indicador: { slugDoLocal: Serie } } */
export type Indicadores = Record<string, Record<string, Serie>>;

export type Catalogo = Record<string, { nome: string; unidade: string }>;

/** Qualquer local que aparece em comparações (capital ou região metropolitana) */
export interface Lugar {
  slug: string;
  nome: string;
  curto?: string;
}

export const MODOS_TMA = ['barca', 'brt', 'metro', 'monotrilho', 'trem', 'vlt'] as const;
export type ModoTma = (typeof MODOS_TMA)[number];

export interface Capital extends Lugar {
  uf: string;
  rm: string;
  lat: number | null;
  lon: number | null;
  texto: string;
  area: number | null;
  areaUrbana: number | null;
  pop2016: number | null;
  densidade: number | null;
  densidadeUrbana: number | null;
  idhm: number | null;
  faixaIdhm: string;
  renda: number | null;
  percDr1sm: number | null;
  percNegros: number | null;
  percMulheres: number | null;
  percBrancos: number | null;
  percHomens: number | null;
  laiContrato: string;
  laiContratoInicio: string;
  laiContratoPrazo: string;
  laiContratoFonte: string;
  laiGps: string;
  laiGpsFrota: string;
  laiGpsFonte: string;
  laiGtfs: string;
  laiGtfsFonte: string;
  tma: Record<ModoTma, { estacoes: number | null; km: number | null }>;
  planmobStatus: string;
  planmobAno: string;
  planmobFonte: string;
}
