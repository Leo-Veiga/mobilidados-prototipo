import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import CabecalhoPagina from '@/components/CabecalhoPagina';
import GraficosIndicador, { type DadosNivel } from '@/components/indicadores/GraficosIndicador';
import { capitais, indicadoresPorNivel, indicadorPorSlug, listaIndicadores, rms } from '@/lib/dados';
import type { Nivel } from '@/lib/tipos';

type Params = { params: Promise<{ slug: string }> };

// Uma página HTML por indicador, gerada no build
export const dynamicParams = false;
export function generateStaticParams() {
  return listaIndicadores.map(i => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const i = indicadorPorSlug((await params).slug)!;
  const onde = [i.codigos.capitais && 'capitais', i.codigos.rms && 'regiões metropolitanas'].filter(Boolean).join(' e ');
  return {
    title: i.nome,
    description: `${i.nome} (${i.unidade}) nas ${onde} brasileiras: comparação e série histórica.`,
  };
}

const LUGARES: Record<Nivel, { slug: string; nome: string; curto?: string }[]> = {
  capitais: capitais.map(({ slug, nome }) => ({ slug, nome })),
  rms: rms.map(({ slug, nome, curto }) => ({ slug, nome, curto })),
};

export default async function PaginaIndicador({ params }: Params) {
  const i = indicadorPorSlug((await params).slug);
  if (!i) notFound();

  // Só as séries deste indicador vão para o navegador
  const niveis: Partial<Record<Nivel, DadosNivel>> = {};
  for (const nivel of ['capitais', 'rms'] as Nivel[]) {
    const codigo = i.codigos[nivel];
    if (codigo) niveis[nivel] = { codigo, series: indicadoresPorNivel[nivel][codigo], lugares: LUGARES[nivel] };
  }
  const cobertura = (['capitais', 'rms'] as Nivel[])
    .filter(n => niveis[n])
    .map(n => `${LUGARES[n].filter(l => niveis[n]!.series[l.slug]).length} de ${LUGARES[n].length} ${n === 'capitais' ? 'capitais' : 'regiões metropolitanas'}`)
    .join(' e ');

  return (
    <>
      <CabecalhoPagina titulo={i.nome} voltar={{ href: '/indicadores/', texto: 'Voltar para indicadores' }}>
        <p className="centro nota" style={{ marginTop: 12 }}>Unidade: {i.unidade} · Dados para {cobertura}</p>
      </CabecalhoPagina>
      <div className="container-texto" style={{ padding: '40px 20px 80px' }}>
        {/* useSearchParams (?local=) exige Suspense na exportação estática */}
        <Suspense>
          <GraficosIndicador nome={i.nome} unidade={i.unidade} niveis={niveis} />
        </Suspense>
      </div>
    </>
  );
}
