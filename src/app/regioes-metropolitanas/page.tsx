import type { Metadata } from 'next';
import PaginaBusca from '@/components/busca/PaginaBusca';
import { dadosBusca } from '@/components/busca/dadosBusca';

export const metadata: Metadata = {
  title: 'Regiões metropolitanas',
  description: 'Indicadores de mobilidade urbana das 9 maiores regiões metropolitanas do Brasil.',
};

export default function PaginaRMs() {
  return <PaginaBusca abaInicial="local" nivelInicial="rms" {...dadosBusca()} />;
}
