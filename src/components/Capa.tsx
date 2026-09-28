import Link from 'next/link';
import { asset } from '@/lib/formato';
import styles from './Capa.module.css';

export interface Atalho {
  href: string;
  icone: string; // arquivo em public/img/icones
  texto: string;
}

interface Props {
  imagem: string; // arquivo em public/img
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  atalhos?: Atalho[];
  alta?: boolean;
  children?: React.ReactNode;
}

/** Cabeçalho das páginas: imagem de fundo desfocada, título, texto e atalhos com ícones */
export default function Capa({ imagem, titulo, subtitulo, atalhos, alta, children }: Props) {
  return (
    <section className={`${styles.capa} ${alta ? styles.alta : ''}`}>
      <div className={styles.fundo} style={{ backgroundImage: `url('${asset('/img/' + imagem)}')` }} />
      <div className={styles.conteudo}>
        <h1>{titulo}</h1>
        {subtitulo && <div className={styles.subtitulo}>{subtitulo}</div>}
        {children}
        {atalhos && (
          <nav className={styles.atalhos} aria-label="Seções da página">
            {atalhos.map(a => (
              <Link key={a.href} href={a.href}>
                <img src={asset('/img/icones/' + a.icone)} alt="" />
                {a.texto}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
