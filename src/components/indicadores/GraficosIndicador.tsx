'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ChartConfiguration } from 'chart.js';
import BotaoDados from '@/components/BotaoDados';
import Grafico, { COR_SECUNDARIA, PALETA } from '@/components/Grafico';
import { baixarCSV } from '@/lib/csv';
import { fmt } from '@/lib/formato';
import type { Lugar, Nivel, Serie } from '@/lib/tipos';
import SecaoSerie from './SecaoSerie';
import styles from './GraficosIndicador.module.css';

export interface DadosNivel {
  codigo: string;
  /** { slugDoLocal: { ano: valor } } */
  series: Record<string, Serie>;
  lugares: Lugar[];
}

interface Props {
  nome: string;
  unidade: string;
  niveis: Partial<Record<Nivel, DadosNivel>>;
}

const TEXTO: Record<Nivel, { plural: string; conjunto: string; um: string }> = {
  capitais: { plural: 'Capitais', conjunto: 'as capitais', um: 'uma capital' },
  rms: { plural: 'Regiões metropolitanas', conjunto: 'as regiões metropolitanas', um: 'uma região metropolitana' },
};

/** Página de um indicador: ranking entre os locais (dado mais recente) e série histórica.
    Quando o indicador existe para capitais e RMs, dá para alternar entre os dois. */
export default function GraficosIndicador({ nome, unidade, niveis }: Props) {
  const disponiveis = (['capitais', 'rms'] as Nivel[]).filter(n => niveis[n]);
  // ?local=recife (ou ?local=rmr) vem da página do local e define o nível e o destaque
  const doEndereco = useSearchParams().get('local') ?? '';
  const nivelDoEndereco = disponiveis.find(n => niveis[n]!.series[doEndereco]);
  const [nivel, setNivel] = useState<Nivel>(nivelDoEndereco ?? disponiveis[0]);
  const [destaque, setDestaque] = useState(nivelDoEndereco ? doEndereco : '');
  const { codigo, series, lugares } = niveis[nivel]!;
  const t = TEXTO[nivel];

  function trocarNivel(n: Nivel) {
    setNivel(n);
    setDestaque('');
  }

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
      labels: ranking.map(x => `${x.l.curto ?? x.l.nome} (${x.ano})`),
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

  const localDestaque = ranking.find(x => x.l.slug === destaque)?.l;

  function baixar() {
    const linhas: (string | number)[][] = [['local', 'ano', 'indicador', 'descricao', 'unidade', 'valor']];
    lugares.forEach(l => Object.entries(series[l.slug] ?? {}).forEach(([a, v]) => linhas.push([l.nome, +a, codigo, nome, unidade, v])));
    baixarCSV(`mobilidados_${nivel}_${codigo.replace(/[^\w]+/g, '_')}`, linhas);
  }

  return (
    <>
      <div className={styles.controles}>
        {disponiveis.length > 1 && (
          <fieldset className={styles.nivel}>
            <legend className="rotulo-campo">Comparar</legend>
            {disponiveis.map(n => (
              <label key={n}>
                <input type="radio" name="nivel" checked={nivel === n} onChange={() => trocarNivel(n)} /> {TEXTO[n].plural}
              </label>
            ))}
          </fieldset>
        )}
        <div className={styles.destaque}>
          <label className="rotulo-campo" htmlFor="destaque">Destacar {t.um}</label>
          <select id="destaque" className="campo" value={destaque} onChange={e => setDestaque(e.target.value)}>
            <option value="">Nenhum destaque</option>
            {ranking.map(x => <option key={x.l.slug} value={x.l.slug}>{x.l.curto ?? x.l.nome}</option>)}
          </select>
        </div>
      </div>

      <section className={styles.bloco} aria-labelledby="titulo-ranking">
        <h2 id="titulo-ranking" className={styles.titulo}>Comparação entre {t.conjunto}</h2>
        <p className={styles.texto}>Valor mais recente de cada local ({unidade}). Entre parênteses, o ano do dado.</p>
        <div className="cartao">
          <Grafico
            config={config} altura={Math.max(320, ranking.length * 24 + 60)} descricao={`${nome}: comparação entre ${t.conjunto}`}
            imagem={{
              titulo: `${nome} — comparação entre ${t.conjunto}`,
              subtitulo: `${unidade} · dado mais recente de cada local (ano entre parênteses)`
                + (localDestaque ? ` · em destaque: ${localDestaque.curto ?? localDestaque.nome}` : ''),
            }}
          />
        </div>
      </section>

      <section className={styles.bloco} aria-labelledby="titulo-serie">
        <h2 id="titulo-serie" className={styles.titulo}>Série histórica</h2>
        <p className={styles.texto}>
          Compare o desempenho de dois ou mais locais em um ano específico ou ao longo do tempo.
          A comparação está sujeita à disponibilidade dos dados.
        </p>
        <SecaoSerie
          key={nivel + destaque} series={series} titulo={nome} unidade={unidade} lugares={lugares}
          iniciais={destaque ? [destaque] : []} rotuloLugar={t.plural}
        />
      </section>

      <div className="centro"><BotaoDados onClick={baixar} texto="Baixar os dados deste indicador (CSV)" /></div>
    </>
  );
}
