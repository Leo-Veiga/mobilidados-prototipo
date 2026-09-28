'use client';

import { useMemo, useState } from 'react';
import type { ChartConfiguration } from 'chart.js';
import BotaoDados from '@/components/BotaoDados';
import Grafico, { COR_SECUNDARIA, PALETA } from '@/components/Grafico';
import { baixarCSV } from '@/lib/csv';
import { GRUPOS_INFRA, rotulo } from '@/lib/indicadores';
import type { Indicadores, Lugar } from '@/lib/tipos';
import styles from './Indicadores.module.css';

interface Props {
  ind: Indicadores;
  lugares: Lugar[];
  /** slug do local em destaque */
  atual: string;
  /** Como chamar o conjunto comparado: "as capitais", "as regiões metropolitanas" */
  conjunto: string;
}

/** Último ano com dado de um indicador em um local */
function ultimoAno(ind: Indicadores, k: string, lugar: string): number | null {
  const anos = Object.keys(ind[k]?.[lugar] ?? {}).map(Number);
  return anos.length ? Math.max(...anos) : null;
}

/** Seção "Distribuição da infraestrutura de mobilidade urbana" */
export default function SecaoInfra({ ind, lugares, atual, conjunto }: Props) {
  const grupos = useMemo(() => GRUPOS_INFRA.filter(g => g.partes.some(([k]) => ind[k])), [ind]);
  const [grupoId, setGrupoId] = useState(grupos[0].id);
  const g = grupos.find(x => x.id === grupoId)!;
  const nomeAtual = lugares.find(l => l.slug === atual)?.nome ?? atual;

  // Gráfico 1: composição no local em destaque (último ano disponível)
  const ano = Math.max(0, ...g.partes.map(([k]) => ultimoAno(ind, k, atual) ?? 0));
  const composicao = useMemo<ChartConfiguration<'bar'>>(() => ({
    type: 'bar',
    data: {
      labels: g.partes.map(p => p[1]),
      datasets: [{ label: '%', data: g.partes.map(([k]) => ind[k]?.[atual]?.[ano] ?? null), backgroundColor: g.partes.map((_, i) => PALETA[i]) }],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, suggestedMax: 100, ticks: { callback: v => v + '%' } } } },
  }), [g, ind, atual, ano]);

  // Gráfico 2: comparação entre locais (indicador total, último ano de cada um)
  const comparacao = useMemo(() => lugares
    .map(l => ({ l, ano: ultimoAno(ind, g.total, l.slug) }))
    .filter((x): x is { l: Lugar; ano: number } => x.ano != null)
    .map(x => ({ ...x, v: ind[g.total][x.l.slug][x.ano] }))
    .sort((a, b) => b.v - a.v), [g, ind, lugares]);
  const configComparacao = useMemo<ChartConfiguration<'bar'>>(() => ({
    type: 'bar',
    data: {
      labels: comparacao.map(x => `${x.l.curto ?? x.l.nome} (${x.ano})`),
      datasets: [{ label: '%', data: comparacao.map(x => x.v), backgroundColor: comparacao.map(x => (x.l.slug === atual ? PALETA[0] : COR_SECUNDARIA)) }],
    },
    options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { callback: v => v + '%' } }, y: { ticks: { autoSkip: false } } } },
  }), [comparacao, atual]);

  function baixar() {
    const linhas: (string | number)[][] = [['local', 'ano', 'indicador', 'descricao', 'valor_%']];
    lugares.forEach(l => g.partes.forEach(([k]) =>
      Object.entries(ind[k]?.[l.slug] ?? {}).forEach(([a, v]) => linhas.push([l.nome, +a, k, rotulo(k), v]))));
    baixarCSV('mobilidados_infraestrutura_' + g.id, linhas);
  }

  return (
    <>
      <div className={`${styles.filtros} ${styles.filtrosUm}`}>
        <div>
          <label className="rotulo-campo" htmlFor="infra-grupo">Indicador</label>
          <select id="infra-grupo" className="campo" value={grupoId} onChange={e => setGrupoId(e.target.value)}>
            {grupos.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
          </select>
        </div>
      </div>
      <div className={styles.lado}>
        <div className="cartao">
          <h3>{nomeAtual}{ano ? ` — ${ano}` : ''}</h3>
          {ano
            ? <Grafico
                config={composicao} descricao={`${g.nome} em ${nomeAtual}, ${ano}`}
                imagem={{ titulo: `${g.nome} — ${nomeAtual}`, subtitulo: `% da população de cada grupo · ${ano}`, fonte: 'ITDP Brasil / MobiliDADOS' }}
              />
            : <div className="vazio" style={{ height: 300 }}>Não há dados deste indicador para este local.</div>}
          {ano > 0 && <p className="fonte-dado">Fonte: ITDP. Percentual da população de cada grupo que vive a até 1 km (PNT) ou 300 m (PNB) da infraestrutura.</p>}
        </div>
        <div className="cartao">
          <h3>{rotulo(g.total)} — comparação</h3>
          <Grafico
            config={configComparacao} altura={Math.max(300, comparacao.length * 22 + 60)} descricao={`${rotulo(g.total)}: comparação entre locais`}
            imagem={{ titulo: `${rotulo(g.total)} — comparação entre ${conjunto}`, subtitulo: `% · dado mais recente de cada local (ano entre parênteses) · em destaque: ${nomeAtual}`, fonte: 'ITDP Brasil / MobiliDADOS' }}
          />
          <p className="fonte-dado">Em destaque, o local selecionado. Entre parênteses, o ano do dado mais recente.</p>
        </div>
      </div>
      <div className="centro"><BotaoDados onClick={baixar} /></div>
    </>
  );
}
