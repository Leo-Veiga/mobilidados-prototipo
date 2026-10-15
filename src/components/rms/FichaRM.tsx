'use client';

import Abas from '@/components/Abas';
import { Grade, Numero } from '@/components/local/Numeros';
import { comAno, fmt, pct100 } from '@/lib/formato';
import type { RegiaoMetropolitana, ValorAno } from '@/lib/tipos';
import styles from '@/components/capitais/FichaCapital.module.css';

interface Props {
  rm: RegiaoMetropolitana;
  /** Valor mais recente de população, área, densidade, perfil e renda, com o ano */
  ficha: Record<string, ValorAno>;
}

/** Ficha da região metropolitana (informações gerais) */
export default function FichaRM({ rm, ficha }: Props) {
  const pop = ficha.POP;
  return (
    <Abas rotulo="Dados da região metropolitana" ativa="info" aoMudar={() => {}} className={styles.ficha}
      abas={[{ id: 'info', titulo: 'Informações gerais' }]}>
      <Grade>
        <Numero valor={<>{fmt((pop?.valor ?? NaN) / 1e6, 1)} <small>milhões</small></>} rotulo={comAno('População', pop)} />
        <Numero valor={<>{fmt(ficha.AREA_KM2?.valor, 0)} <small>km²</small></>} rotulo={comAno('Área', ficha.AREA_KM2)} />
        <Numero valor={<>{fmt(ficha.DENS_URB?.valor, 0)} <small>hab/km²</small></>} rotulo={comAno('Densidade urbana', ficha.DENS_URB)} />
        <Numero valor={<>{fmt(rm.idhm, 3)}{rm.faixaIdhm && <small> ({rm.faixaIdhm})</small>}</>} rotulo="IDHM (2010)" />
        <Numero valor={'R$ ' + fmt(ficha.RENDA_MED_PC?.valor, 0)} rotulo={comAno('Renda média domiciliar per capita', ficha.RENDA_MED_PC)} />
        <Numero valor={pct100(ficha.PERC_ATE_1SM_PC)} rotulo={comAno('Moradores com renda domiciliar per capita até 1 salário mínimo', ficha.PERC_ATE_1SM_PC)} />
        <Numero valor={pct100(ficha.PERC_NEGROS)} rotulo={comAno('População negra', ficha.PERC_NEGROS)} />
        <Numero valor={pct100(ficha.PERC_MULHERES)} rotulo={comAno('Mulheres na população', ficha.PERC_MULHERES)} />
      </Grade>
    </Abas>
  );
}
