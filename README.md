# 🏋️‍♀️ Mi Gimnasio en Casa

Aplicación web sencilla para entrenar en casa, pensada para personas mayores de 60 años que empiezan.
Solo necesita **mancuernas, banda elástica, esterilla, una silla** o el propio cuerpo.

## Qué incluye

- **50 ejercicios** con explicación paso a paso, consejos, precauciones y vídeo (YouTube).
- **10 rutinas ya hechas**: cuerpo completo (iniciación y con mancuernas), piernas y glúteos, hombros y brazos,
  espalda y postura, pecho/espalda/brazos, core, equilibrio y prevención de caídas, movilidad y exprés de 10 min.
- **Modo entrenamiento guiado**: un ejercicio cada vez, botón «¡Hecho!», temporizador, descansos automáticos,
  pitidos y **voz en español** que va guiando. La pantalla no se apaga mientras se entrena.
- **Plan semanal sugerido**: la pantalla de inicio propone la rutina del día.
- **Diario**: cada sesión se guarda con cómo te has sentido y una nota. Calendario, objetivo semanal y racha.
  También se pueden apuntar paseos, natación, etc.
- **Crear rutinas propias** o copiar y modificar una existente.
- **Letra grande** ajustable, botones grandes y diseño claro.
- Funciona **sin conexión** y se puede **instalar en el móvil** como una app.
- Copia de seguridad (descargar / cargar) desde Ajustes.

Los datos se guardan solo en el navegador del dispositivo (no hay servidor ni cuentas).

## Publicarla con GitHub Pages (gratis)

1. En GitHub, entra en el repositorio → **Settings** → **Pages**.
2. En *Build and deployment* → *Source*, elige **Deploy from a branch**.
3. Selecciona la rama (`main`, una vez fusionados los cambios) y la carpeta **`/ (root)`** → **Save**.
4. En 1–2 minutos la app estará en: `https://<tu-usuario>.github.io/RutinasEntrenamiento/`

### Instalarla en el móvil
- **iPhone (Safari)**: abrir la URL → botón Compartir → «Añadir a pantalla de inicio».
- **Android (Chrome)**: abrir la URL → menú ⋮ → «Instalar aplicación».

## Personalizar

Todo el contenido está en [`js/data.js`](js/data.js):

- **Poner un vídeo concreto** a un ejercicio: añade `video: "ID_DE_YOUTUBE"`
  (p. ej. para `https://www.youtube.com/watch?v=abc123XYZ00` → `video: "abc123XYZ00"`).
  También se puede hacer desde la propia app («Guárdalo aquí» en la ficha del ejercicio).
- **Añadir ejercicios o rutinas**: copia uno existente y cambia los campos.
- **Cambiar el plan semanal**: edita `WEEK_PLAN`.

Si modificas archivos, sube la versión de `CACHE` en `sw.js` para que los móviles descarguen la nueva versión.

## Base de las recomendaciones

Organización Mundial de la Salud, *WHO guidelines on physical activity and sedentary behaviour* (2020):
para mayores de 65 años, 150–300 min/semana de actividad aeróbica moderada, fortalecimiento muscular ≥ 2 días/semana
y actividad multicomponente con énfasis en equilibrio ≥ 3 días/semana.

> ⚠️ Esta app no sustituye el consejo médico. Consulta con tu médico antes de empezar un programa de ejercicio.

## Estructura

```
index.html            Página principal
css/styles.css        Estilos
js/data.js            Ejercicios, rutinas y plan semanal
js/app.js             Lógica (navegación, entrenamiento guiado, diario, ajustes)
sw.js                 Funcionamiento sin conexión
manifest.webmanifest  Instalación como app
icons/                Iconos
```
