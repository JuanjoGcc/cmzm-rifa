import { esSuperAdmin, haySuperAdmins, sesion } from '@/lib/auth';
import { sql } from '@/lib/db';
import { Cabecera } from '@/components/Cabecera';
import { Campo, Panel, claseInput } from '@/components/campos';
import { InterruptorPermiso } from '@/components/InterruptorPermiso';
import { guardarConfig } from '@/app/actions';

type Fila = {
  email: string;
  nombre: string | null;
  foto: string | null;
  puede_editar: boolean;
  ingresos: number;
  ultimo_acceso: Date | null;
};

export default async function AdminPage() {
  const yo = await sesion();

  if (!yo?.superAdmin) {
    return (
      <>
        <Cabecera titulo="Accesos" />
        <p className="text-sm text-muted">
          {haySuperAdmins()
            ? 'Esta pantalla es solo para super admins.'
            : 'Este deployment no tiene ningún super admin: falta setear SUPER_ADMIN_EMAILS.'}
        </p>
      </>
    );
  }

  const [usuarios, [config]] = await Promise.all([
    sql<Fila>`
      select email, nombre, foto, puede_editar, ingresos, ultimo_acceso
      from usuarios order by puede_editar desc, ultimo_acceso desc nulls last`,
    sql<{
      titulo: string;
      bajada: string | null;
      fecha_sorteo: Date | null;
      precio_numero: number | null;
    }>`select titulo, bajada, fecha_sorteo, precio_numero from config`,
  ]);

  return (
    <>
      <Cabecera
        titulo="Accesos"
        bajada="Cualquiera puede mirar la rifa sin entrar. Acá decidís quién además puede editarla."
      />

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.14em] text-faint">
            <th className="pb-2 font-normal">Cuenta</th>
            <th className="hidden pb-2 pl-4 text-right font-normal sm:table-cell">
              Último acceso
            </th>
            <th className="pb-2 pl-4 text-right font-normal">Puede editar</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.email} className="border-b border-line/60 last:border-0">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  {u.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element -- avatar de Google
                    <img
                      src={u.foto}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-7 w-7 rounded-full"
                    />
                  ) : (
                    <span className="h-7 w-7 rounded-full bg-raised" />
                  )}
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {u.nombre ?? u.email}
                    </div>
                    <div className="truncate text-xs text-faint">{u.email}</div>
                  </div>
                </div>
              </td>
              <td className="cifra hidden py-3 pl-4 text-right text-xs text-muted sm:table-cell">
                {u.ultimo_acceso
                  ? new Date(u.ultimo_acceso).toLocaleDateString('es-CL')
                  : '—'}
              </td>
              <td className="py-3 pl-4 text-right">
                {esSuperAdmin(u.email) ? (
                  <span className="text-xs text-acento">Super admin</span>
                ) : (
                  <InterruptorPermiso
                    email={u.email}
                    puedeEditar={u.puede_editar}
                  />
                )}
              </td>
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-sm text-muted">
                Nadie inició sesión todavía. Aparecen acá después de su primer
                login con Google.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Panel titulo="Datos de la rifa">
        <form action={guardarConfig} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Título">
            <input
              name="titulo"
              defaultValue={config?.titulo ?? ''}
              maxLength={80}
              className={claseInput}
            />
          </Campo>
          <Campo etiqueta="Fecha del sorteo">
            <input
              name="fecha_sorteo"
              type="date"
              defaultValue={
                config?.fecha_sorteo
                  ? new Date(config.fecha_sorteo).toISOString().slice(0, 10)
                  : ''
              }
              className={claseInput}
            />
          </Campo>
          <Campo etiqueta="Bajada">
            <input
              name="bajada"
              defaultValue={config?.bajada ?? ''}
              maxLength={200}
              placeholder="Para qué juntamos la plata"
              className={claseInput}
            />
          </Campo>
          <Campo etiqueta="Precio por número (CLP)">
            <input
              name="precio_numero"
              type="number"
              min={0}
              defaultValue={config?.precio_numero ?? ''}
              className={`${claseInput} cifra`}
            />
          </Campo>
          <div>
            <button
              type="submit"
              className="rounded border border-acento/40 bg-acento/10 px-4 py-2 text-sm text-acento transition-colors hover:bg-acento/20"
            >
              Guardar
            </button>
          </div>
        </form>
      </Panel>
    </>
  );
}
