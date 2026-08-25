// Separado de `auth.ts` para que el test lo importe sin arrastrar a next-auth,
// que fuera del runtime de Next no resuelve `next/server`.

function configurados(): string[] {
  return (process.env.SUPER_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function esSuperAdmin(email: string | null | undefined): boolean {
  return !!email && configurados().includes(email.toLowerCase());
}

/** Si nadie es super admin, nadie reparte permisos y la app queda de solo lectura. */
export function haySuperAdmins(): boolean {
  return configurados().length > 0;
}
