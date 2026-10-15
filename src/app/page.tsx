import Link from 'next/link';
import BuscaInicial from '@/components/busca/BuscaInicial';
import GradeDestaques from '@/components/destaques/GradeDestaques';
import { destaques } from '@/lib/destaques';
import { capitais, listaIndicadores, rms } from '@/lib/dados';
import { asset } from '@/lib/formato';
import { agruparPorTema, temaDoIndicador } from '@/lib/temas';
import styles from './page.module.css';

export default function Home() {
  const locais = [
    ...capitais.map(c => ({ rotulo: `${c.nome} (${c.uf})`, href: `/capitais/${c.slug}/` })),
    ...rms.map(r => ({ rotulo: `${r.nome} (${r.sigla})`, href: `/regioes-metropolitanas/${r.slug}/` })),
  ];
  // Mesma organização da página de indicadores: agrupados por tema, na ordem dos temas
  const indicadores = agruparPorTema(listaIndicadores.map(i => ({ ...i, ...temaDoIndicador(i.slug) })))
    .flatMap(g => g.itens.map(i => ({ rotulo: i.nome, href: `/indicadores/${i.slug}/`, grupo: g.tema })));

  return (
    <>
      <section className={styles.hero} style={{ backgroundImage: `url('${asset('/img/capa-home.jpg')}')` }}>
        <div className="container">
          <h1 className={styles.titulo}>Monitore a mobilidade urbana nas 27 capitais e 9 maiores regiões metropolitanas do país</h1>
          <p className={styles.subtitulo}>Encontre dados de mobilidade urbana por indicador ou localização</p>
          <div className={styles.linhaBusca}>
            <BuscaInicial locais={locais} indicadores={indicadores} />
            <aside className={styles.apresentacao}>
              A <span className={styles.verde}>MobiliDADOS</span> é uma plataforma com{' '}
              <Link className={styles.azul} href="/indicadores/">indicadores e dados abertos</Link> para apoiar a
              elaboração e monitoramento de políticas públicas de mobilidade urbana no país.
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.destaques} aria-labelledby="titulo-destaques">
        <div className="container">
          <div className={styles.cabecalhoDestaques}>
            <h2 id="titulo-destaques" className={styles.tituloSobre}>Destaques</h2>
            <Link className="botao-contorno" href="/destaques/">Ver todos os destaques</Link>
          </div>
          <GradeDestaques itens={destaques} />
        </div>
      </section>

      <section id="sobre" className={styles.sobre}>
        <div className="container">
          <h2 className={styles.tituloSobre}>Sobre a <span>MobiliDADOS</span></h2>
          <div className={styles.textoSobre}>
            <p>
              A MobiliDADOS foi criada com o objetivo de promover o uso de informações confiáveis nos processos de
              elaboração, monitoramento e avaliação de políticas de mobilidade e desenvolvimento urbano.
            </p>
            <p>
              Além de indicadores para capitais e regiões metropolitanas, a plataforma oferece acesso a todos os dados
              brutos utilizados e descreve as metodologias de apuração de cada indicador.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
