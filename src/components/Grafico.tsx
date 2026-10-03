'use client';

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import type { ChartConfiguration, ChartType, Plugin, TooltipItem } from 'chart.js';
import { fmt } from '@/lib/formato';
import { baixarImagemGrafico, type InfoImagem } from '@/lib/imagemGrafico';
import { IconeImagem } from './Icones';
import styles from './Grafico.module.css';

// Tema escuro, com as cores e a fonte do site
Chart.defaults.color = '#fff';
Chart.defaults.font.family = '"Open Sans", Helvetica, Arial, sans-serif';
Chart.defaults.borderColor = 'rgba(255,255,255,.1)';
Chart.defaults.maintainAspectRatio = false;
Chart.defaults.plugins.tooltip.callbacks.label = (c: TooltipItem<ChartType>) => {
  const p = c.parsed as { x: number; y: number };
  const v = c.chart.options.indexAxis === 'y' ? p.x : p.y;
  return ` ${c.dataset.label ? c.dataset.label + ': ' : ''}${fmt(v, 2)}`;
};

// Começa pelo verde e o azul da marca
export const PALETA = ['#64eaa6', '#54c7dd', '#f5b841', '#ef6f8e', '#b39ddb', '#e8e15a', '#ff8a5b', '#2ab870', '#6f94ff', '#1f95ab',
  '#f48fb1', '#c5e1a5', '#ffcc80', '#90caf9', '#ce93d8', '#80deea', '#ffab91', '#a1ffcf', '#fff59d', '#b0bec5'];
/** Cor das barras dos outros locais quando um local está em destaque */
export const COR_SECUNDARIA = '#2f5f48';

/** Escreve os valores no gráfico: nas barras, todos; nas linhas, só o primeiro e o último ponto de cada série.
    Como é desenhado no próprio canvas, os valores também saem na imagem baixada. */
const pluginValores: Plugin = {
  id: 'valores',
  afterDatasetsDraw(chart) {
    const rotulos: { x: number; y: number; texto: string; cor: string }[] = [];
    chart.data.datasets.forEach((ds, i) => {
      const meta = chart.getDatasetMeta(i);
      if (meta.hidden || !chart.isDatasetVisible(i)) return;
      const dados = ds.data as (number | null)[];
      const comValor = dados.map((v, k) => (v == null ? -1 : k)).filter(k => k >= 0);
      if (!comValor.length) return;
      const barra = meta.type === 'bar';
      const indices = barra ? comValor : [...new Set([comValor[0], comValor[comValor.length - 1]])];
      for (const k of indices) {
        const el = meta.data[k];
        if (el) rotulos.push({ x: el.x, y: el.y - (barra ? 4 : 8), texto: fmt(dados[k] as number, 1), cor: barra ? '#fff' : String(ds.borderColor ?? '#fff') });
      }
    });

    // Rótulos na mesma coluna que ficariam sobrepostos são afastados verticalmente
    const ALTURA = 14;
    const colunas = new Map<number, typeof rotulos>();
    for (const r of rotulos) {
      const chave = Math.round(r.x / 30);
      colunas.set(chave, [...(colunas.get(chave) ?? []), r]);
    }
    for (const col of colunas.values()) {
      col.sort((a, b) => b.y - a.y); // de baixo para cima
      for (let k = 1; k < col.length; k++) {
        if (Math.abs(col[k].x - col[k - 1].x) < 30 && col[k - 1].y - col[k].y < ALTURA) col[k].y = col[k - 1].y - ALTURA;
      }
    }

    const ctx = chart.ctx;
    ctx.save();
    ctx.font = '600 12px "Open Sans", Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0e110f'; // contorno escuro para o número ficar legível sobre linhas e grades
    for (const r of rotulos) {
      ctx.strokeText(r.texto, r.x, r.y);
      ctx.fillStyle = r.cor;
      ctx.fillText(r.texto, r.x, r.y);
    }
    ctx.restore();
  },
};

/** Configuração aceita pelo componente: gráficos de barras ou de linhas */
export type ConfigGrafico = ChartConfiguration<'bar'> | ChartConfiguration<'line'>;

interface Props {
  /** Configuração do Chart.js. Memorize com useMemo para não redesenhar a cada render. */
  config: ConfigGrafico;
  altura?: number;
  /** Descrição para leitores de tela */
  descricao: string;
  /** Título, subtítulo e fonte da imagem baixada pelo botão "Baixar imagem" */
  imagem: InfoImagem;
  /** Mostra o botão "Mostrar valores" (valores ligados de início) */
  valores?: boolean;
}

export default function Grafico({ config, altura = 300, descricao, imagem, valores = false }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [gerando, setGerando] = useState(false);
  const [mostrarValores, setMostrarValores] = useState(true);
  const comValores = valores && mostrarValores;

  useEffect(() => {
    // O construtor não aceita a união de tipos; cada membro dela é uma configuração válida.
    // Resolução mínima de 2x, para a imagem baixada ficar nítida mesmo em telas comuns.
    const opcoes = config.options ?? {};
    const grafico = new Chart(canvas.current!, {
      ...config,
      options: {
        ...opcoes,
        devicePixelRatio: Math.max(window.devicePixelRatio || 1, 2),
        // Espaço em cima e nas laterais para os valores não serem cortados
        ...(comValores ? { layout: { padding: { top: 22, left: 16, right: 24 } } } : {}),
      },
      plugins: [...(config.plugins ?? []), ...(comValores ? [pluginValores] : [])],
    } as ChartConfiguration);
    return () => grafico.destroy();
  }, [config, comValores]);

  async function baixar() {
    setGerando(true);
    try { await baixarImagemGrafico(canvas.current!, imagem); } finally { setGerando(false); }
  }

  return (
    <figure className={styles.figura}>
      <div style={{ position: 'relative', height: altura }}>
        <canvas ref={canvas} role="img" aria-label={descricao} />
      </div>
      <div className={styles.acoes}>
        {valores && (
          <button type="button" className={styles.botao} aria-pressed={mostrarValores} onClick={() => setMostrarValores(!mostrarValores)}>
            {mostrarValores ? 'Esconder valores' : 'Mostrar valores'}
          </button>
        )}
        <button type="button" className={styles.botao} onClick={baixar} disabled={gerando}>
          <IconeImagem tamanho={18} /> {gerando ? 'Gerando…' : 'Baixar imagem'}
        </button>
      </div>
    </figure>
  );
}
