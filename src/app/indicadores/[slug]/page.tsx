import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import CabecalhoPagina from '@/components/CabecalhoPagina';
import GraficosIndicador from '@/components/indicadores/GraficosIndicador';
import { capitais, indicadoresCapitais, indicadorPorSlug, listaIndicadores } from '@/lib/dados';

type Params = { params: Promise<{ slug: string }> };

// Uma página HTML por indicador, gerada no build
export const dynamicParams = false;
export function generateStaticParams() {
  return listaIndicadores.map(i => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const i = indicadorPorSlug((await params).slug)!;
  return {
    title: i.nome,
    description: `${i.nome} (${i.unidade}) nas capitais brasileiras: comparação e série histórica.`,
  };
}

export default async function PaginaIndicador({ params }: Params) {
  const i = indicadorPorSlug((await params).slug);
  if (!i) notFound();
  const series = indicadoresCapitais[i.codigo];
  const comDado = capitais.filter(c => series[c.slug]).length;

  return (
    <>
      <CabecalhoPagina titulo={i.nome} voltar={{ href: '/indicadores/', texto: 'Voltar para indicadores' }}>
        <p className="centro nota" style={{ marginTop: 12 }}>
          Unidade: {i.unidade} · Dados para {comDado} de {capitais.length} capitais
        </p>
      </CabecalhoPagina>
      <div className="container-texto" style={{ padding: '40px 20px 80px' }}>
        {/* useSearchParams (?local=) exige Suspense na exportação estática */}
        <Suspense>
          <GraficosIndicador
            codigo={i.codigo} nome={i.nome} unidade={i.unidade} series={series}
            lugares={capitais.map(({ slug, nome }) => ({ slug, nome }))}
          />
        </Suspense>
      </div>
    </>
  );
}
