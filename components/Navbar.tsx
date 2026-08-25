import Link from 'next/link';
import type { Sesion } from '@/lib/auth';
import { MenuUsuario } from './MenuUsuario';

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

function Tab({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="-mb-px border-b border-transparent px-1 pb-3 text-sm text-muted transition-colors hover:border-line hover:text-ink"
    >
      {children}
    </Link>
  );
}

export function Navbar({ titulo, yo }: { titulo: string; yo: Sesion | null }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex w-full max-w-5xl items-end justify-between gap-6 px-6 pt-5 sm:px-8">
        <div className="flex items-end gap-7">
          <Link
            href="/premios"
            className="flex items-center gap-2 pb-3 text-gold"
            aria-label={titulo}
          >
            <Logo />
            <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
              {titulo}
            </span>
          </Link>
          <nav className="flex items-end gap-6">
            <Tab href="/premios">Premios</Tab>
            <Tab href="/participantes">Participantes</Tab>
            {yo?.superAdmin && <Tab href="/admin">Accesos</Tab>}
          </nav>
        </div>
        <div className="pb-2.5">
          <MenuUsuario yo={yo} />
        </div>
      </div>
    </header>
  );
}
