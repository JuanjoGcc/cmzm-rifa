import { sesion } from '@/lib/auth';
import { sql } from '@/lib/db';
import { Cabecera } from '@/components/Cabecera';
import { BotonBorrar } from '@/components/BotonBorrar';
import { FormParticipante } from '@/components/FormParticipante';
import { Contador } from '@/components/Contador';
import { borrarParticipante } from '@/app/actions';

type Participante = {
  id: number;
  nombre: string;
  numeros: number;
  nota: string | null;
  creado: Date;
};

export default async function ParticipantesPage() {
  const yo = await sesion();

  if (!yo?.puedeEditar) {
    return (
      <>
        <Cabecera titulo="Participantes" />
        <p className="text-sm text-muted">
          Esta pantalla es solo para quienes pueden editar la rifa.
        </p>
      </>
    );
  }

  const [participantes, [config]] = await Promise.all([
    sql<Participante>`
      select id, nombre, numeros, nota, creado
      from participantes order by numeros desc, nombre`,
    sql<{ precio_numero: number | null }>`select precio_numero from config`,
  ]);

  const total = participantes.reduce((n, p) => n + p.numeros, 0);
  const precio = config?.precio_numero ?? null;
  const recaudado = precio === null ? null : total * precio;

  return (
    <>
      <Cabecera
        titulo="Participantes"
        bajada={
          recaudado === null
            ? undefined
            : `${participantes.length} personas · ${recaudado.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })} recaudados`
        }
        dato={total.toLocaleString('es-CL')}
        datoEtiqueta="Números vendidos"
      />

      {participantes.length === 0 ? (
        <p className="text-sm text-muted">Todavía no vendimos ningún número.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.14em] text-faint">
              <th className="pb-2 font-normal">Nombre</th>
              <th className="pb-2 pl-4 text-right font-normal">Números</th>
              {precio !== null && (
                <th className="hidden pb-2 pl-4 text-right font-normal sm:table-cell">
                  Total
                </th>
              )}
              <th className="w-px pb-2 pl-4" />
            </tr>
          </thead>
          <tbody>
            {participantes.map((p) => (
              <tr
                key={p.id}
                className="border-b border-line/60 last:border-0 hover:bg-surface/60"
              >
                <td className="py-3 pr-4">
                  <div className="font-medium">{p.nombre}</div>
                  {p.nota && (
                    <div className="mt-0.5 text-xs text-faint">{p.nota}</div>
                  )}
                </td>
                <td className="py-3 pl-4 text-right align-top">
                  <Contador id={p.id} numeros={p.numeros} />
                </td>
                {precio !== null && (
                  <td className="cifra hidden py-3 pl-4 text-right align-top text-muted sm:table-cell">
                    {(p.numeros * precio).toLocaleString('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      maximumFractionDigits: 0,
                    })}
                  </td>
                )}
                <td className="py-3 pl-4 text-right align-top">
                  <BotonBorrar
                    id={p.id}
                    accion={borrarParticipante}
                    que={p.nombre}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <FormParticipante />
    </>
  );
}
