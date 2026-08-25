'use client';

import { useRef, useState, useTransition } from 'react';
import { crearParticipante } from '@/app/actions';
import { Campo, Panel, claseInput } from './campos';

export function FormParticipante() {
  const form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  return (
    <Panel titulo="Anotar una venta">
      <form
        ref={form}
        action={(fd) => {
          setError(null);
          iniciar(async () => {
            try {
              await crearParticipante(fd);
              form.current?.reset();
            } catch (e) {
              setError(e instanceof Error ? e.message : 'No se pudo guardar.');
            }
          });
        }}
        className="grid gap-4 sm:grid-cols-[2fr_6rem_2fr_auto] sm:items-end"
      >
        <Campo etiqueta="Nombre">
          <input
            name="nombre"
            required
            maxLength={120}
            placeholder="María Pérez"
            className={claseInput}
          />
        </Campo>
        <Campo etiqueta="Números">
          <input
            name="numeros"
            type="number"
            min={1}
            defaultValue={1}
            required
            className={`${claseInput} cifra`}
          />
        </Campo>
        <Campo etiqueta="Nota">
          <input
            name="nota"
            maxLength={200}
            placeholder="Teléfono, quién le vendió…"
            className={claseInput}
          />
        </Campo>
        <button
          type="submit"
          disabled={pendiente}
          className="h-[38px] rounded border border-acento/40 bg-acento/10 px-4 text-sm text-acento transition-colors hover:bg-acento/20 disabled:opacity-50"
        >
          {pendiente ? 'Guardando…' : 'Anotar'}
        </button>
        {error && (
          <span className="text-xs text-danger sm:col-span-4">{error}</span>
        )}
      </form>
    </Panel>
  );
}
