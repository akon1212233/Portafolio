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


## Retro Racer

Juego de carreras con perspectiva pseudo-3D dibujada en Canvas, sin dependencias. Abre Retro Racer desde la biblioteca «Juegos», `open racer` o el buscador. Flechas o A/D para conducir; flecha abajo o S para frenar. También hay controles táctiles. Sobrevive 60 segundos, evita el tráfico y suma puntos por distancia y adelantamientos. Tres choques terminan la carrera. Se pausa al perder el foco; al cerrar la app se cancela la animación.

El jugador registra exactamente cuatro letras o números (por ejemplo AKON o 1234). El top 10 se guarda en localStorage de ese navegador; no es un ranking global ni se sincroniza. La página informa si no puede guardar.


## Más juegos: Buscaminas y SIGNAL

- **Buscaminas:** 8×8 con 10 minas o 10×10 con 18. El primer clic y sus vecinos son seguros. Clic derecho, tecla F o botón de modo bandera para marcar. Las flechas mueven el foco y Enter/Espacio abre una casilla. Gana al descubrir todas las casillas sin minas; guarda el mejor tiempo por dificultad en este navegador. Nueva partida, cambio de dificultad o salida de la app reinician el tablero.

Abre los juegos desde el escritorio, Ctrl+K o `open mines` / `open backend`. Los récords de Buscaminas usan localStorage y no se comparten con otros dispositivos. Pruebas de lógica: `node tests/arcade.test.cjs`.


## SIGNAL — bloques, llamadas y errores

Reemplaza el cuestionario Backend Quest por un rompecabezas original de cuatro niveles. Abre «Juegos» en el inicio y selecciona SIGNAL en la biblioteca. También está en Ctrl+K o `open backend`. Las URL `/?play=games` y `/?play=signal` abren la biblioteca de juegos.

Pulsa flechas para girarlas; pulsa CALL para alternar el destino numerado. Recoge toda la luz ✧ y alcanza EXIT. PATCH habilita el paso por ERR. Los bucles y las caídas al vacío detienen la señal. Ejecutar anima el recorrido; Un paso permite inspeccionarlo. Pausar detiene el avance; editar una instrucción pausada reinicia el recorrido conservando tus cambios. Restaurar devuelve el tablero a su estado inicial.

El progreso desbloqueado se guarda en este navegador. Cambiar de app detiene y descarta la ejecución en curso. No ejecuta código del sistema. Pruebas: `node tests/signal.test.cjs`.


## Biblioteca de juegos y pantalla CRT

Un único botón **Juegos** en el inicio abre la biblioteca: Retro Racer, SIGNAL, Buscaminas y Memoria. El escritorio de la PC también agrupa estos juegos en un acceso Juegos.

La biblioteca y los juegos ocupan toda la ventana del navegador, manteniendo el marco de la computadora visible. No usa la API Fullscreen: las pestañas del navegador siguen disponibles. Las tarjetas tienen ilustraciones SVG originales, relieve e inclinación con el cursor (desactivada si se prefiere movimiento reducido). El vidrio curvo, reflejos y separación cromática son efectos visuales CSS; **CRT ON/OFF** permite desactivar el filtro visual.

**← Juegos** vuelve a la biblioteca; **✕** o Escape cierra el monitor y detiene el juego. En móvil el contenido se desplaza dentro de la pantalla. La integración de WebAssembly sigue pendiente: este cambio modifica la presentación y los accesos, no los motores de juego.


## Diseño de las partidas

Los estilos del interior de los juegos están separados en `flask_app/static/css/game-worlds.css`; las portadas y la biblioteca siguen en su diseño original.

- Retro Racer: paisaje por capas en Canvas, sol y montañas, coches con volumen, panel de velocidad/tiempo/vidas/puntos y ranking lateral.
- SIGNAL: tablero de circuitos con bloques elevados, conectores, recorrido iluminado y consola de control lateral.
- Buscaminas: panel de casillas en relieve, contadores y mesa de configuración.
- Memoria: cartas ilustradas en SVG, reverso ornamental y giro 3D. La animación se desactiva con movimiento reducido.

En móvil los paneles se apilan dentro de la PC. El filtro CRT se suaviza durante las partidas.


## Entrada cinematográfica al arcade

Al abrir Juegos, el monitor crece desde su posición en la página hasta llenar la ventana, el entorno se oscurece y el vidrio muestra un encendido CRT breve. La biblioteca aparece después del encendido. El marco tiene sombreado de material, bisel, textura y reflejos simulados con CSS.

La entrada dura aproximadamente 1,5 segundos y solo ocurre al entrar al modo de juegos, no al cambiar entre juegos. Escape puede cancelarla. Si el sistema solicita movimiento reducido, la apertura es inmediata. Las tarjetas no reciben clics durante la entrada; cerrar el modal elimina las animaciones y restaura la interacción.

Código: `static/js/games-transition.js` y `static/css/cinema.css`. Para ver toda la transición, abre la página sin parámetros y pulsa Juegos.


## Dificultades ampliadas

Sunset Run aumenta velocidad y frecuencia de tráfico durante los 60 segundos. Selecciona Difícil antes de empezar: parte más rápido, acelera más, genera más tráfico y multiplica los puntos por 1,8.

SIGNAL tiene seis niveles. INVOKE guarda una dirección de retorno y salta a una función; RETURN regresa a la casilla siguiente a la llamada. La pila admite ocho llamadas. En modo Mover, selecciona un bloque móvil y después un hueco: funciona con clic o teclado y no requiere arrastrar. START, EXIT, LIGHT, ERR y RETURN están fijos. El nivel 6 exige mover bloques.

Buscaminas: 8×8/10, 12×12/28, 16×16/55 y 20×20/95; los tableros grandes se desplazan horizontalmente en móvil.

Memoria: 24 cartas, 12 parejas. Cada símbolo aparece en ámbar y azul; solo coincide el mismo símbolo del mismo color. El nombre del color también se muestra escrito y se anuncia al revelar la carta.


## Archivos desde la terminal y nuevo Pixel Studio

Los accesos de escritorio Archivos y Notas se integran en la terminal. Son herramientas virtuales del navegador, inspiradas en yazi y nano; no ejecutan programas del equipo.

- `yazi`: explorador de dos paneles; ↑/↓ o j/k seleccionan, Enter/l abre, q/h vuelve a la terminal y punto alterna archivos ocultos. También tiene botones para móvil.
- `touch ideas.txt`: crea un archivo vacío.
- `nano ideas.txt`: crea o abre un archivo para editar. Ctrl+S o Guardar escribe los cambios.
- `cat ideas.txt` y `ls`: muestran los archivos creados.

Los archivos del sistema son de solo lectura. Hasta 20 archivos personales de 10.000 caracteres, guardados en localStorage. Las notas anteriores se recuperan como notas.txt. El editor ahora requiere guardar explícitamente.

Pixel Studio permite trazos con ratón o tacto, pincel/borrador, 50 pasos de deshacer, rehacer, limpieza reversible y descarga SVG. La calculadora conserva su funcionamiento.


## Progresión de SIGNAL y aceleración de Retro Racer

SIGNAL tiene 15 pruebas. El botón Mover no aparece en las pruebas 1–5; en la 6 solo se pueden recolocar las flechas indicadas en dos zonas. El inicio y la salida siempre están protegidos. Las pruebas 7–9 introducen parches tipados y llamadas anidadas. Desde la prueba 10 hay inventario y rutas sin ensamblar: selecciona una pieza y pulsa un hueco permitido. Después de colocarla puedes girarla o cambiar su destino. Las pruebas 12–15 también requieren construir las subrutinas; 13–15 exigen administrar varias cargas de parches A/B. Cada ERR consume una carga de su canal. RETURN debe vaciar la pila antes de salir. Un límite de 128 instrucciones evita bucles que recarguen parches indefinidamente.

Retro Racer muestra la velocidad real del motor. Normal acelera de 130 a aproximadamente 430 km/h; Difícil de 240 a aproximadamente 645 km/h durante 60 segundos sin frenar. La simulación divide los intervalos entre fotogramas para que los bajones de FPS no disimulen la progresión. Balizas, tráfico y trazos de velocidad acompañan el aumento.

Prueba reproducible: `node tests/progression.test.cjs` verifica que las 15 pruebas tengan solución, las restricciones de movimiento, los canales y la aceleración.
