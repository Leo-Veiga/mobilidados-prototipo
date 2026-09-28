'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { ChartConfiguration, ChartType, TooltipItem } from 'chart.js';
import { fmt } from '@/lib/formato';

// Tema escuro, como no site original
Chart.defaults.color = '#fff';
Chart.defaults.font.family = 'Montserrat, Arial, sans-serif';
Chart.defaults.borderColor = 'rgba(255,255,255,.12)';
Chart.defaults.maintainAspectRatio = false;
Chart.defaults.plugins.tooltip.callbacks.label = (c: TooltipItem<ChartType>) => {
  const p = c.parsed as { x: number; y: number };
  const v = c.chart.options.indexAxis === 'y' ? p.x : p.y;
  return ` ${c.dataset.label ? c.dataset.label + ': ' : ''}${fmt(v, 2)}`;
};

export const PALETA = ['#6ef1be', '#48c0d9', '#f5b841', '#ef6f8e', '#b39ddb', '#e8e15a', '#ff8a5b', '#8fd16a', '#6f94ff', '#4dd0c4',
  '#f48fb1', '#c5e1a5', '#ffcc80', '#90caf9', '#ce93d8', '#80deea', '#ffab91', '#a5d6a7', '#fff59d', '#b0bec5'];

/** Configuração aceita pelo componente: gráficos de barras ou de linhas */
export type ConfigGrafico = ChartConfiguration<'bar'> | ChartConfiguration<'line'>;

interface Props {
  /** Configuração do Chart.js. Memorize com useMemo para não redesenhar a cada render. */
  config: ConfigGrafico;
  altura?: number;
  /** Descrição para leitores de tela */
  descricao: string;
}

export default function Grafico({ config, altura = 300, descricao }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // O construtor não aceita a união de tipos; cada membro dela é uma configuração válida
    const grafico = new Chart(canvas.current!, config as ChartConfiguration);
    return () => grafico.destroy();
  }, [config]);

  return (
    <div style={{ position: 'relative', height: altura }}>
      <canvas ref={canvas} role="img" aria-label={descricao} />
    </div>
  );
}
