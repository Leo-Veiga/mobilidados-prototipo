import type { Destaque } from '@/lib/destaques';
import { URL_SITE } from '@/lib/destaques';
import CardDestaque from './CardDestaque';
import styles from './GradeDestaques.module.css';

/** Grade de cards de destaque (home e página /destaques/) */
export default function GradeDestaques({ itens }: { itens: Destaque[] }) {
  return (
    <div className={styles.grade}>
      {itens.map(d => <CardDestaque key={d.id} d={d} url={`${URL_SITE}/destaques/${d.id}/`} />)}
    </div>
  );
}
