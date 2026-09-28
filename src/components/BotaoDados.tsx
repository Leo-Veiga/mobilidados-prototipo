const Icone = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" />
  </svg>
);

/** "Acessar os dados": link para um arquivo pronto (href) ou botão que gera o CSV na hora (onClick) */
export default function BotaoDados({ href, onClick }: { href?: string; onClick?: () => void }) {
  return href
    ? <a className="botao-dados" href={href} download><Icone /> Acessar os dados</a>
    : <button className="botao-dados" type="button" onClick={onClick}><Icone /> Acessar os dados</button>;
}
