import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BotaoDados from '@/components/BotaoDados';
import CabecalhoPagina from '@/components/CabecalhoPagina';
import FichaCapital from '@/components/capitais/FichaCapital';
import ListaIndicadoresLocal from '@/components/capitais/ListaIndicadoresLocal';
import SecaoInfra from '@/components/indicadores/SecaoInfra';
import { capitais, capitalPorSlug, indicadoresCapitais, listaIndicadores, ultimoValor } from '@/lib/dados';
import { asset } from '@/lib/formato';
import { GRUPOS_INFRA } from '@/lib/indicadores';
import type { Indicadores } from '@/lib/tipos';
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

// Só as séries da seção de infraestrutura vão para o navegador (e não o arquivo inteiro de indicadores)
const indicadoresInfra: Indicadores = Object.fromEntries(
  [...new Set(GRUPOS_INFRA.flatMap(g => [g.total, ...g.partes.map(([k]) => k)]))]
    .filter(k => indicadoresCapitais[k])
    .map(k => [k, indicadoresCapitais[k]]),
);

export default async function PaginaCapital({ params }: Params) {
  const c = capitalPorSlug((await params).slug);
  if (!c) notFound();
  const lugares = capitais.map(({ slug, nome }) => ({ slug, nome }));
  const itens = listaIndicadores.map(i => {
    const u = ultimoValor(i.codigo, c.slug);
    return { slug: i.slug, nome: i.nome, unidade: i.unidade, ...(u && { valor: u.valor, ano: u.ano }) };
  });

  return (
    <>
      <CabecalhoPagina titulo={`${c.nome} (${c.uf})`} voltar={{ href: '/capitais/', texto: 'Voltar para localizações' }} />

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
          <SecaoInfra ind={indicadoresInfra} lugares={lugares} atual={c.slug} />
        </section>
      </div>
    </>
  );
}
