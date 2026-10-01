'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { GraficoDestaque } from '@/lib/destaques';
import { fmt } from '@/lib/formato';

const VERDE = '#64eaa6';
const SECUNDARIA = '#2f5f48';

/** Gráfico pequeno do verso do card (sem eixos detalhados, só a forma e os valores no toque) */
export default function MiniGrafico({ g, altura = 150 }: { g: GraficoDestaque; altura?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const horizontal = g.tipo === 'barras';
    const grafico = new Chart(canvas.current!, {
      type: 'bar',
      data: {
        labels: g.pontos.map(p => p.rotulo),
        datasets: [{ data: g.pontos.map(p => p.valor), backgroundColor: g.pontos.map(p => (p.destaque ? VERDE : SECUNDARIA)), borderRadius: 3 }],
      },
      options: {
        indexAxis: horizontal ? 'y' : 'x',
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => ` ${fmt(Number(c.raw), 1)} ${g.unidade}` } },
        },
        scales: {
          x: { display: horizontal ? false : true, grid: { display: false }, ticks: { color: '#a0a8a3', font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 4 } },
          y: { display: horizontal, grid: { display: false }, ticks: { color: '#d2dcd6', font: { size: 11 }, autoSkip: false } },
        },
      },
    });
    return () => grafico.destroy();
  }, [g]);

  return (
    <div style={{ position: 'relative', height: altura }}>
      <canvas ref={canvas} role="img" aria-label={`${g.titulo}: ${g.pontos.map(p => `${p.rotulo} ${fmt(p.valor, 1)}`).join('; ')}`} />
    </div>
  );
}
