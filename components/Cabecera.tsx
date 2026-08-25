/** Título de sección con su bajada y, opcionalmente, un dato grande al costado. */
export function Cabecera({
  titulo,
  bajada,
  dato,
  datoEtiqueta,
}: {
  titulo: string;
  bajada?: string | null;
  dato?: string;
  datoEtiqueta?: string;
}) {
  return (
    <div className="mb-10 flex items-end justify-between gap-8 border-b border-line pb-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {titulo}
        </h1>
        {bajada && (
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
            {bajada}
          </p>
        )}
      </div>
      {dato && (
        <div className="shrink-0 text-right">
          <div className="cifra text-3xl font-medium text-acento">{dato}</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-faint">
            {datoEtiqueta}
          </div>
        </div>
      )}
    </div>
  );
}
