/* Temas dos indicadores, na mesma ordem e com os mesmos nomes da ficha da cidade em PDF.
   Usado na ficha, na lista de indicadores e na lista de indicadores de cada local. */
import { slugIndicador } from './indicadores';

/** Temas por código da planilha (ordem = ordem de exibição) */
export const TEMAS: { titulo: string; codigos: string[] }[] = [
  { titulo: 'Segurança viária: mortes', codigos: ['TX_MORT_TOT', 'TX_MORT_PED', 'TX_MORT_CICL', 'TX_MORT_MOTO', 'TX_MORT_AUTO', 'PERC_MORTE_NEGROS'] },
  { titulo: 'Segurança viária: internações', codigos: ['TX_INTERN_TOT', 'TX_INTERN_PED', 'TX_INTERN_CIC', 'TX_INTERN_MOTO', 'TX_INTERN_AUTO'] },
  { titulo: 'Transporte de média e alta capacidade', codigos: ['PNT', 'PNT_ATE_1/2', 'PNT_1/2_1', 'PNT_1_3', 'PNT_ACIMA_3', 'PNT_MULHERES_NEGRAS', 'PNT_MULHERES_1SM'] },
  { titulo: 'Infraestrutura cicloviária', codigos: ['PNB', 'PNB_ATE_1/2', 'PNB_1/2_1', 'PNB_1_3', 'PNB_ACIMA_3', 'PNB_MULHERES_NEGRAS', 'PNB_MULHERES_1SM', 'PNB_MULHERES_ATE_2SM', 'TMA_INFRA_CICLO'] },
  { titulo: 'Deslocamentos e divisão modal', codigos: ['TEMPO_MED', 'PERC_ACIMA_1H', 'PERC_A PE', 'PERC_A PÉ', 'PERC_BICI', 'PERC_TRANSP_COLETIVO', 'PERC_TRANSP_IND_MOTO'] },
  { titulo: 'Motorização, emissões e custo', codigos: ['TX_MOTO', 'kgCO2/hab', 'gMP/hab', 'TARIFAxSM', 'TARIFAX RENDA_DOM_NEGRA'] },
  { titulo: 'Entorno dos domicílios', codigos: ['PERC_CALÇADAS', 'PERC_RAMPAS'] },
];

const OUTROS = 'Outros indicadores';
const posicao = new Map(TEMAS.flatMap((t, i) => t.codigos.map((c, j) => [slugIndicador(c), { tema: t.titulo, ordem: i * 100 + j }])));

/** Tema e ordem de um indicador a partir do endereço (slug) */
export function temaDoIndicador(slug: string): { tema: string; ordem: number } {
  return posicao.get(slug) ?? { tema: OUTROS, ordem: 9999 };
}

/** Agrupa itens por tema, na ordem dos temas e, dentro de cada tema, na ordem da ficha */
export function agruparPorTema<T extends { tema: string; ordem: number }>(itens: T[]): { tema: string; itens: T[] }[] {
  const grupos = new Map<string, T[]>();
  for (const i of [...itens].sort((a, b) => a.ordem - b.ordem)) grupos.set(i.tema, [...(grupos.get(i.tema) ?? []), i]);
  return [...grupos].map(([tema, lista]) => ({ tema, itens: lista }));
}
