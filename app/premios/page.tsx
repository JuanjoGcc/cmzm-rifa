import { sesion } from '@/lib/auth';
import { sql } from '@/lib/db';
import { Cabecera } from '@/components/Cabecera';
import { FormPremio } from '@/components/FormPremio';
import { TarjetaPremio, type Premio } from '@/components/TarjetaPremio';

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
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {premios.map((p, i) => (
            <TarjetaPremio
              key={p.id}
              premio={p}
              etiqueta={etiqueta(i)}
              puedeEditar={yo?.puedeEditar === true}
            />
          ))}
        </ul>
      )}

      {yo?.puedeEditar && <FormPremio />}
    </>
  );
}
