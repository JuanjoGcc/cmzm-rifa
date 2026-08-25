import type { Metadata } from 'next';
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
  title: 'Rifa',
  description: 'Premios y participantes de la rifa.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El layout es async y toca la BDD, así que toda la app se renderiza por
  // request. Es lo que queremos: los números se venden mientras la gente mira.
  const [config] = await sql<{ titulo: string }>`select titulo from config`;
  const yo = await sesion();

  return (
    <html lang="es">
      <body
        className={`${sans.variable} ${display.variable} ${mono.variable} font-sans`}
      >
        <Navbar titulo={config?.titulo ?? 'Rifa'} yo={yo} />
        <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-10 sm:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
