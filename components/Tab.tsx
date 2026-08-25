'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Pestaña del navbar. Cliente porque el subrayado depende de la ruta actual, y
 * el layout es un server component que no la conoce.
 */
export function Tab({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const activa = usePathname() === href;

  return (
    <Link
      href={href}
      aria-current={activa ? 'page' : undefined}
      className={`-mb-px border-b px-1 pb-3 text-sm transition-colors ${
        activa
          ? 'border-gold text-ink'
          : 'border-transparent text-muted hover:border-line hover:text-ink'
      }`}
    >
      {children}
    </Link>
  );
}
