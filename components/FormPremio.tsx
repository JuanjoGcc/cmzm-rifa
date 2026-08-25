'use client';

import { useRef, useState, useTransition } from 'react';
import { crearPremio } from '@/app/actions';
import { Campo, Panel, claseInput } from './campos';

/** Lado más largo al que reducimos la foto antes de guardarla. */
const LADO_MAX = 1000;

/**
 * La foto va como data URL dentro de la columna (ver "Las fotos" en CLAUDE.md).
 * El reescalado no es cosmético: sin él una foto de celular son 4 MB por fila.
 */
async function aDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(bitmap.width * escala);
  lienzo.height = Math.round(bitmap.height * escala);
  lienzo.getContext('2d')!.drawImage(bitmap, 0, 0, lienzo.width, lienzo.height);
  bitmap.close();
  return lienzo.toDataURL('image/webp', 0.82);
}

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
              className="rounded border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
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
