// Validación de lo que entra por las server actions. Los `maxLength` y los
// `type="number"` del formulario no cuentan: el cliente elige los argumentos.
// Módulo aparte de `actions.ts` para poder testearlo sin arrastrar a Next.

/** Máximo de un data URL de foto. Se corresponde con el techo del CLAUDE.md. */
export const FOTO_MAX_BYTES = 1_500_000;

export function texto(
  fd: FormData,
  campo: string,
  max: number,
): string | null {
  const v = String(fd.get(campo) ?? '').trim();
  if (v.length > max) {
    throw new Error(`"${campo}" no puede pasar de ${max} caracteres.`);
  }
  return v || null;
}

export function textoRequerido(
  fd: FormData,
  campo: string,
  max: number,
): string {
  const v = texto(fd, campo, max);
  if (v === null) throw new Error(`Falta "${campo}".`);
  return v;
}

export function entero(
  valor: unknown,
  min: number,
  max: number,
  que: string,
): number {
  const error = new Error(`${que} tiene que ser un entero entre ${min} y ${max}.`);
  // `Number('')` y `Number(null)` son 0: sin este corte un campo vacío entraría
  // como un cero perfectamente válido en vez de ser rechazado.
  if (valor === '' || valor === null || valor === undefined) throw error;

  const n = Number(valor);
  if (!Number.isInteger(n) || n < min || n > max) throw error;
  return n;
}

/** El id de una fila. Lo manda el cliente, así que un NaN llegaría a Postgres. */
export function id(valor: unknown): number {
  return entero(valor, 1, 2_147_483_647, 'El id');
}

export function foto(fd: FormData): string | null {
  const v = String(fd.get('foto') ?? '');
  if (!v) return null;
  if (!v.startsWith('data:image/')) {
    throw new Error('La foto no es una imagen válida.');
  }
  if (v.length > FOTO_MAX_BYTES) {
    throw new Error('La foto es demasiado pesada. Probá con una más chica.');
  }
  return v;
}

/**
 * Fecha en formato `YYYY-MM-DD`, o null.
 * Sin esto un string cualquiera llega a una columna `date` y Postgres responde
 * con un 500 crudo en vez de un mensaje que el usuario pueda entender.
 */
export function fecha(fd: FormData, campo: string): string | null {
  const v = String(fd.get(campo) ?? '').trim();
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) {
    throw new Error('La fecha del sorteo no es válida.');
  }
  return v;
}
