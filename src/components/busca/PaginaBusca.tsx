'use client';

import Link from 'next/link';
import { useState } from 'react';
import Abas from '@/components/Abas';
import BuscaSelecao from '@/components/BuscaSelecao';
import { IconeEqualizador } from '@/components/Icones';
import { asset } from '@/lib/formato';
import type { Nivel } from '@/lib/tipos';
import styles from './PaginaBusca.module.css';

export type AbaBusca = 'local' | 'indicador';
type Local = { slug: string; nome: string; rotulo: string };

interface Props {
  abaInicial: AbaBusca;
  nivelInicial?: Nivel;
  capitais: Local[];
  rms: Local[];
  indicadores: { slug: string; nome: string; unidade: string; tema: string; recortes: string }[];
}

const CAMINHO: Record<Nivel, string> = { capitais: '/capitais/', rms: '/regioes-metropolitanas/' };

/** "Buscar dados": escolher uma localização (capital ou região metropolitana) ou um indicador */
export default function PaginaBusca({ abaInicial, nivelInicial = 'capitais', capitais, rms, indicadores }: Props) {
  const [aba, setAba] = useState<AbaBusca>(abaInicial);
  const [nivel, setNivel] = useState<Nivel>(nivelInicial);
  const locais = nivel === 'capitais' ? capitais : rms;

  return (
    <div className="container">
      <h1 className={styles.titulo}>Buscar dados</h1>
      <Abas
        rotulo="Tipo de busca" ativa={aba} aoMudar={setAba} className={styles.abas}
        abas={[{ id: 'local', titulo: 'Localização' }, { id: 'indicador', titulo: 'Indicadores' }]}
      >
        {aba === 'local' ? (
          <div className={styles.local}>
            <div className={styles.colunaLocal}>
              <fieldset className={styles.tipoLocal}>
                <legend className="sr-only">Tipo de localização</legend>
                <label><input type="radio" name="tipo" checked={nivel === 'capitais'} onChange={() => setNivel('capitais')} /> Capitais</label>
                <label><input type="radio" name="tipo" checked={nivel === 'rms'} onChange={() => setNivel('rms')} /> Regiões metropolitanas</label>
              </fieldset>
              <BuscaSelecao
                key={nivel} icone="local" rotulo="Selecione uma localização" placeholder="Digite uma localização"
                opcoes={locais.map(l => ({ rotulo: l.rotulo, href: `${CAMINHO[nivel]}${l.slug}/` }))}
              />
              <div className={styles.chips}>
                {locais.map(l => (
                  <Link key={l.slug} className={styles.chip} href={`${CAMINHO[nivel]}${l.slug}/`} title={l.rotulo}>{l.nome}</Link>
                ))}
              </div>
            </div>
            <img className={styles.mapa} src={asset('/img/mapa-capitais.png')} alt="Mapa do Brasil com as 27 capitais" width={548} height={455} />
          </div>
        ) : (
          <div className={styles.indicadores}>
            <p>Acesse todos os indicadores monitorados pela MobiliDADOS.</p>
            <BuscaSelecao
              icone="grafico" rotulo="Selecione um indicador" placeholder="Digite um indicador"
              opcoes={indicadores.map(i => ({ rotulo: i.nome, href: `/indicadores/${i.slug}/` }))}
            />
            <div className={styles.temas}>
              {[...new Set(indicadores.map(i => i.tema))].map(tema => (
                <div key={tema} className={styles.tema}>
                  <h2 className={styles.nomeTema}>{tema}</h2>
                  <ul className={styles.listaIndicadores}>
                    {indicadores.filter(i => i.tema === tema).map(i => (
                      <li key={i.slug}>
                        <Link href={`/indicadores/${i.slug}/`}>
                          <IconeEqualizador /> <span>{i.nome}</span> <small>{i.unidade}</small>
                        </Link>
                        {i.recortes && <p className={styles.recortes}>Recortes: {i.recortes}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </Abas>
    </div>
  );
}
