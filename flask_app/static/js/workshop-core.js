/* Funciones independientes del DOM, compartidas por la página y sus pruebas. */
(function (root) {
  "use strict";
  const normalize = text => String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  function filterProjects(projects, category, query, order) {
    const words = normalize(query).trim().split(/\s+/).filter(Boolean);
    const result = projects.filter(p => (category === "Todos" || p.categories.includes(category)) && words.every(word => normalize([p.title, p.description, ...p.technologies].join(" ")).includes(word)));
    if (order === "az" || order === "za") result.sort((a, b) => a.title.localeCompare(b.title, "es") * (order === "za" ? -1 : 1));
    return result;
  }
  function createLab() {
    let tasks, next;
    const reset = () => { tasks = [{ id: 1, titulo: "Explorar el portafolio" }, { id: 2, titulo: "Encontrar un secreto en Akon OS" }]; next = 3; };
    reset();
    function request(method, input = "") {
      const value = input.trim();
      const response = (status, body, stage = 4) => ({ status, body, stage });
      if (!["GET", "POST", "DELETE"].includes(method)) return response(405, { error: "Método no permitido" }, 1);
      if (method === "POST") {
        if (value.length < 3 || value.length > 80) return response(400, { error: "El título debe tener entre 3 y 80 caracteres." }, 2);
        if (tasks.length >= 25) return response(409, { error: "Disco de demo lleno. Elimina una tarea o restaura los datos." }, 3);
        const task = { id: next++, titulo: value }; tasks.push(task); return response(201, { ...task });
      }
      if (method === "GET" && !value) return response(200, tasks.map(task => ({ ...task })));
      if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) return response(400, { error: "Escribe un ID entero positivo." }, 2);
      const task = tasks.find(t => t.id === Number(value));
      if (!task) return response(404, { error: "No existe una tarea con ese ID." }, 3);
      if (method === "DELETE") { tasks = tasks.filter(t => t !== task); return response(200, { eliminado: task.id, mensaje: "Tarea eliminada" }); }
      return response(200, { ...task });
    }
    return { request, reset };
  }
  function composeContact(name, subject, message) {
    name = name.trim(); message = message.trim();
    if (!name || name.length > 80 || message.length < 10 || message.length > 1500) throw new Error("Completa tu nombre y un mensaje de entre 10 y 1500 caracteres.");
    const body = `Hola Akon,\n\n${message}\n\nSaludos,\n${name}`;
    return { body, url: `mailto:akonbustamante11@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
  }
  const api = { filterProjects, createLab, composeContact };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.AkonWorkshop = api;
})(globalThis);
