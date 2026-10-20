// Pruebas de lógica e interacciones con un DOM mínimo, sin dependencias.
// No sustituyen la revisión visual en un navegador.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../flask_app/static/js/retro-pc.js'), 'utf8');
function setup(initialStorage = {}) {
  let document;
  class El {
    constructor(tag = 'div') { this.tagName = tag; this.children = []; this.dataset = {}; this.style = {}; this.attrs = {}; this.listeners = {}; this.value = ''; this._text = ''; this.className = ''; this.disabled = false; this.classList = { add: (...names) => { this.className += ' ' + names.join(' '); }, remove: name => { this.className = this.className.split(' ').filter(x => x !== name).join(' '); }, toggle: (name, force) => { const enabled = force ?? !this.className.split(' ').includes(name); this.classList.remove(name); if (enabled) this.classList.add(name); return enabled; } }; }
    set textContent(text) { this._text = String(text); this.children = []; }
    get textContent() { return this._text + this.children.map(el => el.textContent).join(''); }
    append(...nodes) { for (const el of nodes) { if (el.parent) el.parent.children = el.parent.children.filter(n => n !== el); this.children.push(el); el.parent = this; } }
    replaceChildren(...nodes) { this.children.forEach(n => { n.parent = null; }); this.children = []; this._text = ''; this.append(...nodes); }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    addEventListener(type, listener) { (this.listeners[type] ??= []).push(listener); }
    fire(type, extras = {}) { if (type === 'click' && this.disabled) return; const event = { target: this, preventDefault() {}, ...extras }; for (const fn of this.listeners[type] || []) fn(event); }
    click() { this.fire('click'); }
    matches(selector) { return selector.split(',').some(s => { s = s.trim(); return s.startsWith('#') ? this.id === s.slice(1) : s.startsWith('.') ? this.className.split(' ').includes(s.slice(1)) : s === '[data-app]' ? !!this.dataset.app : this.tagName === s; }); }
    querySelectorAll(selector) { return this.children.flatMap(n => [...(n.matches(selector) ? [n] : []), ...n.querySelectorAll(selector)]); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    contains(el) { return el === this || this.children.some(n => n.contains(el)); }
    focus() { document.activeElement = this; }
    setSelectionRange() {}
    showModal() { this.open = true; }
    close() { this.open = false; this.fire('close'); }
    get isConnected() { return document.body.contains(this); }
  }
  document = { body: new El('body'), activeElement: null, addEventListener() {}, createElement: tag => new El(tag), querySelector: selector => document.body.querySelector(selector) };
  const make = (id, parent, tag) => { const el = new El(tag); el.id = id; parent.append(el); return el; };
  const slot = make('computer-slot', document.body), pc = make('retro-pc', slot), dialog = make('pc-dialog', document.body, 'dialog');
  ['pc-workspace','pc-status','pc-clock'].forEach(id => make(id, pc));
  ['pc-home','pc-expand','pc-power','pc-secrets'].forEach(id => make(id, pc, 'button'));
  ['terminal','files','notes','calculator','paint','game'].forEach(app => { const b = new El('button'); b.dataset.app = app; b.title = app; pc.append(b); });
  const data = new Map(Object.entries(initialStorage));
  const pending = new Map(), intervals = new Map(); let timerId = 0, now = Date.now();
  class Clock extends Date { static now() { return now; } }
  const context = { document, localStorage: { getItem: key => data.get(key) ?? null, setItem: (k, v) => data.set(k, String(v)) }, console, URL, Blob, window: {}, Date: Clock, Math: Object.assign(Object.create(Math), { random: () => 0 }), matchMedia: () => ({ matches: true }), setInterval: fn => { intervals.set(++timerId, fn); return timerId; }, clearInterval: id => intervals.delete(id), setTimeout: fn => { pending.set(++timerId, fn); return timerId; }, clearTimeout: id => pending.delete(id), fetch: async () => ({ ok: true, json: async () => [{ title: 'Nuevo proyecto', repository: 'https://github.com/example/new' }] }) };
  vm.runInNewContext(source, context);
  const q = s => document.querySelector(s);
  const app = name => pc.querySelectorAll('[data-app]').find(n => n.dataset.app === name).click();
  const command = text => { const input = q('#pc-command'); input.value = text; input.parent.fire('submit'); };
  return { document, pc, slot, dialog, q, app, command, data, pending, advance: seconds => { now += seconds * 1000; for (const fn of intervals.values()) fn(); } };
}
test('terminal: cálculo seguro, errores, historial y texto sin HTML', () => {
  const ui = setup(); ui.app('terminal');
  for (const [expr, result] of [['(12 + 3) * 2', '30'], ['-2 * (3 + 4)', '-14'], ['.5 + .25', '0.75'], ['0.1 + 0.2', '0.3'], ['1 / 0', 'No se puede dividir por cero.'], ['2 +', 'Expresión incompleta.'], ['2(3)', 'Expresión inválida o resultado demasiado grande.'], ['alert(1)', 'Usa números, + − * / y paréntesis.']]) {
    ui.command('calc ' + expr); assert.equal(ui.q('.pc-terminal-log').children.at(-1).textContent, result);
  }
  ui.command('echo <img src=x onerror=alert(1)>');
  assert.equal(ui.q('.pc-terminal-log').children.at(-1).textContent, '<img src=x onerror=alert(1)>');
  assert.equal(ui.q('.pc-terminal-log').querySelectorAll('img').length, 0);
  ui.q('#pc-command').fire('keydown', { key: 'ArrowUp' }); assert.equal(ui.q('#pc-command').value, 'echo <img src=x onerror=alert(1)>');
  ui.q('#pc-command').fire('keydown', { key: 'ArrowDown' }); assert.equal(ui.q('#pc-command').value, '');
});
test('notas, píxeles y secretos persisten; apagar y reiniciar conservan datos', () => {
  const ui = setup(); ui.app('notes'); ui.q('#pc-notes').value = 'Idea nueva'; ui.q('#pc-notes').fire('input');
  ui.app('paint'); ui.q('.pc-pixels').children[0].click();
  ui.app('terminal'); ui.command('cat .vault'); ui.command('coffee'); ui.command('matrix');
  ui.q('#pc-home').click();
  ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'].forEach(key => ui.pc.fire('keydown', { key }));
  assert.equal(ui.q('#pc-secrets').textContent, '◇ 4/6');
  ui.q('#pc-power').click(); assert.equal(ui.q('#pc-power').attrs['aria-pressed'], 'false');
  ui.app('notes'); assert.equal(ui.q('#pc-notes'), null);
  ui.q('#pc-power').click(); ui.app('notes'); assert.equal(ui.q('#pc-notes').value, 'Idea nueva');
  const restored = setup(Object.fromEntries(ui.data)); restored.app('notes'); assert.equal(restored.q('#pc-notes').value, 'Idea nueva');
  restored.app('paint'); assert.equal(restored.q('.pc-pixels').children[0].style.background, '#b7cd9a'); assert.equal(restored.q('#pc-secrets').textContent, '◇ 4/6');
});
test('ampliar y cerrar restauran la misma computadora y el foco', () => {
  const ui = setup(); ui.app('notes'); const notes = ui.q('#pc-notes');
  ui.q('#pc-expand').click(); assert.equal(ui.dialog.open, true); assert.equal(ui.pc.parent, ui.dialog); assert.equal(ui.q('#pc-notes'), notes);
  ui.dialog.close(); assert.equal(ui.pc.parent, ui.slot); assert.equal(ui.document.activeElement, ui.q('#pc-expand'));
});
test('memoria: pares, intentos, ocultación y limpieza al cambiar de app', () => {
  const ui = setup(); ui.app('game'); const cards = ui.q('.pc-memory').children;
  cards[0].click(); cards[1].click();
  assert.equal(ui.pending.size, 1); assert.notEqual(cards[0].textContent, cards[1].textContent);
  cards[2].click(); assert.equal(cards[2].textContent, '?', 'No permite una tercera carta durante la espera');
  for (const [id, callback] of ui.pending) { ui.pending.delete(id); callback(); }
  assert.equal(cards[0].textContent, '?'); assert.equal(cards[1].textContent, '?');
  cards[0].click(); cards[6].click(); assert.equal(cards[0].disabled, true); assert.equal(cards[6].disabled, true);
  assert.match(ui.q('.pc-hint').textContent, /Pares: 1\/6 · Intentos: 2/);
  cards[1].click(); cards[2].click(); assert.equal(ui.pending.size, 1);
  ui.app('files'); assert.equal(ui.pending.size, 0); assert.ok(ui.q('.pc-file-list'));
});
test('almacenamiento malformado no impide iniciar; proyectos se leen del JSON', async () => {
  const ui = setup({ 'akon-pc-secrets': '{invalid', 'akon-pc-pixels': '["invalid"]' });
  assert.equal(ui.q('#pc-secrets').textContent, '◇ 0/6'); ui.app('paint'); assert.equal(ui.q('.pc-pixels').children.length, 96);
  ui.app('terminal'); ui.command('projects'); await new Promise(resolve => setImmediate(resolve));
  assert.equal(ui.q('.pc-file-link').textContent, '↗ Nuevo proyecto');
});

test('nuevos secretos completan el archivo y temporizador pausa al salir', () => {
  const ui = setup(); ui.app('terminal');
  for (const command of ['cat .vault', 'coffee', 'matrix']) { ui.app('terminal'); ui.command(command); }
  ui.q('#pc-home').click();
  ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'].forEach(key => ui.pc.fire('keydown', { key }));
  ui.app('terminal'); ui.command('timecapsule'); ui.command('xyzzy'); assert.equal(ui.q('#pc-secrets').textContent, '◇ 6/6');
  const openTimer = () => { ui.q('#pc-home').click(); ui.q('.pc-desktop').children.find(el => el.textContent.includes('Temporizador')).click(); };
  const clickText = text => ui.q('#pc-workspace').querySelectorAll('button').find(el => el.textContent === text).click();
  openTimer(); clickText('1 min'); clickText('▶ Iniciar'); ui.advance(15); assert.equal(ui.q('.pc-timer-display').textContent, '00:45');
  ui.app('notes'); ui.advance(30); openTimer(); assert.equal(ui.q('.pc-timer-display').textContent, '00:45');
  clickText('▶ Iniciar'); ui.advance(45); assert.equal(ui.q('.pc-timer-display').textContent, '00:00');
  assert.match(ui.q('#pc-workspace').textContent, /Tiempo cumplido/);
});
test('sonidos: informa si Web Audio no está disponible', () => {
  const ui = setup(); ui.q('.pc-desktop').children.find(el => el.textContent.includes('Sonidos')).click();
  ui.q('.pc-file-list').children[0].click(); assert.match(ui.q('.pc-music-status').textContent, /no permite sintetizar/);
});
