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
  abajo,
}: {
  href: string;
  children: React.ReactNode;
  abajo?: boolean;
}) {
  const activa = usePathname() === href;

  return (
    <Link
      href={href}
      aria-current={activa ? 'page' : undefined}
      className={
        abajo
          ? `flex-1 border-t-2 py-3 text-center text-sm transition-colors ${
              activa ? 'border-acento text-acento' : 'border-transparent text-muted'
            }`
          : `-mb-px border-b px-1 pb-3 text-sm transition-colors ${
              activa
                ? 'border-acento text-ink'
                : 'border-transparent text-muted hover:border-line hover:text-ink'
            }`
      }
    >
      {children}
    </Link>
  );
}
