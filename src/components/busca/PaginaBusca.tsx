'use client';

import Link from 'next/link';
import { useState } from 'react';
import Abas from '@/components/Abas';
import BuscaSelecao from '@/components/BuscaSelecao';
import MapaLocais, { type LocalMapa } from './MapaLocais';
import { IconeEqualizador } from '@/components/Icones';
import { BotaoInfo, PainelInfo, type ResumoFicha } from '@/components/InfoFicha';
import { agruparPorTema } from '@/lib/temas';
import type { Nivel } from '@/lib/tipos';
import styles from './PaginaBusca.module.css';

export type AbaBusca = 'local' | 'indicador';
type Local = LocalMapa;

interface Props {
  abaInicial: AbaBusca;
  nivelInicial?: Nivel;
  capitais: Local[];
  rms: Local[];
  indicadores: { slug: string; nome: string; unidade: string; tema: string; ordem: number; ficha?: ResumoFicha }[];
}

/** "Buscar dados": escolher uma localização (capital ou região metropolitana) ou um indicador */
export default function PaginaBusca({ abaInicial, nivelInicial = 'capitais', capitais, rms, indicadores }: Props) {
  const [aba, setAba] = useState<AbaBusca>(abaInicial);
  const [info, setInfo] = useState<string | null>(null);

  return (
    <div className="container">
      <h1 className={styles.titulo}>Buscar dados</h1>
      <Abas
        rotulo="Tipo de busca" ativa={aba} aoMudar={setAba} className={styles.abas}
        abas={[{ id: 'local', titulo: 'Localização' }, { id: 'indicador', titulo: 'Indicadores' }]}
      >
        {aba === 'local' ? (
          <MapaLocais capitais={capitais} rms={rms} nivelInicial={nivelInicial} />
        ) : (
          <div className={styles.indicadores}>
            <p>Acesse todos os indicadores monitorados pela MobiliDADOS.</p>
            <BuscaSelecao
              icone="grafico" rotulo="Selecione um indicador" placeholder="Digite um indicador"
              opcoes={indicadores.map(i => ({ rotulo: i.nome, href: `/indicadores/${i.slug}/` }))}
            />
            <div className={styles.cabecalho} aria-hidden="true">
              <span>Nome do indicador</span>
              <span>Unidade de medida</span>
            </div>
            {agruparPorTema(indicadores).map(g => (
              <section key={g.tema} className={styles.tema}>
                <h2 className={styles.nomeTema}>{g.tema}</h2>
                <ul className={styles.listaIndicadores}>
                  {g.itens.map(i => (
                    <li key={i.slug} className={styles.item}>
                      <Link href={`/indicadores/${i.slug}/`}>
                        <IconeEqualizador /> <span>{i.nome}</span> <small>{i.unidade}</small>
                      </Link>
                      {i.ficha && <BotaoInfo id={i.slug} nome={i.nome} aberto={info === i.slug} aoClicar={() => setInfo(info === i.slug ? null : i.slug)} />}
                      {i.ficha && info === i.slug && <PainelInfo id={i.slug} ficha={i.ficha} />}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Abas>
    </div>
  );
}
