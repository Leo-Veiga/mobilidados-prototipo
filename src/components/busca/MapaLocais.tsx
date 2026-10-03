'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import mapa from '@/data/mapa-brasil.json';
import type { Nivel } from '@/lib/tipos';
import styles from './MapaLocais.module.css';

export interface LocalMapa {
  slug: string;
  /** Nome curto mostrado no mapa e na lista */
  nome: string;
  /** Nome completo, para leitores de tela e busca */
  rotulo: string;
  uf: string;
  lat: number | null;
  lon: number | null;
}

const CAMINHO: Record<Nivel, string> = { capitais: '/capitais/', rms: '/regioes-metropolitanas/' };
const REGIOES = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
const regiaoDaUf = Object.fromEntries(mapa.estados.map(e => [e.uf, e.regiao]));
const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Mesma projeção de scripts/gerar_mapa.py */
const projetar = (lat: number, lon: number) => ({
  x: (lon - mapa.lonMin) * mapa.cos * mapa.escala,
  y: (mapa.latMax - lat) * mapa.escala,
});

/** Escolha do local: mapa do Brasil clicável e lista por região, ligados entre si */
export default function MapaLocais({ capitais, rms, nivelInicial }: { capitais: LocalMapa[]; rms: LocalMapa[]; nivelInicial: Nivel }) {
  const router = useRouter();
  const [nivel, setNivel] = useState<Nivel>(nivelInicial);
  const [ativo, setAtivo] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const locais = nivel === 'capitais' ? capitais : rms;

  const pontos = useMemo(() => locais
    .filter(l => l.lat != null && l.lon != null)
    .map(l => ({ ...l, ...projetar(l.lat!, l.lon!) })), [locais]);
  const t = semAcento(busca.trim());
  const combina = (l: LocalMapa) => !t || semAcento(`${l.nome} ${l.rotulo} ${l.uf}`).includes(t);
  const visiveis = new Set(locais.filter(combina).map(l => l.slug));
  const daVez = pontos.find(p => p.slug === ativo);
  const ufAtiva = daVez?.uf;
  const abrir = (slug: string) => router.push(`${CAMINHO[nivel]}${slug}/`);

  function trocar(n: Nivel) {
    setNivel(n);
    setAtivo(null);
    setBusca('');
  }

  return (
    <div className={styles.raiz}>
      <div className={styles.topo}>
        <div>
          <h2 className={styles.titulo}>Qual lugar você quer investigar?</h2>
          <p className={styles.texto}>
            Clique numa {nivel === 'capitais' ? 'capital' : 'região metropolitana'} no mapa ou escolha na lista.
            Em cada página estão os indicadores de mobilidade, a comparação com os outros locais e os dados para baixar.
          </p>
        </div>
        <div className={styles.seletor} role="radiogroup" aria-label="Tipo de localização">
          {(['capitais', 'rms'] as Nivel[]).map(n => (
            <button key={n} type="button" role="radio" aria-checked={nivel === n} onClick={() => trocar(n)}>
              {n === 'capitais' ? `Capitais (${capitais.length})` : `Regiões metropolitanas (${rms.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.corpo}>
        <figure className={styles.figura}>
          <svg viewBox={`-20 -20 ${mapa.largura + 40} ${mapa.altura + 40}`} className={styles.mapa} role="group"
            aria-label={`Mapa do Brasil com ${nivel === 'capitais' ? 'as capitais' : 'as regiões metropolitanas'}`}>
            <g aria-hidden="true">
              {mapa.estados.map(e => (
                <path key={e.uf} d={e.d} className={`${styles.estado} ${e.uf === ufAtiva ? styles.estadoAtivo : ''}`} />
              ))}
            </g>
            {pontos.map(p => {
              const ligado = p.slug === ativo;
              const apagado = !visiveis.has(p.slug);
              return (
                <g
                  key={p.slug} transform={`translate(${p.x},${p.y})`} tabIndex={0} role="link" aria-label={p.rotulo}
                  className={`${styles.ponto} ${nivel === 'rms' ? styles.rm : ''} ${ligado ? styles.ligado : ''} ${apagado ? styles.apagado : ''}`}
                  onMouseEnter={() => setAtivo(p.slug)} onMouseLeave={() => setAtivo(null)}
                  onFocus={() => setAtivo(p.slug)} onBlur={() => setAtivo(null)}
                  onClick={() => abrir(p.slug)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(p.slug); } }}
                >
                  <circle className={styles.halo} r={nivel === 'rms' ? 26 : 20} />
                  <circle className={styles.miolo} r={nivel === 'rms' ? 11 : 8} />
                </g>
              );
            })}
            {/* Nome do local em destaque, desenhado por último para ficar por cima de tudo */}
            {daVez && (
              <g transform={`translate(${daVez.x},${daVez.y})`} className={styles.etiqueta} aria-hidden="true">
                <text x={daVez.x > mapa.largura * 0.7 ? -30 : 30} y={8} textAnchor={daVez.x > mapa.largura * 0.7 ? 'end' : 'start'}>
                  {daVez.nome}
                </text>
              </g>
            )}
          </svg>
        </figure>

        <div className={styles.lista}>
          <label className={styles.rotulo} htmlFor="busca-local">Buscar</label>
          <input
            id="busca-local" className={styles.busca} type="search" autoComplete="off" value={busca}
            placeholder={nivel === 'capitais' ? 'Ex.: Cuiabá ou MT' : 'Ex.: Recife'} onChange={e => setBusca(e.target.value)}
          />
          {REGIOES.map(r => {
            const daRegiao = locais.filter(l => regiaoDaUf[l.uf] === r && combina(l)).sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
            return daRegiao.length > 0 && (
              <div key={r} className={styles.regiao}>
                <h3>{r}</h3>
                <ul>
                  {daRegiao.map(l => (
                    <li key={l.slug}>
                      <a
                        href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${CAMINHO[nivel]}${l.slug}/`}
                        className={l.slug === ativo ? styles.itemAtivo : undefined}
                        onMouseEnter={() => setAtivo(l.slug)} onMouseLeave={() => setAtivo(null)}
                        onFocus={() => setAtivo(l.slug)} onBlur={() => setAtivo(null)}
                        onClick={e => { e.preventDefault(); abrir(l.slug); }}
                      >
                        {l.nome} <small>{l.uf}</small>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {!visiveis.size && <p className={styles.vazio}>Nenhum local encontrado.</p>}
        </div>
      </div>
    </div>
  );
}
