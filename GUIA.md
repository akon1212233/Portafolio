# Portafolio de Akon Bustamante

Aplicación Flask con HTML, CSS y JavaScript. Diseño retro, adaptable a móvil, sin video por decisión del autor. No necesita base de datos ni claves privadas.

## Ejecutar

Desde `Formulario`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python server.py
```

Abre http://127.0.0.1:5000. El modo debug es solo para desarrollo local.

## Agregar proyectos

Edita `flask_app/static/projects.json` y agrega un objeto a la lista (separado por coma):

```json
{
  "title": "Mi nuevo proyecto",
  "description": "Descripción breve para la tarjeta.",
  "details": "Explicación más completa para la ventana de detalle.",
  "technologies": ["Python", "Flask"],
  "categories": ["Backend"],
  "repository": "https://github.com/usuario/repositorio",
  "demo": "",
  "image": "static/media/mi-proyecto.png",
  "art": "terminal"
}
```

Guarda la imagen en `flask_app/static/media/`. `image` y `demo` son opcionales: usa una cadena vacía o elimina el campo. Sin imagen se muestra una ilustración retro. `art` puede ser `film` o `terminal`. Las categorías disponibles son `Full stack` y `Backend`; un proyecto puede tener ambas. No necesitas editar HTML para agregar tarjetas. Recarga la página después de guardar.

Los proyectos iniciales enlazan a carpetas del repositorio Skillnest_Python. Deben estar subidos a GitHub para que esos enlaces puedan consultarse públicamente.

## Publicación estática en GitHub Pages

```bash
python export.py
python -m http.server 8000 --directory dist
```

Revisa http://localhost:8000. La exportación no necesita Flask. Publica el contenido de `dist/` en la raíz de un repositorio exclusivo para el portafolio, y configura GitHub Pages para servir esa rama desde `/ (root)`. Conserva también el código fuente en el repositorio. La exportación usa rutas relativas para funcionar bajo el nombre de un repositorio. Vuelve a exportar después de cada cambio; no abras el HTML con `file://`, porque los proyectos se cargan mediante fetch.

## Personalización

- Presentación, contacto y redes: `flask_app/templates/index.html`.
- Correo del botón copiar: `flask_app/static/js/app.js`.
- Colores y diseño: variables al inicio de `flask_app/static/css/style.css`.
- Proyectos: `flask_app/static/projects.json`.

Funciones: filtros, detalle en modal accesible con Escape, menú móvil, tema claro/oscuro persistente y copiar correo. El contacto abre el cliente de correo; no envía mensajes desde un servidor.

La consigna original de la actividad se conserva en `docs/CONSIGNA.md`. No se incluye video según la instrucción de Akon, aunque la consigna original lo solicita. La creación del repositorio exclusivo y la publicación en GitHub Pages quedan pendientes; no se han realizado desde esta app.


## Computadora interactiva — Akon OS

La computadora del inicio es un pequeño escritorio que funciona en el navegador. Pulsa **⛶** para ampliarla (Escape cierra la vista ampliada) y **⏻** para apagarla o encenderla.

- **Terminal:** escribe `help`. Soporta historial con las flechas arriba/abajo, lectura de archivos y operaciones con `calc (12 + 3) * 2`.
- **Archivos:** perfil, contacto, pistas y acceso a los proyectos del mismo `projects.json`.
- **Notas:** guardado local automático y descarga como `.txt`.
- **Calculadora:** teclado, botones, paréntesis y manejo de errores.
- **Pixel Studio:** lienzo de 12 × 8, seis colores y descarga SVG.
- **Memoria:** encuentra seis pares. La partida se reinicia al salir o pedir una nueva.
- **Descubrimientos:** seis secretos con pistas en `leeme.txt`. Se conservan en este navegador.

Las notas, dibujos y descubrimientos se guardan en `localStorage`; no se envían a un servidor ni se sincronizan entre dispositivos. Si el navegador bloquea el almacenamiento, las apps siguen funcionando durante la visita. Los comandos de la terminal pertenecen al mundo virtual de Akon OS.

Código: `flask_app/static/js/retro-pc.js`. Para comprobar su lógica sin instalar paquetes:

```bash
node tests/retro-pc.test.cjs
```

Estas pruebas cubren comandos, operaciones, persistencia, ampliación, secretos y lógica del juego con un DOM simulado; no sustituyen pruebas visuales de navegador.


## Más herramientas de la página

- **Archivo:** búsqueda por título, descripción y tecnologías, combinable con categorías y orden alfabético.
- **Laboratorio:** API simulada de tareas (GET, POST y DELETE), validación, estados HTTP y explicación del recorrido. No utiliza red ni una base de datos real; los datos se reinician al recargar y tienen un límite de 25 tareas.
- **Bitácora:** apartados desplegables sobre interfaz, lógica y datos.
- **Explorar / Ctrl+K / ⌘+K:** buscador de secciones y aplicaciones de Akon OS.
- **Ficha personal:** descarga un `.txt` con presentación y enlaces.
- **Contacto:** valida los campos y prepara un borrador en el cliente de correo. El botón de copiar sirve como alternativa. No envía ni guarda el mensaje en el servidor.
- **Sonidos de Akon OS:** tres melodías sintetizadas originales con volumen y parada. Requieren Web Audio; solo suenan al pulsar reproducir y se detienen al salir de la app o apagar la PC.
- **Temporizador:** sesiones de 1, 5 o 25 minutos. Se pausa al salir de la aplicación y conserva el tiempo restante durante la visita.

Las apps nuevas se abren desde el escritorio, el buscador rápido o `open music` / `open timer` en la terminal. Ahora hay seis secretos. La página sigue sin video.

Pruebas adicionales:

```bash
node tests/workshop.test.cjs
node tests/retro-pc.test.cjs
```
