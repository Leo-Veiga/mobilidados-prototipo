'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ChartConfiguration, Plugin } from 'chart.js';
import BotaoDados from '@/components/BotaoDados';
import Grafico, { COR_SECUNDARIA, PALETA } from '@/components/Grafico';
import { baixarCSV } from '@/lib/csv';
import { fmt } from '@/lib/formato';
import { REGIOES } from '@/lib/regioes';
import type { Lugar, Nivel, Serie } from '@/lib/tipos';
import SecaoSerie from './SecaoSerie';
import styles from './GraficosIndicador.module.css';

export interface DadosNivel {
  codigo: string;
  /** { slugDoLocal: { ano: valor } } */
  series: Record<string, Serie>;
  lugares: Lugar[];
}

interface Props {
  nome: string;
  unidade: string;
  niveis: Partial<Record<Nivel, DadosNivel>>;
  /** Mostra a seção "Série histórica" (padrão: sim) */
  serie?: boolean;
}

const TEXTO: Record<Nivel, { plural: string; conjunto: string; um: string }> = {
  capitais: { plural: 'Capitais', conjunto: 'as capitais', um: 'uma capital' },
  rms: { plural: 'Regiões metropolitanas', conjunto: 'as regiões metropolitanas', um: 'uma região metropolitana' },
};

/** Página de um indicador: ranking entre os locais (dado mais recente) e série histórica.
    Quando o indicador existe para capitais e RMs, dá para alternar entre os dois. */
/** Ano que mais se repete entre os locais (empate: o mais recente) */
function anoPredominante(anos: number[]): number {
  const n = new Map<number, number>();
  anos.forEach(a => n.set(a, (n.get(a) ?? 0) + 1));
  return [...n].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? 0;
}

function mediana(v: number[]): number {
  const o = [...v].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
}

/** Linha vertical tracejada com a mediana dos locais exibidos (sai também na imagem baixada) */
function pluginMediana(valor: number): Plugin<'bar'> {
  return {
    id: 'mediana',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      const x = scales.x.getPixelForValue(valor);
      const cor = getComputedStyle(chart.canvas).color || '#888';
      ctx.save();
      ctx.strokeStyle = cor;
      ctx.globalAlpha = 0.8;
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = cor;
      ctx.font = '600 12px "Open Sans", sans-serif';
      const texto = `Mediana: ${fmt(valor, 1)}`;
      const largura = ctx.measureText(texto).width;
      ctx.textAlign = x + 6 + largura > chartArea.right ? 'right' : 'left';
      ctx.fillText(texto, ctx.textAlign === 'right' ? x - 6 : x + 6, chartArea.top - 6);
      ctx.restore();
    },
  };
}

export default function GraficosIndicador({ nome, unidade, niveis, serie = true }: Props) {
  const disponiveis = (['capitais', 'rms'] as Nivel[]).filter(n => niveis[n]);
  // ?local=recife (ou ?local=rmr) vem da página do local e define o nível e o destaque
  const doEndereco = useSearchParams().get('local') ?? '';
  const nivelDoEndereco = disponiveis.find(n => niveis[n]!.series[doEndereco]);
  const [nivel, setNivel] = useState<Nivel>(nivelDoEndereco ?? disponiveis[0]);
  const [destaque, setDestaque] = useState(nivelDoEndereco ? doEndereco : '');
  const { codigo, series, lugares } = niveis[nivel]!;
  const t = TEXTO[nivel];

  /** Locais do nível que têm dado, em ordem alfabética */
  const comDado = useMemo(
    () => lugares.filter(l => series[l.slug]).sort((a, b) => (a.curto ?? a.nome).localeCompare(b.curto ?? b.nome, 'pt-BR')),
    [lugares, series],
  );
  const todos = (n: Nivel) => new Set(niveis[n]!.lugares.filter(l => niveis[n]!.series[l.slug]).map(l => l.slug));
  // Começa com todos os locais que têm dado
  const [selecionados, setSelecionados] = useState<Set<string>>(() => todos(nivel));
  const [comMediana, setComMediana] = useState(true);
  const regioes = REGIOES.filter(r => comDado.some(l => l.regiao === r));

  function trocarNivel(n: Nivel) {
    setNivel(n);
    setDestaque('');
    setSelecionados(todos(n));
  }

  function alternar(slug: string) {
    const s = new Set(selecionados);
    if (s.has(slug)) s.delete(slug); else s.add(slug);
    setSelecionados(s);
  }

  const ranking = useMemo(() => comDado
    .filter(l => selecionados.has(l.slug))
    .map(l => {
      const ano = Math.max(...Object.keys(series[l.slug]).map(Number));
      return { l, ano, v: series[l.slug][ano] };
    })
    .sort((a, b) => b.v - a.v), [comDado, selecionados, series]);

  // Ano no título; quem tem dado de outro ano ganha asterisco e entra na nota.
  // Se menos da metade dos locais tiver o ano predominante, o título fica sem ano e a nota lista o ano de cada um.
  const anoMaisComum = anoPredominante(ranking.map(x => x.ano));
  const misto = ranking.filter(x => x.ano === anoMaisComum).length * 2 < ranking.length;
  const ano = misto ? 0 : anoMaisComum;
  const excecoes = misto ? [] : ranking.filter(x => x.ano !== ano);
  const nota = misto
    ? `Ano de cada local: ${ranking.map(x => `${x.l.curto ?? x.l.nome} ${x.ano}`).join(' · ')}.`
    : excecoes.length
      ? `* Dado mais recente de outro ano: ${excecoes.map(x => `${x.l.curto ?? x.l.nome} (${x.ano})`).join(', ')}.`
      : '';
  const rotuloAno = misto ? 'dado mais recente de cada local' : String(ano);
  const med = ranking.length ? mediana(ranking.map(x => x.v)) : 0;
  const mostraMediana = comMediana && ranking.length > 1;
  const destaqueAtivo = ranking.some(x => x.l.slug === destaque) ? destaque : '';

  const config = useMemo<ChartConfiguration<'bar'>>(() => ({
    type: 'bar',
    data: {
      labels: ranking.map(x => `${x.l.curto ?? x.l.nome}${!misto && x.ano !== ano ? '*' : ''}`),
      datasets: [{
        label: unidade, data: ranking.map(x => x.v), borderRadius: 4,
        backgroundColor: ranking.map(x => (!destaqueAtivo || x.l.slug === destaqueAtivo ? PALETA[0] : COR_SECUNDARIA)),
      }],
    },
    options: {
      indexAxis: 'y',
      layout: { padding: { top: mostraMediana ? 22 : 0 } }, // espaço para o rótulo da mediana
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { callback: v => fmt(Number(v), 1) } }, y: { ticks: { autoSkip: false } } },
    },
    plugins: mostraMediana ? [pluginMediana(med)] : [],
  }), [ranking, destaqueAtivo, unidade, ano, misto, med, mostraMediana]);

  const localDestaque = ranking.find(x => x.l.slug === destaqueAtivo)?.l;

  function baixar() {
    const linhas: (string | number)[][] = [['local', 'ano', 'indicador', 'descricao', 'unidade', 'valor']];
    lugares.forEach(l => Object.entries(series[l.slug] ?? {}).forEach(([a, v]) => linhas.push([l.nome, +a, codigo, nome, unidade, v])));
    baixarCSV(`mobilidados_${nivel}_${codigo.replace(/[^\w]+/g, '_')}`, linhas);
  }

  return (
    <>
      <div className={styles.controles}>
        {disponiveis.length > 1 && (
          <fieldset className={styles.nivel}>
            <legend className="rotulo-campo">Comparar</legend>
            {disponiveis.map(n => (
              <label key={n}>
                <input type="radio" name="nivel" checked={nivel === n} onChange={() => trocarNivel(n)} /> {TEXTO[n].plural}
              </label>
            ))}
          </fieldset>
        )}
        <div className={styles.destaque}>
          <label className="rotulo-campo" htmlFor="destaque">Destacar {t.um}</label>
          <select id="destaque" className="campo" value={destaqueAtivo} onChange={e => setDestaque(e.target.value)}>
            <option value="">Nenhum destaque</option>
            {ranking.map(x => <option key={x.l.slug} value={x.l.slug}>{x.l.curto ?? x.l.nome}</option>)}
          </select>
        </div>
      </div>

      <fieldset className={styles.selecao}>
        <legend className="rotulo-campo">{t.plural} exibidas ({selecionados.size} de {comDado.length})</legend>
        <div className={styles.atalhos}>
          <button type="button" className={styles.atalho} onClick={() => setSelecionados(todos(nivel))}>Todas</button>
          <button type="button" className={styles.atalho} onClick={() => setSelecionados(new Set())}>Nenhuma</button>
          {regioes.length > 1 && regioes.map(r => (
            <button key={r} type="button" className={styles.atalho}
              onClick={() => setSelecionados(new Set(comDado.filter(l => l.regiao === r).map(l => l.slug)))}>
              {r}
            </button>
          ))}
        </div>
        <details className={styles.lista}>
          <summary>Escolher {t.conjunto.replace(/^as /, '')} uma a uma</summary>
          <div className={styles.caixas}>
            {comDado.map(l => (
              <label key={l.slug}>
                <input type="checkbox" checked={selecionados.has(l.slug)} onChange={() => alternar(l.slug)} /> {l.curto ?? l.nome}
              </label>
            ))}
          </div>
        </details>
      </fieldset>

      <section className={styles.bloco} aria-labelledby="titulo-ranking">
        <h2 id="titulo-ranking" className={styles.titulo}>Comparação entre {t.conjunto}{ranking.length ? ` — ${rotuloAno}` : ''}</h2>
        <p className={styles.texto}>
          {misto ? `Valor mais recente de cada local (${unidade}); o ano de cada um está na nota abaixo do gráfico.` : `Valor de ${ano || '—'} (${unidade})${excecoes.length ? ', ou o mais recente disponível (*)' : ''}.`}
          {mostraMediana && ' Linha tracejada: mediana dos locais exibidos.'}
        </p>
        <div className="cartao">
          {ranking.length ? (
            <Grafico
              config={config} altura={Math.max(320, ranking.length * 24 + 80)} descricao={`${nome}: comparação entre ${t.conjunto}`}
              alternancias={ranking.length > 1 ? [{ ativo: comMediana, aoAlternar: () => setComMediana(!comMediana), ligado: 'Ocultar mediana', desligado: 'Mostrar mediana' }] : []}
              imagem={{
                titulo: `${nome} — comparação entre ${t.conjunto} (${rotuloAno})`,
                subtitulo: `${unidade}${excecoes.length ? ' · * dado mais recente de outro ano' : ''}`
                  + (mostraMediana ? ` · mediana ${fmt(med, 1)}` : '')
                  + (localDestaque ? ` · em destaque: ${localDestaque.curto ?? localDestaque.nome}` : ''),
              }}
            />
          ) : <p className="centro nota">Selecione ao menos um local para ver a comparação.</p>}
          {nota && <p className={styles.nota}>{nota}</p>}
        </div>
      </section>

      {serie && <section className={styles.bloco} aria-labelledby="titulo-serie">
        <h2 id="titulo-serie" className={styles.titulo}>Série histórica</h2>
        <p className={styles.texto}>
          Compare o desempenho de dois ou mais locais em um ano específico ou ao longo do tempo.
          A comparação está sujeita à disponibilidade dos dados.
        </p>
        <SecaoSerie
          key={nivel + destaque} series={series} titulo={nome} unidade={unidade} lugares={lugares}
          iniciais={destaque ? [destaque] : []} rotuloLugar={t.plural}
        />
      </section>}

      <div className="centro"><BotaoDados onClick={baixar} texto="Baixar os dados deste indicador (CSV)" /></div>
    </>
  );
}
