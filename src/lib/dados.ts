/* Acesso aos dados gerados por scripts/gerar_dados.py (pasta src/data), usado nas páginas
   (no build). Componentes do navegador recebem só a fatia que usam, para não pesar a página. */
import capitaisJson from '@/data/capitais.json';
import catalogoJson from '@/data/catalogo-indicadores.json';
import indicadoresCapitaisJson from '@/data/indicadores-capitais.json';
import indicadoresRmsJson from '@/data/indicadores-rms.json';
import metaJson from '@/data/meta.json';
import rmsJson from '@/data/rms.json';
import { enderecoFicha, fichaDoCodigo } from './metodologia';
import { CODIGOS_FICHA, GRUPOS_INFRA, rotulo, slugIndicador, unidade } from './indicadores';
import { MODOS_TMA, type Capital, type Catalogo, type Indicadores, type ModoTma, type Nivel, type RegiaoMetropolitana, type ValorAno } from './tipos';
import { temaDoIndicador } from './temas';

export const capitais = capitaisJson as Capital[];
export const rms = rmsJson as RegiaoMetropolitana[];
export const catalogo = catalogoJson as Catalogo;
export const indicadoresCapitais = indicadoresCapitaisJson as unknown as Indicadores;
export const indicadoresRms = indicadoresRmsJson as unknown as Indicadores;
export const meta = metaJson as { geradoEm: string; planilha: string };

export const indicadoresPorNivel: Record<Nivel, Indicadores> = { capitais: indicadoresCapitais, rms: indicadoresRms };
export const NOME_NIVEL: Record<Nivel, { plural: string; singular: string }> = {
  capitais: { plural: 'Capitais', singular: 'Capital' },
  rms: { plural: 'Regiões metropolitanas', singular: 'Região metropolitana' },
};

export function capitalPorSlug(slug: string): Capital | undefined {
  return capitais.find(c => c.slug === slug);
}
export function rmPorSlug(slug: string): RegiaoMetropolitana | undefined {
  return rms.find(r => r.slug === slug);
}

/** Um indicador, com o código da planilha em cada nível em que existe.
    (O mesmo indicador pode ter códigos diferentes nas duas abas: "PERC_A PE" e "PERC_A PÉ".) */
export interface InfoIndicador {
  slug: string;
  nome: string;
  unidade: string;
  codigos: Partial<Record<Nivel, string>>;
}

/** Indicadores com dados, em ordem alfabética (população, perfil, área e estações ficam de fora: estão na ficha) */
export const listaIndicadores: InfoIndicador[] = (() => {
  const porSlug = new Map<string, InfoIndicador>();
  for (const nivel of ['capitais', 'rms'] as Nivel[]) {
    const ind = indicadoresPorNivel[nivel];
    for (const codigo of Object.keys(ind)) {
      if (CODIGOS_FICHA.has(codigo) || !Object.keys(ind[codigo]).length) continue;
      const slug = slugIndicador(codigo);
      const item = porSlug.get(slug) ?? { slug, nome: rotulo(codigo), unidade: unidade(codigo), codigos: {} };
      if (item.codigos[nivel]) throw new Error(`Dois indicadores com a mesma URL (${slug}): ${item.codigos[nivel]} e ${codigo}`);
      item.codigos[nivel] = codigo;
      porSlug.set(slug, item);
    }
  }
  return [...porSlug.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
})();

export function indicadorPorSlug(slug: string): InfoIndicador | undefined {
  return listaIndicadores.find(i => i.slug === slug);
}

/** Valor mais recente de um indicador (código da planilha) para um local: { ano, valor } */
export function ultimoValor(nivel: Nivel, codigo: string, local: string): { ano: number; valor: number } | null {
  const serie = indicadoresPorNivel[nivel][codigo]?.[local];
  if (!serie) return null;
  const ano = Math.max(...Object.keys(serie).map(Number));
  return { ano, valor: serie[ano] };
}

/** Resumo da ficha metodológica de um código (só fichas prontas), para o botão "i" das listas */
export function resumoFicha(codigo: string) {
  const f = fichaDoCodigo(codigo);
  return f && !f.pendente ? { resumo: f.resumo, endereco: enderecoFicha(f) } : undefined;
}

/** Linhas da lista "Busca por indicadores" de um local, com o valor mais recente */
export function indicadoresDoLocal(nivel: Nivel, local: string) {
  return listaIndicadores
    .filter(i => i.codigos[nivel])
    .map(i => {
      const u = ultimoValor(nivel, i.codigos[nivel]!, local);
      const ficha = resumoFicha(i.codigos[nivel]!);
      return {
        slug: i.slug, nome: i.nome, unidade: i.unidade, ...temaDoIndicador(i.slug), ...(u && { valor: u.valor, ano: u.ano }),
        ...(ficha && { ficha }),
      };
    });
}

/** Só as séries da seção de infraestrutura (e não o arquivo inteiro), para enviar ao navegador */
export function indicadoresInfra(nivel: Nivel): Indicadores {
  const ind = indicadoresPorNivel[nivel];
  const codigos = new Set(GRUPOS_INFRA.flatMap(g => [g.total, ...g.partes.map(([k]) => k)]));
  return Object.fromEntries([...codigos].filter(k => ind[k]).map(k => [k, ind[k]]));
}

/** Dados da ficha de um local: valor mais recente de cada código, com o ano */
export function dadosFicha(nivel: Nivel, local: string): Record<string, ValorAno> {
  return Object.fromEntries([...CODIGOS_FICHA].map(c => [c, ultimoValor(nivel, c, local)]));
}

/** Estações de TMA por modo no ano mais recente do mapa TMA (modos sem estação ficam de fora) */
export function estacoesTma(nivel: Nivel, local: string): { ano: number | null; modos: Partial<Record<ModoTma, number>> } {
  const series = MODOS_TMA.map(m => [m, indicadoresPorNivel[nivel][`TMA_ESTACOES_${m.toUpperCase()}`]] as const);
  const anos = series.flatMap(([, ind]) => Object.values(ind ?? {}).flatMap(s => Object.keys(s).map(Number)));
  if (!anos.length) return { ano: null, modos: {} };
  const ano = Math.max(...anos);
  const modos: Partial<Record<ModoTma, number>> = {};
  for (const [m, ind] of series) {
    const v = ind?.[local]?.[ano];
    if (v) modos[m] = v;
  }
  return { ano, modos };
}
