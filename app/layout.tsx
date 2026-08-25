import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import { sql } from '@/lib/db';
import { sesion } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import './globals.css';

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--fuente-sans',
});
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--fuente-display',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--fuente-mono',
});

export const metadata: Metadata = {
  title: 'Rifa CMZM',
  description: 'Premios y participantes de la rifa.',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Rifa CMZM' },
};

// Corre antes de pintar: si el tema se resolviera en React, la página arrancaría
// clara y saltaría a oscura en la hidratación.
const SCRIPT_TEMA = `try{var t=localStorage.getItem('tema')||'sistema',d=document.documentElement;d.dataset.tema=t;d.dataset.modo=t==='sistema'?(matchMedia('(prefers-color-scheme: dark)').matches?'oscuro':'claro'):t}catch(e){}`;

export const viewport: Viewport = {
  themeColor: '#000080',
  viewportFit: 'cover',
};

// El layout lee el título de la BDD, así que sin esto Next intenta prerenderizar
// `/` en build y el deploy se cae antes de que exista POSTGRES_URL. Además es lo
// que queremos: los números se venden mientras la gente mira la página.
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config] = await sql<{ titulo: string }>`select titulo from config`;
  const yo = await sesion();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body
        className={`${sans.variable} ${display.variable} ${mono.variable} font-sans`}
      >
        <Navbar titulo={config?.titulo ?? 'Rifa CMZM'} yo={yo} />
        <main className="mx-auto w-full max-w-6xl px-6 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-10 sm:px-8 sm:pb-24">
          {children}
        </main>
      </body>
    </html>
  );
}
