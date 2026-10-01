'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Destaque } from '@/lib/destaques';
import Compartilhar from './Compartilhar';
import MiniGrafico from './MiniGrafico';
import styles from './CardDestaque.module.css';

/** Card de destaque: frente com o número; verso com explicação, gráfico, fonte e compartilhar.
    Vira ao passar o mouse (computador), ao tocar (celular) ou com Enter/Espaço (teclado). */
export default function CardDestaque({ d, url }: { d: Destaque; url: string }) {
  const [virado, setVirado] = useState(false);
  const alternar = () => setVirado(v => !v);

  return (
    <article className={`${styles.card} ${virado ? styles.virado : ''}`} aria-label={`Destaque: ${d.numero} ${d.frase}`}>
      <div className={styles.interno}>
        <div
          className={`${styles.face} ${styles.frente}`} role="button" tabIndex={0} aria-pressed={virado}
          aria-label={`${d.numero} ${d.frase}. Ver explicação`}
          onClick={alternar} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternar(); } }}
        >
          <span className={styles.tema}>{d.tema}</span>
          <strong className={styles.numero}>{d.numero}</strong>
          <p className={styles.frase}>{d.frase}</p>
          <p className={styles.contexto}>{d.contexto}</p>
          <span className={styles.dica} aria-hidden="true">Toque ou passe o mouse para ver mais ↻</span>
        </div>

        <div className={`${styles.face} ${styles.verso}`} onClick={alternar}>
          <p className={styles.explicacao}>{d.explicacao}</p>
          <p className={styles.tituloGrafico}>{d.grafico.titulo}</p>
          <MiniGrafico g={d.grafico} />
          <p className={styles.fonte}>Fonte: {d.fonte}</p>
          <div className={styles.acoes} onClick={e => e.stopPropagation()}>
            <Link href={d.link} className={styles.link}>Ver o indicador</Link>
            <Compartilhar id={d.id} texto={`${d.numero} ${d.frase} — MobiliDADOS`} url={url} />
          </div>
        </div>
      </div>
    </article>
  );
}
