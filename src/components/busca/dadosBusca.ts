import { capitais, listaIndicadores, rms } from '@/lib/dados';

/** Só o necessário para a busca (evita mandar as fichas completas ao navegador) */
export function dadosBusca() {
  return {
    capitais: capitais.map(({ slug, nome, uf }) => ({ slug, nome, rotulo: `${nome} (${uf})` })),
    rms: rms.map(({ slug, nome, sigla, curto }) => ({ slug, nome: curto, rotulo: `${nome} (${sigla})` })),
    indicadores: listaIndicadores.map(({ slug, nome, unidade }) => ({ slug, nome, unidade })),
  };
}
