# Rifa MZM

Página de la rifa: los premios con foto y quién compró cuántos números.
Ver no requiere login; editar sí, y solo las cuentas de Google habilitadas.

```bash
brew services start postgresql@17
createdb rifa
cp .env.example .env.local     # y completar
npm run db:init
npm run dev
```

`npm test` corre los checks de permisos y del armado de consultas.

Todo lo demás —permisos, decisiones de stack, guía de diseño, cómo configurar
el login en Google Cloud y Postgres en Vercel— está en [CLAUDE.md](CLAUDE.md).
