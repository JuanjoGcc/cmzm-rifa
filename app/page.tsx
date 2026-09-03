import Link from 'next/link';
import { sesion } from '@/lib/auth';
import { sql } from '@/lib/db';

// Poné el archivo en `public/` y nombralo acá: `.mp4`/`.webm` se muestran como
// video en loop, cualquier otra cosa como foto. Vacío no muestra nada.
const PORTADA = '';

const DESTINOS = [
  {
    titulo: 'Tres garrochas usadas',
    detalle:
      'Reservadas para el team. Son el material que hoy falta y lo que más limita entrenar.',
  },
  {
    titulo: 'Materiales de lanzamiento',
    detalle: 'Implementos para sumar la rama de lanzamientos a los entrenamientos.',
  },
  {
    titulo: 'Un anexo a la bodega',
    detalle: 'Para guardar los materiales del club sin que se arruinen a la intemperie.',
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
          Team Famas de Garrochas
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {config?.titulo ?? 'Rifa CMZM'}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
          {config?.bajada ??
            'Juntamos plata para comprar garrochas, materiales de lanzamiento y levantar un anexo a la bodega del club. Los números se venden en persona; acá se anota lo vendido y se mira cómo va.'}
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

      {PORTADA && (
        <div className="mt-10 overflow-hidden rounded-lg border border-line bg-raised">
          {/\.(mp4|webm)$/.test(PORTADA) ? (
            <video
              src={PORTADA}
              autoPlay
              muted
              loop
              playsInline
              className="aspect-video w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- archivo estático en public/
            <img
              src={PORTADA}
              alt="El team saltando"
              className="aspect-video w-full object-cover"
            />
          )}
        </div>
      )}

      <section className="mt-14 grid gap-10 sm:grid-cols-[14rem_1fr] sm:gap-16">
        <h2 className="font-display text-lg font-medium tracking-tight">
          En qué se usa la plata
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
