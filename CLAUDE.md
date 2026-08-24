# Cartas para Kata

Sitio estático (HTML + CSS + JS plano, sin build ni dependencias) con cartas que
se leen página por página, con efecto de máquina de escribir. Se publica tal cual:
cualquier servidor de archivos estáticos sirve.

## Estructura

```
index.html          menú: lista las cartas por fecha (la más nueva arriba)
carta-1.html        lector de la carta #1  ─┐ HTML mínimo, solo carga scripts
carta-2.html        lector de la carta #2  ─┘
cartas/carta-N.js   CONTENIDO de cada carta (lo único que cambia entre cartas)
assets/base.css     paleta + fondo animado (compartido por menú y cartas)
assets/menu.css     estilos del menú
assets/letter.css   estilos del lector
assets/notify.js    push por ntfy.sh — window.Notif
assets/background.js  íconos flotantes del fondo (SVG inline + emojis)
assets/letter.js    motor del lector: páginas, tipeo, navegación, hitos
assets/menu.js      arma la lista del menú desde window.LETTERS
```

Regla clave: **el motor no se toca para agregar contenido**. Una carta nueva son
dos archivos (`cartas/carta-N.js` + `carta-N.html`) y una línea en `index.html`.

## Cómo agregar una carta

1. Copia `cartas/carta-2.js` a `cartas/carta-3.js` y edita:

```js
(window.LETTERS = window.LETTERS || []).push({
  n: 3,                                  // número, sale en el menú y en los push
  file: "carta-3.html",                  // a dónde apunta el menú
  date: "2026-09-01",                    // YYYY-MM-DD — ordena el menú
  dateLabel: "1 de septiembre de 2026",  // lo que se muestra
  title: "Título de la carta",
  teaser: "Una línea de gancho en el menú.",
  coverTitle: "Para ti,<br>Kata",        // portada (admite HTML)
  coverSub: "una carta, página por página",
  spotify: "https://open.spotify.com/track/XXXX",
  song: '"Nombre" — Artista',            // solo para el texto del push
  pages: [
    { cover: true },                     // portada, siempre la primera
    {
      eyebrow: "Título de sección",      // opcional, va en versalitas arriba
      lines: [
        ["lead", "Frase de entrada, más grande."],
        ["", "Párrafo normal."],
        ["accent", "La frase importante, en color y negrita."],
        ["soft", "Nota al margen, en itálica y más clara."],
      ],
    },
    {
      spotify: true,                     // muestra el botón verde de Spotify
      eyebrow: "Una canción",
      lines: [["lead", '"Nombre de la canción"']],
    },
  ],
});
```

Clases de párrafo disponibles: `""` (normal), `lead`, `accent`, `soft`.
Cada página se centra vertical y hace scroll sola si el texto es largo.

2. Copia `carta-2.html` a `carta-3.html` y cambia **solo** el `<script>` del
   contenido y el `<title>`:

```html
<title>Carta #3</title>
...
<script src="cartas/carta-3.js"></script>
```

3. En `index.html`, agrega la línea antes de `assets/menu.js`:

```html
<script src="cartas/carta-3.js"></script>
```

El menú se arma solo, ordenado por `date` descendente.

## La ruta /preguntas

Página aparte, **no usa el motor de cartas**. Son cuatro archivos:

```
preguntas.html        la página (se sirve en /preguntas gracias a vercel.json)
assets/preguntas.css  estilos propios
assets/preguntas.js   preguntas + respuestas + envío + llamada al análisis
api/analizar.js       función serverless: proxy a la API de Anthropic
```

Cómo funciona:

1. `assets/preguntas.js` tiene dos listas (`ESPERO`, `DOY`) de `[clave, pregunta]`
   y seis campos de texto libre (`LIBRES`). Para cambiar el cuestionario se editan
   esas listas y nada más.
2. Cada respuesta se guarda en `localStorage` bajo `preguntas:v1`, así que ella
   puede salir y volver sin perder nada.
3. El botón final hace tres cosas: manda las respuestas por push, llama a
   `POST /api/analizar` y pinta el análisis en la página (markdown mínimo:
   `## título`, `- viñeta`, `**negrita**`), y manda ese análisis por push también.
4. La respuesta a la invitación (`¿Empezamos otra vez?`) dispara su propio push en
   el momento en que ella la toca.

### El análisis (api/analizar.js)

Modelo `claude-opus-5`, llamada directa a `POST https://api.anthropic.com/v1/messages`
con `fetch` (sin SDK, sin npm — Node 18+ ya trae `fetch`).

- **La API key nunca va al navegador.** Vive en la variable de entorno
  `ANTHROPIC_API_KEY` del hosting. En Vercel: Settings -> Environment Variables.
- El navegador manda solo los datos (pares pregunta/respuesta + textos); el prompt
  del terapeuta y el armado del caso se hacen en el servidor.
- El system prompt le pide ser honesto: si las respuestas muestran que no hay
  disposición, tiene que decirlo, no empujar a que vuelvan.
- Si la cuenta no tiene habilitada la beta `server-side-fallback-2026-07-01`, la
  primera llamada da 400 y la función reintenta sola sin `betas`/`fallbacks`.
- Sin `ANTHROPIC_API_KEY` (o sirviendo el sitio como archivos estáticos planos) el
  análisis falla con un mensaje en pantalla, pero las respuestas **sí** se envían
  por push: la página no se rompe.

## Notificaciones (ntfy.sh)

Topic: **`carta-kata-santi-4t7wq9`** (en `assets/notify.js:4`).
Para recibirlas hay que estar suscrito a ese topic exacto en la app ntfy.

Qué se avisa hoy:

| Evento | Dónde se dispara |
|---|---|
| 💌 entraron al menú | `assets/menu.js` |
| 📖 abrieron la carta #N | `assets/letter.js` — al cargar |
| 👀 va por la mitad | `assets/letter.js` — al llegar a `Math.ceil(total/2)` |
| 💙 terminó de leerla | `assets/letter.js` — al llegar a la última página |
| 🎵 abrió la canción | `assets/letter.js` — clic en el botón de Spotify |
| ❓ entró a las preguntas | `assets/preguntas.js` — al cargar |
| 📝 respondió las preguntas | `assets/preguntas.js` — botón de enviar |
| 🧠 análisis del terapeuta | `assets/preguntas.js` — cuando llega la respuesta |
| 💙 respondió a la invitación | `assets/preguntas.js` — clic en sí/hablemos/tiempo |

Todo mensaje incluye ubicación aproximada (vía `ipwho.is`), IP, dispositivo,
pantalla, idioma y hora.

### API

```js
Notif.send(title, extra);   // envía siempre
Notif.fresh(key);           // true la primera vez que pasa el hito EN ESTA CARGA
Notif.bump(key);            // contador persistente en localStorage, devuelve el nuevo total
Notif.once(key, title, x);  // fresh + send
```

**Sin cooldown por tiempo, a propósito**: cada carga de página cuenta como
lectura nueva y vuelve a avisar, para enterarse de las relecturas. `fresh()` solo
evita que el mismo hito se repita dentro de una misma carga (ir y volver entre
páginas). Los contadores (`cont:abrir:N`, `cont:terminar:N`) permiten decir
"🔁 relectura: 3.ª vez".

### ⚠️ Trampa ya pisada: emojis en headers HTTP

Los push se publican en **modo JSON** (`POST https://ntfy.sh/` con
`{topic, title, message, priority, tags}`), **no** con los headers `Title:`/
`Priority:` de ntfy. Los headers HTTP solo admiten ASCII (ByteString): un título
con emoji o tildes hace que `fetch` lance
`TypeError: Cannot convert argument to a ByteString` y, como el error se traga
con `.catch()`, **el push desaparece en silencio**. Si vuelves a usar headers,
los títulos tienen que ser ASCII puro.

## Cómo probar

```bash
python3 -m http.server 8000    # abre http://localhost:8000
node --check assets/*.js       # sintaxis
```

Para verificar los push sin abrir el navegador, se pueden cargar los scripts en
un contexto de Node (`vm`) con stubs de `document`/`localStorage` y un `fetch`
espía. Para ver qué llegó al topic:

```
https://ntfy.sh/carta-kata-santi-4t7wq9/json?poll=1&since=1h
```

Ojo: los avisos se disparan de verdad al abrir la página, así que cada prueba en
el navegador manda un push real.

## Convenciones

- Sin frameworks, sin build, sin npm. JS plano en `<script>` clásicos (no
  módulos), para que funcione hasta abriendo el archivo directo.
- Prettier con la config por defecto para el formato.
- Commits en español, estilo conventional (`feat:`, `fix:`, `content:`).
- El contenido de las cartas es personal: **nunca reescribir el texto de una
  carta existente** salvo que se pida explícitamente.
