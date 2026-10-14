/** Número no padrão brasileiro; ausente vira "–" */
export function fmt(v: number | null | undefined, casas = 1): string {
  return v == null || isNaN(v) ? '–' : v.toLocaleString('pt-BR', { maximumFractionDigits: casas });
}

/** Fração (0.42) como percentual ("42 %") */
export function pct(v: number | null | undefined): string {
  return v == null ? '–' : fmt(v * 100, 0) + ' %';
}

/** Percentual de 0 a 100 de um dado da ficha ("60,8 %") */
export function pct100(v: { valor: number } | null | undefined): string {
  return v == null ? '–' : fmt(v.valor, 1) + ' %';
}

/** Rótulo com o ano do dado: "População (2026)" */
export function comAno(rotulo: string, v: { ano: number } | null | undefined): string {
  return v ? `${rotulo} (${v.ano})` : rotulo;
}

/** Caminho de um arquivo em public/, respeitando o basePath do GitHub Pages.
    (next/link já faz isso sozinho; <img> e url() em CSS precisam deste helper.) */
export function asset(caminho: string): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? '') + caminho;
}
