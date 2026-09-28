import type { Metadata } from 'next';
import PaginaBusca from '@/components/busca/PaginaBusca';
import { dadosBusca } from '@/components/busca/dadosBusca';

export const metadata: Metadata = {
  title: 'Indicadores',
  description: 'Todos os indicadores de mobilidade urbana monitorados pela MobiliDADOS.',
};

export default function PaginaIndicadores() {
  return <PaginaBusca abaInicial="indicador" {...dadosBusca()} />;
}
