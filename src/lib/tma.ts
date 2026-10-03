/* Dados da aba TMA (Transporte de Média e Alta Capacidade), gerados por scripts/gerar_tma.py
   a partir do Mapa de TMA do ITDP. */
import tmaJson from '@/data/tma.json';

/** Valores por ano ("2018": 12.3) */
export type PorAno = Record<string, number>;

export interface SerieTMA {
  /** Inaugurado em cada ano, por modo (o primeiro ano do gráfico acumula tudo o que é anterior) */
  km: Record<string, PorAno>;
  estacoes: Record<string, PorAno>;
  /** Planejado ou em construção, pelo ano previsto (todos os modos juntos) */
  kmProj: PorAno;
  estacoesProj: PorAno;
}

export interface DadosTMA {
  geradoEm: string;
  modos: string[];
  anos: number[];
  anosProjecao: number[];
  inicioGrafico: number;
  resumo: {
    km: number; estacoes: number; municipios: number; sistemas: number;
    porModo: Record<string, number>; kmPorModo: Record<string, number>; kmUltimos10Anos: number;
  };
  sistemas: { nome: string; km: number; estacoes: number; municipios: number }[];
  series: Record<string, SerieTMA>;
  avisos: Record<string, number>;
}

export const tma = tmaJson as unknown as DadosTMA;

/** Cor fixa de cada modo, igual no infográfico e no gráfico */
export const COR_MODO: Record<string, string> = {
  BRT: '#64eaa6', 'Metrô': '#54c7dd', Trem: '#f5b841', VLT: '#ef6f8e', Monotrilho: '#b39ddb', Barca: '#ff8a5b',
};
