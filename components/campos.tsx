/** Estilos compartidos de formulario. Sin librería: son tres clases. */

export const claseInput =
  'w-full rounded border border-line bg-fondo px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-acento/60';

export function Campo({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-faint">
        {etiqueta}
      </span>
      {children}
    </label>
  );
}

export function Panel({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 rounded border border-line bg-surface p-6">
      <h2 className="mb-5 font-display text-sm font-medium tracking-tight text-muted">
        {titulo}
      </h2>
      {children}
    </section>
  );
}
