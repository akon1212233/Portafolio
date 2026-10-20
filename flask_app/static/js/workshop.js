(() => {
  "use strict";
  const q = selector => document.querySelector(selector);
  const lab = AkonWorkshop.createLab();
  const method = q("#api-method"), value = q("#api-value");
  function endpoint() {
    q("#api-value-label").textContent = method.value === "POST" ? "Título de la nueva tarea" : method.value === "DELETE" ? "ID de la tarea que quieres eliminar" : "ID (opcional; vacío devuelve todas)";
    value.placeholder = method.value === "POST" ? "Ejemplo: Revisar los proyectos" : "Ejemplo: 1";
    q("#api-endpoint").textContent = `${method.value} /api/tareas${method.value !== "POST" && value.value.trim() ? "/" + value.value.trim() : ""}`;
  }
  method.addEventListener("change", () => { value.value = ""; endpoint(); }); value.addEventListener("input", endpoint);
  q("#api-form").addEventListener("submit", event => {
    event.preventDefault(); const result = lab.request(method.value, value.value);
    q("#api-response").textContent = JSON.stringify(result.body, null, 2);
    q("#api-code").textContent = String(result.status) + ({200:" OK",201:" CREATED",400:" BAD REQUEST",404:" NOT FOUND",409:" CONFLICT"}[result.status] || "");
    q("#api-code").dataset.error = String(result.status >= 400);
    q("#api-copy-status").textContent = "";
    const explanations = ["La ruta recibe " + method.value + " /api/tareas.", result.stage === 2 ? "La validación detuvo esta petición. Revisa el dato ingresado." : "Los parámetros tienen un formato válido.", result.stage < 3 ? "No se consultan ni modifican los datos." : result.status === 404 ? "El ID solicitado no está en la colección." : result.status === 409 ? "La colección alcanzó el límite de la demo." : "La operación se completó sobre la colección local.", "El cliente recibe JSON y el estado " + result.status + "."];
    q("#request-trace").querySelectorAll("li").forEach((item, index) => { item.classList.toggle("trace-error", index + 1 === result.stage && result.status >= 400); item.querySelector("span").textContent = explanations[index]; });
  });
  q("#api-reset").addEventListener("click", () => { lab.reset(); method.value = "GET"; value.value = ""; endpoint(); q("#api-form").requestSubmit(); });
  async function copy(text, target) { try { await navigator.clipboard.writeText(text); target.textContent = "Copiado."; } catch { target.textContent = "No se pudo copiar automáticamente. Selecciona el texto para copiarlo."; } }
  q("#api-copy").addEventListener("click", () => copy(q("#api-response").textContent, q("#api-copy-status")));
  const contact = q("#contact-form");
  q("#contact-message").addEventListener("input", event => { q("#message-count").textContent = `${event.target.value.length}/1500`; q("#contact-status").textContent = ""; });
  function compose() { return AkonWorkshop.composeContact(q("#contact-name").value, q("#contact-subject").value, q("#contact-message").value); }
  contact.addEventListener("submit", event => { event.preventDefault(); try { const draft = compose(); window.location.href = draft.url; q("#contact-status").textContent = "Borrador preparado. Si no se abre tu aplicación de correo, usa «Copiar mensaje»."; } catch (error) { q("#contact-status").textContent = error.message; } });
  q("#contact-copy").addEventListener("click", () => { if (!contact.reportValidity()) return; try { copy(compose().body, q("#contact-status")); } catch (error) { q("#contact-status").textContent = error.message; } });
  q("#download-profile").addEventListener("click", () => {
    const profile = "AKON BUSTAMANTE\nProgramador full stack · Afinidad por backend\n\nSoy programador full stack, con mayor facilidad y afinidad por el desarrollo backend.\n\nTecnologías: Python, Flask, MySQL, HTML, CSS, JavaScript, Git y GitHub.\n\nContacto: akonbustamante11@gmail.com\nLinkedIn: https://www.linkedin.com/in/akon-bustamante-b58313319/\nGitHub: https://github.com/akon1212233\n\nProyectos y ejercicios: https://github.com/akon1212233/Skillnest_Python\n";
    const url = URL.createObjectURL(new Blob([profile], { type: "text/plain;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "Akon-Bustamante-perfil.txt"; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const palette = q("#command-dialog");
  const commands = [
    ["Inicio", "#inicio"], ["Sobre mí", "#sobre-mi"], ["Proyectos", "#proyectos"], ["Laboratorio backend", "#laboratorio"], ["Bitácora", "#bitacora"], ["Contacto", "#contacto"],
    ...["terminal", "files", "notes", "calculator", "paint", "game", "music", "timer"].map((app, i) => [["Terminal", "Archivos", "Notas", "Calculadora", "Pixel Studio", "Memoria", "Sonidos retro", "Temporizador"][i], app])
  ];
  function run(target) {
    palette.close();
    if (target.startsWith("#")) { const section = q(target); section.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); section.setAttribute("tabindex", "-1"); section.focus({ preventScroll: true }); }
    else { document.dispatchEvent(new CustomEvent("akon:open-app", { detail: target })); }
  }
  function renderCommands() {
    const query = q("#command-query").value.trim().toLocaleLowerCase("es"); const result = q("#command-results"); result.replaceChildren();
    commands.filter(([name]) => name.toLocaleLowerCase("es").includes(query)).forEach(([name, target]) => { const b = document.createElement("button"); b.type = "button"; b.textContent = `${target.startsWith("#") ? "↳" : "▣"} ${name}`; b.addEventListener("click", () => run(target)); result.append(b); });
    if (!result.children.length) { const p = document.createElement("p"); p.textContent = "Sin coincidencias. Prueba otra palabra."; result.append(p); }
  }
  function openPalette() { if (document.querySelector("dialog[open]")) return; q("#command-query").value = ""; renderCommands(); palette.showModal(); q("#command-query").focus(); }
  q("#command-open").addEventListener("click", openPalette); q("#command-close").addEventListener("click", () => palette.close());
  q("#command-query").addEventListener("input", renderCommands);
  q("#command-query").addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); q("#command-results button")?.click(); } });
  document.addEventListener("keydown", event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); if (palette.open) palette.close(); else openPalette(); } });
  let scheduled = false;
  function progress() { const max = document.documentElement.scrollHeight - window.innerHeight; q("#reading-progress").style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`; scheduled = false; }
  window.addEventListener("scroll", () => { if (!scheduled) { scheduled = true; requestAnimationFrame(progress); } }, { passive: true }); window.addEventListener("resize", progress); window.addEventListener("load", progress); progress();
})();
