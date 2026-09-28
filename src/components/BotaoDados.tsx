import { IconeDownload } from './Icones';

/** "Acessar os dados": link para um arquivo pronto (href) ou botão que gera o CSV na hora (onClick) */
export default function BotaoDados({ href, onClick, texto = 'Acessar os dados' }: { href?: string; onClick?: () => void; texto?: string }) {
  return href
    ? <a className="botao-dados" href={href} download><IconeDownload /> {texto}</a>
    : <button className="botao-dados" type="button" onClick={onClick}><IconeDownload /> {texto}</button>;
}
