import { destaquePorId, destaques } from '@/lib/destaques';
import { FORMATOS, imagemDestaque, type Formato } from '@/lib/imagemDestaque';

// Gera, no build, /destaques/<id>/previa.png, feed.png e stories.png
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return destaques.flatMap(d => Object.keys(FORMATOS).map(arquivo => ({ id: d.id, arquivo })));
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string; arquivo: string }> }) {
  const { id, arquivo } = await params;
  const d = destaquePorId(id);
  if (!d || !(arquivo in FORMATOS)) return new Response('Não encontrado', { status: 404 });
  return imagemDestaque(d, arquivo as Formato);
}
