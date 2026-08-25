/**
 * `npm test` — corre con el runner de Node, sin framework.
 *
 * Cubre las dos cosas que, si se rompen, se rompen en silencio: quién es super
 * admin (un email de más acá es acceso total) y que los valores del template
 * tag salgan siempre como parámetros y no concatenados en el SQL.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { armarConsulta } from './db.ts';
import { esSuperAdmin, haySuperAdmins } from './permisos.ts';
import * as v from './validar.ts';

/** Las server actions reciben FormData; esto arma uno para el test. */
function form(campos: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, val] of Object.entries(campos)) fd.set(k, val);
  return fd;
}

test('entero rechaza lo que rompería la columna integer', () => {
  assert.equal(v.entero('5', 1, 10, 'x'), 5);
  assert.equal(v.entero(-3, -10, 10, 'x'), -3);
  for (const malo of [1.5, NaN, Infinity, '', 'abc', null, undefined, 1e20]) {
    assert.throws(() => v.entero(malo, -10, 10, 'x'), /entero entre/);
  }
  // Fuera de rango por arriba y por abajo.
  assert.throws(() => v.entero(11, 1, 10, 'x'));
  assert.throws(() => v.entero(0, 1, 10, 'x'));
});

test('id no deja pasar un NaN a Postgres', () => {
  assert.equal(v.id('42'), 42);
  assert.throws(() => v.id('abc'));
  assert.throws(() => v.id(0));
  assert.throws(() => v.id(-1));
});

test('texto recorta y acota', () => {
  assert.equal(v.texto(form({ a: '  hola  ' }), 'a', 10), 'hola');
  assert.equal(v.texto(form({ a: '   ' }), 'a', 10), null, 'vacío es null');
  assert.equal(v.texto(form({}), 'a', 10), null, 'ausente es null');
  assert.throws(() => v.texto(form({ a: 'x'.repeat(11) }), 'a', 10), /caracteres/);
  assert.throws(() => v.textoRequerido(form({ a: '  ' }), 'a', 10), /Falta/);
});

test('foto exige data URL de imagen y acota el peso', () => {
  assert.equal(v.foto(form({})), null);
  assert.equal(v.foto(form({ foto: 'data:image/webp;base64,AAAA' })), 'data:image/webp;base64,AAAA');
  assert.throws(() => v.foto(form({ foto: 'https://ajeno.com/x.png' })), /no es una imagen/);
  assert.throws(() => v.foto(form({ foto: 'data:text/html,<script>' })), /no es una imagen/);
  const enorme = 'data:image/png;base64,' + 'A'.repeat(v.FOTO_MAX_BYTES);
  assert.throws(() => v.foto(form({ foto: enorme })), /demasiado pesada/);
});

test('fecha solo acepta YYYY-MM-DD', () => {
  assert.equal(v.fecha(form({ f: '2026-10-18' }), 'f'), '2026-10-18');
  assert.equal(v.fecha(form({ f: '' }), 'f'), null);
  for (const mala of ['18/10/2026', '2026-13-01', 'mañana', '2026-10-18; drop table']) {
    assert.throws(() => v.fecha(form({ f: mala }), 'f'), /no es válida/);
  }
});

test('armarConsulta numera los parámetros desde $1', () => {
  assert.equal(
    armarConsulta(['select * from premios where id = ', ' and orden > ', '']),
    'select * from premios where id = $1 and orden > $2',
  );
  assert.equal(armarConsulta(['select 1']), 'select 1');
});

test('esSuperAdmin ignora mayúsculas y espacios de la variable de entorno', () => {
  process.env.SUPER_ADMIN_EMAILS = ' Juan@Gmail.com , otro@gmail.com ';
  assert.equal(esSuperAdmin('juan@gmail.com'), true);
  assert.equal(esSuperAdmin('JUAN@GMAIL.COM'), true);
  assert.equal(esSuperAdmin('otro@gmail.com'), true);
});

test('nadie es super admin por accidente', () => {
  process.env.SUPER_ADMIN_EMAILS = 'juan@gmail.com';
  assert.equal(esSuperAdmin('juanx@gmail.com'), false);
  assert.equal(esSuperAdmin(''), false);
  assert.equal(esSuperAdmin(null), false);
  assert.equal(esSuperAdmin(undefined), false);

  // La variable vacía no puede degradar en "todos entran".
  process.env.SUPER_ADMIN_EMAILS = '';
  assert.equal(esSuperAdmin('juan@gmail.com'), false);
  assert.equal(haySuperAdmins(), false);

  // Una coma suelta tampoco puede colar un email vacío como admin.
  process.env.SUPER_ADMIN_EMAILS = ',,';
  assert.equal(haySuperAdmins(), false);
  assert.equal(esSuperAdmin(''), false);
});
