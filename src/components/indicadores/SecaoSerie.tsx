'use client';

import { useMemo, useState } from 'react';
import Grafico, { PALETA, type ConfigGrafico } from '@/components/Grafico';
import MultiSelect from '@/components/MultiSelect';
import { fmt } from '@/lib/formato';
import type { Lugar, Serie } from '@/lib/tipos';
import styles from './Indicadores.module.css';

interface Props {
  /** Séries de um indicador: { slugDoLocal: { ano: valor } } */
  series: Record<string, Serie>;
  titulo: string;
  unidade: string;
  lugares: Lugar[];
  /** Locais já selecionados ao abrir */
  iniciais: string[];
  rotuloLugar: string;
}

/** Série histórica de um indicador: compara locais ao longo dos anos */
export default function SecaoSerie({ series, titulo, unidade, lugares, iniciais, rotuloLugar }: Props) {
  const comDado = useMemo(() => lugares.filter(l => series[l.slug]), [lugares, series]);
  const anos = useMemo(
    () => [...new Set(comDado.flatMap(l => Object.keys(series[l.slug]).map(Number)))].sort((a, b) => a - b),
    [comDado, series],
  );
  const [anosSel, setAnosSel] = useState<number[]>(anos);
  const [lugaresSel, setLugaresSel] = useState<string[]>(() => {
    const ini = iniciais.filter(s => series[s]);
    return ini.length ? ini : comDado.slice(0, 3).map(l => l.slug);
  });

  const config = useMemo<ConfigGrafico | null>(() => {
    if (!anosSel.length || !lugaresSel.length) return null;
    const as = [...anosSel].sort((a, b) => a - b);
    const umAno = as.length === 1;
    const ordem = comDado.filter(l => lugaresSel.includes(l.slug));
    return {
      type: umAno ? 'bar' : 'line',
      data: {
        labels: umAno ? [String(as[0])] : as,
        datasets: ordem.map((l, i) => ({
          label: l.curto ?? l.nome, data: as.map(a => series[l.slug]?.[a] ?? null),
          borderColor: PALETA[i % PALETA.length], backgroundColor: PALETA[i % PALETA.length],
          spanGaps: true, tension: .2, pointRadius: 3, borderWidth: 2,
        })),
      },
      options: {
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => fmt(Number(v), 1) } } },
      },
    } as ConfigGrafico;
  }, [anosSel, lugaresSel, series, comDado]);

  return (
    <>
      <div className={styles.filtros}>
        <div>
          <label className="rotulo-campo" htmlFor="serie-anos">Anos</label>
          <MultiSelect id="serie-anos" opcoes={anos.map(a => ({ valor: a, rotulo: String(a) }))} selecionados={anosSel} aoMudar={setAnosSel} />
        </div>
        <div>
          <label className="rotulo-campo" htmlFor="serie-lugares">{rotuloLugar}</label>
          <MultiSelect id="serie-lugares" opcoes={comDado.map(l => ({ valor: l.slug, rotulo: l.curto ?? l.nome }))} selecionados={lugaresSel} aoMudar={setLugaresSel} />
        </div>
      </div>
      <div className="cartao">
        {config
          ? <Grafico
              config={config} altura={420} descricao={`Série histórica: ${titulo}`}
              imagem={{ titulo: `${titulo} — série histórica`, subtitulo: `${unidade} · ${Math.min(...anosSel)}–${Math.max(...anosSel)}` }}
            />
          : <div className="vazio" style={{ height: 420 }}>Selecione ao menos um ano e um local</div>}
      </div>
    </>
  );
}
