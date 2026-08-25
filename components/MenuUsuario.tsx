import type { Sesion } from '@/lib/auth';
import { entrar, salir } from '@/app/actions';

/** Wordmark de Google, para que el botón se lea como el resto de la web. */
function IconoGoogle() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.7 30.2.5 24 .5 14.6.5 6.5 5.8 2.6 13.5l7.8 6c1.9-5.6 7.1-10 13.6-10z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.2 5.6c4.2-3.9 6.6-9.6 6.6-16.8z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-7.8-6C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.5l7.8-6z"
      />
      <path
        fill="#34A853"
        d="M24 47.5c6.2 0 11.5-2 15.3-5.5l-7.2-5.6c-2 1.4-4.6 2.2-8.1 2.2-6.5 0-11.7-4.4-13.6-10l-7.8 6C6.5 42.2 14.6 47.5 24 47.5z"
      />
    </svg>
  );
}

export function MenuUsuario({ yo }: { yo: Sesion | null }) {
  if (!yo) {
    return (
      <form action={entrar}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:border-faint hover:bg-raised"
        >
          <IconoGoogle />
          Entrar con Google
        </button>
      </form>
    );
  }

  // `<details>` en vez de una librería de dropdown: cierra con Escape, es
  // navegable con teclado y no baja un solo kilobyte de JavaScript.
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded outline-none focus-visible:ring-1 focus-visible:ring-gold">
        {yo.foto ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar de Google, sin optimizar
          <img
            src={yo.foto}
            alt=""
            referrerPolicy="no-referrer"
            className="h-7 w-7 rounded-full"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-raised text-xs font-medium">
            {yo.nombre.charAt(0).toUpperCase()}
          </span>
        )}
      </summary>
      <div className="absolute right-0 top-9 z-10 w-60 rounded border border-line bg-surface p-1 text-sm">
        <div className="px-3 py-2">
          <div className="truncate font-medium">{yo.nombre}</div>
          <div className="truncate text-xs text-muted">{yo.email}</div>
          <div className="mt-1.5 text-xs text-gold">
            {yo.superAdmin
              ? 'Super admin'
              : yo.puedeEditar
                ? 'Puede editar'
                : 'Solo lectura'}
          </div>
        </div>
        <div className="my-1 border-t border-line" />
        <form action={salir}>
          <button
            type="submit"
            className="w-full rounded px-3 py-1.5 text-left text-muted transition-colors hover:bg-raised hover:text-ink"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </details>
  );
}
