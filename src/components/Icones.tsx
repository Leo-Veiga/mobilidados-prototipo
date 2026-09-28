/* Ícones do Material Icons (Google, licença Apache 2.0), como SVG embutido. */
type Props = { className?: string; tamanho?: number };

function Icone({ d, className, tamanho = 20 }: Props & { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width={tamanho} height={tamanho} fill="currentColor" aria-hidden="true" className={className}>
      <path d={d} />
    </svg>
  );
}

export const IconeLocal = (p: Props) => <Icone {...p} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />;
export const IconeGrafico = (p: Props) => <Icone {...p} d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" />;
export const IconeEqualizador = (p: Props) => <Icone {...p} d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z" />;
export const IconeSeta = (p: Props) => <Icone {...p} d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />;
export const IconeVoltar = (p: Props) => <Icone {...p} d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />;
export const IconeBusca = (p: Props) => <Icone {...p} d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />;
export const IconeDownload = (p: Props) => <Icone {...p} d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" />;
export const IconeLink = (p: Props) => <Icone {...p} d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />;
