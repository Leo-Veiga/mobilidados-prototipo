import { fmt } from '@/lib/formato';
import { COR_MODO, tma } from '@/lib/tma';
import styles from './Infografico.module.css';

const dataBr = (iso: string) => iso.split('-').reverse().join('/');

/** Retrato fixo da rede de TMA hoje (mesmo conteúdo do infográfico anual do ITDP) */
export default function Infografico() {
  const r = tma.resumo;
  const modos = tma.modos.filter(m => r.porModo[m]);
  return (
    <section className={styles.info} aria-label="Infográfico: a rede de TMA no Brasil hoje">
      <div className={styles.texto}>
        <h2>O que são</h2>
        <p>
          Corredores cuja infraestrutura transporta muitos passageiros de forma ágil em áreas urbanas,
          com prioridade de passagem nas vias.
        </p>
        <ul>
          <li><strong>BRT, VLT e monotrilho</strong> com classificação mínima &quot;básico&quot; no Padrão de Qualidade de BRT.</li>
          <li>
            <strong>Barca, metrô e trem</strong> operando inteiramente numa área urbana contínua, com estações a menos de
            5 km umas das outras (exceto travessias de água), intervalo médio de até 20 minutos entre 6h e 22h
            e cobrança da tarifa fora dos veículos.
          </li>
        </ul>
        <p className={styles.nao}>
          <strong>Não entram:</strong> faixas exclusivas ou corredores de ônibus convencionais, veículos em tráfego
          misto e transporte complementar (vans, táxis).
        </p>
      </div>

      <div className={styles.numeros}>
        <div className={styles.grande}>
          <strong>{fmt(r.km, 0)} km</strong>
          <span>de corredores em operação</span>
        </div>
        <div className={styles.trio}>
          <div><strong>{fmt(r.estacoes, 0)}</strong><span>estações</span></div>
          <div><strong>{r.municipios}</strong><span>municípios atendidos</span></div>
          <div><strong>{r.sistemas}</strong><span>sistemas (cidades-sede)</span></div>
        </div>
        <p className={styles.crescimento}>
          <strong>+{fmt(r.kmUltimos10Anos, 0)} km</strong> inaugurados nos últimos 10 anos.
          Os primeiros corredores sobre trilhos surgiram no fim do século XIX, no Rio de Janeiro, em Recife e em São Paulo.
        </p>

        <h3>Extensão por modo</h3>
        <ul className={styles.barras}>
          {modos.map(m => (
            <li key={m}>
              <span className={styles.rotulo}>{m}</span>
              <span className={styles.trilho}>
                <span style={{ width: `${r.porModo[m] * 100}%`, background: COR_MODO[m] }} />
              </span>
              <span className={styles.valor}>{fmt(r.porModo[m] * 100, 0)}%</span>
            </li>
          ))}
        </ul>
      </div>

      <p className={`nota ${styles.fonte}`}>
        Fonte: Mapa de Transporte de Média e Alta Capacidade no Brasil (ITDP Brasil). Dados processados em {dataBr(tma.geradoEm)}.
        Municípios: cruzamento dos corredores com a malha municipal do IBGE (2022).
      </p>
    </section>
  );
}
