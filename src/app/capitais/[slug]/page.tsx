import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BotaoDados from '@/components/BotaoDados';
import CabecalhoPagina from '@/components/CabecalhoPagina';
import FichaCapital from '@/components/capitais/FichaCapital';
import SecaoInfra from '@/components/indicadores/SecaoInfra';
import ListaIndicadoresLocal from '@/components/local/ListaIndicadoresLocal';
import { capitais, capitalPorSlug, indicadoresDoLocal, indicadoresInfra } from '@/lib/dados';
import { asset } from '@/lib/formato';
import styles from './pagina.module.css';

type Params = { params: Promise<{ slug: string }> };

// Uma página HTML por capital, gerada no build
export const dynamicParams = false;
export function generateStaticParams() {
  return capitais.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = capitalPorSlug((await params).slug)!;
  return {
    title: `${c.nome} (${c.uf})`,
    description: `Indicadores de mobilidade urbana de ${c.nome} (${c.uf}): transporte, infraestrutura cicloviária, segurança viária, emissões e mais.`,
  };
}

export default async function PaginaCapital({ params }: Params) {
  const c = capitalPorSlug((await params).slug);
  if (!c) notFound();
  const lugares = capitais.map(({ slug, nome }) => ({ slug, nome }));
  const itens = indicadoresDoLocal('capitais', c.slug);

  return (
    <>
      <CabecalhoPagina titulo={`${c.nome} (${c.uf})`} voltar={{ href: '/capitais/', texto: 'Voltar para localizações' }}>
        <p className="centro" style={{ margin: '16px 0 0' }}>
          <a className="botao" href={asset(`/capitais/${c.slug}/ficha.pdf`)} target="_blank" rel="noopener">
            Baixar ficha da cidade (PDF)
          </a>
        </p>
        <p className="centro nota" style={{ margin: '8px 0 0' }}>Resumo de 3 páginas com os principais dados de {c.nome}, gerado automaticamente.</p>
      </CabecalhoPagina>

      <div className="container-texto">
        {c.texto && <p className={styles.apresentacao}>{c.texto}</p>}

        <section className={styles.bloco} aria-label="Dados da capital">
          <FichaCapital c={c} />
          <div className="centro"><BotaoDados href={asset('/dados/capitais-informacoes-gerais.csv')} /></div>
        </section>

        <section className={styles.bloco} aria-labelledby="titulo-indicadores">
          <h2 id="titulo-indicadores" className={styles.titulo}>Busca por indicadores</h2>
          <ListaIndicadoresLocal itens={itens} local={c.slug} />
        </section>

        <section className={styles.bloco} aria-labelledby="titulo-infra">
          <h2 id="titulo-infra" className={styles.titulo}>Distribuição da infraestrutura de mobilidade urbana</h2>
          <p className={styles.texto}>
            O acesso às oportunidades de trabalho, estudo, saúde e lazer acontece em grande parte pela infraestrutura
            de transportes disponível no território. Quando ela é distribuída de forma desigual, uma parcela
            significativa da população tem mais dificuldade de acessar essas oportunidades, o que aumenta a
            desigualdade social nas cidades. Compare a distribuição da infraestrutura entre grupos de renda,
            gênero e raça, e entre as capitais.
          </p>
          <SecaoInfra ind={indicadoresInfra('capitais')} lugares={lugares} atual={c.slug} conjunto="as capitais" />
        </section>
      </div>
    </>
  );
}
