import type { Metadata } from 'next';
import Link from 'next/link';
import BotaoDados from '@/components/BotaoDados';
import Capa from '@/components/Capa';
import { capitais, REGIOES } from '@/lib/dados';
import { asset } from '@/lib/formato';
import styles from './capitais.module.css';

export const metadata: Metadata = {
  title: 'Capitais',
  description: 'Indicadores de mobilidade urbana das 27 capitais brasileiras.',
};

export default function PaginaCapitais() {
  return (
    <>
      <Capa imagem="capa-padrao.jpg" titulo="Capitais">
        <p style={{ fontSize: 16, margin: 0 }}>Indicadores de mobilidade urbana das 27 capitais brasileiras. Escolha uma capital.</p>
      </Capa>
      <div className="container">
        {REGIOES.map(([regiao, ufs]) => (
          <section key={regiao} className={styles.regiao} aria-labelledby={`regiao-${regiao}`}>
            <h2 id={`regiao-${regiao}`}>{regiao}</h2>
            <div className={styles.grade}>
              {capitais.filter(c => ufs.includes(c.uf)).map(c => (
                <Link key={c.slug} className={styles.cartao} href={`/capitais/${c.slug}/`}>
                  <strong>{c.nome}</strong>
                  <small>{c.uf}</small>
                </Link>
              ))}
            </div>
          </section>
        ))}
        <div className="centro" style={{ padding: '10px 0 50px' }}>
          <BotaoDados href={asset('/dados/capitais-indicadores.csv')} />
          <p className="nota">Todos os indicadores das 27 capitais, em CSV.</p>
        </div>
      </div>
    </>
  );
}
