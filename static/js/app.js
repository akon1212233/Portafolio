"use strict";
const $ = (selector) => document.querySelector(selector);
const themeButton = $("#theme");
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.setAttribute("aria-label", theme === "dark" ? "Activar tema claro" : "Activar tema oscuro");
}
try { setTheme(localStorage.getItem("akon-theme") === "light" ? "light" : "dark"); } catch { setTheme("dark"); }
themeButton.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(next);
  try { localStorage.setItem("akon-theme", next); } catch { /* El tema funciona sin almacenamiento. */ }
});
const menuButton = $(".menu-button");
menuButton.addEventListener("click", () => {
  const open = $("#navigation").classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll("nav a").forEach(link => link.addEventListener("click", () => {
  $("#navigation").classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));
$("#year").textContent = new Date().getFullYear();
$("#copy-email").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("akonbustamante11@gmail.com");
    $("#copy-status").textContent = "Correo copiado. ¡Hablemos!";
  } catch { $("#copy-status").textContent = "Puedes seleccionar el correo para copiarlo o hacer clic para escribir."; }
});
let projects = [];
let currentFilter = "Todos";
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
function safeUrl(value) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : null; } catch { return null; }
}
function tags(technologies) {
  const box = element("div", "skills");
  technologies.forEach(tech => box.append(element("span", "", tech)));
  return box;
}
const dialog = $("#project-dialog");
$(".close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
function showProject(project) {
  $("#dialog-title").textContent = project.title;
  $("#dialog-description").textContent = project.details || project.description;
  $("#dialog-tags").replaceChildren(...tags(project.technologies).children);
  $("#dialog-repo").href = safeUrl(project.repository);
  dialog.showModal();
}
function renderProjects() {
  const visible = AkonWorkshop.filterProjects(projects, currentFilter, $("#project-search").value, $("#project-sort").value);
  $("#project-grid").replaceChildren();
  visible.forEach(project => {
    const card = element("article", "project-card");
    const art = element("div", "project-art" + (project.art === "film" ? " film" : ""));
    art.setAttribute("aria-hidden", "true");
    art.append(element("span", "art-number", "ARCHIVO / " + String(projects.indexOf(project) + 1).padStart(2, "0")));
    if (project.image && safeUrl(new URL(project.image, document.baseURI).href)) {
      const img = element("img", "project-image"); img.src = project.image; img.alt = ""; img.loading = "lazy";
      img.style.cssText = "width:100%;height:100%;object-fit:cover"; art.append(img);
    } else if (project.art === "film") art.append(element("div", "film-reel", project.title));
    else {
      const window = element("div", "task-window");
      window.append(element("strong", "", ">_ " + project.title));
      ["[✓] Una idea", "[✓] Un poco de lógica", "[ ] La próxima versión"].forEach(text => window.append(element("div", "", text)));
      art.append(window);
    }
    art.append(element("span", "art-label", "ILUSTRACIÓN DEL PROYECTO"));
    const info = element("div", "project-info");
    const meta = element("div", "project-meta", project.categories.join(" / ").toUpperCase());
    meta.append(element("span", "", "↗"));
    info.append(meta, element("h3", "", project.title), element("p", "", project.description), tags(project.technologies));
    const actions = element("div", "project-actions");
    const detail = element("button", "detail-button", "Ver proyecto +"); detail.type = "button";
    detail.setAttribute("aria-label", "Ver detalle de " + project.title);
    detail.addEventListener("click", () => showProject(project));
    const repo = element("a", "", "Código en GitHub ↗"); repo.href = safeUrl(project.repository); repo.target = "_blank"; repo.rel = "noopener noreferrer";
    actions.append(detail, repo);
    if (safeUrl(project.demo)) { const demo = element("a", "", "Demo ↗"); demo.href = safeUrl(project.demo); demo.target = "_blank"; demo.rel = "noopener noreferrer"; actions.append(demo); }
    info.append(actions); card.append(art, info); $("#project-grid").append(card);
  });
  $("#project-count").textContent = String(visible.length).padStart(2, "0") + (visible.length === 1 ? " proyecto" : " proyectos");
  if (!visible.length) $("#project-grid").append(element("p", "", "No hay coincidencias. Prueba otra búsqueda o categoría."));
}
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  currentFilter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach(item => {
    item.classList.toggle("active", item === button); item.setAttribute("aria-pressed", String(item === button));
  }); renderProjects();
}));
$("#project-search").addEventListener("input", renderProjects);
$("#project-sort").addEventListener("change", renderProjects);
async function loadProjects() {
  $("#project-error").hidden = true;
  try {
    const response = await fetch("static/projects.json");
    if (!response.ok) throw new Error("No se pudo leer el archivo");
    const data = await response.json();
    if (!Array.isArray(data) || !data.every(p => typeof p.title === "string" && typeof p.description === "string" && Array.isArray(p.technologies) && Array.isArray(p.categories) && safeUrl(p.repository))) throw new Error("Formato de proyectos inválido");
    projects = data; renderProjects();
  } catch { $("#project-error").hidden = false; $("#project-count").textContent = "Archivo no disponible"; }
}
$("#retry").addEventListener("click", loadProjects);
loadProjects();
