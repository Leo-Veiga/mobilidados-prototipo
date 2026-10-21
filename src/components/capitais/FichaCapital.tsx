'use client';

import { useState } from 'react';
import Abas from '@/components/Abas';
import { IconeLink } from '@/components/Icones';
import { Grade, Numero } from '@/components/local/Numeros';
import { comAno, fmt, pct100 } from '@/lib/formato';
import type { Capital, TextoAno, ValorAno } from '@/lib/tipos';
import styles from './FichaCapital.module.css';

/** Na planilha, "-", "NA" e "N/A" significam "sem informação" */
const valido = (v: string | null | undefined) => Boolean(v) && !['-', 'NA', 'N/A'].includes(v!.trim());

/** "https://www.recife.pe.gov.br/x/y" -> "recife.pe.gov.br" (endereços mal formados aparecem inteiros) */
function dominio(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

/** Valor em texto da ficha de mobilidade, com detalhe opcional em letra menor */
function texto(v: TextoAno | undefined, detalhe?: string) {
  if (!v) return '–';
  return detalhe ? <>{v.valor} <small>{detalhe}</small></> : v.valor;
}

/** Link curto para a fonte de um dado da ficha de mobilidade (texto sem link aparece como está) */
function Fonte({ v }: { v: TextoAno | undefined }) {
  const f = v?.fonte;
  if (!valido(f)) return null;
  return /^https?:\/\//.test(f!)
    ? <a href={f} target="_blank" rel="noopener" title={f}><IconeLink tamanho={14} /> {dominio(f!)}</a>
    : <>{f}</>;
}

interface Props {
  c: Capital;
  /** Valor mais recente de população, área, densidade, perfil e renda, com o ano */
  ficha: Record<string, ValorAno>;
}

/** Ficha da capital, com as abas Informações gerais e Mobilidade */
export default function FichaCapital({ c, ficha }: Props) {
  const [aba, setAba] = useState<'info' | 'mob'>('info');
  const pop = ficha.POP;
  const mob = c.mobilidade;
  const contrato = [mob.CONTRATO_INICIO && `desde ${mob.CONTRATO_INICIO.valor}`, mob.CONTRATO_PRAZO?.valor]
    .filter(Boolean).join(', ');

  return (
    <Abas
      rotulo="Dados da capital" ativa={aba} aoMudar={setAba} className={styles.ficha}
      abas={[{ id: 'info', titulo: 'Informações gerais' }, { id: 'mob', titulo: 'Mobilidade' }]}
    >
      {aba === 'info' ? (
        <Grade>
          <Numero valor={<>{fmt((pop?.valor ?? NaN) / 1e6, 1)} <small>milhões</small></>} rotulo={comAno('População', pop)} />
          <Numero valor={<>{fmt(ficha.AREA_KM2?.valor, 1)} <small>km²</small></>} rotulo={comAno('Área', ficha.AREA_KM2)} />
          <Numero valor={<>{fmt(ficha.DENS?.valor, 0)} <small>hab/km²</small></>} rotulo={comAno('Densidade', ficha.DENS)} />
          <Numero valor={<>{fmt(ficha.DENS_URB?.valor, 0)} <small>hab/km²</small></>} rotulo={comAno('Densidade urbana', ficha.DENS_URB)} />
          <Numero valor={<>{fmt(c.idhm, 3)}{c.faixaIdhm && <small> ({c.faixaIdhm})</small>}</>} rotulo="IDHM (2010)" />
          <Numero valor={'R$ ' + fmt(ficha.RENDA_MED_PC?.valor, 0)} rotulo={comAno('Renda média domiciliar per capita', ficha.RENDA_MED_PC)} />
          <Numero valor={pct100(ficha.PERC_ATE_1SM_PC)} rotulo={comAno('Moradores com renda domiciliar per capita até 1 salário mínimo', ficha.PERC_ATE_1SM_PC)} />
          <Numero valor={pct100(ficha.PERC_NEGROS)} rotulo={comAno('População negra', ficha.PERC_NEGROS)} />
          <Numero valor={pct100(ficha.PERC_BRANCOS)} rotulo={comAno('População branca', ficha.PERC_BRANCOS)} />
          <Numero valor={pct100(ficha.PERC_MULHERES)} rotulo={comAno('Mulheres na população', ficha.PERC_MULHERES)} />
          <Numero valor={pct100(ficha.PERC_HOMENS)} rotulo={comAno('Homens na população', ficha.PERC_HOMENS)} />
        </Grade>
      ) : (
        <Grade colunas={4}>
          <Numero valor={texto(mob.CONTRATO, contrato)} rotulo={comAno('Ônibus com contrato licitado', mob.CONTRATO)} fonte={<Fonte v={mob.CONTRATO} />} />
          <Numero valor={texto(mob.GTFS_PUBLICO)} rotulo={comAno('GTFS público', mob.GTFS_PUBLICO)} fonte={<Fonte v={mob.GTFS_PUBLICO} />} />
          <Numero
            valor={texto(mob.GPS_PUBLICO, mob.GPS_FROTA && `${mob.GPS_FROTA.valor} da frota com GPS`)}
            rotulo={comAno('GPS dos ônibus público', mob.GPS_PUBLICO)}
            fonte={<Fonte v={mob.GPS_PUBLICO ?? mob.GPS_FROTA} />}
          />
          <Numero
            valor={texto(mob.PLANMOB_STATUS, mob.PLANMOB_ANO && `de ${mob.PLANMOB_ANO.valor}`)}
            rotulo={comAno('Plano de mobilidade', mob.PLANMOB_STATUS)}
            fonte={<Fonte v={mob.PLANMOB_STATUS} />}
          />
        </Grade>
      )}
    </Abas>
  );
}
