// Importa só o catálogo (e não lib/dados) para não levar as fichas das capitais aos componentes do navegador
import catalogoJson from '@/data/catalogo-indicadores.json';
import type { Catalogo } from './tipos';

const catalogo = catalogoJson as Catalogo;

export const rotulo = (codigo: string) => catalogo[codigo]?.nome ?? codigo;
export const unidade = (codigo: string) => catalogo[codigo]?.unidade ?? '';

export interface GrupoInfra {
  id: string;
  nome: string;
  /** Indicador usado na comparação entre locais */
  total: string;
  /** [código do indicador, rótulo curto no gráfico] */
  partes: [string, string][];
}

/** Grupos da seção "Distribuição da infraestrutura de mobilidade urbana" */
export const GRUPOS_INFRA: GrupoInfra[] = [
  {
    id: 'pnt-renda', total: 'PNT',
    nome: 'Proximidade do transporte de média e alta capacidade (PNT) por renda',
    partes: [['PNT_ATE_1/2', 'Até ½ SM'], ['PNT_1/2_1', '½ a 1 SM'], ['PNT_1_3', '1 a 3 SM'], ['PNT_ACIMA_3', 'Acima de 3 SM']],
  },
  {
    id: 'pnt-grupos', total: 'PNT',
    nome: 'Proximidade do transporte de média e alta capacidade (PNT) por gênero e raça',
    partes: [['PNT', 'População total'], ['PNT_MULHERES_NEGRAS', 'Mulheres negras'], ['PNT_MULHERES_1SM', 'Mulheres com renda até 1 SM']],
  },
  {
    id: 'pnb-renda', total: 'PNB',
    nome: 'Proximidade da infraestrutura cicloviária (PNB) por renda',
    partes: [['PNB_ATE_1/2', 'Até ½ SM'], ['PNB_1/2_1', '½ a 1 SM'], ['PNB_1_3', '1 a 3 SM'], ['PNB_ACIMA_3', 'Acima de 3 SM']],
  },
  {
    id: 'pnb-grupos', total: 'PNB',
    nome: 'Proximidade da infraestrutura cicloviária (PNB) por gênero e raça',
    partes: [['PNB', 'População total'], ['PNB_MULHERES_NEGRAS', 'Mulheres negras'], ['PNB_MULHERES_1SM', 'Mulheres com renda até 1 SM'], ['PNB_MULHERES_ATE_2SM', 'Mulheres chefes de domicílio até 2 SM']],
  },
  {
    id: 'tma-ciclo', total: 'TMA_INFRA_CICLO',
    nome: 'Integração entre estações de média e alta capacidade e ciclovias',
    partes: [['TMA_INFRA_CICLO', 'Estações a até 300 m de ciclovias']],
  },
];
