'use client';

import { useMemo, useState } from 'react';
import BotaoDados from '@/components/BotaoDados';
import Grafico, { PALETA, type ConfigGrafico } from '@/components/Grafico';
import MultiSelect from '@/components/MultiSelect';
import { baixarCSV } from '@/lib/csv';
import { fmt } from '@/lib/formato';
import { rotulo, unidade } from '@/lib/indicadores';
import type { Indicadores, Lugar } from '@/lib/tipos';
import styles from './Indicadores.module.css';

interface Props {
  ind: Indicadores;
  lugares: Lugar[];
  /** Locais selecionados ao escolher um indicador */
  iniciais: string[];
  rotuloLugar: string;
  /** Sufixo do nome do CSV baixado (ex.: "capitais") */
  nomeArquivo: string;
}

/** Seção "Série histórica": compara locais ao longo dos anos */
export default function SecaoSerie({ ind, lugares, iniciais, rotuloLugar, nomeArquivo }: Props) {
  const chaves = useMemo(() => Object.keys(ind)
    .filter(k => k !== 'POP' && Object.keys(ind[k]).length)
    .sort((a, b) => rotulo(a).localeCompare(rotulo(b), 'pt')), [ind]);
  const [k, setK] = useState('');
  const [anosSel, setAnosSel] = useState<number[]>([]);
  const [lugaresSel, setLugaresSel] = useState<string[]>([]);

  const comDado = useMemo(() => (k ? lugares.filter(l => ind[k][l.slug]) : []), [k, ind, lugares]);
  const anos = useMemo(() => [...new Set(comDado.flatMap(l => Object.keys(ind[k][l.slug]).map(Number)))].sort((a, b) => a - b), [comDado, ind, k]);

  function trocarIndicador(novo: string) {
    setK(novo);
    if (!novo) { setAnosSel([]); setLugaresSel([]); return; }
    const disponiveis = lugares.filter(l => ind[novo][l.slug]);
    const ini = iniciais.filter(s => ind[novo][s]);
    setLugaresSel(ini.length ? ini : disponiveis.slice(0, 3).map(l => l.slug));
    setAnosSel([...new Set(disponiveis.flatMap(l => Object.keys(ind[novo][l.slug]).map(Number)))]);
  }

  const config = useMemo<ConfigGrafico | null>(() => {
    if (!k || !anosSel.length || !lugaresSel.length) return null;
    const as = [...anosSel].sort((a, b) => a - b);
    const umAno = as.length === 1;
    const ordem = lugares.filter(l => lugaresSel.includes(l.slug));
    return {
      type: umAno ? 'bar' : 'line',
      data: {
        labels: umAno ? [String(as[0])] : as,
        datasets: ordem.map((l, i) => ({
          label: l.curto ?? l.nome, data: as.map(a => ind[k][l.slug]?.[a] ?? null),
          borderColor: PALETA[i % PALETA.length], backgroundColor: PALETA[i % PALETA.length],
          spanGaps: true, tension: .2, pointRadius: 3,
        })),
      },
      options: {
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'bottom' }, title: { display: true, text: `${rotulo(k)} (${unidade(k)})` } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => fmt(Number(v), 1) } } },
      },
    } as ConfigGrafico;
  }, [k, anosSel, lugaresSel, ind, lugares]);

  function baixar() {
    const linhas: (string | number)[][] = [['local', 'ano', 'indicador', 'descricao', 'unidade', 'valor']];
    (k ? [k] : chaves).forEach(kk => lugares.forEach(l =>
      Object.entries(ind[kk][l.slug] ?? {}).forEach(([a, v]) => linhas.push([l.nome, +a, kk, rotulo(kk), unidade(kk), v]))));
    baixarCSV('mobilidados_serie_historica_' + nomeArquivo + (k ? '_' + k.replace(/[^\w]+/g, '_') : ''), linhas);
  }

  return (
    <>
      <div className={styles.filtros}>
        <div>
          <label className="rotulo-campo" htmlFor="serie-ind">Indicador</label>
          <select id="serie-ind" className="campo" value={k} onChange={e => trocarIndicador(e.target.value)}>
            <option value="">Selecionar...</option>
            {chaves.map(c => <option key={c} value={c}>{rotulo(c)}</option>)}
          </select>
        </div>
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
          ? <Grafico config={config} altura={420} descricao={`Série histórica: ${rotulo(k)}`} />
          : <div className="vazio" style={{ height: 420 }}>{k ? 'Selecione ao menos um ano e um local' : 'Selecione um indicador'}</div>}
      </div>
      <div className="centro"><BotaoDados onClick={baixar} /></div>
    </>
  );
}
