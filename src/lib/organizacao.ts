/* Proposta de organização dos indicadores: 6 temas, 12 indicadores principais e seus recortes.
   Usada na página de comparação das opções (/organizacao-indicadores/). */

export interface Recorte {
  nome: string;
  /** [código da planilha, rótulo curto] */
  partes: [string, string][];
}

export interface IndicadorPrincipal {
  id: string;
  nome: string;
  /** Código mostrado quando nenhum recorte está escolhido */
  principal: string;
  recortes: Recorte[];
}

export interface Tema {
  id: string;
  nome: string;
  /** Pergunta usada na opção 3 */
  pergunta: string;
  indicadores: IndicadorPrincipal[];
}

const porModo = (cods: [string, string, string, string]): Recorte => ({
  nome: 'Por modo',
  partes: [[cods[0], 'Pedestres'], [cods[1], 'Ciclistas'], [cods[2], 'Motociclistas'], [cods[3], 'Ocupantes de automóveis']],
});

export const TEMAS: Tema[] = [
  {
    id: 'seguranca', nome: 'Segurança viária', pergunta: 'Quantas pessoas morrem ou se ferem no trânsito?',
    indicadores: [
      {
        id: 'mortalidade', nome: 'Mortalidade no trânsito', principal: 'TX_MORT_TOT',
        recortes: [
          porModo(['TX_MORT_PED', 'TX_MORT_CICL', 'TX_MORT_MOTO', 'TX_MORT_AUTO']),
          { nome: 'Perfil das vítimas', partes: [['PERC_MORTE_NEGROS', 'Negros entre as vítimas (%)']] },
        ],
      },
      {
        id: 'internacoes', nome: 'Internações por sinistros de trânsito', principal: 'TX_INTERN_TOT',
        recortes: [porModo(['TX_INTERN_PED', 'TX_INTERN_CIC', 'TX_INTERN_MOTO', 'TX_INTERN_AUTO'])],
      },
    ],
  },
  {
    id: 'acesso', nome: 'Acesso ao transporte', pergunta: 'Quem mora perto do transporte de qualidade?',
    indicadores: [
      {
        id: 'pnt', nome: 'População perto do transporte de média e alta capacidade (PNT)', principal: 'PNT',
        recortes: [
          { nome: 'Por renda', partes: [['PNT_ATE_1/2', 'Até ½ SM'], ['PNT_1/2_1', '½ a 1 SM'], ['PNT_1_3', '1 a 3 SM'], ['PNT_ACIMA_3', 'Acima de 3 SM']] },
          { nome: 'Por gênero e raça', partes: [['PNT', 'População total'], ['PNT_MULHERES_NEGRAS', 'Mulheres negras'], ['PNT_MULHERES_1SM', 'Mulheres até 1 SM']] },
        ],
      },
      {
        id: 'pnb', nome: 'População perto de ciclovias (PNB)', principal: 'PNB',
        recortes: [
          { nome: 'Por renda', partes: [['PNB_ATE_1/2', 'Até ½ SM'], ['PNB_1/2_1', '½ a 1 SM'], ['PNB_1_3', '1 a 3 SM'], ['PNB_ACIMA_3', 'Acima de 3 SM']] },
          { nome: 'Por gênero e raça', partes: [['PNB', 'População total'], ['PNB_MULHERES_NEGRAS', 'Mulheres negras'], ['PNB_MULHERES_1SM', 'Mulheres até 1 SM'], ['PNB_MULHERES_ATE_2SM', 'Mulheres chefes até 2 SM (série antiga)']] },
        ],
      },
      { id: 'tma-ciclo', nome: 'Estações de média e alta capacidade perto de ciclovias', principal: 'TMA_INFRA_CICLO', recortes: [] },
    ],
  },
  {
    id: 'deslocamentos', nome: 'Deslocamentos', pergunta: 'Como e em quanto tempo as pessoas se deslocam?',
    indicadores: [
      {
        id: 'divisao-modal', nome: 'Divisão modal', principal: 'PERC_TRANSP_COLETIVO',
        recortes: [{ nome: 'Por modo', partes: [['PERC_A PE', 'A pé'], ['PERC_BICI', 'Bicicleta'], ['PERC_TRANSP_COLETIVO', 'Transporte coletivo'], ['PERC_TRANSP_IND_MOTO', 'Individual motorizado']] }],
      },
      {
        id: 'tempo', nome: 'Tempo de deslocamento casa-trabalho', principal: 'TEMPO_MED',
        recortes: [{ nome: 'Viagens longas', partes: [['PERC_ACIMA_1H', 'Mais de 1 hora (%)']] }],
      },
    ],
  },
  {
    id: 'custo', nome: 'Custo', pergunta: 'Quanto pesa a tarifa no bolso?',
    indicadores: [
      {
        id: 'tarifa', nome: 'Peso da tarifa na renda', principal: 'TARIFAxSM',
        recortes: [{ nome: 'Por renda de referência', partes: [['TARIFAxSM', 'Salário mínimo'], ['TARIFAX RENDA_DOM_NEGRA', 'Trabalhadora doméstica negra']] }],
      },
    ],
  },
  {
    id: 'ambiente', nome: 'Motorização e meio ambiente', pergunta: 'Qual o impacto dos carros e motos na cidade?',
    indicadores: [
      { id: 'motorizacao', nome: 'Taxa de motorização', principal: 'TX_MOTO', recortes: [] },
      {
        id: 'emissoes', nome: 'Emissões por habitante', principal: 'kgCO2/hab',
        recortes: [{ nome: 'Por poluente', partes: [['kgCO2/hab', 'CO₂ (kg/hab)'], ['gMP/hab', 'Material particulado (g/hab)']] }],
      },
    ],
  },
  {
    id: 'calcadas', nome: 'Calçadas e acessibilidade', pergunta: 'Como estão as calçadas perto de casa?',
    indicadores: [
      {
        id: 'entorno', nome: 'Entorno dos domicílios', principal: 'PERC_CALÇADAS',
        recortes: [{ nome: 'Por elemento', partes: [['PERC_CALÇADAS', 'Calçadas'], ['PERC_RAMPAS', 'Rampas']] }],
      },
    ],
  },
];

/** Todos os códigos de um indicador principal (sem repetir) */
export function codigosDe(ind: IndicadorPrincipal): string[] {
  return [...new Set([ind.principal, ...ind.recortes.flatMap(r => r.partes.map(p => p[0]))])];
}
