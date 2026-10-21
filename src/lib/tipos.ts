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
  /** Grande região do país (atalhos de seleção nos gráficos) */
  regiao?: string;
}

/** Nível geográfico dos dados */
export type Nivel = 'capitais' | 'rms';

export interface RegiaoMetropolitana extends Lugar {
  sigla: string;
  curto: string;
  uf: string;
  lat: number | null;
  lon: number | null;
  texto: string;
  /** IDHM 2010 (Atlas do Desenvolvimento Humano): o último disponível por município */
  idhm: number | null;
  faixaIdhm: string;
}

export const MODOS_TMA = ['barca', 'brt', 'metro', 'monotrilho', 'trem', 'vlt'] as const;
export type ModoTma = (typeof MODOS_TMA)[number];

export interface Capital extends Lugar {
  uf: string;
  rm: string;
  lat: number | null;
  lon: number | null;
  texto: string;
  /** IDHM 2010 (Atlas do Desenvolvimento Humano): o último disponível por município */
  idhm: number | null;
  faixaIdhm: string;
  /** Extensão da rede de TMA por modo (km), do levantamento anterior do ITDP */
  tmaKm: Record<ModoTma, number | null>;
  /** Campos da aba Mobilidade da ficha, no ano mais recente de cada um */
  mobilidade: Partial<Record<CampoMob, TextoAno>>;
}

/** Campos da ficha de mobilidade (aba Ficha_mobilidade_capitais da planilha) */
export type CampoMob =
  | 'CONTRATO' | 'CONTRATO_INICIO' | 'CONTRATO_PRAZO' | 'GTFS_PUBLICO' | 'GPS_PUBLICO' | 'GPS_FROTA'
  | 'PLANMOB_STATUS' | 'PLANMOB_ANO';

/** Dado em texto da ficha, com o ano de verificação e o link da fonte */
export type TextoAno = { valor: string; ano: number; fonte: string };

/** Valor mais recente de um dado da ficha, com o ano */
export type ValorAno = { valor: number; ano: number } | null;
