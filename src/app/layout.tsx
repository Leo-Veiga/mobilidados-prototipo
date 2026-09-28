import type { Metadata } from 'next';
import { Montserrat, Open_Sans } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Rodape from '@/components/Rodape';
import './globals.css';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-montserrat' });
const openSans = Open_Sans({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-open-sans' });

export const metadata: Metadata = {
  title: { default: 'MobiliDADOS', template: '%s | MobiliDADOS' },
  description: 'MobiliDADOS: indicadores e dados abertos de mobilidade urbana para as 27 capitais e 9 maiores regiões metropolitanas do Brasil.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${openSans.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Rodape />
      </body>
    </html>
  );
}
