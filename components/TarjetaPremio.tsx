'use client';

import { useState, useTransition } from 'react';
import { borrarPremio, editarPremio } from '@/app/actions';
import { BotonBorrar } from './BotonBorrar';
import { claseInput } from './campos';
import { aDataUrl } from './foto';

export type Premio = {
  id: number;
  titulo: string;
  descripcion: string | null;
  foto: string | null;
};

export function TarjetaPremio({
  premio,
  etiqueta,
  puedeEditar,
}: {
  premio: Premio;
  etiqueta: string;
  puedeEditar: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  // La foto recién elegida todavía no está en la BDD: se ve igual porque ya es
  // la data URL que vamos a guardar.
  const verFoto = foto ?? premio.foto;

  const imagen = (
    <div className="aspect-[4/3] overflow-hidden bg-raised">
      {verFoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- la foto ya viene como data URL desde la BDD
        <img
          src={verFoto}
          alt={premio.titulo}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-faint">
          sin foto
        </div>
      )}
    </div>
  );

  if (!editando) {
    return (
      <li className="group relative overflow-hidden rounded-lg border border-line bg-surface">
        {imagen}
        <div className="flex items-start justify-between gap-3 p-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-acento">
              {etiqueta}
            </div>
            <h2 className="mt-1.5 font-display text-base font-medium tracking-tight">
              {premio.titulo}
            </h2>
            {premio.descripcion && (
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {premio.descripcion}
              </p>
            )}
          </div>
          {puedeEditar && (
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={() => setEditando(true)}
                className="text-xs text-faint transition-colors hover:text-ink"
              >
                Editar
              </button>
              <BotonBorrar
                id={premio.id}
                accion={borrarPremio}
                que={`el premio "${premio.titulo}"`}
              />
            </div>
          )}
        </div>
      </li>
    );
  }

  return (
    <li className="overflow-hidden rounded-lg border border-acento/40 bg-surface">
      <form
        action={(fd) => {
          if (foto) fd.set('foto', foto);
          setError(null);
          iniciar(async () => {
            try {
              await editarPremio(fd);
              setEditando(false);
              setFoto(null);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'No se pudo guardar.');
            }
          });
        }}
      >
        <input type="hidden" name="id" value={premio.id} />

        <label className="relative block cursor-pointer">
          {imagen}
          <span className="absolute inset-x-0 bottom-0 bg-fondo/85 py-1.5 text-center text-xs text-acento">
            {verFoto ? 'Cambiar foto' : 'Subir foto'}
          </span>
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

        <div className="grid gap-3 p-4">
          <input
            name="titulo"
            required
            maxLength={120}
            defaultValue={premio.titulo}
            className={claseInput}
          />
          <textarea
            name="descripcion"
            rows={2}
            maxLength={400}
            defaultValue={premio.descripcion ?? ''}
            placeholder="Descripción"
            className={claseInput}
          />
          <div className="flex items-center gap-3 text-sm">
            <button
              type="submit"
              disabled={pendiente}
              className="rounded border border-acento/40 bg-acento/10 px-3 py-1.5 text-acento transition-colors hover:bg-acento/20 disabled:opacity-50"
            >
              {pendiente ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditando(false);
                setFoto(null);
                setError(null);
              }}
              className="text-xs text-faint transition-colors hover:text-ink"
            >
              Cancelar
            </button>
          </div>
          {error && <span className="text-xs text-danger">{error}</span>}
        </div>
      </form>
    </li>
  );
}
