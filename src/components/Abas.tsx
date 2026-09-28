'use client';

import styles from './Abas.module.css';

export interface Aba<T extends string> {
  id: T;
  titulo: string;
}

interface Props<T extends string> {
  abas: Aba<T>[];
  ativa: T;
  aoMudar: (id: T) => void;
  /** Nome para leitores de tela */
  rotulo: string;
  children: React.ReactNode;
  className?: string;
}

/** Abas no estilo "pasta": a aba ativa se funde ao painel de conteúdo */
export default function Abas<T extends string>({ abas, ativa, aoMudar, rotulo, children, className }: Props<T>) {
  return (
    <div className={className}>
      <div className={styles.lista} role="tablist" aria-label={rotulo}>
        {abas.map(a => (
          <button
            key={a.id} type="button" role="tab" id={`aba-${a.id}`}
            aria-selected={a.id === ativa} aria-controls={`painel-${a.id}`}
            className={styles.aba} onClick={() => aoMudar(a.id)}
          >
            {a.titulo}
          </button>
        ))}
      </div>
      <div className={styles.painel} role="tabpanel" id={`painel-${ativa}`} aria-labelledby={`aba-${ativa}`}>
        {children}
      </div>
    </div>
  );
}
