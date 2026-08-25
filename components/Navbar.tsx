import Link from 'next/link';
import type { Sesion } from '@/lib/auth';
import { MenuUsuario } from './MenuUsuario';
import { SelectorTema } from './SelectorTema';
import { Tab } from './Tab';

/** Marca de la rifa: un boleto con el troquel al medio. */
function Logo() {
  return (
    <svg viewBox="0 0 28 18" className="h-4 w-6 shrink-0" aria-hidden="true">
      <path
        d="M1 1h26v4a4 4 0 0 0 0 8v4H1v-4a4 4 0 0 0 0-8V1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M14 3v2m0 3v2m0 3v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}


export function Navbar({ titulo, yo }: { titulo: string; yo: Sesion | null }) {
  const tabs = (abajo?: boolean) => (
    <>
      <Tab href="/premios" abajo={abajo}>
        Premios
      </Tab>
      <Tab href="/participantes" abajo={abajo}>
        Participantes
      </Tab>
      {yo?.superAdmin && (
        <Tab href="/admin" abajo={abajo}>
          Accesos
        </Tab>
      )}
    </>
  );

  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-4 px-6 pt-5 sm:gap-6 sm:px-8">
          <div className="flex items-end gap-4 sm:gap-7">
            <Link
              href="/premios"
              className="flex items-center gap-2 pb-3 text-acento"
              aria-label={titulo}
            >
              <Logo />
              <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
                {titulo}
              </span>
            </Link>
            <nav className="hidden items-end gap-6 sm:flex">{tabs()}</nav>
          </div>
          <div className="flex items-center gap-3 pb-2.5">
            <SelectorTema />
            <MenuUsuario yo={yo} />
          </div>
        </div>
      </header>

      {/* En el teléfono las pestañas van abajo: instalada como PWA es donde
          llega el pulgar, y arriba no entran junto al título y el avatar. */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
        {tabs(true)}
      </nav>
    </>
  );
}
