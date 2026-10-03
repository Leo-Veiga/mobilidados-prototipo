'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './MultiSelect.module.css';

export interface Opcao<T> {
  valor: T;
  rotulo: string;
  /** Título de grupo mostrado antes da primeira opção do grupo */
  grupo?: string;
}

interface Props<T> {
  id: string;
  opcoes: Opcao<T>[];
  selecionados: T[];
  aoMudar: (valores: T[]) => void;
  placeholder?: string;
  /** Visual escuro, igual aos outros campos dos filtros */
  escuro?: boolean;
}

/** Lista suspensa com caixas de seleção, "Marcar todos" e "Limpar" */
export default function MultiSelect<T extends string | number>({ id, opcoes, selecionados, aoMudar, placeholder = 'Selecione', escuro = false }: Props<T>) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => { if (!raiz.current?.contains(e.target as Node)) setAberto(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberto(false); };
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', fora); document.removeEventListener('keydown', esc); };
  }, [aberto]);

  const sel = new Set(selecionados);
  const escolhidos = opcoes.filter(o => sel.has(o.valor)).map(o => o.rotulo);
  const texto = !escolhidos.length ? placeholder : escolhidos.length <= 3 ? escolhidos.join(', ') : `${escolhidos.length} selecionados`;
  const alternar = (v: T) => aoMudar(sel.has(v) ? selecionados.filter(x => x !== v) : [...selecionados, v]);

  return (
    <div className={`${styles.multi} ${escuro ? styles.escuro : ''}`} ref={raiz}>
      <button
        id={id} type="button" className={`campo ${styles.botao}`} disabled={!opcoes.length}
        aria-haspopup="listbox" aria-expanded={aberto} onClick={() => setAberto(!aberto)}
      >
        <span>{texto}</span>
      </button>
      {aberto && (
        <div className={styles.lista} role="listbox" aria-multiselectable>
          <div className={styles.acoes}>
            <button type="button" onClick={() => aoMudar(opcoes.map(o => o.valor))}>Marcar todos</button>
            <button type="button" onClick={() => aoMudar([])}>Limpar</button>
          </div>
          {opcoes.map((o, i) => (
            <div key={o.valor}>
              {o.grupo && o.grupo !== opcoes[i - 1]?.grupo && <p className={styles.grupo}>{o.grupo}</p>}
              <label>
                <input type="checkbox" checked={sel.has(o.valor)} onChange={() => alternar(o.valor)} /> {o.rotulo}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
