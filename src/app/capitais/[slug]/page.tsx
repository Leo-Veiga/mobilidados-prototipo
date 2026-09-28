import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BotaoDados from '@/components/BotaoDados';
import Capa, { type Atalho } from '@/components/Capa';
import FichaCapital from '@/components/capitais/FichaCapital';
import SeletorCapital from '@/components/capitais/SeletorCapital';
import IndicadoresCapitais from '@/components/indicadores/IndicadoresCapitais';
import { capitais, capitalPorSlug } from '@/lib/dados';
import { asset } from '@/lib/formato';

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

const ATALHOS: Atalho[] = [
  { href: '#sobre', icone: 'ico-capitais.svg', texto: 'Sobre a capital' },
  { href: '#infraestrutura', icone: 'ico-infra.svg', texto: 'Distribuição da infraestrutura' },
  { href: '#serie-historica', icone: 'ico-serie.svg', texto: 'Série histórica' },
  { href: '/capitais/', icone: 'ico-capitais.svg', texto: 'Outra capital' },
];

export default async function PaginaCapital({ params }: Params) {
  const c = capitalPorSlug((await params).slug);
  if (!c) notFound();
  // Só o necessário para seletores e comparações (a ficha completa vai só para esta capital)
  const lista = capitais.map(({ slug, nome, uf }) => ({ slug, nome, uf }));

  return (
    <>
      <Capa imagem="capa-padrao.jpg" titulo={c.nome} subtitulo={`(${c.uf})`} atalhos={ATALHOS}>
        {c.texto && <p style={{ fontSize: 16 }}>{c.texto}</p>}
      </Capa>
      <div className="container">
        <section className="secao" id="sobre">
          <h2 className="centro">Sobre a capital</h2>
          <SeletorCapital capitais={lista} atual={c.slug} />
          <FichaCapital c={c} />
          <div className="centro">
            <BotaoDados href={asset('/dados/capitais-informacoes-gerais.csv')} />
          </div>
        </section>
        <IndicadoresCapitais capitais={lista} atual={c.slug} />
      </div>
    </>
  );
}
