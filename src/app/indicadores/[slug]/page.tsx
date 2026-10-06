import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import CabecalhoPagina from '@/components/CabecalhoPagina';
import type { DadosNivel } from '@/components/indicadores/GraficosIndicador';
import PaginaIndicador from '@/components/indicadores/PaginaIndicador';
import { capitais, catalogo, indicadoresPorNivel, listaIndicadores, rms } from '@/lib/dados';
import { slugIndicador } from '@/lib/indicadores';
import { enderecoFicha, fichaDoCodigo } from '@/lib/metodologia';
import { codigosDe, TEMAS, type IndicadorPrincipal } from '@/lib/organizacao';
import type { Nivel } from '@/lib/tipos';

type Params = { params: Promise<{ slug: string }> };

/** Endereço -> indicador principal e recorte aberto de início.
    Os indicadores principais têm endereço próprio (ex.: /indicadores/mortalidade/); os endereços antigos,
    um por código da planilha (ex.: /indicadores/tx-mort-ped/), continuam funcionando e abrem o recorte certo. */
const ENDERECOS = (() => {
  const mapa = new Map<string, { ind: IndicadorPrincipal; recorte: number; categoria: number }>();
  const todos = TEMAS.flatMap(t => t.indicadores);
  for (const ind of todos) {
    for (const codigo of codigosDe(ind)) {
      const slug = slugIndicador(codigo);
      if (mapa.has(slug)) continue;
      const r = codigo === ind.principal ? -1 : ind.recortes.findIndex(x => x.partes.some(p => p[0] === codigo));
      const categoria = r < 0 ? 0 : ind.recortes[r].partes.findIndex(p => p[0] === codigo);
      mapa.set(slug, { ind, recorte: r + 1, categoria });
    }
  }
  for (const ind of todos) mapa.set(ind.id, { ind, recorte: 0, categoria: 0 });
  return mapa;
})();

export const dynamicParams = false;
export function generateStaticParams() {
  return [...ENDERECOS.keys()].map(slug => ({ slug }));
}

const temaDe = (ind: IndicadorPrincipal) => TEMAS.find(t => t.indicadores.includes(ind))!;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { ind } = ENDERECOS.get((await params).slug)!;
  return {
    title: ind.nome,
    description: `${ind.nome} nas capitais e regiões metropolitanas brasileiras: recortes, comparação entre locais e evolução no tempo.`,
  };
}

const LUGARES: Record<Nivel, { slug: string; nome: string; curto?: string }[]> = {
  capitais: capitais.map(({ slug, nome }) => ({ slug, nome })),
  rms: rms.map(({ slug, nome, curto }) => ({ slug, nome, curto })),
};

/** Código usado em cada nível (nas RMs alguns códigos têm outra grafia, ex.: "PERC_A PÉ") */
function codigoNoNivel(codigo: string, nivel: Nivel): string | undefined {
  return listaIndicadores.find(i => i.slug === slugIndicador(codigo))?.codigos[nivel];
}

export default async function Pagina({ params }: Params) {
  const end = ENDERECOS.get((await params).slug);
  if (!end) notFound();
  const { ind } = end;
  const codigos = codigosDe(ind);

  // Só as séries deste indicador vão para o navegador
  const ranking: Record<string, Partial<Record<Nivel, DadosNivel>>> = {};
  const series: Record<Nivel, Record<string, DadosNivel['series']>> = { capitais: {}, rms: {} };
  for (const c of codigos) {
    ranking[c] = {};
    for (const nivel of ['capitais', 'rms'] as Nivel[]) {
      const cod = codigoNoNivel(c, nivel);
      const s = cod ? indicadoresPorNivel[nivel][cod] : undefined;
      if (cod && s && Object.keys(s).length) {
        ranking[c][nivel] = { codigo: cod, series: s, lugares: LUGARES[nivel] };
        series[nivel][c] = s;
      }
    }
  }
  const temRm = Object.keys(series.rms).length > 0;
  const ficha = fichaDoCodigo(ind.principal);
  const temFicha = ficha && !ficha.pendente;

  return (
    <>
      <CabecalhoPagina titulo={ind.nome} voltar={{ href: '/indicadores/', texto: 'Voltar para indicadores' }}>
        <p className="centro nota" style={{ marginTop: 12 }}>
          {temaDe(ind).nome} · Unidade: {catalogo[ind.principal]?.unidade} · {temRm ? 'Capitais e regiões metropolitanas' : 'Só capitais'}
          {temFicha && <> · <Link href={enderecoFicha(ficha)} style={{ color: 'var(--verde-300)', fontWeight: 600 }}>Como é calculado →</Link></>}
        </p>
      </CabecalhoPagina>
      <div className="container-texto" style={{ padding: '24px 20px 80px' }}>
        {/* useSearchParams (?local=) exige Suspense na exportação estática */}
        <Suspense>
          <PaginaIndicador
            ind={ind} ranking={ranking} inicial={{ recorte: end.recorte, categoria: end.categoria }}
            explorador={{
              series, locais: LUGARES,
              unidades: Object.fromEntries(codigos.map(c => [c, catalogo[c]?.unidade ?? ''])),
            }}
          />
        </Suspense>
      </div>
    </>
  );
}
