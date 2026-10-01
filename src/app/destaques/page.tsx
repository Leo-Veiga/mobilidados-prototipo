import type { Metadata } from 'next';
import CabecalhoPagina from '@/components/CabecalhoPagina';
import GradeDestaques from '@/components/destaques/GradeDestaques';
import { destaques } from '@/lib/destaques';

export const metadata: Metadata = {
  title: 'Destaques',
  description: 'Números que ajudam a entender a mobilidade urbana nas capitais e regiões metropolitanas brasileiras.',
};

export default function PaginaDestaques() {
  return (
    <>
      <CabecalhoPagina titulo="Destaques">
        <p className="centro nota" style={{ marginTop: 12 }}>
          Números que ajudam a entender a mobilidade urbana. Passe o mouse ou toque em um card para ver a explicação e compartilhar.
        </p>
      </CabecalhoPagina>
      <div className="container" style={{ padding: '40px 20px 80px' }}>
        <GradeDestaques itens={destaques} />
      </div>
    </>
  );
}
