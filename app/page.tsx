import Link from 'next/link';
import { Portada } from '@/components/Portada';
import { sesion } from '@/lib/auth';
import { sql } from '@/lib/db';

const DESTINOS = [
  {
    titulo: 'Tres garrochas usadas',
    detalle:
      'Queremos incorporar nuevas garrochas para que nuestros atletas cuenten con más material disponible y mejores condiciones para entrenar.',
  },
  {
    titulo: 'Materiales para lanzamiento',
    detalle:
      'Queremos ampliar nuestras posibilidades de entrenamiento incorporando material que nos permita desarrollar y potenciar el área de lanzamientos dentro del equipo.',
  },
  {
    titulo: 'Una nueva bodega',
    detalle:
      'Queremos construir un anexo para la bodega que nos permita almacenar y proteger los materiales que utilizamos en nuestros entrenamientos.',
  },
];

export default async function Inicio() {
  const [[config], [premios], [vendidos], yo] = await Promise.all([
    sql<{
      titulo: string;
      bajada: string | null;
      fecha_sorteo: Date | null;
      precio_numero: number | null;
    }>`select titulo, bajada, fecha_sorteo, precio_numero from config`,
    sql<{ n: string }>`select count(*) as n from premios`,
    sql<{ n: string | null }>`select sum(numeros) as n from participantes`,
    sesion(),
  ]);

  const fecha = config?.fecha_sorteo
    ? new Date(config.fecha_sorteo).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : null;

  const cifras = [
    { dato: premios?.n ?? '0', etiqueta: 'Premios' },
    { dato: vendidos?.n ?? '0', etiqueta: 'Números vendidos' },
    config?.precio_numero
      ? {
          dato: config.precio_numero.toLocaleString('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0,
          }),
          etiqueta: 'Por número',
        }
      : null,
    fecha ? { dato: fecha, etiqueta: 'Sorteo' } : null,
  ].filter((c) => c !== null);

  return (
    <>
      <section className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.14em] text-acento">
          Equipo de atletismo MCM
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {config?.titulo ?? 'Rifa CMZM'}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
          {config?.bajada ??
            'Queremos seguir creciendo y mejorar nuestros entrenamientos. Por eso estamos realizando esta rifa para reunir fondos que nos permitan incorporar nuevo material y mejorar nuestros espacios. Cada número que compras es un aporte directo al desarrollo de nuestro equipo.'}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/premios"
            className="rounded border border-acento/40 bg-acento/10 px-4 py-2 text-sm text-acento transition-colors hover:bg-acento/20"
          >
            Ver los premios
          </Link>
          {yo?.puedeEditar && (
            <Link
              href="/participantes"
              className="rounded border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-faint hover:text-ink"
            >
              Quién compró
            </Link>
          )}
        </div>
      </section>

      <Portada />

      <section className="mt-14 grid gap-10 sm:grid-cols-[14rem_1fr] sm:gap-16">
        <h2 className="font-display text-lg font-medium tracking-tight">
          ¿A qué destinaremos lo recaudado?
        </h2>
        <ul className="divide-y divide-line">
          {DESTINOS.map((d) => (
            <li key={d.titulo} className="py-4 first:pt-0 last:pb-0">
              <h3 className="font-display text-base font-medium tracking-tight">
                {d.titulo}
              </h3>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
                {d.detalle}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <dl className="mt-14 grid grid-cols-2 gap-y-6 border-t border-line pt-5 sm:grid-cols-4">
        {cifras.map((c) => (
          <div key={c.etiqueta}>
            <dd className="cifra text-2xl font-medium">{c.dato}</dd>
            <dt className="mt-1 text-[11px] uppercase tracking-[0.14em] text-faint">
              {c.etiqueta}
            </dt>
          </div>
        ))}
      </dl>
    </>
  );
}
