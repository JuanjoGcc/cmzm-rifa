import { sesion } from '@/lib/auth';
import { sql } from '@/lib/db';
import { Cabecera } from '@/components/Cabecera';
import { FormPremio } from '@/components/FormPremio';
import { BotonBorrar } from '@/components/BotonBorrar';
import { borrarPremio } from '@/app/actions';

type Premio = {
  id: number;
  titulo: string;
  descripcion: string | null;
  foto: string | null;
};

const ORDINALES = ['1er premio', '2do premio', '3er premio'];

function etiqueta(i: number) {
  return ORDINALES[i] ?? `${i + 1}º premio`;
}

export default async function PremiosPage() {
  const [premios, [config], yo] = await Promise.all([
    sql<Premio>`select id, titulo, descripcion, foto from premios order by orden, id`,
    sql<{ bajada: string | null; fecha_sorteo: Date | null }>`
      select bajada, fecha_sorteo from config`,
    sesion(),
  ]);

  const fecha = config?.fecha_sorteo
    ? new Date(config.fecha_sorteo).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : undefined;

  return (
    <>
      <Cabecera
        titulo="Premios"
        bajada={config?.bajada}
        dato={fecha}
        datoEtiqueta="Sorteo"
      />

      {premios.length === 0 ? (
        <p className="text-sm text-muted">Todavía no hay premios cargados.</p>
      ) : (
        <ul className="grid gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-2">
          {premios.map((p, i) => (
            <li key={p.id} className="group relative bg-surface">
              <div className="aspect-[4/3] overflow-hidden bg-raised">
                {p.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element -- la foto ya viene como data URL desde la BDD
                  <img
                    src={p.foto}
                    alt={p.titulo}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-faint">
                    sin foto
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between gap-4 p-5">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-gold">
                    {etiqueta(i)}
                  </div>
                  <h2 className="mt-1.5 font-display text-base font-medium tracking-tight">
                    {p.titulo}
                  </h2>
                  {p.descripcion && (
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {p.descripcion}
                    </p>
                  )}
                </div>
                {yo?.puedeEditar && (
                  <BotonBorrar
                    id={p.id}
                    accion={borrarPremio}
                    que={`el premio "${p.titulo}"`}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {yo?.puedeEditar && <FormPremio />}
    </>
  );
}
