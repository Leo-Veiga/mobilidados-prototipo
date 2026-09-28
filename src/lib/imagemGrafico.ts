/* Gera um PNG de um gráfico já desenhado, com título, subtítulo, fonte, data e logo.
   Roda só no navegador (usa canvas). */
import metaJson from '@/data/meta.json';
import { asset } from './formato';

export interface InfoImagem {
  titulo: string;
  /** Ex.: unidade, local em destaque, anos */
  subtitulo?: string;
  /** Padrão: "MobiliDADOS / ITDP Brasil" */
  fonte?: string;
  /** Nome do arquivo sem extensão (padrão: gerado a partir do título) */
  arquivo?: string;
}

const COR_FUNDO = '#0e110f';
const COR_TEXTO = '#ffffff';
const COR_TEXTO_2 = '#a0a8a3';
const COR_VERDE = '#64eaa6';
const FONTE = '"Open Sans", Helvetica, Arial, sans-serif';

const nomeArquivo = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

/** Quebra um texto em linhas que caibam na largura */
function quebrar(ctx: CanvasRenderingContext2D, texto: string, largura: number): string[] {
  const linhas: string[] = [];
  let atual = '';
  for (const palavra of texto.split(/\s+/)) {
    const teste = atual ? `${atual} ${palavra}` : palavra;
    if (ctx.measureText(teste).width > largura && atual) { linhas.push(atual); atual = palavra; }
    else atual = teste;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

function carregarImagem(src: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // sem logo, mas a imagem sai do mesmo jeito
    img.src = src;
  });
}

/** Monta a imagem a partir do canvas do gráfico e inicia o download */
export async function baixarImagemGrafico(grafico: HTMLCanvasElement, info: InfoImagem) {
  const escala = grafico.width / grafico.clientWidth || 1; // mantém a nitidez da tela
  const px = (n: number) => Math.round(n * escala);
  const margem = px(28);
  const largura = grafico.width + margem * 2;
  const larguraTexto = largura - margem * 2 - px(130); // espaço para o logo

  const medidor = document.createElement('canvas').getContext('2d')!;
  medidor.font = `600 ${px(20)}px ${FONTE}`;
  const linhasTitulo = quebrar(medidor, info.titulo, larguraTexto);
  medidor.font = `400 ${px(14)}px ${FONTE}`;
  const linhasSub = info.subtitulo ? quebrar(medidor, info.subtitulo, larguraTexto) : [];

  const altTitulo = linhasTitulo.length * px(27);
  const altSub = linhasSub.length * px(20);
  const topoGrafico = margem + altTitulo + (altSub ? px(6) + altSub : 0) + px(20);
  const altura = topoGrafico + grafico.height + px(20) + px(18) + margem;

  const saida = document.createElement('canvas');
  saida.width = largura;
  saida.height = altura;
  const ctx = saida.getContext('2d')!;
  ctx.fillStyle = COR_FUNDO;
  ctx.fillRect(0, 0, largura, altura);
  ctx.textBaseline = 'top';

  // Título e subtítulo
  let y = margem;
  ctx.fillStyle = COR_TEXTO;
  ctx.font = `600 ${px(20)}px ${FONTE}`;
  for (const l of linhasTitulo) { ctx.fillText(l, margem, y); y += px(27); }
  if (linhasSub.length) {
    y += px(6);
    ctx.fillStyle = COR_TEXTO_2;
    ctx.font = `400 ${px(14)}px ${FONTE}`;
    for (const l of linhasSub) { ctx.fillText(l, margem, y); y += px(20); }
  }

  // Logo no canto superior direito
  const logo = await carregarImagem(asset('/img/logo-mobilidados.png'));
  if (logo) {
    const alt = px(40);
    const larg = (logo.width / logo.height) * alt;
    ctx.drawImage(logo, largura - margem - larg, margem, larg, alt);
  }

  // Gráfico
  ctx.drawImage(grafico, margem, topoGrafico);

  // Linha verde e rodapé com fonte e data dos dados
  const yRodape = topoGrafico + grafico.height + px(20);
  ctx.fillStyle = COR_VERDE;
  ctx.fillRect(margem, yRodape - px(8), largura - margem * 2, Math.max(1, px(1)));
  ctx.fillStyle = COR_TEXTO_2;
  ctx.font = `400 ${px(12)}px ${FONTE}`;
  const data = new Date(metaJson.geradoEm + 'T12:00:00').toLocaleDateString('pt-BR');
  ctx.fillText(`Fonte: ${info.fonte ?? 'MobiliDADOS / ITDP Brasil'} · Dados atualizados em ${data} · Licença CC BY 4.0`, margem, yRodape);

  const blob = await new Promise<Blob | null>(r => saida.toBlob(r, 'image/png'));
  if (!blob) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mobilidados_${info.arquivo ?? nomeArquivo(info.titulo)}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
