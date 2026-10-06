import type { Metadata } from 'next';
import CabecalhoPagina from '@/components/CabecalhoPagina';
import AbrirAncora from '@/components/metodologia/AbrirAncora';
import { conceitos, fichas, fontes, URL_DETALHE, type Polaridade } from '@/lib/metodologia';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Metodologia dos indicadores',
  description: 'Como cada indicador da MobiliDADOS é calculado: fórmula, fontes, recortes e cuidados ao usar.',
};

const POLARIDADE: Record<Polaridade, { seta: string; texto: string }> = {
  'maior-melhor': { seta: '↑', texto: 'Quanto maior, melhor' },
  'menor-melhor': { seta: '↓', texto: 'Quanto menor, melhor' },
  equidade: { seta: '=', texto: 'Quanto mais parecidos os recortes, melhor' },
  neutra: { seta: '·', texto: 'Sem polaridade' },
};

const nomeFonte = new Map(fontes.map(f => [f.id, f]));
const nomeConceito = new Map(conceitos.map(c => [c.ancora, c.titulo]));

/** "O que mede" e "Como é calculado" aparecem abertos; as demais seções ficam recolhidas */
const ABERTAS = ['O que mede', 'Como é calculado'];

export default function PaginaMetodologia() {
  const temas = [...new Set(fichas.map(f => f.tema))];
  return (
    <>
      <AbrirAncora />
      <CabecalhoPagina titulo="Metodologia dos indicadores">
        <p className="centro nota" style={{ marginTop: 12 }}>
          Clique num indicador para ver como ele é calculado, de onde vêm os dados e o que levar em conta ao usá-los.
        </p>
      </CabecalhoPagina>

      <div className={`container-texto ${styles.pagina}`}>
        {temas.map(t => (
          <section key={t} className={styles.grupo}>
            <h2 className={styles.tema}>{t}</h2>
            {fichas.filter(f => f.tema === t).map(f => {
              if (f.pendente) return (
                <div key={f.id} id={f.id} className={`${styles.ficha} ${styles.pendente}`}>
                  <span className={styles.titulo}>{f.titulo}</span>
                  <span className={styles.resumo}>{f.resumo}</span>
                  <span className={styles.etiquetas}><span>Ficha em elaboração</span></span>
                </div>
              );
              const pol = POLARIDADE[f.polaridade];
              return (
                <details key={f.id} id={f.id} className={styles.ficha}>
                  <summary>
                    <span className={styles.titulo}>{f.titulo}</span>
                    <span className={styles.resumo}>{f.resumo}</span>
                    <span className={styles.etiquetas}>
                      <span>{f.unidade}</span>
                      <span title={pol.texto}><b className={styles.seta}>{pol.seta}</b> {pol.texto}</span>
                      <span>{f.serie}</span>
                    </span>
                  </summary>

                  <div className={styles.corpo}>
                    <dl className={styles.campos}>
                      <div><dt>Abrangência</dt><dd>{f.abrangencia}</dd></div>
                      <div><dt>Atualização</dt><dd>{f.atualizacao}</dd></div>
                      <div><dt>Códigos</dt><dd>{f.codigos.map(c => <code key={c}>{c}</code>)}</dd></div>
                    </dl>

                    {f.secoes.map(s => ABERTAS.includes(s.titulo) ? (
                      <section key={s.ancora} id={s.ancora} className={styles.secaoAberta}>
                        <h3>{s.titulo}</h3>
                        <div className={styles.texto} dangerouslySetInnerHTML={{ __html: s.html }} />
                      </section>
                    ) : (
                      <details key={s.ancora} id={s.ancora} className={styles.secao}>
                        <summary>{s.titulo}</summary>
                        <div className={styles.texto} dangerouslySetInnerHTML={{ __html: s.html }} />
                      </details>
                    ))}

                    <details className={styles.secao}>
                      <summary>Fontes</summary>
                      <ul className={styles.texto}>
                        {f.fontes.map(id => {
                          const fonte = nomeFonte.get(id);
                          return (
                            <li key={id}>
                              {fonte ? <><a href={fonte.link} target="_blank" rel="noopener">{fonte.nome}</a>: {fonte.detalhe}</> : id}
                            </li>
                          );
                        })}
                      </ul>
                    </details>

                    <p className={styles.rodapeFicha}>
                      {f.conceitos.length > 0 && <>Conceitos usados: {f.conceitos.map((c, i) => (
                        <span key={c}>{i > 0 && ' · '}<a href={`#${c}`}>{nomeConceito.get(c) ?? c}</a></span>
                      ))}<br /></>}
                      {f.detalhe && <a href={URL_DETALHE + f.detalhe} target="_blank" rel="noopener">Detalhe técnico e código no GitHub ↗</a>}
                    </p>
                  </div>
                </details>
              );
            })}
          </section>
        ))}

        <section className={styles.grupo}>
          <h2 className={styles.tema}>Conceitos comuns a vários indicadores</h2>
          {conceitos.map(c => (
            <details key={c.ancora} id={c.ancora} className={styles.conceito}>
              <summary>{c.titulo}</summary>
              <div className={styles.texto} dangerouslySetInnerHTML={{ __html: c.html }} />
            </details>
          ))}
        </section>
      </div>
    </>
  );
}
