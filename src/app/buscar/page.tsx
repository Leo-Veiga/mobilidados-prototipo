import type { Metadata } from 'next';
import PaginaBusca from '@/components/busca/PaginaBusca';
import { dadosBusca } from '@/components/busca/dadosBusca';

export const metadata: Metadata = {
  title: 'Buscar dados',
  description: 'Encontre dados de mobilidade urbana por localização ou por indicador.',
};

export default function Buscar() {
  return <PaginaBusca abaInicial="local" {...dadosBusca()} />;
}
