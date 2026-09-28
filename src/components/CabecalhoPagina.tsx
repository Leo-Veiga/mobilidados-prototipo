import Link from 'next/link';
import { IconeVoltar } from './Icones';
import styles from './CabecalhoPagina.module.css';

interface Props {
  titulo: React.ReactNode;
  voltar?: { href: string; texto: string };
  children?: React.ReactNode;
}

/** Faixa de título das páginas internas, com link de volta */
export default function CabecalhoPagina({ titulo, voltar, children }: Props) {
  return (
    <div className={styles.faixa}>
      <div className="container-texto">
        {voltar && (
          <Link className={styles.voltar} href={voltar.href}>
            <IconeVoltar tamanho={24} /> {voltar.texto}
          </Link>
        )}
        <h1 className={styles.titulo}>{titulo}</h1>
        {children}
      </div>
    </div>
  );
}
