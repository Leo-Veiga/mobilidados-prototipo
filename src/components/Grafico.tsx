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

/** Escreve os valores no gráfico. Barras: todos. Linhas: primeiro e último ponto de cada série; o ponto do meio
    quando a série tem 7 anos ou mais; e o maior e o menor valor quando a opção picoVale estiver ligada
    e o gráfico tiver uma única linha visível. Como é desenhado no próprio canvas, sai na imagem baixada. */
const pluginValores: Plugin = {
  id: 'valores',
  afterDatasetsDraw(chart, _args, opcoes: { picoVale?: boolean }) {
    const rotulos: { x: number; y: number; texto: string; cor: string; alinhar: CanvasTextAlign; base: CanvasTextBaseline; fonte: number; livre?: boolean }[] = [];
    const horizontal = chart.options.indexAxis === 'y';
    const escalas = chart.options.scales as Record<string, { stacked?: boolean }> | undefined;
    const empilhado = !!(escalas?.x?.stacked || escalas?.y?.stacked);
    // Pico e vale só quando há uma única linha visível no gráfico
    const umaLinha = chart.data.datasets.filter((_, i) => chart.isDatasetVisible(i)).length === 1;
    chart.data.datasets.forEach((ds, i) => {
      const meta = chart.getDatasetMeta(i);
      if (meta.hidden || !chart.isDatasetVisible(i)) return;
      const dados = ds.data as (number | null)[];
      const comValor = dados.map((v, k) => (v == null ? -1 : k)).filter(k => k >= 0);
      if (!comValor.length) return;
      const barra = meta.type === 'bar';
      const primeiro = comValor[0], ultimo = comValor[comValor.length - 1];
      let indices = comValor;
      if (!barra) {
        const escolhidos = [primeiro, ultimo];
        if (comValor.length >= 7) escolhidos.push(comValor[Math.floor((comValor.length - 1) / 2)]);
        if (opcoes?.picoVale && umaLinha) {
          const valor = (k: number) => dados[k] as number;
          escolhidos.push(comValor.reduce((a, b) => (valor(b) > valor(a) ? b : a)), comValor.reduce((a, b) => (valor(b) < valor(a) ? b : a)));
        }
        indices = [...new Set(escolhidos)];
      }
      for (const k of indices) {
        const el = meta.data[k] as unknown as { x: number; y: number; base?: number; width?: number; height?: number };
        if (!el) continue;
        const texto = fmt(dados[k] as number, 1);
        if (barra) {
          // Espessura da barra (largura nas verticais, altura nas horizontais) e comprimento do segmento
          const espessura = (horizontal ? el.height : el.width) ?? 30;
          const comprimento = Math.abs((horizontal ? el.x : el.y) - (el.base ?? (horizontal ? el.x : el.y)));
          const fonte = espessura < 20 ? 10 : 12;
          if (espessura < 12) continue; // barras finas demais: o número não cabe
          if (empilhado) {
            // Barras empilhadas: o valor vai no meio do segmento, se couber
            if (comprimento < 16) continue;
            const meio = ((horizontal ? el.x : el.y) + (el.base ?? 0)) / 2;
            rotulos.push(horizontal
              ? { x: meio, y: el.y, texto, cor: '#fff', alinhar: 'center', base: 'middle', fonte, livre: true }
              : { x: el.x, y: meio, texto, cor: '#fff', alinhar: 'center', base: 'middle', fonte, livre: true });
          } else if (horizontal) {
            rotulos.push({ x: el.x + 5, y: el.y, texto, cor: '#fff', alinhar: 'left', base: 'middle', fonte, livre: true });
          } else {
            rotulos.push({ x: el.x, y: el.y - 4, texto, cor: '#fff', alinhar: 'center', base: 'bottom', fonte });
          }
          continue;
        }
        // Nas linhas, o primeiro rótulo começa à direita do ponto (longe do eixo) e o último termina à esquerda dele
        const alinhar: CanvasTextAlign = primeiro === ultimo ? 'center' : k === primeiro ? 'left' : k === ultimo ? 'right' : 'center';
        const x = alinhar === 'left' ? el.x + 4 : alinhar === 'right' ? el.x - 4 : el.x;
        const area = empilhado && !!(ds as { fill?: unknown }).fill;
        if (area) {
          // Áreas empilhadas: o número vai no meio da faixa, em branco; faixas vazias (zero) ficam sem número
          const v = dados[k] as number;
          const escalaY = chart.scales[meta.yAxisID ?? 'y'];
          const meio = escalaY.getPixelForValue(escalaY.getValueForPixel(el.y)! - v / 2);
          if (!v || Math.abs(el.y - escalaY.getPixelForValue(escalaY.getValueForPixel(el.y)! - v)) < 14) continue;
          rotulos.push({ x, y: meio, texto, cor: '#fff', alinhar, base: 'middle', fonte: 12, livre: true });
          continue;
        }
        rotulos.push({ x, y: el.y - 8, texto, cor: String(ds.borderColor ?? '#fff'), alinhar, base: 'bottom', fonte: 12 });
      }
    });

    // Rótulos que se sobreporiam (pela caixa real do texto) são empurrados para cima, um a um
    const ctx = chart.ctx;
    const caixa = (r: (typeof rotulos)[number]) => {
      ctx.font = `600 ${r.fonte}px "Open Sans", Helvetica, Arial, sans-serif`;
      const w = ctx.measureText(r.texto).width;
      const esq = r.alinhar === 'left' ? r.x : r.alinhar === 'right' ? r.x - w : r.x - w / 2;
      return { esq, dir: esq + w, topo: r.y - r.fonte - 2, base: r.y };
    };
    const colocados: ReturnType<typeof caixa>[] = [];
    for (const r of rotulos.filter(r => !r.livre).sort((a, b) => b.y - a.y)) {
      let c = caixa(r);
      for (let tentativa = 0; tentativa < 20; tentativa++) {
        const choque = colocados.find(o => c.esq < o.dir + 2 && c.dir > o.esq - 2 && c.topo < o.base && c.base > o.topo);
        if (!choque) break;
        r.y = choque.topo - 1;
        c = caixa(r);
      }
      colocados.push(c);
    }

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0e110f'; // contorno escuro para o número ficar legível sobre linhas e grades
    for (const r of rotulos) {
      ctx.font = `600 ${r.fonte}px "Open Sans", Helvetica, Arial, sans-serif`;
      ctx.textBaseline = r.base;
      ctx.textAlign = r.alinhar;
      ctx.strokeText(r.texto, r.x, r.y);
      ctx.fillStyle = r.cor;
      ctx.fillText(r.texto, r.x, r.y);
    }
    ctx.restore();
  },
};

/** Todos os gráficos do site mostram valores (com pico e vale quando há uma só linha); use valores={false} para desligar */
const PADRAO_VALORES = { picoVale: true };

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
  /** Mostra os valores no gráfico e o botão para escondê-los. picoVale: rotula também o maior e o menor valor das linhas */
  valores?: boolean | { picoVale?: boolean };
}

export default function Grafico({ config, altura = 300, descricao, imagem, valores = PADRAO_VALORES }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [gerando, setGerando] = useState(false);
  const [mostrarValores, setMostrarValores] = useState(true);
  const comValores = !!valores && mostrarValores;

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
        ...(comValores ? { layout: { padding: { top: 22, left: 16, right: opcoes.indexAxis === 'y' ? 48 : 24 } } } : {}),
        plugins: { ...opcoes.plugins, ...(comValores ? { valores: { picoVale: typeof valores === 'object' && !!valores.picoVale } } : {}) },
      },
      plugins: [...(config.plugins ?? []), ...(comValores ? [pluginValores] : [])],
    } as ChartConfiguration);
    return () => grafico.destroy();
  }, [config, comValores, typeof valores === 'object' && valores.picoVale]); // eslint-disable-line react-hooks/exhaustive-deps

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
