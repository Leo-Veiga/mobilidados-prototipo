import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BotaoDados from '@/components/BotaoDados';
import CabecalhoPagina from '@/components/CabecalhoPagina';
import SecaoInfra from '@/components/indicadores/SecaoInfra';
import ListaIndicadoresLocal from '@/components/local/ListaIndicadoresLocal';
import FichaRM from '@/components/rms/FichaRM';
import GraficosRM from '@/components/rms/GraficosRM';
import { indicadoresDoLocal, indicadoresInfra, indicadoresRms, rmPorSlug, rms } from '@/lib/dados';
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
  const anoPop = Math.max(...Object.keys(populacao).map(Number));
  const popAtual = Number.isFinite(anoPop) ? { valor: populacao[anoPop], ano: anoPop } : { valor: r.pop2016, ano: 2016 };

  const serieModo = (codigos: string[]) => codigos.map(c => indicadoresRms[c]?.[r.slug]).find(Boolean) ?? {};
  const series = CODIGOS_MODAL.map(serieModo);
  const anosModal = [...new Set(series.flatMap(s => Object.keys(s)))].sort();
  const modal = Object.fromEntries(anosModal.map(a => [a, series.map(s => s[a] ?? null)]));

  return (
    <>
      <CabecalhoPagina titulo={r.nome} voltar={{ href: '/regioes-metropolitanas/', texto: 'Voltar para localizações' }}>
        <p className="centro" style={{ margin: '8px 0 0', fontWeight: 600 }}>({r.sigla})</p>
      </CabecalhoPagina>

      <div className="container-texto">
        {r.texto && <p className={styles.apresentacao}>{r.texto}</p>}

        <section className={styles.bloco} aria-label="Dados da região metropolitana">
          <FichaRM rm={r} populacao={popAtual} />
          <div className="centro"><BotaoDados href={asset('/dados/rms-informacoes-gerais.csv')} /></div>
        </section>

        <GraficosRM
          nome={r.nome} sigla={r.sigla} populacao={populacao}
          densidade={r.densidade} densidadeUrbana={r.densidadeUrbana} modal={modal}
        />

        <section className={styles.bloco} aria-labelledby="titulo-indicadores">
          <h2 id="titulo-indicadores" className={styles.titulo}>Busca por indicadores</h2>
          <ListaIndicadoresLocal itens={indicadoresDoLocal('rms', r.slug)} local={r.slug} />
        </section>

        <section className={styles.bloco} aria-labelledby="titulo-infra">
          <h2 id="titulo-infra" className={styles.titulo}>Distribuição da infraestrutura de mobilidade urbana</h2>
          <p className={styles.texto}>
            O acesso às oportunidades de trabalho, estudo, saúde e lazer acontece em grande parte pela infraestrutura
            de transportes disponível no território. Quando ela é distribuída de forma desigual, uma parcela
            significativa da população tem mais dificuldade de acessar essas oportunidades. Compare a distribuição
            da infraestrutura entre grupos de renda, gênero e raça, e entre as regiões metropolitanas.
          </p>
          <SecaoInfra
            ind={indicadoresInfra('rms')} lugares={rms.map(({ slug, nome, curto }) => ({ slug, nome, curto }))}
            atual={r.slug} conjunto="as regiões metropolitanas"
          />
        </section>
      </div>
    </>
  );
}
