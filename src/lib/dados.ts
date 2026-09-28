/* Acesso aos dados gerados por scripts/gerar_dados.py (pasta src/data).
   Não edite os JSON à mão: altere a planilha e rode `npm run dados`. */
import capitaisJson from '@/data/capitais.json';
import catalogoJson from '@/data/catalogo-indicadores.json';
import metaJson from '@/data/meta.json';
import type { Capital, Catalogo } from './tipos';

export const capitais = capitaisJson as Capital[];
export const catalogo = catalogoJson as Catalogo;
export const meta = metaJson as { geradoEm: string; planilha: string };

export function capitalPorSlug(slug: string): Capital | undefined {
  return capitais.find(c => c.slug === slug);
}

/** Regiões do Brasil, para agrupar as capitais na página de listagem */
export const REGIOES: [string, string[]][] = [
  ['Norte', ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO']],
  ['Nordeste', ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE']],
  ['Centro-Oeste', ['DF', 'GO', 'MS', 'MT']],
  ['Sudeste', ['ES', 'MG', 'RJ', 'SP']],
  ['Sul', ['PR', 'RS', 'SC']],
];
