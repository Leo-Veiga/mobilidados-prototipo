import { meta } from '@/lib/dados';
import { asset } from '@/lib/formato';
import styles from './Rodape.module.css';

export default function Rodape() {
  const data = new Date(meta.geradoEm + 'T12:00:00').toLocaleDateString('pt-BR');
  return (
    <footer className={styles.rodape}>
      <span>© MobiliDADOS | ITDP Brasil</span>
      <a
        className={styles.licenca} href="https://creativecommons.org/licenses/by/4.0/deed.pt_BR"
        target="_blank" rel="noopener" title="Conteúdo sob licença Creative Commons Atribuição 4.0"
      >
        <img src={asset('/img/icones/cc.svg')} alt="" width={18} height={18} />
        <img src={asset('/img/icones/cc-by.svg')} alt="" width={18} height={18} />
        CC BY 4.0
      </a>
      <span className={styles.nota}>Dados atualizados em {data}</span>
    </footer>
  );
}
