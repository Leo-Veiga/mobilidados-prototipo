/* Imagens dos destaques geradas no build (next/og): prévia de link, feed e stories.
   O gerador de imagens entende um subconjunto de CSS (flexbox), por isso o layout é simples. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import type { Destaque, GraficoDestaque } from './destaques';

export const FORMATOS = {
  'previa.png': { largura: 1200, altura: 630 }, // prévia ao colar o link (WhatsApp, Facebook, X)
  'feed.png': { largura: 1080, altura: 1080 }, // Instagram (feed)
  'stories.png': { largura: 1080, altura: 1920 }, // Instagram e WhatsApp (stories/status)
} as const;
export type Formato = keyof typeof FORMATOS;

const VERDE = '#64eaa6';
const FUNDO = '#0e110f';
const CINZA = '#a0a8a3';
const SECUNDARIA = '#2f5f48';

// A fonte do site, a partir do pacote instalado (o gerador aceita .woff, não .woff2)
const fonte = (peso: number) =>
  readFileSync(join(process.cwd(), 'node_modules/@fontsource/open-sans/files', `open-sans-latin-${peso}-normal.woff`));
const FONTES = [
  { name: 'Open Sans', data: fonte(400), weight: 400 as const },
  { name: 'Open Sans', data: fonte(700), weight: 700 as const },
];
const LOGO = `data:image/png;base64,${readFileSync(join(process.cwd(), 'public/img/logo-mobilidados.png')).toString('base64')}`;

const fmt = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

/** Mini-gráfico desenhado com caixas (barras horizontais ou colunas) */
function Grafico({ g, largura, altura }: { g: GraficoDestaque; largura: number; altura: number }) {
  const max = Math.max(...g.pontos.map(p => p.valor), g.referencia?.valor ?? 0);
  if (g.tipo === 'barras') {
    const alturaBarra = Math.min(34, Math.floor(altura / g.pontos.length) - 8);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: largura, gap: 8 }}>
        {g.pontos.map(p => (
          <div key={p.rotulo} style={{ display: 'flex', alignItems: 'center', gap: 12, height: alturaBarra }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: largura * 0.36, whiteSpace: 'nowrap', overflow: 'hidden', fontSize: alturaBarra * 0.62, color: p.destaque ? '#fff' : CINZA, fontWeight: p.destaque ? 700 : 400 }}>{p.rotulo}</div>
            <div style={{ display: 'flex', height: alturaBarra, width: (largura * 0.48 * p.valor) / max, background: p.destaque ? VERDE : SECUNDARIA, borderRadius: 4 }} />
            <div style={{ display: 'flex', fontSize: alturaBarra * 0.62, color: p.destaque ? VERDE : CINZA }}>{fmt(p.valor)}</div>
          </div>
        ))}
      </div>
    );
  }
  const n = g.pontos.length;
  const passo = largura / n;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: largura }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: altura, position: 'relative', gap: 0 }}>
        {g.referencia && (
          <div style={{ display: 'flex', position: 'absolute', left: 0, right: 0, bottom: (altura * g.referencia.valor) / max, borderTop: `2px dashed ${CINZA}` }}>
            <div style={{ display: 'flex', position: 'absolute', right: 0, top: -30, fontSize: 22, color: CINZA }}>{g.referencia.rotulo}</div>
          </div>
        )}
        {g.pontos.map(p => (
          <div key={p.rotulo} style={{ display: 'flex', width: passo, justifyContent: 'center' }}>
            <div style={{ display: 'flex', width: passo * 0.7, height: Math.max(2, (altura * p.valor) / max), background: p.destaque ? VERDE : SECUNDARIA, borderRadius: 3 }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 22, color: CINZA }}>
        <div style={{ display: 'flex' }}>{g.pontos[0].rotulo}</div>
        <div style={{ display: 'flex' }}>{g.pontos[n - 1].rotulo}</div>
      </div>
    </div>
  );
}

/** Imagem de um destaque no formato pedido */
export function imagemDestaque(d: Destaque, formato: Formato) {
  const { largura, altura } = FORMATOS[formato];
  const paisagem = largura > altura;
  const margem = paisagem ? 56 : 80;
  const tamNumero = paisagem ? 120 : formato === 'stories.png' ? 190 : 150;
  // Frases longas diminuem para caber (sobretudo na prévia horizontal)
  const tamFrase = paisagem ? (d.frase.length > 70 ? 28 : 34) : d.frase.length > 70 ? 42 : 48;
  const grafLargura = paisagem ? 470 : largura - margem * 2;
  const grafAltura = paisagem ? 380 : formato === 'stories.png' ? 560 : 300;

  const textos = (
    <div style={{ display: 'flex', flexDirection: 'column', ...(paisagem ? { flex: 1 } : {}), gap: 16 }}>
      <div style={{ display: 'flex', alignSelf: 'flex-start', padding: '6px 18px', border: `2px solid ${VERDE}`, borderRadius: 30, color: VERDE, fontSize: paisagem ? 24 : 30 }}>{d.tema}</div>
      <div style={{ display: 'flex', fontSize: tamNumero, fontWeight: 700, color: VERDE, lineHeight: 1 }}>{d.numero}</div>
      <div style={{ display: 'flex', fontSize: tamFrase, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{d.frase}</div>
      <div style={{ display: 'flex', fontSize: paisagem ? 22 : 32, color: CINZA, lineHeight: 1.3 }}>{d.contexto}</div>
    </div>
  );
  const grafico = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', fontSize: paisagem ? 22 : 28, color: CINZA }}>{d.grafico.titulo}</div>
      <Grafico g={d.grafico} largura={grafLargura} altura={grafAltura} />
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: largura, height: altura, background: FUNDO, padding: margem, fontFamily: 'Open Sans', color: '#fff' }}>
        <div style={{ display: 'flex', flex: 1, flexDirection: paisagem ? 'row' : 'column', gap: paisagem ? 48 : 56, justifyContent: paisagem ? 'flex-start' : 'center' }}>
          {textos}
          {grafico}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `2px solid ${VERDE}`, paddingTop: 20, marginTop: 24 }}>
          <div style={{ display: 'flex', fontSize: paisagem ? 18 : 24, color: CINZA, maxWidth: largura * 0.7 }}>Fonte: {d.fonte}</div>
          <img src={LOGO} height={paisagem ? 44 : 60} width={paisagem ? 111 : 152} alt="" />
        </div>
      </div>
    ),
    { width: largura, height: altura, fonts: FONTES },
  );
}
