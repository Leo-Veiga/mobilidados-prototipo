'use client';

import Abas from '@/components/Abas';
import { Grade, Numero } from '@/components/local/Numeros';
import { fmt, pct } from '@/lib/formato';
import type { RegiaoMetropolitana } from '@/lib/tipos';
import styles from '@/components/capitais/FichaCapital.module.css';

interface Props {
  rm: RegiaoMetropolitana;
  /** População mais recente da série (ou a de 2016, da ficha) */
  populacao: { valor: number | null; ano: number };
}

/** Ficha da região metropolitana (informações gerais) */
export default function FichaRM({ rm, populacao }: Props) {
  return (
    <Abas rotulo="Dados da região metropolitana" ativa="info" aoMudar={() => {}} className={styles.ficha}
      abas={[{ id: 'info', titulo: 'Informações gerais' }]}>
      <Grade>
        <Numero valor={<>{fmt(rm.area, 0)} <small>km²</small></>} rotulo="Área (2010)" />
        <Numero valor={<>{fmt(rm.idhm, 3)}{rm.faixaIdhm && <small> ({rm.faixaIdhm})</small>}</>} rotulo="IDHM (2010)" />
        <Numero valor={<>{fmt((populacao.valor ?? 0) / 1e6, 1)} <small>milhões</small></>} rotulo={`População (${populacao.ano})`} />
        <Numero valor={<>{fmt(rm.densidadeUrbana, 0)} <small>hab/km²</small></>} rotulo="Densidade urbana (2010)" />
        <Numero valor={'R$ ' + fmt(rm.renda, 0)} rotulo="Renda média domiciliar per capita" />
        <Numero valor={pct(rm.percDr1sm)} rotulo="Domicílios com renda abaixo de 1 salário mínimo per capita (2010)" />
        <Numero valor={pct(rm.percNegros)} rotulo="População negra (2010)" />
        <Numero valor={pct(rm.percMulheres)} rotulo="Mulheres na população (2010)" />
      </Grade>
    </Abas>
  );
}
