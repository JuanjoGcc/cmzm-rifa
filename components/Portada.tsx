'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

// Las fotos del team. Para cambiarlas se reemplazan los archivos de
// `public/portada/`: van con el deploy, no hay nada que subir ni migrar.
const FOTOS = [
  { src: '/portada/1.jpg', alt: 'El team en el asado de la rifa' },
  { src: '/portada/2.jpg', alt: 'El team en la pista' },
  { src: '/portada/3.jpg', alt: 'Parte del team después de entrenar' },
];

export function Portada() {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActual((n) => (n + 1) % FOTOS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-lg border border-line bg-raised sm:aspect-video">
      {FOTOS.map((f, n) => (
        <Image
          key={f.src}
          src={f.src}
          alt={f.alt}
          fill
          priority={n === 0}
          sizes="(min-width: 1024px) 64rem, 100vw"
          className={`object-cover transition-opacity duration-700 ${
            n === actual ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1">
        {FOTOS.map((f, n) => (
          <button
            key={f.src}
            type="button"
            onClick={() => setActual(n)}
            aria-label={`Foto ${n + 1} de ${FOTOS.length}`}
            aria-current={n === actual}
            className="group px-2 py-4"
          >
            <span
              className={`block h-1.5 w-6 rounded-full transition-colors ${
                n === actual
                  ? 'bg-white'
                  : 'bg-white/40 group-hover:bg-white/70'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
