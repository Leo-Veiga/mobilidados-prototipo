import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CabecalhoPagina from '@/components/CabecalhoPagina';
import CardDestaque from '@/components/destaques/CardDestaque';
import GradeDestaques from '@/components/destaques/GradeDestaques';
import { destaquePorId, destaques, URL_SITE } from '@/lib/destaques';

type Params = { params: Promise<{ id: string }> };

// Uma página por destaque: é ela que aparece como prévia quando o link é colado nas redes
export const dynamicParams = false;
export function generateStaticParams() {
  return destaques.map(d => ({ id: d.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const d = destaquePorId((await params).id)!;
  const titulo = `${d.numero} ${d.frase}`;
  const url = `${URL_SITE}/destaques/${d.id}/`;
  const imagem = { url: `${URL_SITE}/destaques/${d.id}/previa.png`, width: 1200, height: 630, alt: titulo };
  return {
    title: titulo,
    description: d.contexto,
    openGraph: { title: titulo, description: d.contexto, url, siteName: 'MobiliDADOS', type: 'article', locale: 'pt_BR', images: [imagem] },
    twitter: { card: 'summary_large_image', title: titulo, description: d.contexto, images: [imagem.url] },
  };
}

export default async function PaginaDestaque({ params }: Params) {
  const d = destaquePorId((await params).id);
  if (!d) notFound();
  const outros = destaques.filter(x => x.id !== d.id).slice(0, 3);

  return (
    <>
      <CabecalhoPagina titulo={d.tema} voltar={{ href: '/destaques/', texto: 'Ver todos os destaques' }} />
      <div className="container-texto" style={{ padding: '40px 20px', maxWidth: 520 }}>
        <CardDestaque d={d} url={`${URL_SITE}/destaques/${d.id}/`} />
      </div>
      <div className="container" style={{ padding: '20px 20px 80px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 400, marginBottom: 20 }}>Outros destaques</h2>
        <GradeDestaques itens={outros} />
      </div>
    </>
  );
}
