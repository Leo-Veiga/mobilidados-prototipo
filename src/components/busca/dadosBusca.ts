import { capitais, listaIndicadores } from '@/lib/dados';

/** Só o necessário para a busca (evita mandar as fichas completas das capitais ao navegador) */
export function dadosBusca() {
  return {
    capitais: capitais.map(({ slug, nome, uf }) => ({ slug, nome, uf })),
    indicadores: listaIndicadores.map(({ slug, nome, unidade }) => ({ slug, nome, unidade })),
  };
}
