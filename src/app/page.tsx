import Link from 'next/link';
import Capa from '@/components/Capa';
import { asset } from '@/lib/formato';
import styles from './page.module.css';

/* Números de destaque da homepage (textos do site original, 2022) */
const DESTAQUES = [
  'A taxa de motorização no Brasil subiu consecutivamente nos últimos 20 anos, chegando a 471 automóveis para cada mil habitantes em 2020.',
  'Não é acidente. Em 2019 mais de 31 mil pessoas morreram em sinistros de trânsito no Brasil.',
  'Em duas a cada três capitais do país, mais de 80% da população mora longe de ciclovias e ciclofaixas.',
  'Menos de 20% da população das grandes metrópoles brasileiras vive próxima de uma estação de média e alta capacidade.',
  'O consumo de combustível por veículos particulares é a principal fonte de poluição do ar nas cidades brasileiras.',
];

const ENTRADAS = [
  { href: '/capitais/', icone: 'home-capitais.png', texto: 'Indicadores por capitais' },
  { icone: 'home-rms.png', texto: 'Indicadores por regiões metropolitanas' },
  { icone: 'home-base-dados.png', texto: 'Base de dados' },
];

type Logo = [nome: string, arquivo: string, site: string];
const LOGOS: [grupo: string, logos: Logo[]][] = [
  ['Realização', [['ITDP Brasil', 'itdp.jpg', 'https://itdpbrasil.org/']]],
  ['Apoio', [
    ['Instituto Clima e Sociedade', 'ics.png', 'https://www.climaesociedade.org/'],
    ['Oak Foundation', 'oak-foundation.png', 'https://oakfnd.org/'],
  ]],
  ['Parceiros', [
    ['Ameciclo', 'ameciclo.jpg', 'https://www.ameciclo.org/'],
    ['Habitat Geo', 'habitat.png', 'https://www.habitatgeo.com.br/'],
    ['União de Ciclistas do Brasil', 'ucb.jpg', 'https://www.uniaodeciclistas.org.br/'],
    ['Casa Fluminense', 'casa-fluminense.png', 'https://casafluminense.org.br/'],
    ['Nossa BH', 'nossabh.png', 'https://nossabh.org.br/'],
    ['Instituto de Energia e Meio Ambiente', 'iema.png', 'https://energiaeambiente.org.br/'],
    ['Idec', 'idec.jpg', 'https://idec.org.br/'],
    ['Multiplicidade Mobilidade Urbana', 'multiplicidade.png', 'https://multiplicidademobilidade.com.br/'],
  ]],
];

export default function Home() {
  return (
    <>
      <Capa imagem="capa-home.jpg" alta titulo="Monitore a mobilidade urbana nas 27 capitais e 9 maiores regiões metropolitanas do país">
        <p className={styles.intro}>
          A MobiliDADOS é uma plataforma com indicadores e dados abertos para apoiar a elaboração e o
          monitoramento de políticas públicas de mobilidade urbana no país.
        </p>
        <a className={styles.chamada} href="#indicadores">Confira os indicadores</a>
      </Capa>

      <div className="container">
        <section className="secao" id="indicadores">
          <h2 className="centro">Confira os indicadores</h2>
          <div className={styles.entradas}>
            {ENTRADAS.map(e => {
              const conteudo = (
                <>
                  <img src={asset('/img/icones/' + e.icone)} alt="" />
                  <strong>{e.texto}</strong>
                  {!e.href && <small>em breve</small>}
                </>
              );
              return e.href
                ? <Link key={e.texto} className={styles.entrada} href={e.href}>{conteudo}</Link>
                : <div key={e.texto} className={`${styles.entrada} ${styles.desativada}`}>{conteudo}</div>;
            })}
          </div>
        </section>

        <section className="secao" aria-labelledby="titulo-destaques">
          <h2 id="titulo-destaques" className="centro">Destaques</h2>
          <ul className={styles.destaques}>
            {DESTAQUES.map(d => <li key={d}>{d}</li>)}
          </ul>
        </section>
      </div>

      <section className={styles.sobre} id="sobre">
        <div className={styles.sobreFundo} style={{ backgroundImage: `url('${asset('/img/capa-home.jpg')}')` }} />
        <div className={`container ${styles.sobreConteudo}`}>
          <h2>Sobre a MobiliDADOS</h2>
          <p>
            A MobiliDADOS foi criada com o objetivo de promover o uso de informações confiáveis nos processos de
            elaboração, monitoramento e avaliação de políticas de mobilidade e desenvolvimento urbano. Além de
            indicadores para capitais e regiões metropolitanas, a plataforma oferece acesso a todos os dados brutos
            utilizados e descreve as metodologias de apuração de cada indicador.
          </p>
        </div>
      </section>

      <section className={styles.logos} aria-label="Realização, apoio e parceiros">
        {LOGOS.map(([grupo, logos]) => (
          <div key={grupo} className={styles.grupoLogos}>
            <h3>{grupo}</h3>
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
