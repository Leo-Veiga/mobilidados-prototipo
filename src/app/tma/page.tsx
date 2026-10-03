import type { Metadata } from 'next';
import CabecalhoPagina from '@/components/CabecalhoPagina';
import GraficoTMA from '@/components/tma/GraficoTMA';
import Infografico from '@/components/tma/Infografico';

export const metadata: Metadata = {
  title: 'Transporte de Média e Alta Capacidade',
  description: 'A rede de BRT, metrô, trem, VLT, monotrilho e barcas no Brasil: retrato atual e evolução por ano e por modo.',
};

export default function PaginaTMA() {
  return (
    <>
      <CabecalhoPagina titulo="Transporte de Média e Alta Capacidade">
        <p className="centro nota" style={{ marginTop: 12 }}>
          A rede de BRT, metrô, trem, VLT, monotrilho e barcas nas cidades brasileiras, segundo o Mapa de TMA do ITDP.
        </p>
      </CabecalhoPagina>
      <div className="container" style={{ padding: '40px 20px 80px' }}>
        <Infografico />
        <GraficoTMA />
      </div>
    </>
  );
}
