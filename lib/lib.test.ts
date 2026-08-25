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
