'use client';

import { useMemo, useState } from 'react';
import Grafico, { type ConfigGrafico } from '@/components/Grafico';
import { fmt } from '@/lib/formato';
import { COR_MODO, tma, type PorAno } from '@/lib/tma';
import styles from './GraficoTMA.module.css';

type Medida = 'km' | 'estacoes';
type Visao = 'acumulado' | 'anual';

const NOME_MEDIDA: Record<Medida, string> = { km: 'Extensão (km)', estacoes: 'Estações' };

/** Grupo de botões em que só um fica marcado */
function Opcoes<T extends string>({ rotulo, valor, opcoes, aoMudar }:
  { rotulo: string; valor: T; opcoes: [T, string][]; aoMudar: (v: T) => void }) {
  return (
    <div className={styles.grupo} role="radiogroup" aria-label={rotulo}>
      <span className={styles.rotulo}>{rotulo}</span>
      <div className={styles.botoes}>
        {opcoes.map(([v, texto]) => (
          <button key={v} type="button" role="radio" aria-checked={v === valor}
            className={styles.opcao} onClick={() => aoMudar(v)}>{texto}</button>
        ))}
      </div>
    </div>
  );
}

/** Evolução da rede de TMA por ano e por modo, com filtros */
export default function GraficoTMA() {
  const [sistema, setSistema] = useState('Brasil');
  const [medida, setMedida] = useState<Medida>('km');
  const [visao, setVisao] = useState<Visao>('acumulado');
  const [projecao, setProjecao] = useState(true);

  const serie = tma.series[sistema];
  const hoje = tma.anos[tma.anos.length - 1];
  const casas = medida === 'km' ? 1 : 0;

  const { config, resumo } = useMemo(() => {
    const porModo = serie[medida];
    const modos = tma.modos.filter(m => Object.keys(porModo[m]).length);
    const proj: PorAno = medida === 'km' ? serie.kmProj : serie.estacoesProj;
    const temProj = visao === 'acumulado' && projecao && Object.keys(proj).length > 0;
    // No modo anual, o primeiro ano (que soma tudo o que é anterior) fica de fora
    const anos = visao === 'anual' ? tma.anos.slice(1) : tma.anos;
    const rotulos = temProj ? [...anos, ...tma.anosProjecao.filter(a => a > hoje)] : anos;

    const acumulada = (valores: PorAno) => {
      let soma = 0;
      return tma.anos.map(a => (soma += valores[a] ?? 0));
    };
    const datasets = modos.map(m => {
      const dados = visao === 'acumulado' ? acumulada(porModo[m]) : anos.map(a => porModo[m][a] ?? 0);
      return {
        label: m, data: dados.map(v => Math.round(v * 10) / 10),
        backgroundColor: COR_MODO[m] + (visao === 'acumulado' ? 'cc' : ''), borderColor: COR_MODO[m],
        fill: visao === 'acumulado', pointRadius: 0, borderWidth: 1.5, tension: 0, stack: 'rede',
      };
    });
    const totalHoje = modos.reduce((s, m) => s + Object.values(porModo[m]).reduce((a, b) => a + b, 0), 0);
    if (temProj) {
      let soma = totalHoje;
      const dadosProj = rotulos.map(a => {
        if (a < hoje) return null;
        soma += proj[a] ?? 0;
        return Math.round(soma * 10) / 10;
      });
      datasets.push({
        label: 'Previsto (planejado e em construção)', data: dadosProj as number[],
        backgroundColor: 'transparent', borderColor: '#ffffff', fill: false, pointRadius: 0,
        borderWidth: 2, tension: 0, stack: 'previsto',
        // @ts-expect-error opção válida do Chart.js para linhas
        borderDash: [6, 5],
      });
    }

    const nome = sistema === 'Brasil' ? 'Brasil' : sistema;
    const titulo = visao === 'acumulado'
      ? `${NOME_MEDIDA[medida]} da rede de TMA em operação, por modo — ${nome}`
      : `${NOME_MEDIDA[medida]} de TMA inaugurada em cada ano, por modo — ${nome}`;
    const cfg = {
      type: visao === 'acumulado' ? 'line' : 'bar',
      data: { labels: rotulos.map(String), datasets },
      options: {
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 12 } },
          y: { stacked: true, beginAtZero: true, ticks: { callback: (v: number | string) => fmt(Number(v), 0) } },
        },
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
          tooltip: {
            filter: (i: { parsed: { y: number | null } }) => i.parsed.y !== null && i.parsed.y !== 0,
            callbacks: {
              footer: (itens: { dataset: { stack?: string }; parsed: { y: number } }[]) => {
                const rede = itens.filter(i => i.dataset.stack === 'rede');
                return rede.length > 1 ? `Total: ${fmt(rede.reduce((s, i) => s + i.parsed.y, 0), casas)}` : '';
              },
            },
          },
        },
      },
    } as unknown as ConfigGrafico;
    return {
      config: cfg,
      resumo: { titulo, totalHoje, modos: modos.length, proj: Object.values(proj).reduce((a, b) => a + b, 0) },
    };
  }, [serie, medida, visao, projecao, sistema, hoje, casas]);

  const info = tma.sistemas.find(s => s.nome === sistema);
  const unidade = medida === 'km' ? ' km' : ' estações';

  return (
    <section className={styles.bloco} aria-labelledby="titulo-grafico-tma">
      <h2 id="titulo-grafico-tma" className={styles.titulo}>Explore a evolução da rede</h2>

      <div className={styles.filtros}>
        <label className={styles.grupo}>
          <span className={styles.rotulo}>Sistema</span>
          <select className={styles.select} value={sistema} onChange={e => setSistema(e.target.value)}>
            <option value="Brasil">Brasil (todos os sistemas)</option>
            {tma.sistemas.map(s => <option key={s.nome} value={s.nome}>{s.nome}</option>)}
          </select>
        </label>
        <Opcoes rotulo="Medida" valor={medida} aoMudar={setMedida} opcoes={[['km', 'Extensão (km)'], ['estacoes', 'Estações']]} />
        <Opcoes rotulo="Visão" valor={visao} aoMudar={setVisao} opcoes={[['acumulado', 'Rede acumulada'], ['anual', 'Inaugurado no ano']]} />
        <label className={`${styles.grupo} ${styles.check}`} aria-disabled={visao !== 'acumulado'}>
          <input type="checkbox" checked={projecao} disabled={visao !== 'acumulado'} onChange={e => setProjecao(e.target.checked)} />
          <span>Mostrar o previsto até 2030</span>
        </label>
      </div>

      <p className={styles.legenda}>
        <strong>{resumo.titulo}.</strong>{' '}
        Em operação hoje: <strong>{fmt(resumo.totalHoje, casas)}{unidade}</strong>
        {info && <> em {info.municipios} {info.municipios === 1 ? 'município' : 'municípios'}</>}.
        {resumo.proj > 0 && <> Previsto com data até 2030: +{fmt(resumo.proj, casas)}{unidade}.</>}
        {' '}Clique num modo na legenda para escondê-lo ou mostrá-lo.
      </p>

      <Grafico
        config={config} altura={420}
        descricao={`${resumo.titulo}, de ${tma.inicioGrafico} a ${hoje}`}
        imagem={{ titulo: resumo.titulo, subtitulo: `${tma.inicioGrafico}–${hoje}`, fonte: 'Mapa de TMA — ITDP Brasil / MobiliDADOS' }}
      />

      <ul className={`nota ${styles.notas}`}>
        <li>A série é reconstruída pelo ano de inauguração de cada trecho no mapa atual; trechos já desativados não aparecem no passado.</li>
        <li>{tma.inicioGrafico} inclui tudo o que foi inaugurado antes desse ano.</li>
        {tma.avisos.estacoesSemAno > 0 && medida === 'estacoes' && (
          <li>{tma.avisos.estacoesSemAno} estações em operação não têm ano de inauguração no mapa: contam no total de hoje, mas não na série.</li>
        )}
        {tma.avisos.previstosSemAno > 0 && (
          <li>{tma.avisos.previstosSemAno} trechos planejados ou em construção não têm ano previsto e ficam fora da projeção.</li>
        )}
      </ul>
    </section>
  );
}
