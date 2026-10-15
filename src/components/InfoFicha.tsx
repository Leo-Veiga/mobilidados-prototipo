import Link from 'next/link';
import styles from './InfoFicha.module.css';

/** Resumo e endereço da ficha metodológica de um indicador */
export interface ResumoFicha { resumo: string; endereco: string }

/** Botão "i" ao lado de um indicador: abre e fecha o painel com o resumo da ficha */
export function BotaoInfo({ id, nome, aberto, aoClicar }: { id: string; nome: string; aberto: boolean; aoClicar: () => void }) {
  return (
    <button
      type="button" className={styles.botao} aria-expanded={aberto} aria-controls={`info-${id}`}
      aria-label={`O que é: ${nome}`} title="O que é este indicador" onClick={aoClicar}
    >i</button>
  );
}

export function PainelInfo({ id, ficha }: { id: string; ficha: ResumoFicha }) {
  return (
    <div id={`info-${id}`} className={styles.painel}>
      <p>{ficha.resumo}</p>
      <Link className={styles.link} href={ficha.endereco}>Como é calculado →</Link>
    </div>
  );
}
