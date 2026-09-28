import type { Metadata } from 'next';
// Fonte instalada no projeto (sem depender do Google Fonts durante o build)
import '@fontsource/open-sans/latin-300.css';
import '@fontsource/open-sans/latin-400.css';
import '@fontsource/open-sans/latin-600.css';
import '@fontsource/open-sans/latin-700.css';
import Cabecalho from '@/components/Cabecalho';
import Rodape from '@/components/Rodape';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'MobiliDADOS', template: '%s | MobiliDADOS' },
  description: 'MobiliDADOS: indicadores e dados abertos de mobilidade urbana para as 27 capitais e 9 maiores regiões metropolitanas do Brasil.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Cabecalho />
        <main>{children}</main>
        <Rodape />
      </body>
    </html>
  );
}
