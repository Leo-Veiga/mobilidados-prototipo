import styles from './Numeros.module.css';

/** Grade centralizada de números grandes com legenda (fichas de capital e de região metropolitana) */
export function Grade({ children }: { children: React.ReactNode }) {
  return <div className={styles.grade}>{children}</div>;
}

/** Um número grande com legenda curta embaixo */
export function Numero({ valor, rotulo }: { valor: React.ReactNode; rotulo: string }) {
  return (
    <div className={styles.numero}>
      <div className={styles.valor}>{valor}</div>
      <div className={styles.rotulo}>{rotulo}</div>
    </div>
  );
}
