'use client';

import { useMemo, useState } from 'react';
import { fmt } from '@/lib/formato';
import { enmu } from '@/lib/enmu';
import styles from './Enmu.module.css';

const sem = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Lista dos projetos do ENMU com filtros e a situação registrada no acompanhamento */
export default function ListaProjetos() {
  const [rm, setRm] = useState('');
  const [tec, setTec] = useState('');
  const [busca, setBusca] = useState('');
  const tecnologias = useMemo(() => [...new Set(enmu.projetos.map(p => p.tecnologia))].sort(), []);

  const lista = enmu.projetos
    .filter(p => (!rm || p.rm === rm) && (!tec || p.tecnologia === tec) && (!busca || sem(p.nome).includes(sem(busca))))
    .sort((a, b) => a.rm.localeCompare(b.rm) || b.km - a.km);

  return (
    <section className={styles.bloco} aria-labelledby="titulo-projetos">
      <h2 id="titulo-projetos" className={styles.h2}>Projetos</h2>
      <div className={styles.filtros}>
        <label className={styles.grupo}>
          <span className={styles.rotulo}>Região metropolitana</span>
          <select className={styles.select} value={rm} onChange={e => setRm(e.target.value)}>
            <option value="">Todas</option>
            {enmu.rms.map(r => <option key={r.nome}>{r.nome}</option>)}
          </select>
        </label>
        <label className={styles.grupo}>
          <span className={styles.rotulo}>Tecnologia</span>
          <select className={styles.select} value={tec} onChange={e => setTec(e.target.value)}>
            <option value="">Todas</option>
            {tecnologias.map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className={styles.grupo}>
          <span className={styles.rotulo}>Buscar projeto</span>
          <input className={styles.select} type="search" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Ex.: Linha 2" />
        </label>
      </div>
      <p className="nota">{lista.length} registros. Eixos com duas tecnologias possíveis aparecem uma vez para cada opção (marcados com *).</p>
      <div className={`${styles.rolagem} ${styles.alta}`}>
        <table className={styles.tabela}>
          <thead>
            <tr><th>Projeto</th><th>Região</th><th>Tecnologia</th><th>km</th><th>Estágio no ENMU</th><th>Investimento (R$ mi)</th><th>Situação</th></tr>
          </thead>
          <tbody>
            {lista.map(p => (
              <tr key={p.id}>
                <td>{p.nome}{p.alternativa && ' *'}</td>
                <td>{p.rm}</td>
                <td>{p.tecnologia}</td>
                <td>{fmt(p.km, 1)}</td>
                <td>{p.estagio}</td>
                <td>{fmt(p.investimento, 0)}</td>
                <td>{p.situacao ? `${p.situacao} (${p.anoSituacao})` : <span className={styles.apagado}>sem registro</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
