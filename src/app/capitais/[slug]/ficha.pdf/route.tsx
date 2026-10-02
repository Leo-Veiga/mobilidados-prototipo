import { capitais } from '@/lib/dados';
import { URL_SITE } from '@/lib/destaques';
import { dadosFicha } from '@/lib/ficha';
import { gerarFichaPdf } from '@/lib/fichaPdf';

// Gera, no build, /capitais/<slug>/ficha.pdf para cada capital
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return capitais.map(c => ({ slug: c.slug }));
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = dadosFicha(slug);
  if (!d) return new Response('Não encontrado', { status: 404 });
  const pdf = await gerarFichaPdf(d, `${URL_SITE}/capitais/${slug}/`);
  return new Response(new Uint8Array(pdf), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="mobilidados_ficha_${slug}.pdf"` },
  });
}
