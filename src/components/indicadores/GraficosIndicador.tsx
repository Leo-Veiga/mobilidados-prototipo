'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ChartConfiguration } from 'chart.js';
import BotaoDados from '@/components/BotaoDados';
import Grafico, { COR_SECUNDARIA, PALETA } from '@/components/Grafico';
import { baixarCSV } from '@/lib/csv';
import { fmt } from '@/lib/formato';
import type { Lugar, Serie } from '@/lib/tipos';
import SecaoSerie from './SecaoSerie';
import styles from './GraficosIndicador.module.css';

interface Props {
  codigo: string;
  nome: string;
  unidade: string;
  /** { slugDaCapital: { ano: valor } } */
  series: Record<string, Serie>;
  lugares: Lugar[];
}

/** Página de um indicador: ranking entre as capitais (dado mais recente) e série histórica */
export default function GraficosIndicador({ codigo, nome, unidade, series, lugares }: Props) {
  // ?local=recife destaca uma capital (vem da página da capital)
  const doEndereco = useSearchParams().get('local') ?? '';
  const [destaque, setDestaque] = useState(series[doEndereco] ? doEndereco : '');

  const ranking = useMemo(() => lugares
    .filter(l => series[l.slug])
    .map(l => {
      const ano = Math.max(...Object.keys(series[l.slug]).map(Number));
      return { l, ano, v: series[l.slug][ano] };
    })
    .sort((a, b) => b.v - a.v), [lugares, series]);

  const config = useMemo<ChartConfiguration<'bar'>>(() => ({
    type: 'bar',
    data: {
      labels: ranking.map(x => `${x.l.nome} (${x.ano})`),
      datasets: [{
        label: unidade, data: ranking.map(x => x.v), borderRadius: 4,
        backgroundColor: ranking.map(x => (!destaque || x.l.slug === destaque ? PALETA[0] : COR_SECUNDARIA)),
      }],
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { callback: v => fmt(Number(v), 1) } }, y: { ticks: { autoSkip: false } } },
    },
  }), [ranking, destaque, unidade]);

  function baixar() {
    const linhas: (string | number)[][] = [['local', 'ano', 'indicador', 'descricao', 'unidade', 'valor']];
    lugares.forEach(l => Object.entries(series[l.slug] ?? {}).forEach(([a, v]) => linhas.push([l.nome, +a, codigo, nome, unidade, v])));
    baixarCSV('mobilidados_' + codigo.replace(/[^\w]+/g, '_'), linhas);
  }

  return (
    <>
      <div className={styles.destaque}>
        <label className="rotulo-campo" htmlFor="destaque">Destacar uma capital</label>
        <select id="destaque" className="campo" value={destaque} onChange={e => setDestaque(e.target.value)}>
          <option value="">Nenhuma</option>
          {ranking.map(x => <option key={x.l.slug} value={x.l.slug}>{x.l.nome}</option>)}
        </select>
      </div>

      <section className={styles.bloco} aria-labelledby="titulo-ranking">
        <h2 id="titulo-ranking" className={styles.titulo}>Comparação entre as capitais</h2>
        <p className={styles.texto}>Valor mais recente de cada capital ({unidade}). Entre parênteses, o ano do dado.</p>
        <div className="cartao">
          <Grafico
            config={config} altura={Math.max(320, ranking.length * 24 + 60)} descricao={`${nome}: comparação entre as capitais`}
            imagem={{
              titulo: `${nome} — comparação entre as capitais`,
              subtitulo: `${unidade} · dado mais recente de cada capital (ano entre parênteses)`
                + (destaque ? ` · em destaque: ${ranking.find(x => x.l.slug === destaque)?.l.nome}` : ''),
            }}
          />
        </div>
      </section>

      <section className={styles.bloco} aria-labelledby="titulo-serie">
        <h2 id="titulo-serie" className={styles.titulo}>Série histórica</h2>
        <p className={styles.texto}>
          Compare o desempenho de duas ou mais capitais em um ano específico ou ao longo do tempo.
          A comparação está sujeita à disponibilidade dos dados.
        </p>
        <SecaoSerie key={destaque} series={series} titulo={nome} unidade={unidade} lugares={lugares} iniciais={destaque ? [destaque] : []} rotuloLugar="Capitais" />
      </section>

      <div className="centro"><BotaoDados onClick={baixar} texto="Baixar os dados deste indicador (CSV)" /></div>
    </>
  );
}
