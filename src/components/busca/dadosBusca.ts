import { capitais, catalogo, rms } from '@/lib/dados';
import { TEMAS } from '@/lib/organizacao';

/** Só o necessário para a busca (evita mandar as fichas completas ao navegador) */
export function dadosBusca() {
  return {
    capitais: capitais.map(({ slug, nome, uf }) => ({ slug, nome, rotulo: `${nome} (${uf})` })),
    rms: rms.map(({ slug, nome, sigla, curto }) => ({ slug, nome: curto, rotulo: `${nome} (${sigla})` })),
    indicadores: TEMAS.flatMap(t => t.indicadores.map(i => ({
      slug: i.id, nome: i.nome, unidade: catalogo[i.principal]?.unidade ?? '', tema: t.nome,
      recortes: i.recortes.map(r => r.nome.toLowerCase()).join(' · '),
    }))),
  };
}
