import Link from 'next/link';
import BuscaInicial from '@/components/busca/BuscaInicial';
import GradeDestaques from '@/components/destaques/GradeDestaques';
import { destaques } from '@/lib/destaques';
import { capitais, rms } from '@/lib/dados';
import { TEMAS } from '@/lib/organizacao';
import { asset } from '@/lib/formato';
import styles from './page.module.css';

type Logo = [nome: string, arquivo: string, site: string];
const LOGOS: { grupo: string; logos: Logo[] }[] = [
  { grupo: 'Realização', logos: [['ITDP Brasil', 'itdp.jpg', 'https://itdpbrasil.org/']] },
  {
    grupo: 'Apoio', logos: [
      ['Instituto Clima e Sociedade', 'ics.png', 'https://www.climaesociedade.org/'],
      ['Oak Foundation', 'oak-foundation.png', 'https://oakfnd.org/'],
    ],
  },
  {
    grupo: 'Parceiros', logos: [
      ['Multiplicidade Mobilidade Urbana', 'multiplicidade.png', 'https://multiplicidademobilidade.com.br/'],
      ['Ameciclo', 'ameciclo.jpg', 'https://www.ameciclo.org/'],
      ['União de Ciclistas do Brasil', 'ucb.jpg', 'https://www.uniaodeciclistas.org.br/'],
      ['Casa Fluminense', 'casa-fluminense.png', 'https://casafluminense.org.br/'],
      ['Nossa BH', 'nossabh.png', 'https://nossabh.org.br/'],
      ['Instituto de Energia e Meio Ambiente', 'iema.png', 'https://energiaeambiente.org.br/'],
      ['Idec', 'idec.jpg', 'https://idec.org.br/'],
      ['Habitat Geo', 'habitat.png', 'https://www.habitatgeo.com.br/'],
    ],
  },
];

export default function Home() {
  const locais = [
    ...capitais.map(c => ({ rotulo: `${c.nome} (${c.uf})`, href: `/capitais/${c.slug}/` })),
    ...rms.map(r => ({ rotulo: `${r.nome} (${r.sigla})`, href: `/regioes-metropolitanas/${r.slug}/` })),
  ];
  const indicadores = TEMAS.flatMap(t => t.indicadores.map(i => ({ rotulo: i.nome, href: `/indicadores/${i.id}/` })));

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

      <section className={styles.logos} aria-label="Realização, apoio e parceiros">
        {LOGOS.map(({ grupo, logos }) => (
          <div key={grupo} className={styles.grupoLogos}>
            <h3><span>{grupo}</span></h3>
            <div>
              {logos.map(([nome, arquivo, site]) => (
                <a key={nome} href={site} target="_blank" rel="noopener" title={nome}>
                  <img src={asset('/img/logos/' + arquivo)} alt={nome} />
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
