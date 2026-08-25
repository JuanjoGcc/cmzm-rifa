'use client';

import { useRef, useState, useTransition } from 'react';
import { crearPremio } from '@/app/actions';
import { Campo, Panel, claseInput } from './campos';
import { aDataUrl } from './foto';

export function FormPremio() {
  const form = useRef<HTMLFormElement>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  return (
    <Panel titulo="Agregar premio">
      <form
        ref={form}
        action={(fd) => {
          if (foto) fd.set('foto', foto);
          setError(null);
          iniciar(async () => {
            try {
              await crearPremio(fd);
              form.current?.reset();
              setFoto(null);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'No se pudo guardar.');
            }
          });
        }}
        className="grid gap-5 sm:grid-cols-[9rem_1fr]"
      >
        <label className="block cursor-pointer">
          <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-faint">
            Foto
          </span>
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded border border-dashed border-line bg-fondo text-xs text-faint transition-colors hover:border-faint">
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview local
              <img src={foto} alt="" className="h-full w-full object-cover" />
            ) : (
              'Elegir…'
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                setFoto(await aDataUrl(f));
              } catch {
                setError('No pudimos leer esa imagen.');
              }
            }}
          />
        </label>

        <div className="grid content-start gap-4">
          <Campo etiqueta="Título">
            <input
              name="titulo"
              required
              maxLength={120}
              placeholder="Bicicleta aro 29"
              className={claseInput}
            />
          </Campo>
          <Campo etiqueta="Descripción">
            <textarea
              name="descripcion"
              rows={2}
              maxLength={400}
              placeholder="Opcional: marca, modelo, quién lo donó…"
              className={claseInput}
            />
          </Campo>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={pendiente}
              className="rounded border border-acento/40 bg-acento/10 px-4 py-2 text-sm text-acento transition-colors hover:bg-acento/20 disabled:opacity-50"
            >
              {pendiente ? 'Guardando…' : 'Agregar premio'}
            </button>
            {error && <span className="text-xs text-danger">{error}</span>}
          </div>
        </div>
      </form>
    </Panel>
  );
}
