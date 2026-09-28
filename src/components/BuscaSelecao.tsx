'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { IconeGrafico, IconeLocal, IconeSeta } from './Icones';
import styles from './BuscaSelecao.module.css';

export interface OpcaoBusca {
  rotulo: string;
  href: string;
}

interface Props {
  rotulo: string;
  placeholder: string;
  icone: 'local' | 'grafico';
  opcoes: OpcaoBusca[];
  /** Link no fim da lista (ex.: "Exibir todas as localizações") */
  verTodos?: OpcaoBusca;
}

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Campo de busca com lista suspensa: digitar filtra, Enter ou clique abre a página escolhida */
export default function BuscaSelecao({ rotulo, placeholder, icone, opcoes, verTodos }: Props) {
  const router = useRouter();
  const id = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const [texto, setTexto] = useState('');
  const [aberto, setAberto] = useState(false);
  const [destaque, setDestaque] = useState(0);

  const filtradas = useMemo(() => {
    const t = semAcento(texto.trim());
    return t ? opcoes.filter(o => semAcento(o.rotulo).includes(t)) : opcoes;
  }, [texto, opcoes]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => { if (!raiz.current?.contains(e.target as Node)) setAberto(false); };
    document.addEventListener('mousedown', fora);
    return () => document.removeEventListener('mousedown', fora);
  }, [aberto]);

  function teclado(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setAberto(true); setDestaque(d => Math.min(d + 1, filtradas.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setDestaque(d => Math.max(d - 1, 0)); }
    else if (e.key === 'Enter' && aberto && filtradas[destaque]) { e.preventDefault(); router.push(filtradas[destaque].href); }
    else if (e.key === 'Escape') setAberto(false);
  }

  const Icone = icone === 'local' ? IconeLocal : IconeGrafico;
  return (
    <div className={styles.busca} ref={raiz}>
      <label className="rotulo-campo" htmlFor={id}>{rotulo}</label>
      <div className={styles.campo}>
        <Icone className={styles.icone} />
        <input
          id={id} type="text" autoComplete="off" placeholder={placeholder} value={texto}
          role="combobox" aria-expanded={aberto} aria-controls={`${id}-lista`} aria-autocomplete="list"
          aria-activedescendant={aberto && filtradas[destaque] ? `${id}-${destaque}` : undefined}
          onChange={e => { setTexto(e.target.value); setAberto(true); setDestaque(0); }}
          onFocus={() => setAberto(true)} onClick={() => setAberto(true)} onKeyDown={teclado}
        />
      </div>
      {aberto && (
        <div className={styles.lista}>
          <ul id={`${id}-lista`} role="listbox" aria-label={rotulo}>
            {filtradas.length ? filtradas.map((o, i) => (
              <li key={o.href} id={`${id}-${i}`} role="option" aria-selected={i === destaque}>
                <Link href={o.href} onMouseEnter={() => setDestaque(i)}>
                  {o.rotulo} <IconeSeta tamanho={18} />
                </Link>
              </li>
            )) : <li className={styles.nada}>Nenhum resultado para “{texto}”</li>}
          </ul>
          {verTodos && <Link className={styles.verTodos} href={verTodos.href}>{verTodos.rotulo}</Link>}
        </div>
      )}
    </div>
  );
}
