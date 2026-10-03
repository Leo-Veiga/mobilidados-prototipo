import { capitais, listaIndicadores, rms } from '@/lib/dados';
import { temaDoIndicador } from '@/lib/temas';

/** Só o necessário para a busca (evita mandar as fichas completas ao navegador) */
export function dadosBusca() {
  return {
    capitais: capitais.map(({ slug, nome, uf, lat, lon }) => ({ slug, nome, rotulo: `${nome} (${uf})`, uf, lat, lon })),
    rms: rms.map(({ slug, nome, sigla, curto, uf, lat, lon }) => ({ slug, nome: curto, rotulo: `${nome} (${sigla})`, uf, lat, lon })),
    indicadores: listaIndicadores.map(({ slug, nome, unidade }) => ({ slug, nome, unidade, ...temaDoIndicador(slug) })),
  };
}
