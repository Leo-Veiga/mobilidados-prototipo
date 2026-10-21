import { rms } from '@/lib/dados';
import { URL_SITE } from '@/lib/destaques';
import { dadosFicha } from '@/lib/ficha';
import { gerarFichaPdf } from '@/lib/fichaPdf';

// Gera, no build, /regioes-metropolitanas/<slug>/ficha.pdf para cada região metropolitana
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return rms.map(r => ({ slug: r.slug }));
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = dadosFicha('rms', slug);
  if (!d) return new Response('Não encontrado', { status: 404 });
  const pdf = await gerarFichaPdf(d, `${URL_SITE}/regioes-metropolitanas/${slug}/`);
  return new Response(new Uint8Array(pdf), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="mobilidados_ficha_${slug}.pdf"` },
  });
}
