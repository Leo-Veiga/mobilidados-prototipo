'use client';

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import type { ChartConfiguration, ChartType, TooltipItem } from 'chart.js';
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
}

export default function Grafico({ config, altura = 300, descricao, imagem }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [gerando, setGerando] = useState(false);

  useEffect(() => {
    // O construtor não aceita a união de tipos; cada membro dela é uma configuração válida.
    // Resolução mínima de 2x, para a imagem baixada ficar nítida mesmo em telas comuns.
    const grafico = new Chart(canvas.current!, {
      ...config,
      options: { ...config.options, devicePixelRatio: Math.max(window.devicePixelRatio || 1, 2) },
    } as ChartConfiguration);
    return () => grafico.destroy();
  }, [config]);

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
        <button type="button" className={styles.botao} onClick={baixar} disabled={gerando}>
          <IconeImagem tamanho={18} /> {gerando ? 'Gerando…' : 'Baixar imagem'}
        </button>
      </div>
    </figure>
  );
}
