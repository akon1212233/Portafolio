const { test } = require('node:test');
const assert = require('node:assert/strict');
const { filterProjects, createLab, composeContact } = require('../flask_app/static/js/workshop-core.js');

test('laboratorio: crear, consultar, borrar y restaurar sin mutar respuestas anteriores', () => {
  const lab = createLab();
  const original = lab.request('GET').body;
  assert.equal(original.length, 2);
  const created = lab.request('POST', '  Nueva tarea  ');
  assert.equal(created.status, 201); assert.equal(created.body.titulo, 'Nueva tarea');
  created.body.titulo = 'Cambio externo';
  assert.equal(lab.request('GET', '3').body.titulo, 'Nueva tarea');
  assert.equal(lab.request('DELETE', '3').status, 200);
  assert.equal(lab.request('GET', '3').status, 404);
  assert.equal(lab.request('POST', 'Otra tarea').body.id, 4);
  assert.equal(original.length, 2);
  lab.reset(); assert.equal(lab.request('GET').body.length, 2); assert.equal(lab.request('POST', 'Desde cero').body.id, 3);
});
test('laboratorio: valida títulos, IDs, métodos y límite de la demo', () => {
  const lab = createLab();
  for (const title of ['', '  ', 'ab', 'a'.repeat(81)]) assert.equal(lab.request('POST', title).status, 400);
  for (const id of ['', '0', '-1', '1.5', '1e0', '01', 'NaN', '999999999999999999999']) assert.equal(lab.request('DELETE', id).status, 400);
  assert.equal(lab.request('GET', '999').status, 404);
  assert.equal(lab.request('PATCH', '1').status, 405);
  for (let i = 0; i < 23; i++) assert.equal(lab.request('POST', 'Tarea ' + i).status, 201);
  assert.equal(lab.request('POST', 'No cabe').status, 409);
  lab.request('DELETE', '1'); assert.equal(lab.request('POST', 'Ahora sí').status, 201);
});
test('proyectos: combina categoría, palabras, acentos y orden sin cambiar el original', () => {
  const projects = [{title:'Zeta',description:'Gestión de tareas',technologies:['Python'],categories:['Backend']},{title:'Alfa',description:'Películas',technologies:['Python'],categories:['Full stack']}];
  assert.equal(filterProjects(projects, 'Backend', 'gestion python', 'az')[0].title, 'Zeta');
  assert.equal(filterProjects(projects, 'Backend', 'películas', 'az').length, 0);
  assert.deepEqual(filterProjects(projects, 'Todos', '', 'az').map(p => p.title), ['Alfa','Zeta']);
  assert.equal(projects[0].title, 'Zeta');
});
test('contacto: valida espacios y codifica caracteres sin añadir destinatarios', () => {
  assert.throws(() => composeContact('  ', 'Hola', 'Mensaje suficientemente largo'));
  assert.throws(() => composeContact('Persona', 'Hola', 'corto'));
  const result = composeContact('José & Ana', 'Proyecto & más', '¿Creamos algo juntos? #ideas & código');
  const url = new URL(result.url);
  assert.equal(url.pathname, 'akonbustamante11@gmail.com');
  assert.equal(url.searchParams.get('subject'), 'Proyecto & más');
  assert.match(url.searchParams.get('body'), /José & Ana/);
  assert.equal([...url.searchParams.keys()].length, 2);
});
