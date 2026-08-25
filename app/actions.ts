'use server';

// Todas las escrituras de la app. Una server action es un endpoint HTTP: si
// alguna no arranca con `requiereEditor()` o `requiereSuperAdmin()`, queda abierta.

import { revalidatePath } from 'next/cache';
import { requiereEditor, requiereSuperAdmin, sesion } from '@/lib/auth';
import { signIn, signOut } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function entrar() {
  await signIn('google');
}

export async function salir() {
  await signOut({ redirectTo: '/' });
}

// --- Premios ---------------------------------------------------------------

export async function crearPremio(fd: FormData) {
  await requiereEditor();
  const titulo = String(fd.get('titulo') ?? '').trim();
  if (!titulo) throw new Error('El premio necesita un título.');

  const foto = String(fd.get('foto') ?? '') || null;
  if (foto && !foto.startsWith('data:image/')) {
    throw new Error('La foto no es una imagen válida.');
  }

  await sql`
    insert into premios (titulo, descripcion, foto, orden)
    values (
      ${titulo},
      ${String(fd.get('descripcion') ?? '').trim() || null},
      ${foto},
      coalesce((select max(orden) + 1 from premios), 1)
    )`;
  revalidatePath('/premios');
}

export async function borrarPremio(id: number) {
  await requiereEditor();
  await sql`delete from premios where id = ${id}`;
  revalidatePath('/premios');
}

// --- Participantes ---------------------------------------------------------

export async function crearParticipante(fd: FormData) {
  await requiereEditor();
  const nombre = String(fd.get('nombre') ?? '').trim();
  if (!nombre) throw new Error('Falta el nombre.');

  const numeros = Number(fd.get('numeros'));
  if (!Number.isInteger(numeros) || numeros < 1) {
    throw new Error('Los números tienen que ser un entero mayor a cero.');
  }

  await sql`
    insert into participantes (nombre, numeros, nota)
    values (${nombre}, ${numeros}, ${String(fd.get('nota') ?? '').trim() || null})`;
  revalidatePath('/participantes');
}

/**
 * Suma (o resta) números a alguien que ya está en la lista.
 * En la vida real se vende de a poco y la misma persona vuelve a comprar; sin
 * esto habría que borrar la fila y recrearla con el total a mano.
 */
export async function ajustarNumeros(id: number, delta: number) {
  await requiereEditor();
  await sql`
    update participantes set numeros = numeros + ${delta}
    where id = ${id} and numeros + ${delta} >= 1`;
  revalidatePath('/participantes');
}

export async function borrarParticipante(id: number) {
  await requiereEditor();
  await sql`delete from participantes where id = ${id}`;
  revalidatePath('/participantes');
}

// --- Config de la rifa -----------------------------------------------------

export async function guardarConfig(fd: FormData) {
  await requiereEditor();
  const precio = Number(fd.get('precio_numero'));
  await sql`
    update config set
      titulo = ${String(fd.get('titulo') ?? '').trim() || 'Rifa'},
      bajada = ${String(fd.get('bajada') ?? '').trim() || null},
      fecha_sorteo = ${String(fd.get('fecha_sorteo') ?? '') || null},
      precio_numero = ${Number.isFinite(precio) && precio > 0 ? precio : null}
    where id = true`;
  revalidatePath('/', 'layout');
}

// --- Permisos (solo super admin) -------------------------------------------

export async function fijarPermiso(email: string, puedeEditar: boolean) {
  const admin = await requiereSuperAdmin();
  // Un super admin lo es por el entorno; tocarle la fila no cambia nada y solo
  // confunde al leer la tabla.
  if (email.toLowerCase() === admin.email) return;

  await sql`
    update usuarios set puede_editar = ${puedeEditar}
    where email = ${email.toLowerCase()}`;
  revalidatePath('/admin');
}

/** Para que la UI sepa qué mostrar. No expone nada que no sea del propio usuario. */
export async function miSesion() {
  return sesion();
}
