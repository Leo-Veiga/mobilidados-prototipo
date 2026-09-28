'use client';

import Link from 'next/link';
import { useState } from 'react';
import Abas from '@/components/Abas';
import BuscaSelecao from '@/components/BuscaSelecao';
import { IconeEqualizador } from '@/components/Icones';
import { asset } from '@/lib/formato';
import styles from './PaginaBusca.module.css';

export type AbaBusca = 'local' | 'indicador';

interface Props {
  abaInicial: AbaBusca;
  capitais: { slug: string; nome: string; uf: string }[];
  indicadores: { slug: string; nome: string; unidade: string }[];
}

/** "Buscar dados": escolher uma localização (capital) ou um indicador */
export default function PaginaBusca({ abaInicial, capitais, indicadores }: Props) {
  const [aba, setAba] = useState<AbaBusca>(abaInicial);

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
                <label><input type="radio" name="tipo" defaultChecked /> Capitais</label>
                <label className={styles.desativado}>
                  <input type="radio" name="tipo" disabled /> Regiões metropolitanas <span className="etiqueta">em breve</span>
                </label>
              </fieldset>
              <BuscaSelecao
                icone="local" rotulo="Selecione uma localização" placeholder="Digite uma localização"
                opcoes={capitais.map(c => ({ rotulo: `${c.nome} (${c.uf})`, href: `/capitais/${c.slug}/` }))}
              />
              <div className={styles.chips}>
                {capitais.map(c => (
                  <Link key={c.slug} className={styles.chip} href={`/capitais/${c.slug}/`}>{c.nome}</Link>
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
            <ul className={styles.listaIndicadores}>
              {indicadores.map(i => (
                <li key={i.slug}>
                  <Link href={`/indicadores/${i.slug}/`}>
                    <IconeEqualizador /> <span>{i.nome}</span> <small>{i.unidade}</small>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Abas>
    </div>
  );
}
