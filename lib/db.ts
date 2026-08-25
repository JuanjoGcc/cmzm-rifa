import { Pool } from 'pg';

// El pool vive en globalThis para que el hot reload de `next dev` no abra uno
// nuevo por recarga hasta agotar las conexiones de Postgres.
const g = globalThis as { _pool?: Pool };

function pool(): Pool {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error('Falta POSTGRES_URL (ver .env.example)');
  g._pool ??= new Pool({
    connectionString: url,
    // Vercel/Neon exigen TLS; el Postgres local no lo tiene.
    ssl: url.includes('localhost') ? false : { rejectUnauthorized: false },
  });
  return g._pool;
}

/** Cada interpolación pasa a ser $1, $2… Exportada aparte para poder testearla. */
export function armarConsulta(strings: readonly string[]): string {
  return strings.reduce((q, s, i) => q + '$' + i + s);
}

/**
 * Consulta con template tag: `sql<Fila>\`select * from premios where id = ${id}\``
 *
 * Los valores siempre viajan como parámetros, así que no hay forma de armar una
 * consulta concatenando input del usuario aunque uno quiera.
 */
export async function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const { rows } = await pool().query(armarConsulta(strings), values);
  return rows as T[];
}
