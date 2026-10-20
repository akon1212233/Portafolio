/* Akon OS: una computadora virtual local. No ejecuta comandos del sistema. */
(() => {
  "use strict";
  const pc = document.querySelector("#retro-pc");
  const workspace = pc.querySelector("#pc-workspace");
  const status = pc.querySelector("#pc-status");
  const modal = document.querySelector("#pc-dialog");
  const expand = pc.querySelector("#pc-expand");
  const power = pc.querySelector("#pc-power");
  const appNames = { terminal: "Terminal", files: "Archivos", notes: "Notas", calculator: "Calculadora", paint: "Pixel Studio", game: "Memoria", music: "Sonidos", timer: "Temporizador" };
  const secretNames = { vault: "El archivo olvidado", coffee: "Combustible backend", matrix: "Detrás de la pantalla", konami: "Jugador de la vieja escuela", time: "Cápsula del tiempo", wizard: "Pasadizo de texto" };
  const read = (key, fallback) => { try { return localStorage.getItem("akon-pc-" + key) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem("akon-pc-" + key, value); return true; } catch { return false; } };
  let discovered;
  try { discovered = new Set(JSON.parse(read("secrets", "[]")).filter(key => Object.hasOwn(secretNames, key))); } catch { discovered = new Set(); }
  let on = true, current = "desktop", stopApp = () => {}, hiddenFiles = false;
  let notes = read("notes", "Mis ideas empiezan aquí…\n");
  let terminalLines = ["AKON OS [versión 1.0]", "Bienvenido, visitante. Escribe help para explorar.", "Pista: no todos los archivos están a simple vista."];
  const history = [];
  let historyIndex = 0, draft = "";
  let projectData = null;
  let pixels;
  try { pixels = JSON.parse(read("pixels", "[]")); } catch { pixels = []; }
  const palette = ["#17231b", "#b7cd9a", "#e6ad63", "#df7770", "#89b9cb", "#eee7d3"];
  if (!Array.isArray(pixels) || pixels.length !== 96 || !pixels.every(c => palette.includes(c))) pixels = Array(96).fill(palette[0]);
  const node = (tag, className = "", text = "") => { const el = document.createElement(tag); el.className = className; el.textContent = text; return el; };
  const button = (text, action, className = "") => { const el = node("button", className, text); el.type = "button"; el.addEventListener("click", action); return el; };
  function announce(text) { status.textContent = text; }
  function updateSecrets() { pc.querySelector("#pc-secrets").textContent = `◇ ${discovered.size}/6`; }
  function unlock(key) {
    if (discovered.has(key)) return;
    discovered.add(key); save("secrets", JSON.stringify([...discovered])); updateSecrets();
    announce("Secreto: " + secretNames[key]);
  }
  function heading(text, back = desktop) {
    const bar = node("div", "pc-window-title"); bar.append(node("strong", "", text), button("← Volver", back)); workspace.append(bar);
  }
  function reset(app) {
    stopApp(); stopApp = () => {}; current = app;
    if (workspace.contains(document.activeElement)) pc.focus({ preventScroll: true });
    workspace.replaceChildren(); workspace.scrollTop = 0;
    pc.querySelectorAll("[data-app]").forEach(el => { el.classList.toggle("selected", el.dataset.app === app); el.setAttribute("aria-pressed", String(el.dataset.app === app)); });
    announce("Sistema listo.");
  }
  function desktop() {
    if (!on) return;
    reset("desktop");
    const welcome = node("div", "pc-welcome");
    welcome.append(node("p", "", "BIENVENIDO A AKON OS"), node("span", "", "Un pequeño mundo detrás del código."));
    const grid = node("div", "pc-desktop");
    const icons = { terminal: ">_", files: "▤", notes: "✎", calculator: "±", paint: "▦", game: "♧", music: "♫", timer: "◷" };
    Object.entries(appNames).forEach(([app, name]) => {
      const shortcut = button("", () => openApp(app)); shortcut.append(node("span", "pc-icon", icons[app]), node("span", "", name)); grid.append(shortcut);
    });
    workspace.append(welcome, grid, node("p", "pc-hint", "Abre una app con un clic. Hay 6 secretos escondidos. ¿Los encuentras?"));
  }
  function openApp(app) {
    if (!on || !Object.hasOwn(appNames, app)) return;
    reset(app); heading(appNames[app]);
    ({ terminal, files, notes: notepad, calculator, paint, game, music, timer })[app]();
  }
  const virtualFiles = {
    "perfil.txt": "Akon Bustamante\nFull stack developer, con afinidad por el backend.\nPython · Flask · MySQL\n\nMe gusta entender lo que pasa detrás de la pantalla.",
    "contacto.txt": "Correo: akonbustamante11@gmail.com\nLinkedIn: https://www.linkedin.com/in/akon-bustamante-b58313319/\nGitHub: https://github.com/akon1212233",
    "leeme.txt": "Este es tu rincón para experimentar.\n\nLas notas y los dibujos se guardan en este navegador.\nTerminal: help muestra los comandos.\n\nUn viejo consejo: en una terminal, los archivos con un punto al inicio suelen pasar desapercibidos.\n\nAlgunos desarrolladores funcionan mejor después de un coffee.\nOtros se preguntan qué hay dentro de la matrix.\n\nActualización del archivo: prueba fortune cuando falten ideas.\nUn disquete olvidado lleva escrito: timecapsule.",
    ".vault": "ARCHIVO RECUPERADO — 1998\n\nEncontraste el primer rincón secreto.\n\nLa curiosidad también es una habilidad de programación.\n\nOtra pista: los jugadores de antes recuerdan esta secuencia.\n↑ ↑ ↓ ↓ ← → ← → B A\nPruébala dentro de la computadora, fuera de un campo de texto."
  };
  function showFile(name) {
    if (name === ".vault") unlock("vault");
    reset("files"); heading(name, () => openApp("files"));
    workspace.append(node("pre", "pc-document", virtualFiles[name] ?? notes));
    if (name === "contacto.txt") { const link = node("a", "pc-link", "Escribir un correo ↗"); link.href = "mailto:akonbustamante11@gmail.com"; workspace.append(link); }
  }
  function files() {
    workspace.append(node("p", "pc-hint", "A:/home/akon — selecciona un archivo"));
    const list = node("div", "pc-file-list");
    Object.keys(virtualFiles).filter(name => hiddenFiles || !name.startsWith(".")).forEach(name => list.append(button("▤ " + name, () => showFile(name))));
    list.append(button("✎ notas.txt", () => openApp("notes")), button("▣ proyectos/", projectFolder)); workspace.append(list);
    workspace.append(button(hiddenFiles ? "Ocultar archivos del sistema" : "Mostrar archivos del sistema", () => { hiddenFiles = !hiddenFiles; openApp("files"); }, "pc-subtle"));
  }
  async function projectFolder() {
    reset("projects"); heading("A:/proyectos", () => openApp("files"));
    const listing = node("div", "pc-file-list", "Leyendo disco…"); workspace.append(listing);
    try {
      if (!projectData) { const response = await fetch("static/projects.json"); if (!response.ok) throw new Error(); projectData = await response.json(); }
      if (!listing.isConnected) return;
      listing.replaceChildren();
      projectData.forEach(project => {
        const url = new URL(project.repository); if (!["https:", "http:"].includes(url.protocol)) return;
        const link = node("a", "pc-file-link", "↗ " + project.title); link.href = url.href; link.target = "_blank"; link.rel = "noopener noreferrer"; listing.append(link);
      });
    } catch { if (listing.isConnected) { listing.textContent = "No se pudo leer el disco. "; listing.append(button("Reintentar", projectFolder)); } }
  }
  function notepad() {
    const label = node("label", "pc-hint", "notas.txt · Solo en este navegador"); label.htmlFor = "pc-notes";
    const area = node("textarea", "pc-notes"); area.id = "pc-notes"; area.value = notes; area.maxLength = 10000; area.spellcheck = false;
    area.addEventListener("input", () => { notes = area.value; announce(save("notes", notes) ? "Notas guardadas en este navegador." : "Sin almacenamiento: notas guardadas solo durante esta visita."); });
    workspace.append(label, area, button("Descargar .txt ↓", () => download("notas-akon.txt", notes, "text/plain;charset=utf-8"), "pc-subtle"));
  }
  function download(filename, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = node("a"); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  // Analizador aritmético limitado; nunca usa eval ni ejecuta JavaScript.
  function calculate(input) {
    const text = input.replace(/\s/g, "");
    if (!text || text.length > 100 || /[^\d.+*/()\-]/.test(text)) throw new Error("Usa números, + − * / y paréntesis.");
    const tokens = text.match(/(?:\d+(?:\.\d*)?|\.\d+)|[()+*/-]/g) || [];
    if (tokens.join("") !== text) throw new Error("Expresión inválida.");
    let index = 0;
    function factor() {
      const token = tokens[index++];
      if (token === "+") return factor();
      if (token === "-") return -factor();
      if (token === "(") { const value = sum(); if (tokens[index++] !== ")") throw new Error("Falta cerrar un paréntesis."); return value; }
      if (token === undefined || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) throw new Error("Expresión incompleta.");
      return Number(token);
    }
    function product() { let value = factor(); while (["*", "/"].includes(tokens[index])) { const op = tokens[index++]; const rhs = factor(); if (op === "/" && rhs === 0) throw new Error("No se puede dividir por cero."); value = op === "*" ? value * rhs : value / rhs; } return value; }
    function sum() { let value = product(); while (["+", "-"].includes(tokens[index])) { const op = tokens[index++]; const rhs = product(); value = op === "+" ? value + rhs : value - rhs; } return value; }
    const result = sum();
    if (index !== tokens.length || !Number.isFinite(result)) throw new Error("Expresión inválida o resultado demasiado grande.");
    return Number(result.toPrecision(12)).toString();
  }
  function calculator() {
    const form = node("form", "pc-calculator"); const label = node("label", "pc-hint", "Escribe una operación o usa los botones."); label.htmlFor = "pc-calc";
    const input = node("input", "pc-calc-input"); input.id = "pc-calc"; input.type = "text"; input.inputMode = "text"; input.maxLength = 100; input.placeholder = "(12 + 3) * 2"; input.autocomplete = "off";
    const result = node("output", "pc-calc-result", "0"); result.setAttribute("aria-live", "polite");
    const run = () => { try { result.textContent = calculate(input.value); } catch (err) { result.textContent = err.message; } };
    form.addEventListener("submit", event => { event.preventDefault(); run(); });
    const keys = node("div", "pc-calc-keys");
    ["7","8","9","/","4","5","6","*","1","2","3","-","0",".","(",")","C","⌫","=","+"].forEach(key => keys.append(button(key, () => {
      if (key === "=") run(); else if (key === "C") { input.value = ""; result.textContent = "0"; } else if (key === "⌫") input.value = input.value.slice(0, -1); else if (input.value.length < 100) input.value += key;
    })));
    form.append(label, input, result, keys); workspace.append(form);
  }
  function paint() {
    let color = palette[1];
    const tools = node("div", "pc-palette"); tools.setAttribute("role", "group"); tools.setAttribute("aria-label", "Color del pincel");
    const colorNames = ["Borrador", "Verde", "Ámbar", "Coral", "Azul", "Marfil"];
    palette.forEach((value, i) => { const swatch = button("", () => { color = value; [...tools.children].forEach(el => el.setAttribute("aria-pressed", String(el === swatch))); }); swatch.style.background = value; swatch.setAttribute("aria-label", colorNames[i]); swatch.setAttribute("aria-pressed", String(value === color)); tools.append(swatch); });
    const canvas = node("div", "pc-pixels"); canvas.setAttribute("role", "group"); canvas.setAttribute("aria-label", "Lienzo de 12 por 8 píxeles. Pulsa para pintar.");
    pixels.forEach((value, i) => { const pixel = button("", () => { pixels[i] = color; pixel.style.background = color; pixel.setAttribute("aria-label", `Píxel ${i + 1}: ${colorNames[palette.indexOf(color)]}`); announce(save("pixels", JSON.stringify(pixels)) ? "Dibujo guardado." : "Dibujo disponible solo durante esta visita."); }); pixel.style.background = value; pixel.setAttribute("aria-label", `Píxel ${i + 1}: ${colorNames[palette.indexOf(value)]}`); canvas.append(pixel); });
    const actions = node("div", "pc-row");
    actions.append(button("Limpiar", () => { pixels.fill(palette[0]); save("pixels", JSON.stringify(pixels)); openApp("paint"); }), button("Descargar SVG ↓", () => { const squares = pixels.map((value, i) => `<rect x="${i % 12}" y="${Math.floor(i / 12)}" width="1" height="1" fill="${value}"/>`).join(""); download("pixel-akon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 8" width="600" height="400">${squares}</svg>`, "image/svg+xml"); }));
    workspace.append(tools, canvas, actions);
  }
  function game() {
    const symbols = ["{ }", ">_", "01", "#", "@", "*"];
    const deck = [...symbols, ...symbols];
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    let first = null, locked = false, matches = 0, moves = 0, timer;
    const score = node("p", "pc-hint", "Encuentra los 6 pares. Intentos: 0"); score.setAttribute("role", "status");
    const grid = node("div", "pc-memory");
    deck.forEach((symbol, i) => {
      const card = button("?", () => {
        if (locked || card.disabled || card === first) return;
        card.textContent = symbol; card.setAttribute("aria-label", `Carta ${i + 1}: ${symbol}`); card.classList.add("flipped");
        if (!first) { first = card; return; }
        moves++;
        if (first.textContent === symbol) {
          card.disabled = true; first.disabled = true; card.classList.add("matched"); first.classList.add("matched"); first = null; matches++;
          score.textContent = matches === 6 ? `¡Completado en ${moves} intentos! Una memoria digna de 64 KB.` : `Pares: ${matches}/6 · Intentos: ${moves}`;
        } else {
          score.textContent = `Pares: ${matches}/6 · Intentos: ${moves}`; locked = true;
          timer = setTimeout(() => { [first, card].forEach(el => { el.textContent = "?"; el.classList.remove("flipped"); el.setAttribute("aria-label", `Carta ${Number(el.dataset.index) + 1}, oculta`); }); first = null; locked = false; }, 850);
        }
      }); card.dataset.index = i; card.setAttribute("aria-label", `Carta ${i + 1}, oculta`); grid.append(card);
    });
    stopApp = () => clearTimeout(timer);
    workspace.append(score, grid, button("Nueva partida ↻", () => openApp("game"), "pc-subtle"));
  }
  function music() {
    workspace.append(node("p", "pc-hint", "Tres pequeñas melodías originales. El sonido solo empieza cuando pulsas reproducir."));
    let audio = null, endTimer;
    const tracks = [
      ["01 · Arranque de 8 bits", [262, 330, 392, 523, 392, 330, 294, 262]],
      ["02 · Paseo por la memoria", [330, 392, 440, 392, 330, 294, 262, 294]],
      ["03 · Código nocturno", [220, 262, 330, 440, 330, 262, 247, 220]]
    ];
    const info = node("p", "pc-music-status", "■ DETENIDO"); info.setAttribute("role", "status");
    const volumeLabel = node("label", "pc-hint", "Volumen"); volumeLabel.htmlFor = "pc-volume";
    const volume = node("input", "pc-volume"); volume.id = "pc-volume"; volume.type = "range"; volume.min = "0"; volume.max = "100"; volume.value = "30";
    let master = null;
    const stop = () => { clearTimeout(endTimer); if (audio) { audio.close().catch(() => {}); audio = null; } master = null; info.textContent = "■ DETENIDO"; };
    const list = node("div", "pc-file-list");
    tracks.forEach(([title, notes]) => list.append(button("▶ " + title, async () => {
      stop();
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) { info.textContent = "Este navegador no permite sintetizar sonido."; return; }
      try {
        const ctx = new Audio(); audio = ctx; await ctx.resume();
        if (audio !== ctx) return;
        master = ctx.createGain(); master.gain.value = Number(volume.value) / 100 * 0.15; master.connect(ctx.destination);
        const now = ctx.currentTime + 0.03;
        notes.forEach((frequency, i) => { const oscillator = ctx.createOscillator(), envelope = ctx.createGain(); oscillator.type = "square"; oscillator.frequency.value = frequency; envelope.gain.setValueAtTime(0, now + i * 0.24); envelope.gain.linearRampToValueAtTime(1, now + i * 0.24 + 0.01); envelope.gain.exponentialRampToValueAtTime(0.001, now + i * 0.24 + 0.2); oscillator.connect(envelope); envelope.connect(master); oscillator.start(now + i * 0.24); oscillator.stop(now + i * 0.24 + 0.22); });
        info.textContent = "♫ " + title; endTimer = setTimeout(stop, 2100);
      } catch { stop(); info.textContent = "No se pudo iniciar el audio. Prueba otra vez."; }
    })));
    volume.addEventListener("input", () => { if (master && audio) master.gain.setTargetAtTime(Number(volume.value) / 100 * 0.15, audio.currentTime, 0.02); });
    workspace.append(list, info, volumeLabel, volume, button("■ Detener", stop, "pc-subtle")); stopApp = stop;
  }
  let timerRemaining = 25 * 60;
  function timer() {
    let deadline = null, interval;
    const display = node("div", "pc-timer-display"); display.setAttribute("role", "timer"); display.setAttribute("aria-label", "Tiempo restante");
    const message = node("p", "pc-hint", "Se pausa al salir de esta aplicación."); message.setAttribute("role", "status");
    const render = () => { display.textContent = `${String(Math.floor(timerRemaining / 60)).padStart(2, "0")}:${String(timerRemaining % 60).padStart(2, "0")}`; };
    const pause = () => { if (deadline !== null) timerRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000)); deadline = null; clearInterval(interval); render(); };
    const choices = node("div", "pc-row");
    [1, 5, 25].forEach(minutes => choices.append(button(minutes + " min", () => { pause(); timerRemaining = minutes * 60; render(); message.textContent = "Duración preparada."; })));
    const controls = node("div", "pc-row");
    controls.append(button("▶ Iniciar", () => {
      if (deadline !== null) return;
      if (timerRemaining <= 0) { message.textContent = "Elige una duración para volver a empezar."; return; }
      deadline = Date.now() + timerRemaining * 1000; message.textContent = "En marcha. Una cosa a la vez.";
      interval = setInterval(() => { timerRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000)); render(); if (timerRemaining === 0) { pause(); message.textContent = "¡Tiempo cumplido! Haz una pausa."; } }, 250);
    }), button("Ⅱ Pausar", () => { pause(); message.textContent = "En pausa."; }));
    workspace.append(node("p", "pc-hint", "FOCUS.EXE / UN MOMENTO PARA CONSTRUIR"), display, choices, controls, message); render(); stopApp = pause;
  }

  function secrets() {
    if (!on) return;
    reset("secrets"); heading("Descubrimientos");
    workspace.append(node("p", "pc-hint", "La curiosidad abre puertas. Tu progreso se guarda aquí."));
    const list = node("ul", "pc-secret-list");
    Object.entries(secretNames).forEach(([key, title], i) => list.append(node("li", "", discovered.has(key) ? "◆ " + title : `◇ Secreto 0${i + 1} — sin descubrir`)));
    workspace.append(list, node("p", "pc-hint", "Primera pista: abre leeme.txt en Archivos."));
  }
  function terminal() {
    const log = node("div", "pc-terminal-log"); log.setAttribute("role", "log"); log.setAttribute("aria-label", "Salida de la terminal"); log.setAttribute("aria-live", "polite"); log.tabIndex = 0;
    const render = () => { log.replaceChildren(...terminalLines.map(line => node("div", "", line))); log.scrollTop = log.scrollHeight; };
    const form = node("form", "pc-command"); const label = node("label", "", "akon:~$"); label.htmlFor = "pc-command";
    const input = node("input"); input.id = "pc-command"; input.type = "text"; input.autocomplete = "off"; input.autocapitalize = "off"; input.spellcheck = false; input.maxLength = 180; input.setAttribute("aria-label", "Comando de terminal"); input.placeholder = "help";
    form.append(label, input); workspace.append(log, form);
    const print = text => { terminalLines.push(text); terminalLines = terminalLines.slice(-100); render(); };
    form.addEventListener("submit", event => {
      event.preventDefault(); const raw = input.value.trim(); if (!raw) return; input.value = ""; history.push(raw); if (history.length > 50) history.shift(); historyIndex = history.length; draft = "";
      print("akon:~$ " + raw);
      const [command, ...args] = raw.split(/\s+/); const value = args.join(" ");
      switch (command.toLowerCase()) {
        case "help": print("help · ls [-a] · cat <archivo> · whoami · date\ncalc <operación> · echo <texto> · clear\nopen terminal|files|notes|calculator|paint|game|music|timer\nprojects · play · home · reboot\nTip: lee leeme.txt. Hay comandos que no aparecen aquí."); break;
        case "ls": print(Object.keys(virtualFiles).filter(file => args.includes("-a") || !file.startsWith(".")).concat(["notas.txt", "proyectos/"]).join("  ")); break;
        case "cat": if (Object.hasOwn(virtualFiles, value)) { print(virtualFiles[value]); if (value === ".vault") unlock("vault"); } else if (value === "notas.txt") print(notes); else print("Archivo no encontrado. Usa ls o ls -a."); break;
        case "whoami": print(virtualFiles["perfil.txt"]); break;
        case "date": print(new Date().toLocaleString("es-CL")); break;
        case "echo": print(value); break;
        case "calc": try { print(calculate(value)); } catch (err) { print(err.message); } break;
        case "clear": terminalLines = []; render(); break;
        case "open": if (Object.hasOwn(appNames, value)) openApp(value); else print("App desconocida. Prueba: open notes"); break;
        case "projects": projectFolder(); break;
        case "play": openApp("game"); break;
        case "home": desktop(); break;
        case "reboot": terminalLines = ["AKON OS reiniciado. Tus notas y descubrimientos siguen aquí.", "Escribe help para comenzar."]; desktop(); announce("Reinicio completo."); break;
        case "coffee": print("    ( (\n     ) )\n   .----.\n   |    |]\n   `----'\nCafé servido. Backend +100 de energía."); unlock("coffee"); break;
        case "matrix": matrix(); break;
        case "sudo": print(value === "make sandwich" ? "Permiso concedido. 🥪 Un sándwich virtual para seguir programando." : "Buen intento. Aquí todos somos visitantes, incluso root."); break;
        case "timecapsule": print("DISQUETE A:/ — ABRIR EN EL FUTURO\n\nQuerido visitante: conserva la curiosidad, haz copias de seguridad y no dejes de construir.\n\nPista de las aventuras de texto: xyzzy."); unlock("time"); break;
        case "xyzzy": print("Se abre una puerta en la pared de texto.\n\nHas encontrado la sala de quienes leen hasta el final.\nAquí no hay tesoros: solo otra idea esperando convertirse en código."); unlock("wizard"); break;
        case "fortune": print(["Un bug también puede ser una pregunta bien escondida.", "Primero hazlo funcionar. Después, hazlo claro.", "El próximo proyecto empieza con una pequeña idea."][Math.floor(Math.random() * 3)]); break;
        case "42": print("La respuesta está lista. Ahora falta encontrar la pregunta."); break;
        default: print(`Comando desconocido: ${command}. Escribe help.`);
      }
    });
    input.addEventListener("keydown", event => {
      if (!["ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      if (historyIndex === history.length) draft = input.value;
      historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === "ArrowUp" ? -1 : 1)));
      input.value = historyIndex === history.length ? draft : history[historyIndex];
      input.setSelectionRange(input.value.length, input.value.length);
    });
    render(); input.focus({ preventScroll: true });
  }
  function matrix() {
    reset("matrix"); heading("Señal encontrada", () => openApp("terminal")); unlock("matrix");
    const rain = node("pre", "pc-matrix"); rain.setAttribute("aria-hidden", "true");
    workspace.append(node("p", "pc-hint", "Ahora ves lo que hay detrás del código."), rain);
    const draw = () => { rain.textContent = Array.from({ length: 10 }, () => Array.from({ length: 28 }, () => "01.: ｱｺﾝ"[Math.floor(Math.random() * 8)]).join("")).join("\n"); };
    draw(); if (!matchMedia("(prefers-reduced-motion: reduce)").matches) { const timer = setInterval(draw, 180); stopApp = () => clearInterval(timer); }
  }
  const sequence = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let sequenceIndex = 0;
  pc.addEventListener("keydown", event => {
    if (!on || event.target.matches("input, textarea")) { sequenceIndex = 0; return; }
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === sequence[sequenceIndex]) {
      event.preventDefault(); sequenceIndex++;
      if (sequenceIndex === sequence.length) { sequenceIndex = 0; unlock("konami"); secrets(); announce("¡Código Konami aceptado! +30 vidas a tu curiosidad."); }
    } else sequenceIndex = key === sequence[0] ? 1 : 0;
  });
  pc.querySelectorAll("[data-app]").forEach(el => { el.setAttribute("aria-label", el.title); el.addEventListener("click", () => openApp(el.dataset.app)); });
  pc.querySelector("#pc-home").addEventListener("click", desktop);
  pc.querySelector("#pc-secrets").addEventListener("click", secrets);
  power.addEventListener("click", () => {
    on = !on; stopApp(); sequenceIndex = 0;
    pc.classList.toggle("pc-off", !on); power.setAttribute("aria-pressed", String(on)); power.setAttribute("aria-label", on ? "Apagar computadora" : "Encender computadora"); power.title = on ? "Apagar computadora" : "Encender computadora";
    pc.querySelectorAll("[data-app], #pc-home, #pc-secrets").forEach(el => el.disabled = !on);
    if (on) desktop(); else { workspace.replaceChildren(node("div", "pc-off-message", "SISTEMA APAGADO\nPulsa ⏻ para volver.")); announce("En espera."); }
  });
  expand.addEventListener("click", () => {
    if (modal.open) { modal.close(); return; }
    modal.append(pc); modal.showModal(); expand.textContent = "↙"; expand.setAttribute("aria-label", "Reducir computadora"); expand.title = "Reducir computadora"; expand.focus();
  });
  modal.addEventListener("close", () => { document.querySelector("#computer-slot").append(pc); expand.textContent = "⛶"; expand.setAttribute("aria-label", "Ampliar computadora"); expand.title = "Ampliar computadora"; expand.focus(); });
  document.addEventListener("akon:open-app", event => {
    if (!Object.hasOwn(appNames, event.detail)) return;
    if (!on) power.click();
    if (!modal.open) expand.click();
    openApp(event.detail);
  });
  function clock() { pc.querySelector("#pc-clock").textContent = new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }); }
  clock(); setInterval(clock, 30000); updateSecrets(); desktop();
})();
