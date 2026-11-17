# 🐒 Mi Gym

Aplicación web sencilla para entrenar en casa, pensada para personas mayores de 60 años que empiezan.
Solo necesita **mancuernas, banda elástica, esterilla, una silla** o el propio cuerpo.

## Qué incluye

- **Muñeco 3D animado** que hace cada ejercicio en bucle. Se puede girar con el dedo y ralentizar.
- **Fotos reales** (posición inicial y final, alternándose) en 31 ejercicios.
- **68 ejercicios** con explicación paso a paso, consejos, precauciones y enlace a vídeos de YouTube.
- **46 rutinas cortas (4–5 ejercicios)** organizadas por categoría: cuerpo completo (6), piernas y glúteos,
  espalda, pecho, hombros, brazos, abdomen, equilibrio y estiramientos (5 de cada). Cada una con un enfoque
  distinto: sin material, con mancuernas, con banda, sentada, suave o «reto».
- **Calentamiento opcional** de 2 minutos al empezar las rutinas de fuerza.
- **Modo entrenamiento guiado**: muñeco haciendo el ejercicio, botón «¡Hecho!», temporizador, descansos
  automáticos (enseñando el siguiente ejercicio), pitidos y **voz en español**. La pantalla no se apaga.
- **Plan semanal sugerido**: la pantalla de inicio propone una rutina del día (va rotando cada semana).
- **Diario**: cada sesión se guarda con cómo te has sentido y una nota. Calendario, objetivo semanal y racha.
  También se pueden apuntar otras actividades: paseo, yoga, natación, bici y gimnasio.
- **Crear rutinas propias** o copiar y modificar una existente.
- **Letra grande** ajustable, botones grandes y diseño claro.
- Funciona **sin conexión** y se puede **instalar en el móvil** como una app.

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

- **Ejercicios, rutinas y plan semanal**: [`js/data.js`](js/data.js).
  Para poner un vídeo concreto a un ejercicio añade `video: "ID_DE_YOUTUBE"`
  (también se puede hacer desde la propia app, en la ficha del ejercicio).
- **Movimientos del muñeco 3D**: [`js/anims.js`](js/anims.js). Cada ejercicio es una lista de poses
  (ángulos de las articulaciones en grados) por las que el muñeco pasa en bucle.
- **Miniaturas**: `img/mini/<id>.webp` son capturas del muñeco; si cambias una animación, conviene regenerarla.

Si modificas archivos, sube la versión de `CACHE` en `sw.js` para que los móviles descarguen la nueva versión.

## Créditos

- Muñeco 3D dibujado con [three.js](https://threejs.org) (licencia MIT, copia en `vendor/`).
- Fotos reales de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (dominio público, Unlicense).

## Base de las recomendaciones

Organización Mundial de la Salud, *WHO guidelines on physical activity and sedentary behaviour* (2020):
para mayores de 65 años, 150–300 min/semana de actividad aeróbica moderada, fortalecimiento muscular ≥ 2 días/semana
y actividad multicomponente con énfasis en equilibrio ≥ 3 días/semana.

> ⚠️ Esta app no sustituye el consejo médico. Consulta con tu médico antes de empezar un programa de ejercicio.

## Estructura

```
index.html            Página principal
css/styles.css        Estilos
js/data.js            Ejercicios, categorías, rutinas y plan semanal
js/app.js             Lógica (navegación, entrenamiento guiado, diario, ajustes)
js/anims.js           Movimientos del muñeco 3D para cada ejercicio
js/figure3d.js        Muñeco 3D (cuerpo, accesorios, animación)
vendor/three.min.js   Librería 3D
img/mini/             Miniaturas del muñeco
img/fotos/            Fotos reales de ejercicios
sw.js                 Funcionamiento sin conexión
manifest.webmanifest  Instalación como app
icons/                Iconos
```
