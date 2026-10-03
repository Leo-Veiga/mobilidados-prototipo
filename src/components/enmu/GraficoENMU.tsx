'use client';

import { useMemo, useState } from 'react';
import Grafico, { type ConfigGrafico } from '@/components/Grafico';
import { fmt } from '@/lib/formato';
import { ANO_HORIZONTE, enmu } from '@/lib/enmu';
import styles from './Enmu.module.css';

const ANO_ATUAL = new Date().getFullYear();

/** Projeção da implantação dos projetos do ENMU (km acumulados) e o que foi entregue de fato */
export default function GraficoENMU() {
  const [local, setLocal] = useState('Brasil');
  const p = enmu.projecao[local];
  const i54 = enmu.anos.indexOf(ANO_HORIZONTE);
  const rm = enmu.rms.find(r => r.nome === local);

  const config = useMemo(() => {
    // Realizado: soma acumulada do que foi entregue, só até o ano corrente
    const porAno = enmu.entregue[local] ?? {};
    let soma = 0;
    const realizado = enmu.anos.map(a => (a > ANO_ATUAL ? null : (soma += porAno[a] ?? 0)));
    return {
      type: 'line',
      data: {
        labels: enmu.anos.map(String),
        datasets: [
          { label: 'Previsto — opção de menor custo (ex.: BRT)', data: p.min, borderColor: '#64eaa6', backgroundColor: '#64eaa633', fill: false, pointRadius: 0, borderWidth: 2, tension: 0.2 },
          { label: 'Previsto — opção de maior custo (ex.: VLT)', data: p.max, borderColor: '#54c7dd', backgroundColor: 'transparent', fill: false, pointRadius: 0, borderWidth: 2, borderDash: [6, 4], tension: 0.2 },
          { label: 'Entregue (acompanhamento MobiliDADOS)', data: realizado, borderColor: '#f5b841', backgroundColor: '#f5b841', pointRadius: 4, borderWidth: 3, tension: 0 },
        ],
      },
      options: {
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 0, autoSkip: false,
              callback: (_: unknown, idx: number) => {
                const a = enmu.anos[idx];
                return a % 4 === 2 || a === ANO_HORIZONTE ? String(a) : '';
              },
              color: (c: { index: number }) => (enmu.anos[c.index] === ANO_HORIZONTE ? '#f5b841' : '#fff'),
            },
          },
          y: { beginAtZero: true, title: { display: true, text: 'km acumulados' }, ticks: { callback: (v: number | string) => fmt(Number(v), 0) } },
        },
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
      },
    } as unknown as ConfigGrafico;
  }, [local, p]);

  const nome = local === 'Brasil' ? 'as 21 regiões metropolitanas' : local;
  return (
    <section className={styles.bloco} aria-labelledby="titulo-projecao">
      <h2 id="titulo-projecao" className={styles.h2}>Projeção da implantação até {ANO_HORIZONTE} e além</h2>
      <div className={styles.filtros}>
        <label className={styles.grupo}>
          <span className={styles.rotulo}>Região metropolitana</span>
          <select className={styles.select} value={local} onChange={e => setLocal(e.target.value)}>
            <option value="Brasil">Todas (21 RMs)</option>
            {enmu.rms.map(r => <option key={r.nome} value={r.nome}>{r.nome}</option>)}
          </select>
        </label>
      </div>
      <p className={styles.legenda}>
        Em {ANO_HORIZONTE}, {nome} teriam <strong>{fmt(Math.min(p.min[i54], p.max[i54]), 0)} a {fmt(Math.max(p.min[i54], p.max[i54]), 0)} km</strong> dos{' '}
        {fmt(Math.max(p.min[p.min.length - 1], p.max[p.max.length - 1]), 0)} km previstos.
        {rm && <> Prazo estimado pelo ENMU: {rm.prazoMin === rm.prazoMax ? `${rm.prazoMin} anos` : `${rm.prazoMin} a ${rm.prazoMax} anos`} (conclusão em {rm.conclusaoMin === rm.conclusaoMax ? rm.conclusaoMin : `${rm.conclusaoMin}–${rm.conclusaoMax}`}).</>}
      </p>
      <Grafico
        config={config} altura={400}
        descricao={`Quilômetros previstos e entregues dos projetos do ENMU em ${nome}, de 2026 a 2070`}
        imagem={{ titulo: `Projetos do ENMU: km previstos e entregues — ${local === 'Brasil' ? '21 RMs' : local}`, subtitulo: '2026–2070', fonte: 'ENMU (BNDES / Ministério das Cidades); projeção e acompanhamento: MobiliDADOS' }}
      />
      <p className="nota">
        Como a projeção foi feita: o ENMU não define ano para cada projeto, mas estima quanto tempo cada RM levaria para
        concluir todos os seus projetos investindo 0,35% do PIB local por ano (2026–2027 estruturação; 2028–2029 início
        gradual; ritmo pleno a partir de 2030). A MobiliDADOS supõe que os km avançam na mesma proporção do investimento.
        Onde há duas tecnologias possíveis para o mesmo eixo, as linhas mostram a opção mais barata e a mais cara.
      </p>
    </section>
  );
}
