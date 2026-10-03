/* Dados da aba ENMU, gerados por scripts/gerar_enmu.py a partir do Portal Mobilidade Brasil (BNDES),
   do Boletim Informativo nº 6 do ENMU e do acompanhamento feito pela MobiliDADOS. */
import enmuJson from '@/data/enmu.json';

export interface RmENMU {
  nome: string; projetos: number;
  kmMin: number; kmMax: number; invMin: number; invMax: number;
  prazoMin: number; prazoMax: number; conclusaoMin: number; conclusaoMax: number;
  kmEntregue: number;
}

export interface ProjetoENMU {
  id: string; rm: string; nome: string; tecnologia: string; km: number; estagio: string;
  investimento: number; alternativa: boolean; situacao: string | null; anoSituacao: number | null;
}

export interface DadosENMU {
  geradoEm: string;
  anos: number[];
  resumo: {
    projetos: number; registrosPortal: number; rms: number; kmMin: number; kmMax: number;
    invMin: number; invMax: number; kmEntregue: number; projetosComSituacao: number;
  };
  rms: RmENMU[];
  /** km acumulados previstos por ano (mesma ordem de `anos`), nos cenários de menor e maior custo */
  projecao: Record<string, { min: number[]; max: number[] }>;
  /** km entregues em cada ano, segundo o acompanhamento */
  entregue: Record<string, Record<string, number>>;
  projetos: ProjetoENMU[];
  situacoes: string[];
}

export const enmu = enmuJson as unknown as DadosENMU;

export const ANO_HORIZONTE = 2054;
export const URL_BNDES = 'https://www.bndes.gov.br/wps/portal/site/home/conhecimento/pesquisaedados/estudos/bndes-fep/estudo-de-mobilidade-urbana';
export const URL_RESULTADOS = 'https://www.bndes.gov.br/wps/portal/site/home/conhecimento/pesquisaedados/estudos/bndes-fep/estudo-nacional-de-mobilidade-urbana-resultados-parciais/';
export const URL_PORTAL = 'https://mobilidadebrasil.bndes.gov.br/';

/** "R$ 398 bi" a partir de milhões */
export const bilhoes = (mi: number) => `R$ ${Math.round(mi / 1000).toLocaleString('pt-BR')} bi`;
