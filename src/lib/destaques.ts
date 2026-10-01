/* Destaques (protótipo): cards com um número de impacto, explicação, mini-gráfico e fonte.
   Os textos são fixos (exemplos); os gráficos são calculados a partir dos dados do site.
   Usado só no build (páginas e imagens). */
import { capitais, indicadoresCapitais, indicadoresRms, rms } from './dados';
import type { Serie } from './tipos';

export interface PontoGrafico {
  rotulo: string;
  valor: number;
  destaque?: boolean;
}

export interface GraficoDestaque {
  /** barras: horizontais com rótulo (até ~10); colunas: verticais, para séries ou muitos locais */
  tipo: 'barras' | 'colunas';
  titulo: string;
  unidade: string;
  pontos: PontoGrafico[];
  /** Linha de referência (ex.: 70%) */
  referencia?: { valor: number; rotulo: string };
}

export interface Destaque {
  id: string;
  tema: string;
  numero: string;
  frase: string;
  /** Detalhe curto na frente (local e ano) */
  contexto: string;
  explicacao: string;
  fonte: string;
  grafico: GraficoDestaque;
  /** Página do site com o indicador completo */
  link: string;
}

const nomeCap = Object.fromEntries(capitais.map(c => [c.slug, c.nome]));
// Nomes curtos para caber nos gráficos
const nomeRm = Object.fromEntries(rms.map(r => [r.slug, r.slug === 'ride-df' ? 'DF e Entorno' : r.curto]));

/** Valor de um ano em todas as séries, ordenado do maior para o menor */
function ranking(series: Record<string, Serie>, ano: string, nomes: Record<string, string>, destaque: string, limite = 99): PontoGrafico[] {
  return Object.entries(series)
    .filter(([, s]) => s[ano] != null)
    .map(([slug, s]) => ({ rotulo: nomes[slug] ?? slug, valor: s[ano], destaque: slug === destaque }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, limite);
}

const C = indicadoresCapitais;
const R = indicadoresRms;

// Participação dos motociclistas nas mortes, por capital (2021)
const percMoto: Record<string, Serie> = Object.fromEntries(
  Object.keys(C.TX_MORT_MOTO).filter(s => C.TX_MORT_TOT[s]?.['2021'])
    .map(s => [s, { 2021: Math.round((C.TX_MORT_MOTO[s]['2021'] / C.TX_MORT_TOT[s]['2021']) * 1000) / 10 }]),
);

const motoPortoVelho = C.TX_MOTO['porto-velho'];

export const destaques: Destaque[] = [
  {
    id: 'mortalidade-vitoria',
    tema: 'Segurança viária',
    numero: '43,8',
    frase: 'mortes no trânsito por 100 mil habitantes em Vitória',
    contexto: 'Maior taxa entre as capitais em 2021 — 2,6 vezes a média (17,1)',
    explicacao: 'A taxa de mortalidade mede os óbitos em sinistros de trânsito para cada 100 mil habitantes, segundo o local de ocorrência. Vitória lidera entre as 27 capitais, seguida de Palmas e Teresina.',
    fonte: 'DATASUS (SIM) e IBGE. Elaboração: MobiliDADOS / ITDP Brasil',
    grafico: { tipo: 'barras', titulo: 'Mortes no trânsito por 100 mil hab. (2021)', unidade: 'por 100 mil hab.', pontos: ranking(C.TX_MORT_TOT, '2021', nomeCap, 'vitoria', 8) },
    link: '/indicadores/tx-mort-tot/?local=vitoria',
  },
  {
    id: 'motociclistas-teresina',
    tema: 'Segurança viária',
    numero: '64%',
    frase: 'das mortes no trânsito em Teresina foram de motociclistas',
    contexto: 'A maior participação entre as capitais em 2021',
    explicacao: 'Motociclistas são o grupo mais vulnerável em boa parte das capitais do Norte e do Nordeste. Em Teresina, quase dois em cada três mortos no trânsito estavam em uma moto.',
    fonte: 'DATASUS (SIM) e IBGE. Elaboração: MobiliDADOS / ITDP Brasil',
    grafico: { tipo: 'barras', titulo: 'Motociclistas no total de mortes no trânsito (2021)', unidade: '%', pontos: ranking(percMoto, '2021', nomeCap, 'teresina', 8) },
    link: '/indicadores/tx-mort-moto/?local=teresina',
  },
  {
    id: 'negros-mortes',
    tema: 'Raça e trânsito',
    numero: '17 de 27',
    frase: 'capitais têm mais de 70% de pessoas negras entre os mortos no trânsito',
    contexto: 'Em Natal, 98,9% — dados de 2021',
    explicacao: 'O percentual de pessoas negras entre as mortes em sinistros de trânsito ajuda a avaliar a vulnerabilidade da população negra às ocorrências fatais. A média entre as capitais é de 71%.',
    fonte: 'DATASUS (SIM). Elaboração: MobiliDADOS / ITDP Brasil',
    grafico: {
      tipo: 'colunas', titulo: 'Pessoas negras entre os mortos no trânsito, por capital (2021)', unidade: '%',
      pontos: ranking(C.PERC_MORTE_NEGROS, '2021', nomeCap, '').map(p => ({ ...p, destaque: p.valor > 70 })),
      referencia: { valor: 70, rotulo: '70%' },
    },
    link: '/indicadores/perc-morte-negros/',
  },
  {
    id: 'pnt-salvador',
    tema: 'Transporte público',
    numero: '4,6%',
    frase: 'da população da RM de Salvador mora a até 1 km de uma estação de média e alta capacidade',
    contexto: 'A menor proximidade entre as 9 metrópoles em 2021',
    explicacao: 'O indicador PNT mede quanto da população vive perto de estações de metrô, trem, BRT, VLT e barcas. Nem na RM do Rio de Janeiro, a melhor colocada, chega a uma em cada cinco pessoas.',
    fonte: 'ITDP Brasil e IBGE. Elaboração: MobiliDADOS / ITDP Brasil',
    grafico: { tipo: 'barras', titulo: 'População perto de estações de média e alta capacidade (2021)', unidade: '%', pontos: ranking(R.PNT, '2021', nomeRm, 'rms') },
    link: '/indicadores/pnt/?local=rms',
  },
  {
    id: 'motorizacao-porto-velho',
    tema: 'Motorização',
    numero: '+376%',
    frase: 'foi o crescimento da taxa de motorização de Porto Velho',
    contexto: 'De 132 para 628 veículos por mil habitantes entre 2001 e 2022',
    explicacao: 'A taxa de motorização mede quantos automóveis, caminhonetes, motos e utilitários existem para cada mil habitantes. Em todas as capitais a frota cresceu mais rápido que a população — em média, 196% no período.',
    fonte: 'SENATRAN e IBGE. Elaboração: MobiliDADOS / ITDP Brasil',
    grafico: {
      tipo: 'colunas', titulo: 'Veículos por mil habitantes em Porto Velho', unidade: 'veículos por mil hab.',
      pontos: Object.keys(motoPortoVelho).sort().map(a => ({ rotulo: a, valor: Math.round(motoPortoVelho[a]), destaque: a === '2022' })),
    },
    link: '/indicadores/tx-moto/?local=porto-velho',
  },
  {
    id: 'tarifa-belo-horizonte',
    tema: 'Custo do transporte',
    numero: '22%',
    frase: 'do salário mínimo vai para a tarifa de transporte em Belo Horizonte',
    contexto: 'O maior comprometimento entre as capitais (dado de 2017)',
    explicacao: 'O indicador considera duas passagens por dia útil ao longo de um mês, comparadas ao salário mínimo. Para quem depende do transporte coletivo, a tarifa pesa no orçamento e limita o acesso à cidade.',
    fonte: 'Prefeituras e Ministério do Trabalho. Elaboração: MobiliDADOS / ITDP Brasil',
    grafico: { tipo: 'barras', titulo: 'Tarifa em relação ao salário mínimo (2017)', unidade: '%', pontos: ranking(C.TARIFAxSM, '2017', nomeCap, 'belo-horizonte', 8) },
    link: '/indicadores/tarifaxsm/?local=belo-horizonte',
  },
];

export function destaquePorId(id: string): Destaque | undefined {
  return destaques.find(d => d.id === id);
}

/** Endereço público do site (para as prévias das redes sociais, que exigem URL completa) */
export const URL_SITE = (process.env.SITE_URL ?? 'http://localhost:8080').replace(/\/$/, '');
