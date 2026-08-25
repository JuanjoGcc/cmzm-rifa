'use server';

// Todas las escrituras de la app. Una server action es un endpoint HTTP: si
// alguna no arranca con `requiereEditor()` o `requiereSuperAdmin()`, queda abierta,
// y sus argumentos los elige el cliente, no el formulario (ver `lib/validar.ts`).

import { revalidatePath } from 'next/cache';
import {
  requiereEditor,
  requiereSuperAdmin,
  signIn,
  signOut,
} from '@/lib/auth';
import { sql } from '@/lib/db';
import * as v from '@/lib/validar';

export async function entrar() {
  await signIn('google');
}

export async function salir() {
  await signOut({ redirectTo: '/' });
}

// --- Premios ---------------------------------------------------------------

export async function crearPremio(fd: FormData) {
  await requiereEditor();
  const titulo = v.textoRequerido(fd, 'titulo', 120);
  const descripcion = v.texto(fd, 'descripcion', 400);
  const foto = v.foto(fd);

  await sql`
    insert into premios (titulo, descripcion, foto, orden)
    values (
      ${titulo},
      ${descripcion},
      ${foto},
      coalesce((select max(orden) + 1 from premios), 1)
    )`;
  revalidatePath('/premios');
}

export async function editarPremio(fd: FormData) {
  await requiereEditor();
  const premioId = v.id(fd.get('id'));
  const titulo = v.textoRequerido(fd, 'titulo', 120);
  const descripcion = v.texto(fd, 'descripcion', 400);
  const foto = v.foto(fd);

  await sql`
    update premios set
      titulo = ${titulo},
      descripcion = ${descripcion},
      -- Sin foto nueva queda la que había: el formulario no reenvía la vieja.
      foto = coalesce(${foto}, foto)
    where id = ${premioId}`;
  revalidatePath('/premios');
}

export async function borrarPremio(premioId: number) {
  await requiereEditor();
  await sql`delete from premios where id = ${v.id(premioId)}`;
  revalidatePath('/premios');
}

// --- Participantes ---------------------------------------------------------

export async function crearParticipante(fd: FormData) {
  await requiereEditor();
  const nombre = v.textoRequerido(fd, 'nombre', 120);
  const numeros = v.entero(fd.get('numeros'), 1, 100_000, 'Los números');
  const nota = v.texto(fd, 'nota', 200);

  await sql`
    insert into participantes (nombre, numeros, nota)
    values (${nombre}, ${numeros}, ${nota})`;
  revalidatePath('/participantes');
}

/**
 * Suma (o resta) números a alguien que ya está en la lista.
 * En la vida real se vende de a poco y la misma persona vuelve a comprar; sin
 * esto habría que borrar la fila y recrearla con el total a mano.
 */
export async function ajustarNumeros(participanteId: number, delta: number) {
  await requiereEditor();
  const d = v.entero(delta, -1000, 1000, 'El ajuste');
  await sql`
    update participantes set numeros = numeros + ${d}
    where id = ${v.id(participanteId)} and numeros + ${d} >= 1`;
  revalidatePath('/participantes');
}

export async function borrarParticipante(participanteId: number) {
  await requiereEditor();
  await sql`delete from participantes where id = ${v.id(participanteId)}`;
  revalidatePath('/participantes');
}

// --- Config de la rifa -----------------------------------------------------

export async function guardarConfig(fd: FormData) {
  await requiereEditor();
  const precio = String(fd.get('precio_numero') ?? '').trim();

  await sql`
    update config set
      titulo = ${v.texto(fd, 'titulo', 80) ?? 'Rifa'},
      bajada = ${v.texto(fd, 'bajada', 200)},
      fecha_sorteo = ${v.fecha(fd, 'fecha_sorteo')},
      precio_numero = ${precio ? v.entero(precio, 0, 100_000_000, 'El precio') : null}
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
    update usuarios set puede_editar = ${puedeEditar === true}
    where email = ${email.toLowerCase()}`;
  revalidatePath('/admin');
}
