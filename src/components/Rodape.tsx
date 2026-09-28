import Link from 'next/link';
import { meta } from '@/lib/dados';
import { asset } from '@/lib/formato';
import styles from './Rodape.module.css';

const REDES = [
  ['Instagram', 'instagram', 'https://www.instagram.com/itdpbrasil_/'],
  ['X (Twitter)', 'x', 'https://twitter.com/ITDPBRASIL'],
  ['LinkedIn', 'linkedin', 'https://www.linkedin.com/company/itdp-brasil/'],
  ['YouTube', 'youtube', 'https://www.youtube.com/itdpbrasil'],
  ['Facebook', 'facebook', 'https://www.facebook.com/ITDPBrasil'],
];

export default function Rodape() {
  const data = new Date(meta.geradoEm + 'T12:00:00').toLocaleDateString('pt-BR');
  return (
    <footer className={styles.rodape}>
      <div className={styles.principal}>
        <div className={styles.marca}>
          <img src={asset('/img/logo-mobilidados.png')} alt="MobiliDADOS" width={120} height={48} />
          <strong>Instituto de Políticas de Transporte e Desenvolvimento (ITDP Brasil)</strong>
          <div className={styles.redes}>
            {REDES.map(([nome, icone, url]) => (
              <a key={icone} href={url} target="_blank" rel="noopener" aria-label={`ITDP Brasil no ${nome}`}>
                <img src={asset(`/img/icones/rede-${icone}.svg`)} alt="" width={22} height={22} />
              </a>
            ))}
          </div>
        </div>
        <nav className={styles.links} aria-label="Rodapé">
          <Link href="/#sobre">Sobre nós</Link>
          <Link href="/capitais/">Capitais</Link>
          <Link href="/regioes-metropolitanas/">Regiões metropolitanas</Link>
          <Link href="/indicadores/">Indicadores</Link>
          <Link href="/buscar/">Buscar dados</Link>
        </nav>
      </div>
      <div className={styles.inferior}>
        <span>
          Copyright © MobiliDADOS | ITDP Brasil
          <a
            className={styles.licenca} href="https://creativecommons.org/licenses/by/4.0/deed.pt_BR"
            target="_blank" rel="noopener" title="Conteúdo sob licença Creative Commons Atribuição 4.0"
          >
            <img src={asset('/img/icones/cc.svg')} alt="Creative Commons" width={20} height={20} />
            <img src={asset('/img/icones/cc-by.svg')} alt="Atribuição" width={20} height={20} />
          </a>
        </span>
        <span>Dados atualizados em {data}</span>
      </div>
    </footer>
  );
}
