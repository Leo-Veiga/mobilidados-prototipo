'use client';

import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/formato';
import styles from './Compartilhar.module.css';

interface Props {
  id: string;
  /** Texto curto que acompanha o link nas redes */
  texto: string;
  /** Endereço público da página do destaque */
  url: string;
}

const FORMATOS = [
  { arquivo: 'feed.png', rotulo: 'Quadrado (feed)' },
  { arquivo: 'stories.png', rotulo: 'Vertical (stories)' },
  { arquivo: 'previa.png', rotulo: 'Horizontal' },
];

/** Menu "Compartilhar": baixar a imagem, redes sociais, menu do celular e copiar link */
export default function Compartilhar({ id, texto, url }: Props) {
  const [aberto, setAberto] = useState(false);
  const [aviso, setAviso] = useState('');
  const raiz = useRef<HTMLDivElement>(null);
  const imagem = (arquivo: string) => asset(`/destaques/${id}/${arquivo}`);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => { if (!raiz.current?.contains(e.target as Node)) setAberto(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberto(false); };
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', fora); document.removeEventListener('keydown', esc); };
  }, [aberto]);

  const avisar = (m: string) => { setAviso(m); setTimeout(() => setAviso(''), 3500); };

  /** No celular, abre o menu do aparelho com a imagem anexada (Instagram, WhatsApp...); senão, baixa */
  async function compartilharImagem(arquivo: string) {
    try {
      const blob = await (await fetch(imagem(arquivo))).blob();
      const file = new File([blob], `mobilidados_${id}_${arquivo}`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${texto} ${url}` });
        return;
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return; // a pessoa fechou o menu
    }
    baixar(arquivo);
    avisar('Imagem baixada. Para o Instagram, publique a imagem pelo aplicativo.');
  }

  function baixar(arquivo: string) {
    const a = document.createElement('a');
    a.href = imagem(arquivo);
    a.download = `mobilidados_${id}_${arquivo}`;
    a.click();
  }

  async function copiar() {
    try { await navigator.clipboard.writeText(url); avisar('Link copiado.'); } catch { avisar(url); }
  }

  const t = encodeURIComponent(texto);
  const u = encodeURIComponent(url);
  const redes = [
    { nome: 'WhatsApp', href: `https://wa.me/?text=${t}%20${u}` },
    { nome: 'X', href: `https://x.com/intent/post?text=${t}&url=${u}` },
    { nome: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  ];

  return (
    <div className={styles.raiz} ref={raiz}>
      <button type="button" className={styles.botao} aria-expanded={aberto} aria-haspopup="menu"
        onClick={e => { e.stopPropagation(); setAberto(!aberto); }}>
        Compartilhar
      </button>
      {aberto && (
        <div className={styles.menu} role="menu" onClick={e => e.stopPropagation()}>
          <button type="button" className={styles.fechar} onClick={() => setAberto(false)} aria-label="Fechar">✕</button>
          <p className={styles.grupo}>Redes</p>
          {redes.map(r => (
            <a key={r.nome} role="menuitem" href={r.href} target="_blank" rel="noopener">{r.nome}</a>
          ))}
          <button type="button" role="menuitem" onClick={() => compartilharImagem('stories.png')}>Instagram (stories)</button>
          <button type="button" role="menuitem" onClick={() => compartilharImagem('feed.png')}>Instagram (feed) / mais opções</button>
          <p className={styles.grupo}>Baixar imagem</p>
          {FORMATOS.map(f => (
            <button key={f.arquivo} type="button" role="menuitem" onClick={() => baixar(f.arquivo)}>{f.rotulo}</button>
          ))}
          <p className={styles.grupo}>Link</p>
          <button type="button" role="menuitem" onClick={copiar}>Copiar link</button>
        </div>
      )}
      {aviso && <p className={styles.aviso} role="status">{aviso}</p>}
    </div>
  );
}
