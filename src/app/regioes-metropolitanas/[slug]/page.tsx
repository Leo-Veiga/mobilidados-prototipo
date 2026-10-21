import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BotaoDados from '@/components/BotaoDados';
import CabecalhoPagina from '@/components/CabecalhoPagina';
import ListaIndicadoresLocal from '@/components/local/ListaIndicadoresLocal';
import FichaRM from '@/components/rms/FichaRM';
import GraficosRM from '@/components/rms/GraficosRM';
import { dadosFicha, indicadoresDoLocal, indicadoresRms, rmPorSlug, rms } from '@/lib/dados';
import { asset } from '@/lib/formato';
import styles from '../../capitais/[slug]/pagina.module.css';

type Params = { params: Promise<{ slug: string }> };

// Uma página HTML por região metropolitana, gerada no build
export const dynamicParams = false;
export function generateStaticParams() {
  return rms.map(r => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = rmPorSlug((await params).slug)!;
  return {
    title: `${r.nome} (${r.sigla})`,
    description: `Indicadores de mobilidade urbana da ${r.nome}: população, divisão modal, transporte, segurança viária, emissões e mais.`,
  };
}

// Códigos da divisão modal na aba Indicadores_RMs ("a pé" aparece com e sem acento em versões da planilha)
const CODIGOS_MODAL = [['PERC_A PÉ', 'PERC_A PE'], ['PERC_BICI'], ['PERC_TRANSP_COLETIVO'], ['PERC_TRANSP_IND_MOTO']];

export default async function PaginaRM({ params }: Params) {
  const r = rmPorSlug((await params).slug);
  if (!r) notFound();

  const populacao = indicadoresRms.POP?.[r.slug] ?? {};
  const ficha = dadosFicha('rms', r.slug);

  const serieModo = (codigos: string[]) => codigos.map(c => indicadoresRms[c]?.[r.slug]).find(Boolean) ?? {};
  const series = CODIGOS_MODAL.map(serieModo);
  const anosModal = [...new Set(series.flatMap(s => Object.keys(s)))].sort();
  const modal = Object.fromEntries(anosModal.map(a => [a, series.map(s => s[a] ?? null)]));

  return (
    <>
      <CabecalhoPagina titulo={r.nome} voltar={{ href: '/regioes-metropolitanas/', texto: 'Voltar para localizações' }}>
        <p className="centro" style={{ margin: '8px 0 0', fontWeight: 600 }}>({r.sigla})</p>
        <p className="centro" style={{ margin: '16px 0 0' }}>
          <a className="botao" href={asset(`/regioes-metropolitanas/${r.slug}/ficha.pdf`)} target="_blank" rel="noopener">
            Baixar ficha da região (PDF)
          </a>
        </p>
        <p className="centro nota" style={{ margin: '8px 0 0' }}>Resumo com os principais dados da {r.sigla}, gerado automaticamente.</p>
      </CabecalhoPagina>

      <div className="container-texto">
        {r.texto && <p className={styles.apresentacao}>{r.texto}</p>}

        <section className={styles.bloco} aria-label="Dados da região metropolitana">
          <FichaRM rm={r} ficha={ficha} />
          <div className="centro"><BotaoDados href={asset('/dados/rms-informacoes-gerais.csv')} /></div>
        </section>

        <GraficosRM
          nome={r.nome} sigla={r.sigla} populacao={populacao}
          densidade={ficha.DENS} densidadeUrbana={ficha.DENS_URB} modal={modal}
        />

        <section className={styles.bloco} aria-labelledby="titulo-indicadores">
          <h2 id="titulo-indicadores" className={styles.titulo}>Busca por indicadores</h2>
          <ListaIndicadoresLocal itens={indicadoresDoLocal('rms', r.slug)} local={r.slug} />
        </section>

      </div>
    </>
  );
}
