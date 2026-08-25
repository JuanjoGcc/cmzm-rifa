# Rifa MZM

Página pública de una rifa: los premios con foto y la lista de quién compró
cuántos números. Los números se venden en persona; esta página es donde se
anota lo vendido y donde la gente mira cómo va.

## Qué es y qué no

- **Ver no requiere login.** Cualquiera entra y ve premios y participantes.
- **Editar sí.** Y solo lo pueden hacer las cuentas de Google habilitadas.
- No hay pagos, ni carrito, ni elección de números por parte del comprador.
  Nosotros vendemos y nosotros anotamos. Si algún día hace falta vender online,
  eso es otra app, no un parche sobre esta.

## Stack

| Pieza | Elección | Por qué esta y no otra |
|---|---|---|
| Framework | Next.js 16, App Router | Server actions: el CRUD son funciones, no rutas de API |
| Estilos | Tailwind v4 | Sin shadcn ni Radix: la app tiene un dropdown y dos formularios |
| BDD | Postgres con `pg` y SQL a mano | Cuatro tablas. Un ORM sería más código que el esquema |
| Login | Auth.js (`next-auth@beta`), Google | Mismo `@auth/core` que el repo de vigas, misma config en GCP |
| Fotos | Data URL en una columna `text` | Ver "Las fotos" abajo |

Todo el estado vive en Postgres. No hay caché, ni Redis, ni store de cliente:
cada página se renderiza por request y `revalidatePath` la invalida al escribir.

## Permisos

Dos niveles, los dos resueltos en el servidor (`lib/auth.ts`):

1. **Super admin** — su email está en `SUPER_ADMIN_EMAILS`, una variable de
   entorno. Edita todo y reparte permisos desde `/admin`.
   Va en el entorno y no en la BDD a propósito: si el primer admin saliera de
   una tabla, no habría quién lo habilite. Es el problema del huevo y la
   gallina y se resuelve así.
2. **Editor** — un super admin le prendió `puede_editar` en `/admin`.

`puede_editar` se lee de la BDD en **cada** request, no del JWT: si le revocás
el permiso a alguien, deja de poder editar en el acto y no cuando le venza la
sesión.

**Toda server action que escriba arranca con `requiereEditor()` o
`requiereSuperAdmin()`.** Esconder el botón en la UI no es control de acceso —
una server action es un endpoint HTTP y cualquiera puede llamarlo. Si agregás
una acción nueva y no le ponés el chequeo, la app queda abierta.

## Las fotos

Se guardan como data URL (`image/webp` en base64) dentro de la columna
`premios.foto`. No hay servicio de archivos: nada que configurar, nada que se
rompa al cambiar de deployment, y el backup de la BDD ya incluye las imágenes.

Lo que hace viable esa decisión es que **el navegador reescala la foto antes de
subirla** (`components/FormPremio.tsx`, lado máximo 1000px): una foto de celular
sin tocar serían ~4 MB de base64 por fila. Con el reescalado son ~100 KB.

Techo conocido: si alguna vez hay decenas de premios o hace falta el original,
se pasa a Vercel Blob y la columna guarda la URL. Hasta entonces esto sobra.

## Guía de diseño

El objetivo es que se vea **hecha a mano, no generada**. La marca de agua de una
página hecha con IA es reconocible: degradado violeta, texto con gradiente,
tarjetas con `rounded-2xl` y `shadow-2xl`, emojis de decoración, todo centrado,
un hero enorme arriba. Nada de eso acá.

**Lo que sí:**

- **Oscuro cálido, no negro azulado.** Base `#0e0f11`, superficie `#15171a`. El
  texto es `#e6e3de` (blanco roto), nunca `#fff`: el contraste puro cansa y se
  lee sintético.
- **Un solo acento**, dorado apagado `#d9a441`, y se usa poco: la etiqueta del
  premio, la cifra grande, el estado del usuario. Si el acento está en todos
  lados, deja de señalar.
- **Los números son el contenido.** Van en IBM Plex Mono con `tabular-nums`
  (clase `.cifra`) para que las columnas se alineen y las cifras no bailen al
  actualizarse. Esta es la decisión que más hace que la página se lea como una
  herramienta y no como una landing.
- **Tipografía en tres roles**: Space Grotesk para títulos, IBM Plex Sans para
  texto, IBM Plex Mono para cifras. Mismo criterio que el repo de vigas.
- **Líneas de un píxel, cero sombras.** La jerarquía la dan los bordes y el
  espacio, no las sombras. Radio 4px, no 16px.
- **Alineado a la izquierda.** Los títulos de sección no van centrados. El dato
  grande (números vendidos, fecha del sorteo) va a la derecha del título, en la
  misma línea de base: asimétrico a propósito.
- **Etiquetas en versalita espaciada** (`text-[11px] uppercase tracking-[0.14em]`)
  para los rótulos de campo y de columna. Es el detalle que separa una tabla
  diseñada de una tabla por defecto.
- **Sin emojis.** El único icono es el boleto del logo, dibujado a mano en SVG.
- **Tablas de verdad para datos tabulares.** Una `<table>` con reglas finas, sin
  cebra y sin una tarjeta por fila.

Antes de agregar una pantalla, mirá una que ya existe y copiale el ritmo:
`Cabecera` arriba, contenido, y el panel de edición (`Panel`) al final, solo si
el usuario puede editar.

## Estructura

```
app/
  layout.tsx            navbar + fuentes; lee el título de la rifa
  page.tsx              redirige a /premios
  premios/              público; el formulario aparece solo si podés editar
  participantes/        idem, con la tabla y el contador −/+
  admin/                solo super admin: permisos y datos de la rifa
  actions.ts            TODAS las escrituras, cada una con su chequeo
  api/auth/[...nextauth]/route.ts
lib/
  db.ts                 pool de pg + template tag `sql`
  auth.ts               Auth.js, sesión y los dos `requiere*`
components/             sin subcarpeta ui/; son nueve archivos
schema.sql              idempotente, se corre con `npm run db:init`
```

## Correrla en local

```bash
brew services start postgresql@17
createdb rifa
cp .env.example .env.local     # y completar
npm run db:init
npm run dev
```

Sin `AUTH_GOOGLE_ID`/`SECRET` la página se ve igual; lo único que falla es el
botón de entrar.

## Convenciones

- **Castellano** en todo: nombres de tabla, de columna, de función, de variable
  y de componente. `crearPremio`, no `createPrize`. El único inglés es el que
  imponen React y Next (`page`, `layout`, `default export`).
- Comentarios: el default es no comentar. Cuando va uno, dice **por qué**, nunca
  qué, y no pasa de dos líneas. Ver el `CLAUDE.md` global.
- Nada de `any`. `npx tsc --noEmit` tiene que pasar limpio.

## Dominios

| Entorno | URL |
|---|---|
| Local | `http://localhost:3000` |
| Producción | `https://cmzm-rifa.vercel.app` |

Repo: `github.com/JuanjoGcc/cmzm-rifa`. Proyecto de Vercel: `cmzm-rifa`, cuenta
personal (`juanjos-projects-a49008cd`), plan hobby.

## Configurar el login en Google Cloud

Mismos pasos que el repo de vigas, cambiando a dónde vuelve el callback: acá es
el dominio de la app, no el de un backend aparte.

1. [console.cloud.google.com](https://console.cloud.google.com) → crear un
   proyecto (`cmzm-rifa`).
2. **APIs y servicios → Pantalla de consentimiento de OAuth**:
   - Tipo de usuario: **Externo**.
   - Nombre de la app, correo de asistencia y correo de contacto: los tuyos.
   - Permisos: los tres por defecto (`userinfo.email`, `userinfo.profile`,
     `openid`) alcanzan. No pidas nada más o Google te manda a verificación.
   - Publicá la app. En modo *Prueba* solo entran los emails que agregues a mano
     y las sesiones se caen cada 7 días.
3. **Credenciales → Crear credenciales → ID de cliente de OAuth**, tipo
   **Aplicación web**. Copiar y pegar tal cual:

   **Orígenes autorizados de JavaScript**
   ```
   http://localhost:3000
   https://cmzm-rifa.vercel.app
   ```

   **URI de redireccionamiento autorizados**
   ```
   http://localhost:3000/api/auth/callback/google
   https://cmzm-rifa.vercel.app/api/auth/callback/google
   ```
4. Copiá el *Client ID* y el *Client secret* a `AUTH_GOOGLE_ID` y
   `AUTH_GOOGLE_SECRET`, en `.env.local` y en Vercel.

Los dos errores que se cometen siempre: olvidar el path completo
`/api/auth/callback/google` (poner solo el dominio no sirve), y agregar el de
producción pero no el de local.

Cada dominio nuevo hay que autorizarlo también o el login devuelve
`redirect_uri_mismatch`. **Los previews de Vercel son un dominio distinto en
cada deploy**, así que el login solo anda en producción y en local; para probar
un preview, agregá su URL a mano o usá `vercel --prod`.

## Postgres en Vercel

1. Vercel → el proyecto → **Storage → Create Database → Postgres (Neon)**.
2. Al conectarla al proyecto, Vercel inyecta sola `POSTGRES_URL` (y varias más)
   en los tres entornos. No hay que copiar nada a mano.
3. Crear las tablas, una sola vez, desde tu máquina:
   ```bash
   psql "<connection string de Neon>" -f schema.sql
   ```
4. Las que sí van a mano en **Settings → Environment Variables**:

   | Variable | Valor |
   |---|---|
   | `AUTH_SECRET` | `npx auth secret --raw`, uno nuevo distinto al de local |
   | `AUTH_GOOGLE_ID` | de Google Cloud |
   | `AUTH_GOOGLE_SECRET` | de Google Cloud |
   | `SUPER_ADMIN_EMAILS` | tu email, el que vas a usar para entrar |

   `AUTH_URL` no hace falta: Auth.js la deduce de `VERCEL_URL`.
5. Redeploy: las variables se leen en build, no en caliente.

Hasta que exista `POSTGRES_URL` la app buildea bien pero todas las páginas
devuelven 500 con "Falta POSTGRES_URL": son dinámicas y consultan la BDD en
cada request. Es el error esperado, no un deploy roto.

Usar la string **pooled** (la que dice `-pooler`), no la directa: las funciones
serverless abren y cierran conexiones todo el tiempo y sin pooler Neon las
rechaza. `lib/db.ts` ya prende TLS para cualquier host que no sea localhost.
