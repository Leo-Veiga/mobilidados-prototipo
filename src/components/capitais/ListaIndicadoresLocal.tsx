'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { IconeBusca, IconeEqualizador } from '@/components/Icones';
import { fmt } from '@/lib/formato';
import styles from './ListaIndicadoresLocal.module.css';

export interface ItemIndicador {
  slug: string;
  nome: string;
  unidade: string;
  /** Valor mais recente neste local (ausente se não houver dado) */
  valor?: number;
  ano?: number;
}

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Lista de indicadores com o valor mais recente do local e link para a página de cada um */
export default function ListaIndicadoresLocal({ itens, local }: { itens: ItemIndicador[]; local: string }) {
  const [texto, setTexto] = useState('');
  const filtrados = useMemo(() => {
    const t = semAcento(texto.trim());
    return t ? itens.filter(i => semAcento(i.nome).includes(t)) : itens;
  }, [texto, itens]);

  return (
    <div className={styles.painel}>
      <p>Acesse todos os indicadores monitorados pela MobiliDADOS. Clique em um indicador para comparar com as outras capitais.</p>
      <label className="rotulo-campo" htmlFor="filtro-indicador">Buscar por um indicador</label>
      <div className={styles.campo}>
        <IconeBusca className={styles.icone} />
        <input
          id="filtro-indicador" type="text" autoComplete="off" placeholder="Filtre por um indicador"
          value={texto} onChange={e => setTexto(e.target.value)}
        />
      </div>
      <div className={styles.cabecalho} aria-hidden="true">
        <span>Nome do indicador</span>
        <span>Valor mais recente</span>
      </div>
      <ul className={styles.lista}>
        {filtrados.map(i => (
          <li key={i.slug}>
            <Link href={`/indicadores/${i.slug}/?local=${local}`}>
              <IconeEqualizador />
              <span className={styles.nome}>{i.nome}</span>
              <span className={styles.valor}>
                {i.valor != null
                  ? <>{fmt(i.valor, 2)} <small>{i.unidade} · {i.ano}</small></>
                  : <small>sem dado</small>}
              </span>
            </Link>
          </li>
        ))}
        {!filtrados.length && <li className="nota">Nenhum indicador encontrado.</li>}
      </ul>
    </div>
  );
}
