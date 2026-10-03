import type { Metadata } from 'next';
import CabecalhoPagina from '@/components/CabecalhoPagina';
import AnoAAno from '@/components/enmu/AnoAAno';
import GraficoENMU from '@/components/enmu/GraficoENMU';
import ListaProjetos from '@/components/enmu/ListaProjetos';
import TabelaRMs from '@/components/enmu/TabelaRMs';
import styles from '@/components/enmu/Enmu.module.css';
import { fmt } from '@/lib/formato';
import { ANO_HORIZONTE, enmu, URL_BNDES, URL_PORTAL, URL_RESULTADOS } from '@/lib/enmu';

export const metadata: Metadata = {
  title: 'Monitoramento do ENMU',
  description: 'Os projetos do Estudo Nacional de Mobilidade Urbana (BNDES e Ministério das Cidades): projeção da implantação até 2054 e acompanhamento ano a ano.',
};

export default function PaginaENMU() {
  const r = enmu.resumo;
  return (
    <>
      <CabecalhoPagina titulo="Monitoramento do ENMU">
        <p className="centro nota" style={{ marginTop: 12 }}>
          O que o Estudo Nacional de Mobilidade Urbana propõe para as regiões metropolitanas e o que está saindo do papel, ano a ano.
        </p>
      </CabecalhoPagina>
      <div className="container" style={{ padding: '40px 20px 80px' }}>
        <section className={styles.intro} aria-label="O que é o ENMU">
          <div>
            <h2>O que é o ENMU</h2>
            <p>
              O Estudo Nacional de Mobilidade Urbana foi feito pelo BNDES em parceria com o Ministério das Cidades, entre
              2024 e 2026, para orientar investimentos em transporte público de média e alta capacidade nas 21 regiões
              metropolitanas com mais de 1 milhão de habitantes, num horizonte de 30 anos (até {ANO_HORIZONTE}).
            </p>
            <p>
              O estudo reuniu um banco de projetos de BRT, VLT, metrô, trem, monotrilho e corredores de ônibus, com
              estimativas de demanda, custo e impactos, e estimou quanto tempo cada região levaria para implantá-los.
              A execução ficou com um consórcio de consultorias, com uma rede de colaboradores da qual o ITDP Brasil fez parte.
            </p>
            <p>
              A MobiliDADOS acompanha esses projetos para responder a uma pergunta simples: <strong>o que foi planejado está sendo implantado?</strong>
            </p>
            <p className="nota">
              Fontes: <a href={URL_BNDES} target="_blank" rel="noreferrer">página do ENMU no BNDES</a>,{' '}
              <a href={URL_RESULTADOS} target="_blank" rel="noreferrer">relatórios e boletins</a> e{' '}
              <a href={URL_PORTAL} target="_blank" rel="noreferrer">Portal Mobilidade Brasil</a>.
            </p>
          </div>
          <div className={styles.numeros}>
            <div><strong>{r.projetos}</strong><span>projetos ({r.registrosPortal} registros, contando as alternativas de tecnologia)</span></div>
            <div><strong>{r.rms}</strong><span>regiões metropolitanas</span></div>
            <div><strong>~{fmt(Math.round(Math.max(r.kmMin, r.kmMax) / 10) * 10, 0)} km</strong><span>de novas linhas</span></div>
            <div><strong>R$ {fmt(Math.round(r.invMin / 1000), 0)}–{fmt(Math.round(r.invMax / 1000), 0)} bi</strong><span>de investimento (infra + frota)</span></div>
            <div><strong>{fmt(r.kmEntregue, 0)} km</strong><span>entregues até agora, segundo o acompanhamento</span></div>
          </div>
        </section>

        <GraficoENMU />
        <AnoAAno />
        <TabelaRMs />
        <ListaProjetos />

        <p className="nota" style={{ marginTop: 32 }}>
          Os boletins do ENMU citam 187 projetos; o banco de projetos do portal tem {r.projetos} eixos distintos
          ({r.registrosPortal} registros). Os números desta página seguem o portal, consultado em {enmu.geradoEm.split('-').reverse().join('/')}.
        </p>
      </div>
    </>
  );
}
