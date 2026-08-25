'use client';

import { useTransition } from 'react';
import { fijarPermiso } from '@/app/actions';

export function InterruptorPermiso({
  email,
  puedeEditar,
}: {
  email: string;
  puedeEditar: boolean;
}) {
  const [pendiente, iniciar] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={puedeEditar}
      aria-label={`Permitir que ${email} edite`}
      disabled={pendiente}
      onClick={() => iniciar(() => void fijarPermiso(email, !puedeEditar))}
      className={`h-5 w-9 rounded-full border transition-colors disabled:opacity-50 ${
        puedeEditar ? 'border-acento/50 bg-acento/25' : 'border-line bg-raised'
      }`}
    >
      <span
        className={`block h-3.5 w-3.5 rounded-full transition-transform ${
          puedeEditar ? 'translate-x-[18px] bg-acento' : 'translate-x-[2px] bg-faint'
        }`}
      />
    </button>
  );
}
