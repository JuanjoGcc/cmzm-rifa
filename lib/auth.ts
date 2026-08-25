// Login con Google y control de acceso. Los dos niveles de permiso y la config
// en Google Cloud están en CLAUDE.md ("Permisos" y "Configurar el login").

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { sql } from './db';
import { esSuperAdmin } from './permisos';

export { esSuperAdmin, haySuperAdmins } from './permisos';

export type Sesion = {
  email: string;
  nombre: string;
  foto: string | null;
  superAdmin: boolean;
  puedeEditar: boolean;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    /**
     * Registramos al usuario en nuestra propia tabla en vez de usar un adapter
     * de NextAuth: la sesión sigue siendo un JWT (sin tabla de sesiones) y lo
     * único que necesitamos persistir es a quién habilitar.
     */
    async signIn({ user }) {
      if (!user.email) return false;
      await sql`
        insert into usuarios (email, nombre, foto, ingresos, ultimo_acceso)
        values (${user.email.toLowerCase()}, ${user.name}, ${user.image}, 1, now())
        on conflict (email) do update set
          nombre = excluded.nombre,
          foto = excluded.foto,
          ingresos = usuarios.ingresos + 1,
          ultimo_acceso = now()`;
      return true;
    },
  },
});

/**
 * Sesión actual con sus permisos ya resueltos, o null si no hay login.
 * `puede_editar` se lee de la BDD en cada request a propósito: si un super
 * admin revoca a alguien, deja de poder editar en el acto y no cuando le
 * expire el JWT.
 */
export async function sesion(): Promise<Sesion | null> {
  const s = await auth();
  const email = s?.user?.email?.toLowerCase();
  if (!email) return null;

  const superAdmin = esSuperAdmin(email);
  const [fila] = await sql<{ puede_editar: boolean }>`
    select puede_editar from usuarios where email = ${email}`;

  return {
    email,
    nombre: s!.user!.name ?? email,
    foto: s!.user!.image ?? null,
    superAdmin,
    puedeEditar: superAdmin || fila?.puede_editar === true,
  };
}

/** Corta la ejecución si el usuario no puede escribir. Devuelve la sesión. */
export async function requiereEditor(): Promise<Sesion> {
  const s = await sesion();
  if (!s) throw new Error('Iniciá sesión con Google.');
  if (!s.puedeEditar) throw new Error('Tu cuenta no tiene permiso para editar.');
  return s;
}

/** Corta la ejecución si no es super admin. Solo ellos reparten permisos. */
export async function requiereSuperAdmin(): Promise<Sesion> {
  const s = await sesion();
  if (!s?.superAdmin) throw new Error('Solo un super admin puede hacer esto.');
  return s;
}
