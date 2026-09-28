'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { asset } from '@/lib/formato';
import styles from './Cabecalho.module.css';

const LINKS = [
  { href: '/#sobre', texto: 'Sobre nós' },
  { href: '/capitais/', texto: 'Capitais' },
  { href: '/indicadores/', texto: 'Indicadores' },
];

export default function Cabecalho() {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);

  // Fecha o menu do celular ao trocar de página
  useEffect(() => setAberto(false), [caminho]);

  return (
    <header className={styles.cabecalho}>
      <Link className={styles.logo} href="/">
        <img src={asset('/img/logo-mobilidados.png')} alt="MobiliDADOS — página inicial" width={97} height={39} />
      </Link>
      <button
        className={styles.botaoMenu} type="button"
        aria-label={aberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={aberto}
        onClick={() => setAberto(!aberto)}
      >
        <span /><span /><span />
      </button>
      <nav className={`${styles.menu} ${aberto ? styles.aberto : ''}`} aria-label="Principal">
        {LINKS.map(l => (
          <Link
            key={l.href} href={l.href} onClick={() => setAberto(false)}
            className={l.href !== '/#sobre' && caminho.startsWith(l.href.slice(0, -1)) ? styles.ativo : undefined}
          >
            {l.texto}
          </Link>
        ))}
        <Link className="botao" href="/buscar/">Buscar dados</Link>
      </nav>
    </header>
  );
}
