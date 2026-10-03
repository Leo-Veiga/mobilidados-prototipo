'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { IconeBusca, IconeEqualizador } from '@/components/Icones';
import { fmt } from '@/lib/formato';
import { agruparPorTema } from '@/lib/temas';
import styles from './ListaIndicadoresLocal.module.css';

export interface ItemIndicador {
  slug: string;
  nome: string;
  unidade: string;
  tema: string;
  ordem: number;
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
      <p>Acesse todos os indicadores monitorados pela MobiliDADOS. Clique em um indicador para comparar com os outros locais.</p>
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
      {agruparPorTema(filtrados).map(g => (
        <section key={g.tema} className={styles.tema}>
          <h3 className={styles.nomeTema}>{g.tema}</h3>
          <ul className={styles.lista}>
            {g.itens.map(i => (
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
          </ul>
        </section>
      ))}
      {!filtrados.length && <p className="nota">Nenhum indicador encontrado.</p>}
    </div>
  );
}
