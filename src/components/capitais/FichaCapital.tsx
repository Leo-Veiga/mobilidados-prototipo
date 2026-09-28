'use client';

import { useState } from 'react';
import Abas from '@/components/Abas';
import { IconeLink } from '@/components/Icones';
import { Grade, Numero } from '@/components/local/Numeros';
import { fmt, pct } from '@/lib/formato';
import { MODOS_TMA, type Capital } from '@/lib/tipos';
import styles from './FichaCapital.module.css';

const NOME_MODO: Record<(typeof MODOS_TMA)[number], string> = {
  barca: 'Barca', brt: 'BRT', metro: 'Metrô', monotrilho: 'Monotrilho', trem: 'Trem', vlt: 'VLT',
};

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

/** Ficha da capital, com as abas Informações gerais e Mobilidade */
export default function FichaCapital({ c }: { c: Capital }) {
  const [aba, setAba] = useState<'info' | 'mob'>('info');
  const tma = MODOS_TMA.filter(m => c.tma[m].estacoes || c.tma[m].km);

  return (
    <Abas
      rotulo="Dados da capital" ativa={aba} aoMudar={setAba} className={styles.ficha}
      abas={[{ id: 'info', titulo: 'Informações gerais' }, { id: 'mob', titulo: 'Mobilidade' }]}
    >
      {aba === 'info' ? (
        <Grade>
          <Numero valor={<>{fmt(c.area, 1)} <small>km²</small></>} rotulo="Área" />
          <Numero valor={<>{fmt(c.idhm, 3)}{c.faixaIdhm && <small> ({c.faixaIdhm})</small>}</>} rotulo="IDHM" />
          <Numero valor={<>{fmt((c.pop2016 ?? 0) / 1e6, 1)} <small>milhões</small></>} rotulo="População (2016)" />
          <Numero valor={<>{fmt(c.densidadeUrbana, 0)} <small>hab/km²</small></>} rotulo="Densidade urbana" />
          <Numero valor={'R$ ' + fmt(c.renda, 0)} rotulo="Renda média domiciliar per capita" />
          <Numero valor={pct(c.percDr1sm)} rotulo="Domicílios com renda abaixo de 1 salário mínimo per capita" />
          <Numero valor={pct(c.percNegros)} rotulo="População negra" />
          <Numero valor={pct(c.percBrancos)} rotulo="População branca" />
          <Numero valor={pct(c.percMulheres)} rotulo="Mulheres na população" />
          <Numero valor={pct(c.percHomens)} rotulo="Homens na população" />
        </Grade>
      ) : (
        <>
          <Grade>
            <Numero
              valor={valido(c.laiContratoPrazo) ? c.laiContratoPrazo : c.laiContrato || '–'}
              rotulo={valido(c.laiContratoInicio) ? `Licitação de ônibus (desde ${c.laiContratoInicio})` : 'Licitação de ônibus'}
            />
            <Numero
              valor={valido(c.laiGpsFrota) && c.laiGpsFrota !== c.laiGps ? c.laiGpsFrota : c.laiGps || '–'}
              rotulo="Frota com GPS"
            />
            <Numero valor={c.laiGtfs || '–'} rotulo="Disponibilidade do GTFS" />
            <Numero
              valor={valido(c.planmobAno) ? `${c.planmobStatus} (${c.planmobAno})` : c.planmobStatus || '–'}
              rotulo="Plano de mobilidade"
            />
          </Grade>
          <h3 className={styles.subtitulo}>Estações e extensão da rede de transporte de média e alta capacidade (TMA)</h3>
          {tma.length ? (
            <Grade>
              {tma.map(m => (
                <Numero
                  key={m} rotulo={NOME_MODO[m]}
                  valor={<>{fmt(c.tma[m].estacoes, 0)} <small>{c.tma[m].estacoes === 1 ? 'estação' : 'estações'} · {fmt(c.tma[m].km, 1)} km</small></>}
                />
              ))}
            </Grade>
          ) : <p className="centro nota">A capital não possui rede de transporte de média e alta capacidade.</p>}
          <Fontes fontes={[
            ['Licitação de ônibus', c.laiContratoFonte], ['Frota com GPS', c.laiGpsFonte],
            ['GTFS', c.laiGtfsFonte], ['Plano de mobilidade', c.planmobFonte], ['Rede de TMA', 'ITDP'],
          ]} />
        </>
      )}
    </Abas>
  );
}
