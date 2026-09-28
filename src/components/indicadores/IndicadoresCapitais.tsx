'use client';

// As séries de todas as capitais ficam num único pedaço de JavaScript, que o navegador
// baixa uma vez e reaproveita ao navegar entre as páginas das capitais.
import indicadoresJson from '@/data/indicadores-capitais.json';
import type { Indicadores, Lugar } from '@/lib/tipos';
import SecaoInfra from './SecaoInfra';
import SecaoSerie from './SecaoSerie';

const ind = indicadoresJson as unknown as Indicadores;

export default function IndicadoresCapitais({ capitais, atual }: { capitais: Lugar[]; atual: string }) {
  return (
    <>
      <section className="secao" id="infraestrutura">
        <h2>Distribuição da infraestrutura de mobilidade urbana</h2>
        <p className="secao__texto">
          O acesso às oportunidades de trabalho, estudo, saúde e lazer, bem como a outros serviços públicos e privados,
          acontece em grande parte pela infraestrutura de transportes disponível no território. Quando esta
          infraestrutura é distribuída de forma desigual, uma parcela significativa da população tem mais dificuldade
          de acessar essas oportunidades, o que aumenta a desigualdade social nas cidades. Nesta seção é possível
          visualizar e comparar a distribuição da infraestrutura de mobilidade urbana nas capitais.
        </p>
        <SecaoInfra ind={ind} lugares={capitais} atual={atual} />
      </section>
      <section className="secao" id="serie-historica">
        <h2>Série histórica</h2>
        <p className="secao__texto">
          Compare o desempenho de duas ou mais capitais em uma data específica ou ao longo de um período de tempo.
          A comparação está sujeita à disponibilidade dos dados.
        </p>
        <SecaoSerie ind={ind} lugares={capitais} iniciais={[atual]} rotuloLugar="Capitais" nomeArquivo="capitais" />
      </section>
    </>
  );
}
