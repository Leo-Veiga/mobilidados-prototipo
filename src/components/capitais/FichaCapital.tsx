'use client';

import { useState } from 'react';
import { fmt, pct } from '@/lib/formato';
import { MODOS_TMA, type Capital } from '@/lib/tipos';
import styles from './FichaCapital.module.css';

const NOME_MODO: Record<(typeof MODOS_TMA)[number], string> = {
  barca: 'Barca', brt: 'BRT', metro: 'Metrô', monotrilho: 'Monotrilho', trem: 'Trem', vlt: 'VLT',
};

/** Na planilha, "-" e "NA" significam "sem informação" */
const valido = (v: string) => Boolean(v) && v !== '-' && v !== 'NA';

function Item({ valor, rotulo }: { valor: React.ReactNode; rotulo: string }) {
  return (
    <div>
      <div className={styles.valor}>{valor || '–'}</div>
      <div className={styles.rotulo}>{rotulo}</div>
    </div>
  );
}

function Fonte({ fonte }: { fonte: string }) {
  if (!valido(fonte)) return null;
  return (
    <div className={styles.fonte}>
      Fonte: {/^https?:\/\//.test(fonte) ? <a href={fonte} target="_blank" rel="noopener">{fonte}</a> : fonte}
    </div>
  );
}

function Bloco({ titulo, azul, inteiro, fonte, children }: {
  titulo?: string; azul?: boolean; inteiro?: boolean; fonte?: string; children: React.ReactNode;
}) {
  return (
    <div className={[styles.bloco, azul && styles.azul, inteiro && styles.inteiro].filter(Boolean).join(' ')}>
      {titulo && <div className={styles.titulo}>{titulo}</div>}
      <div className={styles.itens}>{children}</div>
      {fonte && <Fonte fonte={fonte} />}
    </div>
  );
}

/** Ficha "Sobre a capital", com as abas Informações gerais e Mobilidade */
export default function FichaCapital({ c }: { c: Capital }) {
  const [aba, setAba] = useState<'info' | 'mob'>('info');
  const tma = MODOS_TMA.filter(m => c.tma[m].estacoes || c.tma[m].km);

  return (
    <>
      <div className={styles.abas} role="tablist">
        <button role="tab" type="button" aria-selected={aba === 'info'} onClick={() => setAba('info')}>Informações gerais</button>
        <button role="tab" type="button" aria-selected={aba === 'mob'} onClick={() => setAba('mob')}>Mobilidade</button>
      </div>

      <div className={styles.blocos} role="tabpanel">
        {aba === 'info' ? (
          <>
            <Bloco inteiro>
              <Item valor={fmt(c.area, 1) + ' km²'} rotulo="Área" />
              <Item valor={<>{fmt(c.idhm, 3)}{c.faixaIdhm && <small> ({c.faixaIdhm})</small>}</>} rotulo="IDHM" />
              <Item valor={fmt(c.pop2016, 0)} rotulo="População (2016)" />
              <Item valor={fmt(c.densidadeUrbana, 0) + ' hab/km²'} rotulo="Densidade urbana" />
              <Item valor={'R$ ' + fmt(c.renda, 0)} rotulo="Renda média domiciliar per capita" />
            </Bloco>
            <Bloco azul inteiro>
              <Item valor={pct(c.percDr1sm)} rotulo="Domicílios com renda abaixo de um salário mínimo per capita" />
              <Item valor={pct(c.percNegros)} rotulo="População negra" />
              <Item valor={pct(c.percBrancos)} rotulo="População branca" />
              <Item valor={pct(c.percMulheres)} rotulo="Mulheres na população" />
              <Item valor={pct(c.percHomens)} rotulo="Homens na população" />
            </Bloco>
          </>
        ) : (
          <>
            <Bloco titulo="Licitação de ônibus" fonte={c.laiContratoFonte}>
              <Item valor={c.laiContrato} rotulo="Contrato de concessão" />
              {valido(c.laiContratoInicio) && <Item valor={c.laiContratoInicio} rotulo="Data de início" />}
              {valido(c.laiContratoPrazo) && <Item valor={c.laiContratoPrazo} rotulo="Duração" />}
            </Bloco>
            <Bloco titulo="Frota com GPS" fonte={c.laiGpsFonte}>
              <Item valor={c.laiGps} rotulo="Existência de GPS" />
              {valido(c.laiGpsFrota) && c.laiGpsFrota !== c.laiGps && <Item valor={c.laiGpsFrota} rotulo="Percentual de implantação" />}
            </Bloco>
            <Bloco titulo="Disponibilidade do GTFS" fonte={c.laiGtfsFonte}>
              <Item valor={c.laiGtfs} rotulo="GTFS disponível" />
            </Bloco>
            <Bloco titulo="Plano de mobilidade" fonte={c.planmobFonte}>
              <Item valor={c.planmobStatus} rotulo="Status" />
              {valido(c.planmobAno) && <Item valor={c.planmobAno} rotulo="Ano de aprovação" />}
            </Bloco>
            <Bloco titulo="Estações e extensão da rede de transporte de média e alta capacidade (TMA)" azul inteiro fonte="ITDP">
              {tma.length
                ? tma.map(m => (
                  <Item
                    key={m} rotulo={NOME_MODO[m]}
                    valor={<>{fmt(c.tma[m].estacoes, 0)} <small>{c.tma[m].estacoes === 1 ? 'estação' : 'estações'}</small> ({fmt(c.tma[m].km, 1)} km)</>}
                  />
                ))
                : <div className={styles.rotulo}>A capital não possui rede de transporte de média e alta capacidade.</div>}
            </Bloco>
          </>
        )}
      </div>
    </>
  );
}
