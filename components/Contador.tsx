'use client';

import { useTransition } from 'react';
import { ajustarNumeros } from '@/app/actions';

/**
 * −/+ al lado de la cifra. Es la operación del día a día: alguien que ya está
 * en la lista compra dos números más y hay que sumárselos sin abrir un
 * formulario.
 */
export function Contador({ id, numeros }: { id: number; numeros: number }) {
  const [pendiente, iniciar] = useTransition();

  const boton = (delta: number, signo: string) => (
    <button
      type="button"
      disabled={pendiente || (delta < 0 && numeros <= 1)}
      onClick={() => iniciar(() => void ajustarNumeros(id, delta))}
      aria-label={delta > 0 ? 'Sumar un número' : 'Restar un número'}
      className="h-5 w-5 rounded border border-line text-xs leading-none text-faint transition-colors hover:border-faint hover:text-ink disabled:opacity-30"
    >
      {signo}
    </button>
  );

  return (
    <span className="inline-flex items-center gap-2">
      {boton(-1, '−')}
      <span className={`cifra w-8 text-right ${pendiente ? 'opacity-50' : ''}`}>
        {numeros}
      </span>
      {boton(1, '+')}
    </span>
  );
}
