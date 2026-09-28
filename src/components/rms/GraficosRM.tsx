'use client';

import { useMemo } from 'react';
import type { ChartConfiguration } from 'chart.js';
import BotaoDados from '@/components/BotaoDados';
import Grafico, { PALETA } from '@/components/Grafico';
import { baixarCSV } from '@/lib/csv';
import { fmt } from '@/lib/formato';
import type { Serie } from '@/lib/tipos';
import styles from './GraficosRM.module.css';

/** Modos da divisão modal: [rótulo, cor] na ordem dos gráficos */
export const MODOS_VIAGEM: [string, string][] = [
  ['A pé', PALETA[0]], ['Bicicleta', PALETA[1]], ['Transporte coletivo', PALETA[2]], ['Transporte individual motorizado', PALETA[3]],
];

interface Props {
  nome: string;
  sigla: string;
  populacao: Serie;
  densidade: number | null;
  densidadeUrbana: number | null;
  /** Divisão modal por ano da pesquisa Origem-Destino: { ano: [a pé, bicicleta, coletivo, individual] } (%) */
  modal: Record<string, (number | null)[]>;
}

/** População e densidade + divisão modal de uma região metropolitana */
export default function GraficosRM({ nome, sigla, populacao, densidade, densidadeUrbana, modal }: Props) {
  const anosPop = Object.keys(populacao).map(Number).sort((a, b) => a - b);
  const anosModal = Object.keys(modal).sort();

  const configPop = useMemo<ChartConfiguration<'line'>>(() => ({
    type: 'line',
    data: {
      labels: anosPop,
      datasets: [{ label: 'População', data: anosPop.map(a => populacao[a]), borderColor: PALETA[0], backgroundColor: 'rgba(100,234,166,.2)', fill: true, tension: .2, pointRadius: 2 }],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => fmt(Number(v) / 1e6, 1) + ' mi' } } } },
  }), [anosPop, populacao]);

  const configDens = useMemo<ChartConfiguration<'bar'>>(() => ({
    type: 'bar',
    data: {
      labels: ['Densidade oficial', 'Densidade urbana'],
      datasets: [{ label: 'hab/km²', data: [densidade, densidadeUrbana], backgroundColor: [PALETA[1], PALETA[0]], borderRadius: 4 }],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => fmt(Number(v), 0) } } } },
  }), [densidade, densidadeUrbana]);

  const configsModal = useMemo(() => anosModal.map(ano => ({
    ano,
    config: {
      type: 'bar',
      data: {
        labels: MODOS_VIAGEM.map(m => m[0]),
        datasets: [{ label: '% das viagens', data: modal[ano], backgroundColor: MODOS_VIAGEM.map(m => m[1]), borderRadius: 4 }],
      },
      options: {
        indexAxis: 'y', plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, suggestedMax: 100, ticks: { callback: v => v + '%' } } },
      },
    } as ChartConfiguration<'bar'>,
  })), [anosModal, modal]);

  const baixarPop = () => baixarCSV(`mobilidados_populacao_densidade_${sigla.toLowerCase()}`, [
    ['regiao', 'ano', 'populacao'], ...anosPop.map(a => [nome, a, populacao[a]]),
    [], ['regiao', 'densidade_oficial_hab_km2', 'densidade_urbana_hab_km2'], [nome, densidade, densidadeUrbana],
  ]);
  const baixarModal = () => baixarCSV(`mobilidados_divisao_modal_${sigla.toLowerCase()}`, [
    ['regiao', 'ano', 'modo', 'percentual_viagens'],
    ...anosModal.flatMap(a => MODOS_VIAGEM.map(([m], i) => [nome, +a, m, modal[a][i]])),
  ]);

  return (
    <>
      <section className={styles.bloco} aria-labelledby="titulo-pop">
        <h2 id="titulo-pop" className={styles.titulo}>População e densidade</h2>
        <p className={styles.texto}>
          A população é o total de pessoas que habitam a região; a densidade demográfica é a relação entre a população
          e a área do território, em habitantes por km². A densidade oficial considera a área total da região
          metropolitana; a densidade urbana considera só a população urbana e a área urbanizada, segundo o IBGE.
        </p>
        <div className={styles.lado}>
          <div className="cartao">
            <h3>População</h3>
            <Grafico config={configPop} descricao={`População da ${nome} por ano`}
              imagem={{ titulo: `População — ${nome}`, subtitulo: `${anosPop[0]}–${anosPop[anosPop.length - 1]}`, fonte: 'IBGE / MobiliDADOS' }} />
          </div>
          <div className="cartao">
            <h3>Densidade</h3>
            <Grafico config={configDens} descricao={`Densidade oficial e urbana da ${nome}`}
              imagem={{ titulo: `Densidade oficial e urbana — ${nome}`, subtitulo: 'hab/km² · 2010', fonte: 'IBGE / MobiliDADOS' }} />
          </div>
        </div>
        <div className="centro"><BotaoDados onClick={baixarPop} /></div>
      </section>

      <section className={styles.bloco} aria-labelledby="titulo-modal">
        <h2 id="titulo-modal" className={styles.titulo}>Divisão modal</h2>
        <p className={styles.texto}>
          A divisão modal é a participação de cada modo de transporte no total de viagens realizadas no território:
          a pé, de bicicleta, de transporte coletivo e de transporte individual motorizado, segundo as pesquisas
          Origem-Destino disponíveis.
        </p>
        {configsModal.length ? (
          <>
            <div className={styles.lado}>
              {configsModal.map(({ ano, config }) => (
                <div key={ano} className="cartao">
                  <h3>Pesquisa Origem-Destino {ano}</h3>
                  <Grafico config={config} altura={240} descricao={`Divisão modal da ${nome} em ${ano}`}
                    imagem={{ titulo: `Divisão modal — ${nome}`, subtitulo: `% das viagens · Pesquisa Origem-Destino ${ano}` }} />
                </div>
              ))}
            </div>
            <div className="centro"><BotaoDados onClick={baixarModal} /></div>
          </>
        ) : <div className="cartao vazio">Não há pesquisa Origem-Destino com divisão modal para esta região.</div>}
      </section>
    </>
  );
}
