'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { IndicadorPrincipal } from '@/lib/organizacao';
import type { Nivel } from '@/lib/tipos';
import ExploradorIndicador, { type DadosExplorador } from './ExploradorIndicador';
import GraficosIndicador, { type DadosNivel } from './GraficosIndicador';
import styles from './PaginaIndicador.module.css';

interface Props {
  ind: IndicadorPrincipal;
  /** código -> dados do ranking por nível (o código das RMs pode ter outra grafia) */
  ranking: Record<string, Partial<Record<Nivel, DadosNivel>>>;
  explorador: DadosExplorador;
  /** Recorte e categoria abertos de início (links antigos apontam direto para um recorte) */
  inicial: { recorte: number; categoria: number };
}

/** Página de um indicador principal: recortes em botões, comparação entre locais e evolução no tempo */
export default function PaginaIndicador({ ind, ranking, explorador, inicial }: Props) {
  const [recorte, setRecorte] = useState(inicial.recorte);
  const [categoria, setCategoria] = useState(inicial.categoria);
  const partes: [string, string][] = recorte === 0 ? [[ind.principal, 'Total']] : ind.recortes[recorte - 1].partes;
  const cat = Math.min(categoria, partes.length - 1);
  const [codigo, rotuloCat] = partes[cat];
  const nomeCompleto = partes.length > 1 || recorte > 0 ? `${ind.nome} — ${rotuloCat}` : ind.nome;

  // ?local=recife (ou ?local=rmr) vem da página do local
  const doEndereco = useSearchParams().get('local') ?? '';
  const localInicial = explorador.locais.rms.some(r => r.slug === doEndereco) ? `rms:${doEndereco}`
    : explorador.locais.capitais.some(c => c.slug === doEndereco) ? `capitais:${doEndereco}` : 'capitais:recife';

  return (
    <>
      <div className={styles.barra}>
        {ind.recortes.length > 0 && (
          <div className={styles.grupo}>
            <span className={styles.rotulo}>Recorte</span>
            <div className={styles.botoes} role="radiogroup" aria-label="Recorte">
              {['Total', ...ind.recortes.map(r => r.nome)].map((r, i) => (
                <button key={r} type="button" role="radio" aria-checked={recorte === i} className={styles.opcao}
                  onClick={() => { setRecorte(i); setCategoria(0); }}>{r}</button>
              ))}
            </div>
          </div>
        )}
        {partes.length > 1 && (
          <label className={styles.grupo}>
            <span className={styles.rotulo}>Categoria (comparação entre locais)</span>
            <select className={styles.select} value={cat} onChange={e => setCategoria(Number(e.target.value))}>
              {partes.map(([, r], i) => <option key={r} value={i}>{r}</option>)}
            </select>
          </label>
        )}
      </div>

      <section className={styles.bloco} aria-labelledby="titulo-evolucao">
        <h2 id="titulo-evolucao" className={styles.titulo}>Evolução</h2>
        <p className={styles.texto}>
          Escolha um ou mais locais, misturando capitais e regiões metropolitanas, e o período.
          Com um só local, o gráfico mostra todas as categorias do recorte.
        </p>
        <ExploradorIndicador key={recorte} d={explorador} nome={ind.nome} partes={partes} categoria={cat} localInicial={localInicial} />
      </section>

      <section className={styles.bloco}>
        {Object.keys(ranking[codigo] ?? {}).length
          ? <GraficosIndicador key={codigo} nome={nomeCompleto} unidade={explorador.unidades[codigo] ?? ''} niveis={ranking[codigo]} serie={false} />
          : <p className="nota">Sem dados de {rotuloCat} para comparar entre locais.</p>}
      </section>
    </>
  );
}
