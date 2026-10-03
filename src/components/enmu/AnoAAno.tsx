import { fmt } from '@/lib/formato';
import { enmu } from '@/lib/enmu';
import styles from './Enmu.module.css';

const ANO_ATUAL = new Date().getFullYear();
const ATE = 2030;

/** Previsto × entregue em cada ano, nas 21 RMs, e o que mudou na situação dos projetos */
export default function AnoAAno() {
  const p = enmu.projecao.Brasil;
  const ent = enmu.entregue.Brasil ?? {};
  const linhas = enmu.anos.filter(a => a <= ATE).map(a => {
    const i = enmu.anos.indexOf(a);
    const noAno = (s: number[]) => s[i] - (i ? s[i - 1] : 0);
    return {
      ano: a, prevMin: noAno(p.min), prevMax: noAno(p.max),
      entregue: a <= ANO_ATUAL ? ent[a] ?? 0 : null,
      mudancas: enmu.projetos.filter(x => x.anoSituacao === a),
    };
  });

  return (
    <section className={styles.bloco} aria-labelledby="titulo-ano">
      <h2 id="titulo-ano" className={styles.h2}>Monitoramento ano a ano</h2>
      <p>
        Quanto o ENMU previa implantar em cada ano e quanto foi entregue de fato, segundo o acompanhamento da MobiliDADOS
        ({enmu.resumo.projetosComSituacao} de {enmu.resumo.projetos} projetos com situação registrada).
      </p>
      <div className={styles.rolagem}>
        <table className={styles.tabela}>
          <thead>
            <tr><th>Ano</th><th>Previsto no ano (km)</th><th>Entregue no ano (km)</th><th>Projetos que mudaram de situação</th></tr>
          </thead>
          <tbody>
            {linhas.map(l => (
              <tr key={l.ano}>
                <td><strong>{l.ano}</strong></td>
                <td>{fmt(l.prevMin, 0)}{Math.round(l.prevMin) !== Math.round(l.prevMax) && <> a {fmt(l.prevMax, 0)}</>}</td>
                <td>{l.entregue === null ? <span className={styles.apagado}>ano futuro</span> : fmt(l.entregue, 1)}</td>
                <td>
                  {l.mudancas.length
                    ? l.mudancas.map(m => <div key={m.id}>{m.nome} ({m.rm}): <strong>{m.situacao}</strong></div>)
                    : <span className={styles.apagado}>{l.entregue === null ? '—' : 'nenhum registro'}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="nota">
        Pelas premissas do ENMU, 2026 e 2027 são anos de estruturação dos projetos (planejamento, modelagem e contratação),
        sem obras previstas. A tabela mostra até {ATE}; o gráfico acima segue até a conclusão de todas as RMs.
      </p>
    </section>
  );
}
