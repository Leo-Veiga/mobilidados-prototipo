import styles from './Numeros.module.css';

/** Grade centralizada de números grandes com legenda (fichas de capital e de região metropolitana).
    Com `colunas`, os itens dividem a largura em partes iguais (2 por linha no celular). */
export function Grade({ children, colunas }: { children: React.ReactNode; colunas?: number }) {
  return colunas
    ? <div className={styles.colunas} style={{ '--colunas': colunas } as React.CSSProperties}>{children}</div>
    : <div className={styles.grade}>{children}</div>;
}

/** Um número grande com legenda curta embaixo e, opcionalmente, a fonte do dado */
export function Numero({ valor, rotulo, fonte }: { valor: React.ReactNode; rotulo: string; fonte?: React.ReactNode }) {
  return (
    <div className={styles.numero}>
      <div className={styles.valor}>{valor}</div>
      <div className={styles.rotulo}>{rotulo}</div>
      {fonte && <div className={styles.fonte}>{fonte}</div>}
    </div>
  );
}
