'use client';

import { useMemo, useState } from 'react';
import Grafico, { PALETA, type ConfigGrafico } from '@/components/Grafico';
import MultiSelect from '@/components/MultiSelect';
import type { Nivel, Serie } from '@/lib/tipos';
import styles from './ExploradorIndicador.module.css';

export interface DadosExplorador {
  /** nível -> código (o das capitais) -> slug do local -> série */
  series: Record<Nivel, Record<string, Record<string, Serie>>>;
  locais: Record<Nivel, { slug: string; nome: string; curto?: string }[]>;
  unidades: Record<string, string>;
}

interface Props {
  d: DadosExplorador;
  nome: string;
  /** Categorias do recorte escolhido: [código, rótulo] */
  partes: [string, string][];
  /** Categoria comparada quando há vários locais */
  categoria: number;
  /** Ex.: "capitais:recife" */
  localInicial: string;
}

/** Evolução do indicador: um ou mais locais (capitais e RMs misturados), intervalo de anos e categorias do recorte */
export default function ExploradorIndicador({ d, nome, partes: todasPartes, categoria, localInicial }: Props) {
  const [locais, setLocais] = useState<string[]>([localInicial]);
  const [de, setDe] = useState<string | null>(null);
  const [ate, setAte] = useState<string | null>(null);

  const opcoesLocais = useMemo(() => (['capitais', 'rms'] as Nivel[]).flatMap(n =>
    d.locais[n].map(l => ({
      valor: `${n}:${l.slug}`, rotulo: n === 'capitais' ? l.nome : `RM ${l.curto ?? l.nome}`,
      grupo: n === 'capitais' ? 'Capitais' : 'Regiões metropolitanas',
    }))), [d]);
  const nomeDe = (k: string) => opcoesLocais.find(o => o.valor === k)?.rotulo ?? k;
  const serieDe = (k: string, codigo: string) => {
    const [n, slug] = k.split(':') as [Nivel, string];
    return d.series[n]?.[codigo]?.[slug] ?? {};
  };

  // Um local: uma linha por categoria do recorte. Vários locais: uma linha por local, na categoria escolhida.
  const varios = locais.length > 1;
  const cat = Math.min(categoria, todasPartes.length - 1);
  const partes = varios ? [todasPartes[cat]] : todasPartes;
  const linhas = varios
    ? locais.map(k => ({ rotulo: nomeDe(k), serie: serieDe(k, partes[0][0]) }))
    : partes.map(([c, r]) => ({ rotulo: r, serie: serieDe(locais[0] ?? '', c) }));

  const todosAnos = [...new Set(linhas.flatMap(l => Object.keys(l.serie)))].sort();
  const ini = de && todosAnos.includes(de) ? de : todosAnos[0];
  const fim = ate && todosAnos.includes(ate) && ate >= ini ? ate : todosAnos[todosAnos.length - 1];
  const anos = todosAnos.filter(a => a >= ini && a <= fim);
  const chave = `${todasPartes.map(p => p[0]).join()}|${cat}|${locais.join()}|${anos.join()}`;

  const config = useMemo(() => ({
    type: anos.length > 1 ? 'line' : 'bar',
    data: {
      labels: anos,
      datasets: linhas.map((l, i) => ({
        label: l.rotulo, data: anos.map(a => l.serie[a] ?? null),
        borderColor: PALETA[i % PALETA.length], backgroundColor: PALETA[i % PALETA.length], spanGaps: true, tension: 0.2, pointRadius: 3,
      })),
    },
    options: { plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } }, scales: { x: { grid: { display: false } } } },
  } as unknown as ConfigGrafico), [chave]); // eslint-disable-line react-hooks/exhaustive-deps

  const temRm = locais.some(k => k.startsWith('rms:'));
  const semDado = linhas.filter(l => !Object.keys(l.serie).length).map(l => l.rotulo);
  const un = d.unidades[partes[0][0]];
  const periodo = ini === fim ? ini : `${ini}–${fim}`;
  const titulo = todasPartes.length > 1 && varios ? `${nome} — ${partes[0][1]}` : nome;
  const legendaLocais = varios ? `${locais.length} locais` : nomeDe(locais[0] ?? '');

  return (
    <>
      <div className={styles.filtros}>
        <div className={styles.grupo}>
          <label className={styles.rotulo} htmlFor="explorador-locais">Capitais e regiões metropolitanas</label>
          <div className={styles.multi}>
            <MultiSelect id="explorador-locais" opcoes={opcoesLocais} selecionados={locais} aoMudar={setLocais} placeholder="Escolha um ou mais locais" escuro />
          </div>
        </div>
        {todosAnos.length > 1 && (
          <div className={styles.grupo}>
            <span className={styles.rotulo}>Anos</span>
            <div className={styles.anos}>
              <select className={styles.select} aria-label="Ano inicial" value={ini} onChange={e => setDe(e.target.value)}>
                {todosAnos.map(a => <option key={a}>{a}</option>)}
              </select>
              <span>a</span>
              <select className={styles.select} aria-label="Ano final" value={fim} onChange={e => setAte(e.target.value)}>
                {todosAnos.filter(a => a >= ini).map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
      {varios && todasPartes.length > 1 && (
        <p className="nota">Com vários locais, o gráfico mostra uma categoria por vez: <strong>{partes[0][1]}</strong> (troque acima, em &quot;Categoria&quot;).</p>
      )}
      <p className="nota">{legendaLocais}{un ? ` · ${un}` : ''}{anos.length ? ` · ${periodo}` : ''}</p>
      <div className="cartao">
        {!locais.length
          ? <p className={styles.vazio}>Escolha pelo menos um local.</p>
          : anos.length
            ? <Grafico config={config} altura={340} descricao={`${titulo}: ${locais.map(nomeDe).join(', ')}`} imagem={{ titulo, subtitulo: `${locais.map(nomeDe).join(', ')} · ${periodo}${un ? ` · ${un}` : ''}` }} />
            : <p className={styles.vazio}>Sem dados para {legendaLocais}{temRm ? ' (alguns indicadores existem só para as capitais)' : ''}.</p>}
      </div>
      {anos.length > 0 && semDado.length > 0 && (
        <p className="nota">Sem dados para: {semDado.join(', ')}{temRm ? ' (alguns indicadores existem só para as capitais)' : ''}.</p>
      )}
    </>
  );
}
