'use client';

import { useState, useTransition } from 'react';

/**
 * Borrar en dos toques en vez de un `confirm()`: el diálogo nativo bloquea el
 * hilo y se ve como una alerta del navegador, no como la página.
 */
export function BotonBorrar({
  id,
  accion,
  que,
}: {
  id: number;
  accion: (id: number) => Promise<void>;
  que: string;
}) {
  const [armado, setArmado] = useState(false);
  const [pendiente, iniciar] = useTransition();

  if (!armado) {
    return (
      <button
        type="button"
        onClick={() => setArmado(true)}
        aria-label={`Quitar ${que}`}
        className="shrink-0 text-xs text-faint transition-colors hover:text-danger"
      >
        Quitar
      </button>
    );
  }

  return (
    <span className="flex shrink-0 items-center gap-2 text-xs">
      <button
        type="button"
        disabled={pendiente}
        onClick={() => iniciar(() => void accion(id))}
        className="text-danger hover:underline disabled:opacity-50"
      >
        {pendiente ? 'Quitando…' : 'Confirmar'}
      </button>
      <button
        type="button"
        onClick={() => setArmado(false)}
        className="text-faint hover:text-ink"
      >
        No
      </button>
    </span>
  );
}
