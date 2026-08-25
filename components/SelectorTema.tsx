'use client';

import { useEffect, useState } from 'react';

type Tema = 'sistema' | 'claro' | 'oscuro';

/** `data-tema` es lo que eligió el usuario; `data-modo`, el color que toca. */
function aplicar(tema: Tema) {
  const raiz = document.documentElement;
  raiz.dataset.tema = tema;
  raiz.dataset.modo =
    tema === 'sistema'
      ? matchMedia('(prefers-color-scheme: dark)').matches
        ? 'oscuro'
        : 'claro'
      : tema;
}

export function SelectorTema() {
  const [tema, setTema] = useState<Tema>('sistema');

  // El script del layout ya pintó la página; acá solo sincronizamos el select.
  useEffect(() => {
    setTema((document.documentElement.dataset.tema as Tema) ?? 'sistema');
  }, []);

  useEffect(() => {
    if (tema !== 'sistema') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const alCambiar = () => aplicar('sistema');
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, [tema]);

  return (
    <select
      value={tema}
      aria-label="Tema"
      onChange={(e) => {
        const t = e.target.value as Tema;
        setTema(t);
        aplicar(t);
        localStorage.setItem('tema', t);
      }}
      className="cursor-pointer rounded border border-line bg-transparent px-2 py-1 text-xs text-muted outline-none transition-colors hover:border-faint hover:text-ink focus-visible:border-acento"
    >
      <option value="sistema">Sistema</option>
      <option value="claro">Claro</option>
      <option value="oscuro">Oscuro</option>
    </select>
  );
}
