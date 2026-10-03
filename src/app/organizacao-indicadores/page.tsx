import type { Metadata } from 'next';
import CabecalhoPagina from '@/components/CabecalhoPagina';
import OpcoesIndicadores, { type DadosOpcoes } from '@/components/organizacao/OpcoesIndicadores';
import { capitais, catalogo, indicadoresCapitais, listaIndicadores } from '@/lib/dados';
import { codigosDe, TEMAS } from '@/lib/organizacao';

export const metadata: Metadata = {
  title: 'Opções de organização dos indicadores',
  description: 'Protótipo: três formas de agrupar os indicadores e seus recortes.',
  robots: { index: false },
};

export default function PaginaOrganizacao() {
  const codigos = TEMAS.flatMap(t => t.indicadores.flatMap(codigosDe));
  const d: DadosOpcoes = {
    series: Object.fromEntries(codigos.map(c => [c, indicadoresCapitais[c] ?? {}])),
    capitais: capitais.map(c => ({ slug: c.slug, nome: c.nome })).sort((a, b) => a.nome.localeCompare(b.nome, 'pt')),
    links: Object.fromEntries(codigos.map(c => [c, listaIndicadores.find(i => Object.values(i.codigos).includes(c))?.slug ?? ''])),
    nomes: Object.fromEntries(codigos.map(c => [c, catalogo[c] ?? { nome: c, unidade: '' }])),
  };
  return (
    <>
      <CabecalhoPagina titulo="Como organizar os indicadores?">
        <p className="centro nota" style={{ marginTop: 12 }}>
          Protótipo para discussão: os mesmos 42 itens da base, agrupados em 6 temas e 12 indicadores principais,
          mostrados de três jeitos. Os gráficos usam dados reais das capitais.
        </p>
      </CabecalhoPagina>
      <div className="container" style={{ padding: '40px 20px 80px' }}>
        <OpcoesIndicadores d={d} />
      </div>
    </>
  );
}
