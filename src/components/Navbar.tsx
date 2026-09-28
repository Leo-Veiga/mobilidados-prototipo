'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { asset } from '@/lib/formato';
import styles from './Navbar.module.css';

export default function Navbar() {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);

  // Fecha o menu do celular ao trocar de página
  useEffect(() => setAberto(false), [caminho]);

  return (
    <header className={styles.navbar}>
      <Link className={styles.logo} href="/">
        <img src={asset('/img/logo-mobilidados.png')} alt="MobiliDADOS — página inicial" width={106} height={42} />
      </Link>
      <button
        className={styles.botaoMenu} type="button"
        aria-label={aberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={aberto}
        onClick={() => setAberto(!aberto)}
      >
        {aberto ? '✕' : '☰'}
      </button>
      <ul className={`${styles.menu} ${aberto ? styles.aberto : ''}`}>
        <li><Link href="/#sobre" onClick={() => setAberto(false)}>Sobre nós</Link></li>
        <li>
          <button type="button" className={styles.grupo}>Indicadores</button>
          <ul className={styles.sub}>
            <li>
              <Link href="/capitais/" className={caminho.startsWith('/capitais') ? styles.ativo : undefined}>Capitais</Link>
            </li>
            <li><span className={styles.embreve}>Regiões Metropolitanas<small>em breve</small></span></li>
          </ul>
        </li>
      </ul>
    </header>
  );
}
