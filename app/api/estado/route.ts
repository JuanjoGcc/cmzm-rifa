import { haySuperAdmins } from '@/lib/permisos';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Diagnóstico de deployment: dice qué falta cuando la app tira 500 y no hay
 * forma de leer los logs. Devuelve booleanos y códigos, nunca valores.
 *
 * ponytail: andamio de la puesta en marcha. Cuando la app esté andando en
 * producción, borrar este archivo.
 */
export async function GET() {
  const estado: Record<string, unknown> = {
    postgresUrl: Boolean(process.env.POSTGRES_URL),
    authSecret: Boolean(process.env.AUTH_SECRET),
    google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    superAdmins: haySuperAdmins(),
  };

  try {
    const tablas = await sql<{ tabla: string }>`
      select tablename as tabla from pg_tables
      where schemaname = 'public' order by 1`;
    estado.tablas = tablas.map((t) => t.tabla);
  } catch (e) {
    // Solo el código: el mensaje crudo de Postgres puede traer el host.
    const err = e as { code?: string };
    estado.errorBdd = err.code ?? 'desconocido';
  }

  return Response.json(estado);
}
