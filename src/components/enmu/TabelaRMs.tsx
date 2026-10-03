import { fmt } from '@/lib/formato';
import { ANO_HORIZONTE, bilhoes, enmu } from '@/lib/enmu';
import styles from './Enmu.module.css';

const faixa = (a: number, b: number, f: (v: number) => string) => (a === b ? f(a) : `${f(Math.min(a, b))} a ${f(Math.max(a, b))}`);

/** Resumo por região metropolitana: projetos, km, investimento e prazo estimado */
export default function TabelaRMs() {
  const rms = [...enmu.rms].sort((a, b) => b.kmMin - a.kmMin);
  return (
    <section className={styles.bloco} aria-labelledby="titulo-rms">
      <h2 id="titulo-rms" className={styles.h2}>Por região metropolitana</h2>
      <div className={styles.rolagem}>
        <table className={styles.tabela}>
          <thead>
            <tr><th>Região</th><th>Projetos</th><th>Extensão (km)</th><th>Investimento</th><th>Prazo estimado</th><th>Conclusão</th><th>Entregue (km)</th></tr>
          </thead>
          <tbody>
            {rms.map(r => (
              <tr key={r.nome}>
                <td>{r.nome}</td>
                <td>{r.projetos}</td>
                <td>{faixa(r.kmMin, r.kmMax, v => fmt(v, 0))}</td>
                <td>{faixa(r.invMin, r.invMax, bilhoes)}</td>
                <td>{faixa(r.prazoMin, r.prazoMax, v => String(v))} anos</td>
                <td className={Math.max(r.conclusaoMin, r.conclusaoMax) > ANO_HORIZONTE ? styles.alerta : undefined}>
                  {faixa(r.conclusaoMin, r.conclusaoMax, String)}
                </td>
                <td>{fmt(r.kmEntregue, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="nota">
        Investimento: infraestrutura e frota do primeiro ciclo, em valores nominais (Portal Mobilidade Brasil).
        Prazo: Boletim Informativo nº 6 do ENMU (fev/2026). Em destaque, as RMs que terminariam depois de {ANO_HORIZONTE}.
        Faixas aparecem onde há tecnologias alternativas para o mesmo eixo.
      </p>
    </section>
  );
}
