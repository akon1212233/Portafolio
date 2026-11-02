/* Akon OS: una computadora virtual local. No ejecuta comandos del sistema. */
(() => {
  "use strict";
  const pc = document.querySelector("#retro-pc");
  const workspace = pc.querySelector("#pc-workspace");
  const status = pc.querySelector("#pc-status");
  const modal = document.querySelector("#pc-dialog");
  const expand = pc.querySelector("#pc-expand");
  const power = pc.querySelector("#pc-power");
  const appNames = { terminal: "Terminal", files: "Archivos", notes: "Notas", calculator: "Calculadora", paint: "Pixel Studio", game: "Memoria", music: "Sonidos", timer: "Temporizador", racer: "Retro Racer", mines: "Buscaminas", backend: "SIGNAL", games: "Juegos" };
  const gameIds = new Set(["racer", "backend", "mines", "game"]);
  let cinema = false;
  function gameMode(enabled) {
    cinema = enabled; modal.classList.toggle("games-mode", enabled);
    pc.querySelector("#pc-home").textContent = enabled ? "← JUEGOS" : "▦ AKON OS";
    pc.querySelector("#pc-home").title = enabled ? "Volver a la biblioteca" : "Ir al escritorio";
  }
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
  function heading(text, back = cinema ? () => openApp("games") : desktop) {
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
    gameMode(false);
    reset("desktop");
    const welcome = node("div", "pc-welcome");
    welcome.append(node("p", "", "BIENVENIDO A AKON OS"), node("span", "", "Un pequeño mundo detrás del código."));
    const grid = node("div", "pc-desktop");
    const icons = { terminal: ">_", files: "▤", notes: "✎", calculator: "±", paint: "▦", game: "♧", music: "♫", timer: "◷", racer: "🏁", mines: "⚑", backend: "{ }", games: "✥" };
    Object.entries(appNames).filter(([app]) => !gameIds.has(app) && !["files","notes"].includes(app)).forEach(([app, name]) => {
      const shortcut = button("", () => openApp(app)); shortcut.append(node("span", "pc-icon", icons[app]), node("span", "", name)); grid.append(shortcut);
    });
    workspace.append(welcome, grid, node("p", "pc-hint", "Abre una app con un clic. Hay 6 secretos escondidos. ¿Los encuentras?"));
  }
  function openApp(app) {
    if (!on || !Object.hasOwn(appNames, app)) return;
    const enteringGames = (app === "games" || gameIds.has(app)) && !cinema;
    const origin = enteringGames ? AkonTransition.capture(pc) : null;
    if (app === "games" || gameIds.has(app)) {
      gameMode(true);
      if (!modal.open) expand.click();
    } else if (cinema) { AkonTransition.cancel(pc); gameMode(false); }
    reset(app); if (app !== "games") heading(appNames[app]);
    ({ terminal, files, notes: notepad, calculator, paint, game, music, timer, racer, mines, backend, games })[app]();
    if (enteringGames) AkonTransition.enter(modal, pc, origin);
  }
  function games() { AkonGames.mount(workspace, openApp); }
  function mines() { stopApp = AkonArcade.mountMines(workspace); }
  function backend() { stopApp = AkonSignal.mount(workspace); }
  function racer() { stopApp = AkonRacer.mount(workspace); }
  const virtualFiles = {
    "perfil.txt": "Akon Bustamante\nMe apasiona la tecnología.\nDesarrollo web full stack · C++ · Python\nLinux · Servidores Linux\n\nMe gusta entender cómo funcionan las cosas y aprender construyendo.",
    "contacto.txt": "Correo: akonbustamante11@gmail.com\nLinkedIn: https://www.linkedin.com/in/akon-bustamante-b58313319/\nGitHub: https://github.com/akon1212233",
    "leeme.txt": "Este es tu rincón para experimentar.\n\nLas notas y los dibujos se guardan en este navegador.\nTerminal: help muestra los comandos.\n\nUn viejo consejo: en una terminal, los archivos con un punto al inicio suelen pasar desapercibidos.\n\nAlgunos desarrolladores funcionan mejor después de un coffee.\nOtros se preguntan qué hay dentro de la matrix.\n\nActualización del archivo: prueba fortune cuando falten ideas.\nUn disquete olvidado lleva escrito: timecapsule.",
    ".vault": "ARCHIVO RECUPERADO — 1998\n\nEncontraste el primer rincón secreto.\n\nLa curiosidad también es una habilidad de programación.\n\nOtra pista: los jugadores de antes recuerdan esta secuencia.\n↑ ↑ ↓ ↓ ← → ← → B A\nPruébala dentro de la computadora, fuera de un campo de texto."
  };
  AkonTools.configure(virtualFiles,notes);
  function showFile(name) {
    if (name === ".vault") unlock("vault");
    reset("files"); heading(name, () => openApp("files"));
    workspace.append(node("pre", "pc-document", virtualFiles[name] ?? notes));
    if (name === "contacto.txt") { const link = node("a", "pc-link", "Escribir un correo ↗"); link.href = "mailto:akonbustamante11@gmail.com"; workspace.append(link); }
  }
  function files() { AkonTools.manager(workspace, () => openApp("terminal"), name => editFile(name)); }
  function editFile(name) { if(name===".vault")unlock("vault"); reset("notes"); heading("nano / " + name, () => openApp("terminal")); AkonTools.editor(workspace,name,()=>openApp("terminal")); }
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
  function notepad() { AkonTools.editor(workspace,"notas.txt",()=>openApp("terminal")); }
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
  function paint() { AkonTools.paint(workspace,pixels,palette,()=>save("pixels",JSON.stringify(pixels)),download); }
  function game() {
    const symbols = ['Sol','Luna','Montaña','Rayo','Estrella','Hoja'];
    const paths = [
      '<circle cx="40" cy="40" r="13"/><path d="M40 10v9m0 42v9M10 40h9m42 0h9M19 19l7 7m28 28l7 7M19 61l7-7m28-28l7-7"/>',
      '<path d="M53 14a28 28 0 1 0 13 42A28 28 0 0 1 53 14Z"/>',
      '<path d="m8 62 24-41 11 19 9-12 21 34ZM23 37l9 6 8-6M47 35l6 8 5-4"/>',
      '<path d="M43 8 21 44h17l-3 28 26-40H44Z"/>',
      '<path d="m40 9 9 20 23 3-17 16 4 23-19-11-19 11 4-23L8 32l23-3Z"/>',
      '<path d="M61 12C25 11 8 34 23 54c21 24 45-3 38-42ZM18 67l35-43M28 54l-1-17m11 5 17 1"/>'
    ];
    const variants=symbols.flatMap(symbol=>['Ámbar','Azul'].map(color=>symbol+'|'+color));const deck = [...variants,...variants];for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
    let first=null,locked=false,matches=0,moves=0,timer;
    const box=node('section','memory-game');const header=node('div','play-heading');header.append(node('span','','04 / EL ARCHIVO DE LOS RECUERDOS'),node('h2','','Lo que permanece'),node('p','','Veinticuatro cartas. Doce parejas de símbolo y color. Tómate tu tiempo.'));
    const score=node('p','memory-score','PARES 00 / 12  ·  INTENTOS 00');score.setAttribute('role','status');
    const grid=node('div','pc-memory');
    deck.forEach((symbol,i)=>{
      const card=button('',()=>{
        if(locked||card.disabled||card===first)return;
        card.setAttribute('aria-label',`Carta ${i+1}: ${symbol.replace('|',', ')}`);card.classList.add('flipped');
        if(!first){first=card;return;}moves++;
        if(first.dataset.symbol===symbol){card.disabled=true;first.disabled=true;card.classList.add('matched');first.classList.add('matched');first=null;matches++;score.textContent=matches===12?`ARCHIVO COMPLETO · ${moves} INTENTOS`:`PARES ${String(matches).padStart(2,'0')} / 12 · INTENTOS ${String(moves).padStart(2,'0')}`;}
        else{score.textContent=`PARES ${String(matches).padStart(2,'0')} / 12 · INTENTOS ${String(moves).padStart(2,'0')}`;locked=true;timer=setTimeout(()=>{[first,card].forEach(el=>{el.classList.remove('flipped');el.setAttribute('aria-label',`Carta ${Number(el.dataset.index)+1}, oculta`);});first=null;locked=false;},850);}
      });
      card.dataset.index=i;card.dataset.symbol=symbol;card.dataset.color=symbol.split('|')[1];card.className='memory-card';card.setAttribute('aria-label',`Carta ${i+1}, oculta`);
      const inner=node('span','memory-card-inner'),back=node('span','memory-card-back'),front=node('span','memory-card-front');inner.setAttribute('aria-hidden','true');
      back.append(node('span','memory-seal','✧'),node('small','','AKON ARCHIVE'));
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 80 80');svg.innerHTML=paths[symbols.indexOf(symbol.split('|')[0])];front.append(svg,node('small','',symbol.replace('|',' · ')));inner.append(back,front);card.append(inner);grid.append(card);
    });
    stopApp=()=>clearTimeout(timer);
    const foot=node('div','memory-footer');foot.append(node('p','','Los símbolos solo se quedan si encuentran su pareja.'),button('Barajar de nuevo ↻',()=>openApp('game'),'game-action-primary'));
    box.append(header,score,grid,foot);workspace.append(box);
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
        case "help": print("yazi · touch <archivo> · nano <archivo>\nhelp · ls [-a] · cat <archivo> · whoami · date\ncalc <operación> · echo <texto> · clear\nopen terminal|files|notes|calculator|paint|game|music|timer|racer|mines|backend|games\nprojects · play · home · reboot\nTip: lee leeme.txt. Hay comandos que no aparecen aquí."); break;
        case "ls": print(AkonTools.names().filter(file => args.includes("-a") || !file.startsWith(".")).concat(["proyectos/"]).join("  ")); break;
        case "yazi": openApp("files"); break;
        case "touch": try { AkonTools.create(value); print("Archivo listo: " + value); } catch(err) { print(err.message); } break;
        case "nano": case "edit": try { AkonTools.create(value); editFile(value); } catch(err) { print(err.message); } break;
        case "cat": { const content=AkonTools.read(value); print(content===null?"Archivo no encontrado.":content); if(value===".vault")unlock("vault"); break; }
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
    const view=node('div','matrix-view'),canvas=node('canvas','matrix-canvas');
    canvas.setAttribute('aria-label','Lluvia de caracteres verdes que ocupa la pantalla disponible');
    view.append(canvas);workspace.append(view);
    const ctx=canvas.getContext('2d');if(!ctx){view.textContent='Tu navegador no permite dibujar este efecto.';return;}
    let width=0,height=0,drops=[],frame,last=0,stopped=false;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,chars='0123456789アイウエオカキクケコサシスセソ';
    function resize(){const rect=view.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);drops=Array.from({length:Math.ceil(width/15)},()=>Math.random()*height/17);ctx.fillStyle='#030c07';ctx.fillRect(0,0,width,height);for(let i=0;i<18;i++)draw();}
    function draw(){ctx.fillStyle='rgba(3,12,7,.12)';ctx.fillRect(0,0,width,height);ctx.font='14px monospace';drops.forEach((y,i)=>{const x=i*15;ctx.fillStyle=Math.random()>.93?'#d3ffcc':'#59cf7a';ctx.fillText(chars[Math.floor(Math.random()*chars.length)],x,y*17);drops[i]=y*17>height&&Math.random()>.975?0:y+.7;});}
    function loop(now){if(stopped)return;if(now-last>65){draw();last=now;}frame=requestAnimationFrame(loop);}
    const observer=new ResizeObserver(resize);observer.observe(view);resize();if(!reduced)frame=requestAnimationFrame(loop);
    stopApp=()=>{stopped=true;observer.disconnect();cancelAnimationFrame(frame);};
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
  pc.querySelector("#pc-home").addEventListener("click", () => cinema ? openApp("games") : desktop());
  pc.querySelector("#pc-crt").addEventListener("click", event => {
    const plain = modal.classList.toggle("crt-off"); event.currentTarget.textContent = plain ? "CRT OFF" : "CRT ON"; event.currentTarget.setAttribute("aria-pressed", String(!plain));
  });
  pc.querySelector("#pc-secrets").addEventListener("click", secrets);
  power.addEventListener("click", () => {
    AkonTransition.cancel(pc); on = !on; stopApp(); sequenceIndex = 0;
    pc.classList.toggle("pc-off", !on); power.setAttribute("aria-pressed", String(on)); power.setAttribute("aria-label", on ? "Apagar computadora" : "Encender computadora"); power.title = on ? "Apagar computadora" : "Encender computadora";
    pc.querySelectorAll("[data-app], #pc-home, #pc-secrets").forEach(el => el.disabled = !on);
    if (on) desktop(); else { workspace.replaceChildren(node("div", "pc-off-message", "SISTEMA APAGADO\nPulsa ⏻ para volver.")); announce("En espera."); }
  });
  expand.addEventListener("click", () => {
    if (modal.open) { modal.close(); return; }
    modal.append(pc); modal.showModal(); expand.textContent = "✕"; expand.setAttribute("aria-label", "Cerrar computadora ampliada"); expand.title = "Cerrar computadora ampliada"; expand.focus();
  });
  modal.addEventListener("close", () => { AkonTransition.cancel(pc); stopApp(); gameMode(false); if (on) desktop(); document.querySelector("#computer-slot").append(pc); expand.textContent = "⛶"; expand.setAttribute("aria-label", "Ampliar computadora"); expand.title = "Ampliar computadora"; expand.focus(); });
  document.addEventListener("akon:open-app", event => {
    if (!Object.hasOwn(appNames, event.detail)) return;
    if (!on) power.click();
    if (!modal.open && event.detail !== "games" && !gameIds.has(event.detail)) expand.click();
    openApp(event.detail);
  });
  function clock() { pc.querySelector("#pc-clock").textContent = new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }); }
  clock(); setInterval(clock, 30000); updateSecrets(); desktop();
})();
