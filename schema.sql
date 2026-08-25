-- Esquema completo. Es idempotente: `npm run db:init` lo corre en local y en
-- Vercel sin borrar nada.

create table if not exists usuarios (
  email         text primary key,
  nombre        text,
  foto          text,
  puede_editar  boolean     not null default false,
  ingresos      integer     not null default 0,
  ultimo_acceso timestamptz,
  creado        timestamptz not null default now()
);

create table if not exists premios (
  id          serial primary key,
  titulo      text not null,
  descripcion text,
  -- Data URL (webp en base64); el navegador la reescala antes de subirla.
  -- ponytail: techo ~1 MB por fila; si crece, Vercel Blob y acá solo la URL.
  foto        text,
  orden       integer     not null default 0,
  creado      timestamptz not null default now()
);

create table if not exists participantes (
  id      serial primary key,
  nombre  text    not null,
  numeros integer not null check (numeros > 0),
  nota    text,
  creado  timestamptz not null default now()
);

-- Una sola fila, forzada por el check sobre la PK.
create table if not exists config (
  id             boolean primary key default true check (id),
  titulo         text not null default 'Rifa',
  bajada         text,
  fecha_sorteo   date,
  precio_numero  integer
);
insert into config (id) values (true) on conflict do nothing;
