'use client';

import { useState } from 'react';
import Abas from '@/components/Abas';
import { IconeLink } from '@/components/Icones';
import { Grade, Numero } from '@/components/local/Numeros';
import { comAno, fmt, pct100 } from '@/lib/formato';
import { MODOS_TMA, type Capital, type ModoTma, type ValorAno } from '@/lib/tipos';
import styles from './FichaCapital.module.css';

const NOME_MODO: Record<(typeof MODOS_TMA)[number], string> = {
  barca: 'Barca', brt: 'BRT', metro: 'Metrô', monotrilho: 'Monotrilho', trem: 'Trem', vlt: 'VLT',
};

/** Dados levantados à mão em anos não registrados na planilha */
const SEM_ANO = ' (ano não informado)';

/** Na planilha, "-", "NA" e "N/A" significam "sem informação" */
const valido = (v: string | null | undefined) => Boolean(v) && !['-', 'NA', 'N/A'].includes(v!.trim());

/** "https://www.recife.pe.gov.br/x/y" -> "recife.pe.gov.br" (endereços mal formados aparecem inteiros) */
function dominio(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

function Fontes({ fontes }: { fontes: [string, string][] }) {
  const lista = fontes.filter(([, f]) => valido(f));
  if (!lista.length) return null;
  return (
    <ul className={styles.fontes}>
      {lista.map(([tema, f]) => (
        <li key={tema}>
          <strong>{tema}:</strong>{' '}
          {/^https?:\/\//.test(f)
            ? <a href={f} target="_blank" rel="noopener"><IconeLink tamanho={16} /> {dominio(f)}</a>
            : f}
        </li>
      ))}
    </ul>
  );
}

interface Props {
  c: Capital;
  /** Valor mais recente de população, área, densidade, perfil e renda, com o ano */
  ficha: Record<string, ValorAno>;
  /** Estações de TMA por modo no ano mais recente do mapa TMA */
  tma: { ano: number | null; modos: Partial<Record<ModoTma, number>> };
}

/** Ficha da capital, com as abas Informações gerais e Mobilidade */
export default function FichaCapital({ c, ficha, tma }: Props) {
  const [aba, setAba] = useState<'info' | 'mob'>('info');
  const modos = MODOS_TMA.filter(m => tma.modos[m] || c.tmaKm[m]);
  const pop = ficha.POP;

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
        <>
          <Grade>
            <Numero
              valor={valido(c.laiContratoPrazo) ? c.laiContratoPrazo : c.laiContrato || '–'}
              rotulo={(valido(c.laiContratoInicio) ? `Licitação de ônibus (desde ${c.laiContratoInicio})` : 'Licitação de ônibus') + SEM_ANO}
            />
            <Numero
              valor={valido(c.laiGpsFrota) && c.laiGpsFrota !== c.laiGps ? c.laiGpsFrota : c.laiGps || '–'}
              rotulo={'Frota com GPS' + SEM_ANO}
            />
            <Numero valor={c.laiGtfs || '–'} rotulo={'Disponibilidade do GTFS' + SEM_ANO} />
            <Numero
              valor={valido(c.planmobAno) ? `${c.planmobStatus} (${c.planmobAno})` : c.planmobStatus || '–'}
              rotulo={'Plano de mobilidade' + SEM_ANO}
            />
          </Grade>
          <h3 className={styles.subtitulo}>
            Estações{tma.ano ? ` (${tma.ano})` : ''} e extensão da rede de transporte de média e alta capacidade (TMA)
          </h3>
          {modos.length ? (
            <Grade>
              {modos.map(m => (
                <Numero
                  key={m} rotulo={NOME_MODO[m]}
                  valor={<>{fmt(tma.modos[m] ?? 0, 0)} <small>{tma.modos[m] === 1 ? 'estação' : 'estações'}{c.tmaKm[m] ? <> · {fmt(c.tmaKm[m], 1)} km{SEM_ANO}</> : null}</small></>}
                />
              ))}
            </Grade>
          ) : <p className="centro nota">A capital não possui rede de transporte de média e alta capacidade.</p>}
          <Fontes fontes={[
            ['Licitação de ônibus', c.laiContratoFonte], ['Frota com GPS', c.laiGpsFonte],
            ['GTFS', c.laiGtfsFonte], ['Plano de mobilidade', c.planmobFonte], ['Rede de TMA', 'ITDP (mapa TMA)'],
          ]} />
        </>
      )}
    </Abas>
  );
}
