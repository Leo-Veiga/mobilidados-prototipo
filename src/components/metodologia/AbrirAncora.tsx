'use client';
import { useEffect } from 'react';

/** Ao chegar por um link #ancora (ex.: /metodologia/#pnt ou um conceito citado numa ficha),
    abre o bloco recolhido (<details>) com essa âncora e os que o contêm, e rola até ele. */
export default function AbrirAncora() {
  useEffect(() => {
    function abrir() {
      const id = decodeURIComponent(location.hash.slice(1));
      const alvo = id && document.getElementById(id);
      if (!alvo) return;
      for (let el: HTMLElement | null = alvo; el; el = el.parentElement) {
        if (el instanceof HTMLDetailsElement) el.open = true;
      }
      alvo.scrollIntoView({ block: 'start' });
    }
    abrir();
    window.addEventListener('hashchange', abrir);
    return () => window.removeEventListener('hashchange', abrir);
  }, []);
  return null;
}
