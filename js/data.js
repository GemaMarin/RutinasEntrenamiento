/* =========================================================
   DATOS: zonas, material, ejercicios y rutinas predefinidas
   ---------------------------------------------------------
   Para añadir un vídeo concreto de YouTube a un ejercicio,
   pon su identificador en el campo `video`
   (p. ej. https://www.youtube.com/watch?v=ABC123  ->  video: "ABC123").
   Si no hay `video`, la app muestra un botón que busca
   tutoriales en YouTube con el texto de `yt`.
   ========================================================= */

const ZONES = {
  piernas:     { name: "Piernas y glúteos", emoji: "🦵", color: "#E07A5F" },
  espalda:     { name: "Espalda",           emoji: "🧍‍♀️", color: "#3D8B7D" },
  pecho:       { name: "Pecho",             emoji: "💗", color: "#D1495B" },
  hombros:     { name: "Hombros",           emoji: "🙆‍♀️", color: "#8E6CBF" },
  brazos:      { name: "Brazos",            emoji: "💪", color: "#E8A33D" },
  core:        { name: "Abdomen y core",    emoji: "🎯", color: "#2F6FA8" },
  equilibrio:  { name: "Equilibrio",        emoji: "⚖️", color: "#5C9E5A" },
  movilidad:   { name: "Movilidad y estiramientos", emoji: "🧘‍♀️", color: "#4A9BB5" },
};

const EQUIP = {
  cuerpo:     { name: "Sin material", emoji: "🙌" },
  mancuernas: { name: "Mancuernas",   emoji: "🏋️‍♀️" },
  banda:      { name: "Banda elástica", emoji: "🎗️" },
  esterilla:  { name: "Esterilla",    emoji: "🟩" },
  silla:      { name: "Silla",        emoji: "🪑" },
};

const LEVELS = { 1: "Suave", 2: "Medio", 3: "Más reto" };

/*  type: "reps" (repeticiones) | "time" (segundos)
    side: true  -> se hace con cada lado
    equip: material necesario (el primero es el principal)   */
const EXERCISES = [
  /* ---------------- PIERNAS Y GLÚTEOS ---------------- */
  {
    id: "sit-stand", name: "Sentarse y levantarse de la silla", zone: "piernas", equip: ["silla"], level: 1,
    type: "reps", reps: 10,
    summary: "El ejercicio más útil del día a día: fortalece piernas y glúteos.",
    steps: [
      "Siéntate en la parte delantera de una silla firme (sin ruedas), pies separados al ancho de cadera.",
      "Cruza los brazos sobre el pecho o estíralos al frente.",
      "Inclina un poco el tronco hacia delante y empuja con los talones para ponerte de pie.",
      "Baja despacio, contando hasta 3, hasta rozar la silla y vuelve a subir.",
    ],
    tips: ["Si cuesta, ayúdate con las manos en los muslos.", "Las rodillas miran hacia las puntas de los pies."],
    caution: "Apoya la silla contra la pared para que no se mueva.",
    yt: "levantarse de la silla ejercicio personas mayores",
  },
  {
    id: "squat", name: "Sentadilla libre", zone: "piernas", equip: ["cuerpo"], level: 2,
    type: "reps", reps: 10,
    summary: "Sentadilla sin silla para cuando la anterior resulte fácil.",
    steps: [
      "De pie, pies al ancho de los hombros y puntas ligeramente hacia fuera.",
      "Lleva la cadera hacia atrás como si fueras a sentarte.",
      "Baja hasta donde estés cómoda manteniendo la espalda recta y el pecho alto.",
      "Empuja con los talones para subir.",
    ],
    tips: ["Brazos al frente para equilibrarte.", "No hace falta bajar mucho: la técnica es lo importante."],
    caution: "Si notas molestia en las rodillas, baja menos.",
    yt: "sentadilla correcta principiantes mayores",
  },
  {
    id: "goblet-squat", name: "Sentadilla con mancuerna", zone: "piernas", equip: ["mancuernas"], level: 3,
    type: "reps", reps: 10,
    summary: "Sentadilla sujetando una mancuerna a la altura del pecho.",
    steps: [
      "Sujeta una mancuerna vertical con las dos manos pegada al pecho.",
      "Pies al ancho de hombros.",
      "Baja llevando la cadera atrás y los codos entre las rodillas.",
      "Sube empujando con los talones, sin redondear la espalda.",
    ],
    tips: ["Empieza con poco peso (2–4 kg)."],
    caution: "Mantén la mancuerna pegada al cuerpo.",
    yt: "sentadilla goblet mancuerna principiantes",
  },
  {
    id: "split-squat", name: "Zancada fija con apoyo", zone: "piernas", equip: ["silla"], level: 2,
    type: "reps", reps: 8, side: true,
    summary: "Trabaja cada pierna por separado y mejora el equilibrio.",
    steps: [
      "Colócate junto a una silla o pared y apoya una mano.",
      "Da un paso largo hacia delante; el talón de atrás queda levantado.",
      "Baja recto flexionando las dos rodillas, sin llegar al suelo.",
      "Sube empujando con la pierna de delante. Haz todas y cambia de pierna.",
    ],
    tips: ["El tronco se mantiene recto, como si bajaras en un ascensor."],
    caution: "La rodilla de delante no debe irse hacia dentro.",
    yt: "zancada estatica con apoyo mayores",
  },
  {
    id: "glute-bridge", name: "Puente de glúteos", zone: "piernas", equip: ["esterilla"], level: 1,
    type: "reps", reps: 12,
    summary: "Fortalece glúteos y zona lumbar, muy bueno para la espalda.",
    steps: [
      "Túmbate boca arriba con las rodillas dobladas y los pies apoyados.",
      "Brazos a los lados con las palmas hacia abajo.",
      "Aprieta los glúteos y eleva la cadera hasta formar una línea de rodillas a hombros.",
      "Aguanta 2 segundos arriba y baja despacio.",
    ],
    tips: ["Empuja con los talones.", "Para más reto, apoya una mancuerna sobre la cadera."],
    caution: "No arquees en exceso la zona lumbar.",
    yt: "puente de gluteos principiantes",
  },
  {
    id: "calf-raise", name: "Elevación de talones", zone: "piernas", equip: ["silla"], level: 1,
    type: "reps", reps: 15,
    summary: "Gemelos fuertes = mejor equilibrio al caminar.",
    steps: [
      "De pie, sujétate al respaldo de una silla.",
      "Sube despacio poniéndote de puntillas.",
      "Aguanta un segundo arriba.",
      "Baja despacio los talones al suelo.",
    ],
    tips: ["Para más reto, sujeta una mancuerna con la otra mano."],
    caution: "",
    yt: "elevacion de talones con silla mayores",
  },
  {
    id: "hip-abduction-stand", name: "Apertura de pierna de pie", zone: "piernas", equip: ["silla"], level: 1,
    type: "reps", reps: 10, side: true,
    summary: "Fortalece el lateral de la cadera, clave para no perder el equilibrio.",
    steps: [
      "De pie detrás de una silla, sujeta el respaldo.",
      "Levanta una pierna hacia el lado, con la punta del pie mirando al frente.",
      "Sube solo hasta donde puedas sin inclinar el tronco.",
      "Baja despacio. Haz todas y cambia de pierna.",
    ],
    tips: ["Con una banda alrededor de los tobillos es más intenso."],
    caution: "",
    yt: "abduccion de cadera de pie con silla mayores",
  },
  {
    id: "band-abduction-seated", name: "Apertura de rodillas con banda", zone: "piernas", equip: ["banda", "silla"], level: 1,
    type: "reps", reps: 15,
    summary: "Glúteos sentada, cómodo y seguro.",
    steps: [
      "Siéntate con la banda alrededor de los muslos, justo encima de las rodillas.",
      "Pies juntos y espalda recta.",
      "Separa las rodillas hacia fuera contra la banda.",
      "Vuelve despacio sin dejar que la banda tire de ti.",
    ],
    tips: ["Mantén los pies en el suelo todo el rato."],
    caution: "",
    yt: "abduccion sentada con banda elastica",
  },
  {
    id: "rdl", name: "Peso muerto rumano con mancuernas", zone: "piernas", equip: ["mancuernas"], level: 2,
    type: "reps", reps: 10,
    summary: "Parte trasera de las piernas y espalda; enseña a agacharse bien.",
    steps: [
      "De pie, una mancuerna en cada mano delante de los muslos.",
      "Rodillas un poco flexionadas.",
      "Lleva la cadera hacia atrás y baja las mancuernas pegadas a las piernas hasta las rodillas.",
      "Sube apretando los glúteos.",
    ],
    tips: ["Espalda recta siempre: el movimiento sale de la cadera."],
    caution: "Si tienes problemas de espalda, empieza sin peso.",
    yt: "peso muerto rumano mancuernas principiantes",
  },
  {
    id: "side-leg-raise", name: "Elevación de pierna tumbada de lado", zone: "piernas", equip: ["esterilla"], level: 1,
    type: "reps", reps: 10, side: true,
    summary: "Glúteo medio desde el suelo.",
    steps: [
      "Túmbate de lado con la cabeza apoyada en el brazo.",
      "La pierna de abajo puede ir doblada para más estabilidad.",
      "Sube la pierna de arriba estirada, sin girar el pie hacia el techo.",
      "Baja despacio. Haz todas y cambia de lado.",
    ],
    tips: ["Movimiento lento y controlado."],
    caution: "",
    yt: "elevacion lateral de pierna tumbada",
  },

  /* ---------------- ESPALDA ---------------- */
  {
    id: "band-row", name: "Remo con banda sentada", zone: "espalda", equip: ["banda", "esterilla"], level: 1,
    type: "reps", reps: 12,
    summary: "Fortalece la espalda y mejora la postura.",
    steps: [
      "Siéntate en el suelo con las piernas estiradas (o en una silla con la banda atada a algo firme).",
      "Pasa la banda por la planta de los pies y sujeta un extremo en cada mano.",
      "Tira de los codos hacia atrás, pegados al cuerpo, juntando los omóplatos.",
      "Vuelve despacio.",
    ],
    tips: ["Pecho alto, hombros lejos de las orejas."],
    caution: "",
    yt: "remo con banda elastica sentado",
  },
  {
    id: "db-row", name: "Remo con mancuerna apoyada", zone: "espalda", equip: ["mancuernas", "silla"], level: 2,
    type: "reps", reps: 10, side: true,
    summary: "Espalda y brazos, con apoyo para cuidar la zona lumbar.",
    steps: [
      "Apoya una mano en el asiento de una silla, inclinada hacia delante con la espalda recta.",
      "Con la otra mano sujeta una mancuerna con el brazo estirado.",
      "Sube la mancuerna hacia la cadera llevando el codo hacia atrás.",
      "Baja despacio. Haz todas y cambia de brazo.",
    ],
    tips: ["Piensa en 'meter el codo en el bolsillo de atrás'."],
    caution: "",
    yt: "remo con mancuerna apoyada en silla",
  },
  {
    id: "pull-apart", name: "Apertura de banda", zone: "espalda", equip: ["banda"], level: 1,
    type: "reps", reps: 12,
    summary: "Abre el pecho y corrige la postura encorvada.",
    steps: [
      "De pie o sentada, sujeta la banda con los brazos estirados al frente, a la altura del pecho.",
      "Separa las manos estirando la banda hasta que toque el pecho.",
      "Junta los omóplatos.",
      "Vuelve despacio.",
    ],
    tips: ["Si cuesta mucho, coge la banda más abierta."],
    caution: "",
    yt: "band pull apart banda elastica",
  },
  {
    id: "prone-extension", name: "Extensión de espalda tumbada", zone: "espalda", equip: ["esterilla"], level: 2,
    type: "reps", reps: 8,
    summary: "Fortalece los músculos que sujetan la columna.",
    steps: [
      "Túmbate boca abajo con la frente apoyada en las manos.",
      "Aprieta glúteos y despega el pecho unos centímetros del suelo.",
      "Mira al suelo para no forzar el cuello.",
      "Aguanta 2 segundos y baja.",
    ],
    tips: ["No hace falta subir mucho."],
    caution: "Evítalo si te causa dolor lumbar.",
    yt: "extension de espalda tumbada boca abajo suave",
  },

  /* ---------------- PECHO ---------------- */
  {
    id: "wall-pushup", name: "Flexiones en la pared", zone: "pecho", equip: ["cuerpo"], level: 1,
    type: "reps", reps: 10,
    summary: "La forma más amable de hacer flexiones.",
    steps: [
      "De pie frente a una pared, a un paso largo de distancia.",
      "Apoya las manos en la pared a la altura de los hombros.",
      "Dobla los codos acercando el pecho a la pared, cuerpo recto.",
      "Empuja para volver.",
    ],
    tips: ["Cuanto más lejos los pies, más difícil."],
    caution: "",
    yt: "flexiones en la pared personas mayores",
  },
  {
    id: "knee-pushup", name: "Flexiones con rodillas", zone: "pecho", equip: ["esterilla"], level: 3,
    type: "reps", reps: 8,
    summary: "Siguiente paso tras dominar las de pared.",
    steps: [
      "Apoya rodillas y manos en la esterilla, manos algo más abiertas que los hombros.",
      "Forma una línea recta de rodillas a cabeza.",
      "Baja el pecho doblando los codos.",
      "Empuja para subir.",
    ],
    tips: ["Pon un cojín bajo las rodillas si molestan."],
    caution: "",
    yt: "flexiones con rodillas apoyadas principiantes",
  },
  {
    id: "floor-press", name: "Press de pecho en el suelo", zone: "pecho", equip: ["mancuernas", "esterilla"], level: 2,
    type: "reps", reps: 10,
    summary: "Pecho y tríceps tumbada, el suelo protege los hombros.",
    steps: [
      "Túmbate boca arriba con las rodillas dobladas y una mancuerna en cada mano.",
      "Codos apoyados en el suelo a unos 45° del cuerpo.",
      "Empuja las mancuernas hacia el techo hasta estirar los brazos.",
      "Baja despacio hasta que los codos toquen el suelo.",
    ],
    tips: ["Exhala al subir."],
    caution: "",
    yt: "floor press mancuernas press de pecho en el suelo",
  },
  {
    id: "band-chest-press", name: "Press de pecho con banda", zone: "pecho", equip: ["banda"], level: 1,
    type: "reps", reps: 12,
    summary: "Empuje con banda, sentada o de pie.",
    steps: [
      "Pasa la banda por detrás de la espalda, a la altura de las axilas.",
      "Sujeta un extremo en cada mano, con las manos junto al pecho.",
      "Empuja hacia delante hasta estirar los brazos.",
      "Vuelve despacio.",
    ],
    tips: ["Mantén la espalda recta."],
    caution: "",
    yt: "press de pecho con banda elastica",
  },

  /* ---------------- HOMBROS ---------------- */
  {
    id: "db-shoulder-press", name: "Press de hombros sentada", zone: "hombros", equip: ["mancuernas", "silla"], level: 2,
    type: "reps", reps: 10,
    summary: "Para poder colocar cosas en altillos sin esfuerzo.",
    steps: [
      "Sentada con la espalda apoyada, una mancuerna en cada mano a la altura de los hombros.",
      "Empuja las mancuernas hacia arriba sin bloquear los codos.",
      "Baja despacio a la altura de las orejas.",
    ],
    tips: ["No arquees la espalda; aprieta el abdomen."],
    caution: "Si te duele el hombro, prueba con menos peso o sáltalo.",
    yt: "press de hombros sentado mancuernas principiantes",
  },
  {
    id: "lateral-raise", name: "Elevaciones laterales", zone: "hombros", equip: ["mancuernas"], level: 2,
    type: "reps", reps: 10,
    summary: "Hombros redondeados y fuertes.",
    steps: [
      "De pie o sentada, una mancuerna ligera en cada mano a los lados.",
      "Codos ligeramente doblados.",
      "Sube los brazos hacia los lados hasta la altura de los hombros.",
      "Baja despacio.",
    ],
    tips: ["Usa poco peso: 1–2 kg es suficiente."],
    caution: "No subas por encima de los hombros.",
    yt: "elevaciones laterales mancuernas principiantes",
  },
  {
    id: "front-raise", name: "Elevaciones frontales", zone: "hombros", equip: ["mancuernas"], level: 1,
    type: "reps", reps: 10,
    summary: "Parte delantera del hombro.",
    steps: [
      "De pie, mancuernas delante de los muslos con las palmas hacia ti.",
      "Sube un brazo (o los dos) al frente hasta la altura de los hombros.",
      "Baja despacio.",
    ],
    tips: ["Puedes alternar brazos."],
    caution: "",
    yt: "elevaciones frontales mancuernas",
  },
  {
    id: "band-external-rotation", name: "Rotación de hombro con banda", zone: "hombros", equip: ["banda"], level: 1,
    type: "reps", reps: 12,
    summary: "Protege la articulación del hombro.",
    steps: [
      "Codos doblados a 90°, pegados a la cintura, sujetando la banda con las dos manos.",
      "Separa las manos hacia fuera girando desde el hombro.",
      "Los codos no se despegan del cuerpo.",
      "Vuelve despacio.",
    ],
    tips: ["Imagina que tienes un papel entre el codo y la cintura."],
    caution: "",
    yt: "rotacion externa de hombro con banda elastica",
  },

  /* ---------------- BRAZOS ---------------- */
  {
    id: "biceps-curl", name: "Curl de bíceps", zone: "brazos", equip: ["mancuernas"], level: 1,
    type: "reps", reps: 12,
    summary: "Brazos fuertes para cargar la compra.",
    steps: [
      "De pie o sentada, una mancuerna en cada mano con las palmas hacia delante.",
      "Codos pegados al cuerpo.",
      "Dobla los codos subiendo las mancuernas hacia los hombros.",
      "Baja despacio.",
    ],
    tips: ["No balancees el cuerpo."],
    caution: "",
    yt: "curl de biceps mancuernas principiantes",
  },
  {
    id: "hammer-curl", name: "Curl martillo", zone: "brazos", equip: ["mancuernas"], level: 1,
    type: "reps", reps: 12,
    summary: "Como el curl, pero con las palmas mirándose. Trabaja también el antebrazo.",
    steps: [
      "Mancuernas a los lados con las palmas mirando hacia el cuerpo.",
      "Sube doblando los codos, como si sujetaras un martillo.",
      "Baja despacio.",
    ],
    tips: ["Mejora la fuerza para agarrar."],
    caution: "",
    yt: "curl martillo mancuernas",
  },
  {
    id: "band-curl", name: "Curl con banda", zone: "brazos", equip: ["banda"], level: 1,
    type: "reps", reps: 12,
    summary: "Bíceps con banda pisándola con los pies.",
    steps: [
      "Pisa la banda con los pies y sujeta un extremo en cada mano.",
      "Codos pegados al cuerpo.",
      "Dobla los codos llevando las manos a los hombros.",
      "Baja despacio.",
    ],
    tips: ["Separa los pies para más tensión."],
    caution: "",
    yt: "curl de biceps con banda elastica",
  },
  {
    id: "overhead-triceps", name: "Tríceps por encima de la cabeza", zone: "brazos", equip: ["mancuernas", "silla"], level: 2,
    type: "reps", reps: 10,
    summary: "La parte de atrás del brazo.",
    steps: [
      "Sentada, sujeta una mancuerna con las dos manos por encima de la cabeza.",
      "Dobla los codos bajando la mancuerna por detrás de la cabeza.",
      "Estira los brazos para subir.",
    ],
    tips: ["Codos apuntando al techo."],
    caution: "Evítalo si tienes molestias en los hombros; haz la patada de tríceps.",
    yt: "extension de triceps sentado mancuerna",
  },
  {
    id: "triceps-kickback", name: "Patada de tríceps", zone: "brazos", equip: ["mancuernas", "silla"], level: 1,
    type: "reps", reps: 10, side: true,
    summary: "Tríceps con apoyo, muy seguro.",
    steps: [
      "Apoya una mano en una silla e inclínate hacia delante con la espalda recta.",
      "Con la otra mano sujeta la mancuerna con el codo doblado y pegado al cuerpo.",
      "Estira el brazo hacia atrás.",
      "Vuelve despacio. Haz todas y cambia de brazo.",
    ],
    tips: ["Solo se mueve el antebrazo."],
    caution: "",
    yt: "patada de triceps mancuerna",
  },

  /* ---------------- CORE ---------------- */
  {
    id: "bird-dog", name: "Perro de caza", zone: "core", equip: ["esterilla"], level: 1,
    type: "reps", reps: 8, side: true,
    summary: "Estabilidad de la espalda y coordinación.",
    steps: [
      "Ponte a cuatro patas: manos bajo los hombros, rodillas bajo la cadera.",
      "Estira un brazo al frente y la pierna contraria hacia atrás.",
      "Aguanta 2 segundos sin mover la cadera.",
      "Vuelve y cambia de lado.",
    ],
    tips: ["Si es difícil, mueve solo el brazo o solo la pierna."],
    caution: "",
    yt: "perro de caza bird dog ejercicio",
  },
  {
    id: "dead-bug", name: "Bicho muerto", zone: "core", equip: ["esterilla"], level: 2,
    type: "reps", reps: 8, side: true,
    summary: "Abdomen profundo sin forzar el cuello.",
    steps: [
      "Boca arriba, brazos hacia el techo y rodillas dobladas en el aire (90°).",
      "Pega la zona lumbar al suelo.",
      "Baja despacio un brazo hacia atrás y la pierna contraria hacia delante.",
      "Vuelve y cambia de lado.",
    ],
    tips: ["Versión fácil: pies en el suelo y deslizar solo una pierna."],
    caution: "",
    yt: "dead bug bicho muerto ejercicio principiantes",
  },
  {
    id: "wall-plank", name: "Plancha en la pared", zone: "core", equip: ["cuerpo"], level: 1,
    type: "time", secs: 20,
    summary: "Plancha de pie, perfecta para empezar.",
    steps: [
      "Apoya los antebrazos en la pared a la altura de los hombros.",
      "Aleja los pies hasta que el cuerpo quede inclinado y recto.",
      "Aprieta abdomen y glúteos.",
      "Respira con normalidad y aguanta.",
    ],
    tips: ["Cuanto más lejos los pies, más difícil."],
    caution: "",
    yt: "plancha en la pared principiantes",
  },
  {
    id: "knee-plank", name: "Plancha con rodillas", zone: "core", equip: ["esterilla"], level: 2,
    type: "time", secs: 20,
    summary: "Plancha en el suelo apoyando las rodillas.",
    steps: [
      "Apoya antebrazos y rodillas en la esterilla, codos bajo los hombros.",
      "Forma una línea recta de rodillas a cabeza.",
      "Aprieta el abdomen sin aguantar la respiración.",
    ],
    tips: ["Mejor 15 segundos bien que 40 mal."],
    caution: "",
    yt: "plancha con rodillas apoyadas",
  },
  {
    id: "crunch", name: "Encogimiento abdominal suave", zone: "core", equip: ["esterilla"], level: 1,
    type: "reps", reps: 10,
    summary: "Abdominal clásico, versión cuidadosa.",
    steps: [
      "Boca arriba, rodillas dobladas, manos sobre los muslos.",
      "Despega la cabeza y los hombros deslizando las manos hacia las rodillas.",
      "Baja despacio.",
    ],
    tips: ["Mira al techo, no al pecho, para no forzar el cuello."],
    caution: "Evítalo si tienes osteoporosis en la columna; usa el perro de caza.",
    yt: "crunch abdominal suave principiantes",
  },
  {
    id: "side-plank-knees", name: "Plancha lateral con rodillas", zone: "core", equip: ["esterilla"], level: 2,
    type: "time", secs: 15, side: true,
    summary: "Laterales del abdomen (oblicuos).",
    steps: [
      "Túmbate de lado apoyada en el antebrazo, rodillas dobladas.",
      "Sube la cadera hasta alinear rodillas, cadera y hombros.",
      "Aguanta y cambia de lado.",
    ],
    tips: ["Codo justo debajo del hombro."],
    caution: "",
    yt: "plancha lateral con rodillas principiantes",
  },
  {
    id: "seated-march", name: "Marcha sentada", zone: "core", equip: ["silla"], level: 1,
    type: "time", secs: 40,
    summary: "Abdomen y cadera sin bajar al suelo.",
    steps: [
      "Siéntate en el borde de la silla, espalda recta, manos a los lados del asiento.",
      "Levanta una rodilla y bájala, luego la otra, como si marcharas.",
      "Mantén el abdomen firme sin echarte hacia atrás.",
    ],
    tips: ["Mueve también los brazos para activar más."],
    caution: "",
    yt: "marcha sentada en silla ejercicio mayores",
  },

  /* ---------------- EQUILIBRIO ---------------- */
  {
    id: "single-leg", name: "Equilibrio a una pierna", zone: "equilibrio", equip: ["silla"], level: 1,
    type: "time", secs: 20, side: true,
    summary: "Reduce el riesgo de caídas.",
    steps: [
      "De pie junto a una silla, apóyate con una mano.",
      "Levanta un pie unos centímetros del suelo.",
      "Aguanta el tiempo indicado y cambia de pierna.",
      "Cuando sea fácil, apoya solo un dedo o suelta la silla.",
    ],
    tips: ["Mira a un punto fijo de la pared."],
    caution: "Hazlo siempre con algo cerca a lo que agarrarte.",
    yt: "equilibrio a una pierna personas mayores",
  },
  {
    id: "tandem-stance", name: "Pies en línea (tándem)", zone: "equilibrio", equip: ["cuerpo"], level: 2,
    type: "time", secs: 20, side: true,
    summary: "Como estar de pie sobre una cuerda: entrena el equilibrio.",
    steps: [
      "Colócate junto a una pared o encimera para apoyarte si hace falta.",
      "Pon un pie justo delante del otro, el talón tocando la punta del de atrás.",
      "Mira al frente y aguanta el tiempo indicado. Luego cambia el pie de delante.",
      "Cuando sea fácil, camina así 10–15 pasos.",
    ],
    tips: ["Brazos un poco abiertos para equilibrarte."],
    caution: "Hazlo con algo cerca a lo que agarrarte.",
    yt: "postura tandem equilibrio mayores",
  },
  {
    id: "weight-shift", name: "Cambio de peso lateral", zone: "equilibrio", equip: ["silla"], level: 1,
    type: "time", secs: 30,
    summary: "Primer paso para entrenar el equilibrio.",
    steps: [
      "De pie, pies al ancho de cadera, con una silla delante.",
      "Pasa el peso del cuerpo lentamente a la pierna derecha.",
      "Levanta un poco el pie izquierdo y aguanta 3 segundos.",
      "Vuelve al centro y repite hacia el otro lado.",
    ],
    tips: ["Movimiento lento y suave."],
    caution: "",
    yt: "transferencia de peso equilibrio ejercicio mayores",
  },
  {
    id: "clock-reach", name: "El reloj", zone: "equilibrio", equip: ["silla"], level: 2,
    type: "reps", reps: 5, side: true,
    summary: "Equilibrio a una pierna moviendo el brazo como las agujas de un reloj.",
    steps: [
      "De pie junto a una silla, sujétate con una mano y levanta un poco el pie del mismo lado.",
      "Con el brazo libre señala las 12, luego las 3 y luego las 6, como un reloj.",
      "Gira solo la cabeza y el tronco, sin perder el equilibrio.",
      "Cambia de lado al terminar.",
    ],
    tips: ["Si es difícil, apoya la punta del pie."],
    caution: "",
    yt: "ejercicio del reloj equilibrio mayores",
  },

  /* ---------------- MOVILIDAD Y ESTIRAMIENTOS ---------------- */
  {
    id: "march", name: "Marcha en el sitio", zone: "movilidad", equip: ["cuerpo"], level: 1,
    type: "time", secs: 60,
    summary: "Calentamiento: sube las pulsaciones poco a poco.",
    steps: [
      "De pie, marcha levantando las rodillas a una altura cómoda.",
      "Balancea los brazos de forma natural.",
      "Respira con calma.",
    ],
    tips: ["Si necesitas apoyo, hazlo junto a una silla."],
    caution: "",
    yt: "marcha en el sitio calentamiento mayores",
  },
  {
    id: "shoulder-circles", name: "Círculos de hombros", zone: "movilidad", equip: ["cuerpo"], level: 1,
    type: "time", secs: 30,
    summary: "Afloja hombros y cuello.",
    steps: [
      "De pie o sentada, brazos relajados.",
      "Haz círculos grandes con los hombros hacia atrás.",
      "A mitad de tiempo, cambia hacia delante.",
    ],
    tips: [],
    caution: "",
    yt: "circulos de hombros calentamiento",
  },
  {
    id: "arm-circles", name: "Círculos de brazos", zone: "movilidad", equip: ["cuerpo"], level: 1,
    type: "time", secs: 30,
    summary: "Calentamiento de hombros.",
    steps: [
      "Brazos estirados hacia los lados.",
      "Haz círculos pequeños que se van haciendo grandes.",
      "A mitad de tiempo, cambia de sentido.",
    ],
    tips: [],
    caution: "",
    yt: "circulos de brazos calentamiento",
  },
  {
    id: "hip-circles", name: "Círculos de cadera", zone: "movilidad", equip: ["cuerpo"], level: 1,
    type: "time", secs: 30,
    summary: "Moviliza cadera y zona lumbar.",
    steps: [
      "De pie, manos en la cintura y pies al ancho de cadera.",
      "Dibuja círculos con la cadera.",
      "A mitad de tiempo, cambia de sentido.",
    ],
    tips: [],
    caution: "",
    yt: "circulos de cadera movilidad",
  },
  {
    id: "cat-cow", name: "Gato-vaca", zone: "movilidad", equip: ["esterilla"], level: 1,
    type: "reps", reps: 8,
    summary: "Movilidad de toda la columna.",
    steps: [
      "A cuatro patas, manos bajo hombros y rodillas bajo cadera.",
      "Al soltar el aire, redondea la espalda mirando al ombligo (gato).",
      "Al coger aire, hunde suavemente la espalda y mira al frente (vaca).",
    ],
    tips: ["Sincroniza con la respiración."],
    caution: "Versión sentada si te molestan las rodillas.",
    yt: "gato vaca movilidad columna",
  },
  {
    id: "seated-twist", name: "Rotación de tronco sentada", zone: "movilidad", equip: ["silla"], level: 1,
    type: "reps", reps: 8, side: true,
    summary: "Giros suaves para la espalda.",
    steps: [
      "Sentada, espalda recta y pies apoyados.",
      "Cruza los brazos sobre el pecho.",
      "Gira el tronco despacio hacia un lado, vuelve al centro y gira al otro.",
    ],
    tips: ["Crece hacia el techo al girar."],
    caution: "",
    yt: "rotacion de tronco sentado silla",
  },
  {
    id: "hamstring-stretch", name: "Estiramiento de la parte trasera del muslo", zone: "movilidad", equip: ["silla"], level: 1,
    type: "time", secs: 30, side: true,
    summary: "Isquiotibiales: ayuda a agacharse mejor.",
    steps: [
      "Siéntate al borde de la silla con una pierna estirada y el talón en el suelo.",
      "Con la espalda recta, inclínate hacia delante desde la cadera.",
      "Para cuando notes un estiramiento suave. Cambia de pierna.",
    ],
    tips: ["Nunca rebotes."],
    caution: "",
    yt: "estiramiento isquiotibiales sentado silla",
  },
  {
    id: "quad-stretch", name: "Estiramiento del cuádriceps", zone: "movilidad", equip: ["silla"], level: 1,
    type: "time", secs: 30, side: true,
    summary: "Parte delantera del muslo.",
    steps: [
      "De pie, sujétate a una silla.",
      "Dobla una rodilla llevando el talón hacia el glúteo y sujeta el tobillo (o el pantalón).",
      "Rodillas juntas. Aguanta y cambia de pierna.",
    ],
    tips: ["Si no llegas al tobillo, usa la banda."],
    caution: "",
    yt: "estiramiento cuadriceps de pie con apoyo",
  },
  {
    id: "chest-stretch", name: "Estiramiento de pecho", zone: "movilidad", equip: ["cuerpo"], level: 1,
    type: "time", secs: 30,
    summary: "Abre el pecho y contrarresta la postura encorvada.",
    steps: [
      "Entrelaza las manos detrás de la espalda (o sujeta la banda).",
      "Lleva los hombros hacia atrás y abre el pecho.",
      "Mira al frente y respira profundo.",
    ],
    tips: [],
    caution: "",
    yt: "estiramiento de pecho de pie",
  },
  {
    id: "child-pose", name: "Postura del niño", zone: "movilidad", equip: ["esterilla"], level: 1,
    type: "time", secs: 30,
    summary: "Relaja la espalda al final del entrenamiento.",
    steps: [
      "De rodillas, siéntate sobre los talones.",
      "Inclínate hacia delante estirando los brazos en el suelo.",
      "Apoya la frente y respira lento.",
    ],
    tips: ["Pon un cojín entre glúteos y talones si no llegas."],
    caution: "",
    yt: "postura del nino yoga principiantes",
  },
  {
    id: "neck-stretch", name: "Estiramiento de cuello", zone: "movilidad", equip: ["cuerpo"], level: 1,
    type: "time", secs: 30, side: true,
    summary: "Libera la tensión del cuello.",
    steps: [
      "Sentada con la espalda recta.",
      "Inclina la oreja hacia el hombro, sin subir el hombro.",
      "Aguanta respirando suave y cambia de lado.",
    ],
    tips: ["No hagas círculos completos con el cuello."],
    caution: "",
    yt: "estiramiento de cuello suave",
  },
  {
    id: "ankle-circles", name: "Círculos de tobillos", zone: "movilidad", equip: ["silla"], level: 1,
    type: "time", secs: 30, side: true,
    summary: "Tobillos ágiles para caminar con seguridad.",
    steps: [
      "Sentada, estira una pierna y levanta un poco el pie del suelo.",
      "Sube y baja la punta del pie despacio varias veces.",
      "Después dibuja círculos con la punta, en los dos sentidos.",
      "Cambia de pie.",
    ],
    tips: [],
    caution: "",
    yt: "circulos de tobillo movilidad",
  },
  /* ---------------- RUTINA HABITUAL (fuerza y core) ---------------- */
  {
    id: "squat-press", name: "Sentadilla con press de hombros", zone: "piernas", equip: ["mancuernas"], level: 2,
    type: "reps", reps: 10,
    summary: "Sentadilla y, al subir, empujas las mancuernas por encima de la cabeza. Trabaja todo el cuerpo.",
    steps: [
      "De pie, pies al ancho de los hombros, una mancuerna en cada mano a la altura de los hombros.",
      "Baja en sentadilla llevando la cadera atrás, con el pecho alto.",
      "Sube empujando con los talones.",
      "Al llegar arriba, empuja las mancuernas hacia el techo y bájalas otra vez a los hombros.",
    ],
    tips: ["Haz el movimiento seguido: bajar, subir y empujar.", "Empieza con poco peso."],
    caution: "No arquees la espalda al subir las mancuernas.",
    yt: "sentadilla con press de hombros mancuernas",
  },
  {
    id: "rdl-row", name: "Peso muerto con subida de mancuernas", zone: "piernas", equip: ["mancuernas"], level: 2,
    type: "reps", reps: 10,
    summary: "Peso muerto y, al subir, llevas las mancuernas hacia el pecho. Piernas, glúteos, espalda y hombros.",
    steps: [
      "De pie, una mancuerna en cada mano delante de los muslos, rodillas un poco flexionadas.",
      "Lleva la cadera atrás y baja las mancuernas pegadas a las piernas hasta las rodillas.",
      "Sube apretando los glúteos.",
      "Ya de pie, sube las mancuernas pegadas al cuerpo hasta el pecho, con los codos hacia fuera, y bájalas.",
    ],
    tips: ["Espalda recta en todo momento.", "Los codos no suben por encima de los hombros."],
    caution: "Si notas molestia en los hombros, haz solo el peso muerto.",
    yt: "peso muerto rumano con remo al menton mancuernas",
  },
  {
    id: "reverse-lunge-curl", name: "Zancada atrás con curl de bíceps", zone: "piernas", equip: ["mancuernas"], level: 2,
    type: "reps", reps: 10,
    summary: "Zancada hacia atrás y, al volver, curl de bíceps. Piernas y brazos a la vez.",
    steps: [
      "De pie, una mancuerna en cada mano a los lados.",
      "Da un paso largo hacia atrás y baja doblando las dos rodillas.",
      "Vuelve empujando con la pierna de delante hasta juntar los pies.",
      "De pie, haz un curl de bíceps y baja. Alterna la pierna en cada repetición.",
    ],
    tips: ["Si te falta equilibrio, hazla junto a una pared o una silla."],
    caution: "La rodilla de delante no pasa de la punta del pie.",
    yt: "zancada atras con curl de biceps mancuernas",
  },
  {
    id: "plank", name: "Plancha", zone: "core", equip: ["esterilla"], level: 3,
    type: "time", secs: 30,
    summary: "Plancha sobre antebrazos y puntas de los pies. Todo el abdomen.",
    steps: [
      "Apoya los antebrazos en la esterilla, codos debajo de los hombros.",
      "Estira las piernas hacia atrás y apóyate en las puntas de los pies.",
      "Cuerpo recto de la cabeza a los talones: ni cadera arriba ni abajo.",
      "Aprieta abdomen y glúteos y respira con normalidad.",
    ],
    tips: ["Si cuesta, apoya las rodillas (plancha con rodillas)."],
    caution: "Para si notas dolor en la zona lumbar.",
    yt: "plancha abdominal correcta",
  },
  {
    id: "leg-raise-hold", name: "Elevación de piernas mantenida", zone: "core", equip: ["esterilla"], level: 2,
    type: "time", secs: 30,
    summary: "Tumbada, levantas las piernas estiradas y las mantienes quietas. Abdomen bajo.",
    steps: [
      "Túmbate boca arriba con los brazos a los lados y las palmas hacia abajo.",
      "Pega la zona lumbar al suelo.",
      "Levanta las dos piernas estiradas hasta unos 40 cm del suelo.",
      "Aguanta sin moverlas el tiempo indicado y bájalas despacio.",
    ],
    tips: ["Cuanto más altas las piernas, más fácil.", "Si cuesta, dobla un poco las rodillas."],
    caution: "Si se despega la zona lumbar del suelo, sube más las piernas.",
    yt: "elevacion de piernas isometrica abdominales",
  },
  {
    id: "plank-shoulder-taps", name: "Plancha tocando el hombro contrario", zone: "core", equip: ["esterilla"], level: 3,
    type: "reps", reps: 40,
    summary: "En plancha con los brazos estirados, tocas con una mano el hombro contrario, alternando.",
    steps: [
      "Ponte en plancha alta: manos bajo los hombros y brazos estirados, piernas atrás.",
      "Separa un poco los pies para tener más equilibrio.",
      "Lleva una mano al hombro contrario y vuelve a apoyarla.",
      "Alterna las manos sin balancear la cadera. Cuenta cada toque.",
    ],
    tips: ["Más fácil: con las rodillas apoyadas."],
    caution: "",
    yt: "plancha toque de hombro alternos",
  },

  /* ---------------- EJERCICIOS AÑADIDOS ---------------- */
  {
    id: "sumo-squat", name: "Sentadilla sumo con mancuerna", zone: "piernas", equip: ["mancuernas"], level: 2,
    type: "reps", reps: 10,
    summary: "Piernas abiertas: trabaja glúteos y la cara interna del muslo.",
    steps: [
      "Separa bien los pies, más que el ancho de los hombros, con las puntas hacia fuera.",
      "Sujeta una mancuerna con las dos manos, colgando entre las piernas.",
      "Baja doblando las rodillas, que siguen la dirección de las puntas de los pies.",
      "Sube apretando los glúteos.",
    ],
    tips: ["Espalda recta y pecho alto durante todo el movimiento."],
    caution: "",
    yt: "sentadilla sumo con mancuerna principiantes",
  },
  {
    id: "standing-kickback", name: "Patada de glúteo de pie", zone: "piernas", equip: ["silla"], level: 1,
    type: "reps", reps: 10, side: true,
    summary: "Glúteos sin tumbarse, sujetándote a una silla.",
    steps: [
      "De pie detrás de una silla, sujeta el respaldo con las dos manos.",
      "Inclina el tronco un poco hacia delante.",
      "Lleva una pierna estirada hacia atrás apretando el glúteo.",
      "Vuelve despacio. Haz todas y cambia de pierna.",
    ],
    tips: ["No arquees la espalda: el movimiento es pequeño."],
    caution: "",
    yt: "patada de gluteo de pie con silla mayores",
  },
  {
    id: "clamshell", name: "Apertura de rodilla tumbada de lado", zone: "piernas", equip: ["esterilla", "banda"], level: 1,
    type: "reps", reps: 12, side: true,
    summary: "Glúteo lateral, muy bueno para la cadera.",
    steps: [
      "Túmbate de lado con las rodillas dobladas y la banda justo encima de las rodillas.",
      "Pies juntos y cadera quieta.",
      "Abre la rodilla de arriba hacia el techo, sin separar los pies.",
      "Cierra despacio. Haz todas y cambia de lado.",
    ],
    tips: ["Sin banda también funciona al principio."],
    caution: "",
    yt: "ejercicio almeja clamshell con banda",
  },
  {
    id: "bent-row", name: "Remo inclinada con dos mancuernas", zone: "espalda", equip: ["mancuernas"], level: 2,
    type: "reps", reps: 10,
    summary: "Espalda media y brazos, con las dos manos a la vez.",
    steps: [
      "De pie, rodillas un poco dobladas, inclina el tronco hacia delante con la espalda recta.",
      "Deja colgar las mancuernas debajo de los hombros.",
      "Sube las mancuernas hacia la cintura juntando los omóplatos.",
      "Baja despacio.",
    ],
    tips: ["Mira al suelo un poco por delante de los pies."],
    caution: "Si te molesta la zona lumbar, haz el remo con una mano apoyada en la silla.",
    yt: "remo inclinado con mancuernas principiantes",
  },
  {
    id: "band-pulldown", name: "Jalón con banda sentada", zone: "espalda", equip: ["banda", "silla"], level: 1,
    type: "reps", reps: 12,
    summary: "Fortalece la espalda alta, como la máquina del gimnasio.",
    steps: [
      "Sentada, sujeta la banda con los brazos estirados por encima de la cabeza.",
      "Separa las manos estirando la banda.",
      "Baja los codos hacia los costados, llevando la banda por delante de la cara.",
      "Vuelve a subir despacio.",
    ],
    tips: ["Piensa en meter los codos en los bolsillos de atrás."],
    caution: "",
    yt: "jalon con banda elastica sentado",
  },
  {
    id: "reverse-fly", name: "Pájaro con mancuernas", zone: "espalda", equip: ["mancuernas"], level: 2,
    type: "reps", reps: 10,
    summary: "Parte trasera de los hombros y espalda alta: mejora la postura.",
    steps: [
      "Inclina el tronco hacia delante con la espalda recta y rodillas suaves.",
      "Deja colgar las mancuernas con los codos un poco doblados.",
      "Abre los brazos hacia los lados como unas alas.",
      "Baja despacio.",
    ],
    tips: ["Usa muy poco peso (1–2 kg)."],
    caution: "",
    yt: "pajaro con mancuernas de pie principiantes",
  },
  {
    id: "shrug", name: "Encogimiento de hombros", zone: "espalda", equip: ["mancuernas"], level: 1,
    type: "reps", reps: 12,
    summary: "Fortalece la zona del cuello y trapecios.",
    steps: [
      "De pie, una mancuerna en cada mano a los lados.",
      "Sube los hombros hacia las orejas.",
      "Aguanta un segundo y baja despacio.",
    ],
    tips: ["No gires los hombros: solo arriba y abajo."],
    caution: "",
    yt: "encogimiento de hombros con mancuernas",
  },
  {
    id: "chair-incline-pushup", name: "Flexiones apoyada en la silla", zone: "pecho", equip: ["silla"], level: 2,
    type: "reps", reps: 8,
    summary: "Paso intermedio entre las de pared y las del suelo.",
    steps: [
      "Apoya la silla contra la pared para que no se mueva.",
      "Pon las manos en el borde del asiento y lleva los pies hacia atrás hasta que el cuerpo quede recto.",
      "Dobla los codos acercando el pecho a la silla.",
      "Empuja para volver.",
    ],
    tips: ["Un sofá firme o una encimera también sirven."],
    caution: "La silla debe estar bien sujeta contra la pared.",
    yt: "flexiones inclinadas apoyado en silla",
  },
  {
    id: "floor-fly", name: "Aperturas en el suelo", zone: "pecho", equip: ["mancuernas", "esterilla"], level: 2,
    type: "reps", reps: 10,
    summary: "Abre y fortalece el pecho.",
    steps: [
      "Túmbate boca arriba con las rodillas dobladas y una mancuerna en cada mano, brazos hacia el techo.",
      "Codos un poco doblados.",
      "Abre los brazos hacia los lados hasta casi tocar el suelo.",
      "Vuelve a juntarlos como si abrazaras un árbol.",
    ],
    tips: ["El suelo limita el recorrido y protege los hombros."],
    caution: "",
    yt: "aperturas con mancuernas en el suelo",
  },
  {
    id: "scaption", name: "Elevación en diagonal", zone: "hombros", equip: ["mancuernas"], level: 1,
    type: "reps", reps: 10,
    summary: "La elevación más amable para el hombro.",
    steps: [
      "De pie, mancuernas a los lados con los pulgares hacia delante.",
      "Sube los brazos en diagonal, entre el frente y el lado, formando una V.",
      "Hasta la altura de los hombros.",
      "Baja despacio.",
    ],
    tips: ["Codos casi estirados."],
    caution: "",
    yt: "elevacion de hombros en diagonal scaption",
  },
  {
    id: "band-shoulder-press", name: "Press de hombros con banda", zone: "hombros", equip: ["banda"], level: 1,
    type: "reps", reps: 12,
    summary: "Press de hombros pisando la banda.",
    steps: [
      "Pisa la banda con los pies y sujeta un extremo en cada mano a la altura de los hombros.",
      "Empuja las manos hacia arriba.",
      "Baja despacio a la altura de las orejas.",
    ],
    tips: ["Aprieta el abdomen para no arquear la espalda."],
    caution: "",
    yt: "press de hombros con banda elastica",
  },
  {
    id: "band-lateral-raise", name: "Elevación lateral con banda", zone: "hombros", equip: ["banda"], level: 1,
    type: "reps", reps: 12,
    summary: "Hombros redondeados con la banda bajo los pies.",
    steps: [
      "Pisa la banda y sujeta un extremo en cada mano a los lados.",
      "Sube los brazos hacia los lados hasta la altura de los hombros.",
      "Baja despacio.",
    ],
    tips: ["Codos ligeramente doblados."],
    caution: "",
    yt: "elevaciones laterales con banda elastica",
  },
  {
    id: "seated-curl", name: "Curl de bíceps sentada", zone: "brazos", equip: ["mancuernas", "silla"], level: 1,
    type: "reps", reps: 12,
    summary: "El curl de siempre, más cómodo y estable.",
    steps: [
      "Sentada en el borde de la silla, espalda recta, una mancuerna en cada mano.",
      "Codos pegados al cuerpo.",
      "Sube las mancuernas hacia los hombros.",
      "Baja despacio.",
    ],
    tips: ["Puedes alternar brazos."],
    caution: "",
    yt: "curl de biceps sentado mancuernas",
  },
  {
    id: "close-press", name: "Press cerrado en el suelo", zone: "brazos", equip: ["mancuernas", "esterilla"], level: 2,
    type: "reps", reps: 10,
    summary: "Tríceps tumbada, con los codos pegados al cuerpo.",
    steps: [
      "Túmbate boca arriba con las rodillas dobladas y una mancuerna en cada mano, palmas mirándose.",
      "Codos pegados a los costados.",
      "Empuja las mancuernas hacia el techo.",
      "Baja despacio hasta que los codos toquen el suelo.",
    ],
    tips: ["Los codos no se abren hacia los lados."],
    caution: "",
    yt: "press cerrado con mancuernas en el suelo",
  },
  {
    id: "heel-taps", name: "Toques de talón tumbada", zone: "core", equip: ["esterilla"], level: 1,
    type: "reps", reps: 8, side: true,
    summary: "Abdomen bajo, sin forzar el cuello.",
    steps: [
      "Boca arriba, piernas en el aire con las rodillas dobladas a 90° (como sobre una mesa).",
      "Pega la zona lumbar al suelo.",
      "Baja un pie despacio hasta tocar el suelo con el talón.",
      "Vuelve y cambia de pierna.",
    ],
    tips: ["Si cuesta, empieza con un pie apoyado en el suelo."],
    caution: "",
    yt: "toques de talon tumbado abdominales",
  },
  {
    id: "seated-rotation", name: "Giro con mancuerna sentada", zone: "core", equip: ["mancuernas", "silla"], level: 1,
    type: "reps", reps: 8, side: true,
    summary: "Oblicuos y movilidad de la columna.",
    steps: [
      "Sentada con la espalda recta, sujeta una mancuerna con las dos manos delante del pecho.",
      "Gira el tronco despacio hacia un lado.",
      "Vuelve al centro y gira hacia el otro.",
    ],
    tips: ["La cadera se queda quieta: gira solo el tronco."],
    caution: "Evítalo si tienes una lesión de espalda reciente.",
    yt: "rotacion de tronco sentado con mancuerna",
  },
  {
    id: "knee-lift-hold", name: "Rodilla arriba y aguanta", zone: "equilibrio", equip: ["silla"], level: 1,
    type: "reps", reps: 6, side: true,
    summary: "Equilibrio a una pierna de forma dinámica.",
    steps: [
      "De pie detrás de una silla, sujeta el respaldo.",
      "Sube una rodilla hasta la altura de la cadera.",
      "Aguanta 2–3 segundos y baja despacio.",
      "Alterna las piernas.",
    ],
    tips: ["Cuando sea fácil, sujétate con una sola mano."],
    caution: "",
    yt: "elevacion de rodilla equilibrio mayores",
  },
  {
    id: "heel-toe-rock", name: "Balanceo talón-punta", zone: "equilibrio", equip: ["silla"], level: 1,
    type: "reps", reps: 10,
    summary: "Fortalece tobillos y mejora el equilibrio.",
    steps: [
      "De pie detrás de una silla, sujeta el respaldo.",
      "Sube despacio de puntillas.",
      "Baja y apoya los talones levantando las puntas de los pies.",
      "Sigue balanceándote suavemente.",
    ],
    tips: ["Movimiento lento y controlado."],
    caution: "",
    yt: "balanceo talon punta equilibrio mayores",
  },

];


/* Ejercicios con fotos reales (img/fotos/<id>-0.jpg y -1.jpg).
   Fuente: free-exercise-db (dominio público, Unlicense). */
const PHOTOS = new Set(["squat", "goblet-squat", "sumo-squat", "split-squat", "glute-bridge", "rdl", "bent-row", "db-row", "pull-apart", "prone-extension", "shrug", "floor-press", "db-shoulder-press", "lateral-raise", "front-raise", "scaption", "band-external-rotation", "band-shoulder-press", "band-lateral-raise", "biceps-curl", "hammer-curl", "seated-curl", "overhead-triceps", "triceps-kickback", "dead-bug", "crunch", "child-pose", "cat-cow", "neck-stretch", "arm-circles", "ankle-circles", "squat-press", "rdl-row", "reverse-lunge-curl", "plank"]);

/* ---------------- CATEGORÍAS Y RUTINAS ----------------
   Cada rutina tiene 4 o 5 ejercicios.
   Un ejercicio puede escribirse como "id" (usa series y cantidad por defecto)
   o como ["id", series, repeticiones-o-segundos].                         */
/* Fotos en secuencia (ejercicios combinados): texto de cada foto. Por defecto: inicio y final. */
const PHOTO_SEQ = {
  "squat-press": ["1 · Mancuernas en los hombros", "2 · Baja en sentadilla", "3 · Sube y empuja hacia arriba"],
  "rdl-row": ["1 · De pie", "2 · Baja con la espalda recta", "3 · Sube y quédate de pie", "4 · Sube las mancuernas al pecho"],
  "reverse-lunge-curl": ["1 · De pie", "2 · Paso atrás y baja", "3 · Vuelve a juntar los pies", "4 · Curl de bíceps"],
  "plank": ["Cuerpo recto, sobre antebrazos y puntas"],
};

const CATEGORIES = [
  // color: acento · bg: fondo pastel
  { id: "full",       name: "Cuerpo completo",   emoji: "⭐", color: "#7B68D9", bg: "#ECE7FC", desc: "Un poco de todo en cada sesión", rest: 45 },
  { id: "complete",   name: "Sesión completa",   emoji: "🏆", color: "#C2577E", bg: "#FBE4EC", desc: "Entrenamiento entero de 30–40 min: calentamiento, fuerza con y sin pesas, y estiramientos", rest: 45 },
  { id: "piernas",    name: "Piernas y glúteos", emoji: "🦵", color: "#D9658E", bg: "#FCE6EE", desc: "Subir escaleras y levantarte sin esfuerzo", rest: 45 },
  { id: "espalda",    name: "Espalda",           emoji: "🧍‍♀️", color: "#3E8CC9", bg: "#E2F0FB", desc: "Mejor postura y menos molestias", rest: 40 },
  { id: "pecho",      name: "Pecho",             emoji: "💗", color: "#E07A4F", bg: "#FDEBDF", desc: "Fuerza para empujar y levantarte del suelo", rest: 45 },
  { id: "hombros",    name: "Hombros",           emoji: "🙆‍♀️", color: "#3E9C77", bg: "#DFF4EA", desc: "Alcanzar estanterías y altillos", rest: 40 },
  { id: "brazos",     name: "Brazos",            emoji: "💪", color: "#C99620", bg: "#FCF2D6", desc: "Cargar la compra y los nietos", rest: 40 },
  { id: "core",       name: "Abdomen",           emoji: "🎯", color: "#5B6FD6", bg: "#E6EAFC", desc: "Una zona media fuerte protege la espalda", rest: 30 },
  { id: "equilibrio", name: "Equilibrio",        emoji: "⚖️", color: "#2E9AA6", bg: "#DDF3F5", desc: "Prevenir caídas. Ideal 3 días por semana", rest: 30 },
  { id: "movilidad",  name: "Estiramientos",     emoji: "🧘‍♀️", color: "#A55DB5", bg: "#F5E6F7", desc: "Suave y relajante, para cualquier día", rest: 10 },
];

const ROUTINES = [
  /* ---- Cuerpo completo: las de siempre (movilidad → fuerza → core) ---- */
  { id: "base-1", cat: "full", level: 2, star: true, name: "La de siempre", desc: "Sentadilla con press, peso muerto, hombros y tríceps. Core con plancha.",
    blocks: { mov: ["arm-circles", "hip-circles", "cat-cow"], fuerza: ["squat-press", "rdl-row", "lateral-raise", "overhead-triceps"], core: [["plank", 30], ["leg-raise-hold", 30]] } },
  { id: "base-2", cat: "full", level: 2, star: true, name: "La de siempre con zancada", desc: "Sentadilla con press, peso muerto y zancada con bíceps. Core con toques de hombro.",
    blocks: { mov: ["march", "shoulder-circles", "hip-circles"], fuerza: ["squat-press", "rdl-row", "reverse-lunge-curl"], core: [["plank-shoulder-taps", 40], ["leg-raise-hold", 30]] } },
  { id: "base-3", cat: "full", level: 2, star: true, name: "La de siempre sin sentadilla", desc: "Cambia la sentadilla por la zancada con bíceps.",
    blocks: { mov: ["cat-cow", "arm-circles", "ankle-circles"], fuerza: ["reverse-lunge-curl", "rdl-row", "lateral-raise", "overhead-triceps"], core: [["plank", 30], ["leg-raise-hold", 30]] } },
  { id: "base-4", cat: "full", level: 2, star: true, name: "La de siempre completa", desc: "Los cinco ejercicios de fuerza seguidos. La más larga.",
    blocks: { mov: ["march", "arm-circles", "hip-circles", "cat-cow"], fuerza: ["squat-press", "rdl-row", "lateral-raise", "reverse-lunge-curl", "overhead-triceps"], core: [["plank-shoulder-taps", 40], ["leg-raise-hold", 30]] } },

  /* ---- Cuerpo completo ---- */
  { id: "full-1", cat: "full", level: 1, name: "Primeros pasos", desc: "Sin material. La mejor para empezar.",
    items: ["sit-stand", "wall-pushup", "glute-bridge", "calf-raise", "bird-dog"] },
  { id: "full-2", cat: "full", level: 2, name: "Con mancuernas", desc: "Las cinco zonas principales con pesas.",
    items: ["goblet-squat", "bent-row", "floor-press", "db-shoulder-press", "dead-bug"] },
  { id: "full-3", cat: "full", level: 1, name: "Con banda elástica", desc: "Todo el cuerpo solo con la banda.",
    items: ["band-abduction-seated", "band-row", "band-chest-press", "band-shoulder-press", "band-curl"] },
  { id: "full-4", cat: "full", level: 2, name: "De pie con mancuernas", desc: "Piernas, espalda, hombros y brazos sin tumbarse hasta el core.",
    items: ["goblet-squat", "db-row", "reverse-lunge-curl", "lateral-raise", "hammer-curl"] },
  { id: "full-5", cat: "full", level: 2, name: "Piernas y tren superior", desc: "Sentadilla, zancada, flexiones en la silla y banda.",
    items: ["squat", "split-squat", "chair-incline-pushup", "pull-apart", "glute-bridge"] },
  { id: "full-6", cat: "full", level: 3, name: "Reto completo", desc: "Para cuando las demás se queden cortas.",
    items: [["split-squat", 3, 8], ["rdl", 3, 10], ["knee-pushup", 3, 8], ["db-row", 3, 10], ["knee-plank", 3, 20]] },
  { id: "full-7", cat: "full", level: 2, name: "Completa: pesas y esterilla", desc: "Mancuernas de pie y ejercicios en el suelo.",
    items: ["goblet-squat", "floor-press", "bent-row", "glute-bridge", "dead-bug"] },
  { id: "full-8", cat: "full", level: 2, name: "Fuerza total", desc: "Todo el cuerpo, combinando mancuernas y silla.",
    items: ["rdl", "db-shoulder-press", "chair-incline-pushup", "split-squat", "knee-plank"] },
  { id: "full-9", cat: "full", level: 2, name: "Mezcla de todo", desc: "Mancuernas, banda, esterilla y sin material.",
    items: ["sumo-squat", "band-row", "floor-fly", "standing-kickback", "bird-dog"] },
  { id: "full-10", cat: "full", level: 2, name: "Sesión larga de fin de semana", desc: "Para cuando hay tiempo y ganas.",
    items: [["squat", 3, 12], ["db-row", 3, 10], ["lateral-raise", 3, 10], ["clamshell", 3, 12], ["side-plank-knees", 3, 20]] },
  { id: "full-11", cat: "full", level: 1, name: "Completa y suave", desc: "Más larga pero a ritmo tranquilo.",
    items: [["squat", 3, 12], ["biceps-curl", 3, 12], ["band-pulldown", 3, 12], ["glute-bridge", 3, 12], ["heel-taps", 2, 8]] },

  /* ---- Cuerpo completo: más largas y variadas ---- */
  { id: "full-12", cat: "full", level: 2, name: "Todo con mancuernas", desc: "Siete ejercicios con pesas para trabajar todo el cuerpo.",
    items: [["goblet-squat", 3, 12], ["rdl", 3, 12], ["bent-row", 3, 12], ["floor-press", 3, 12], ["db-shoulder-press", 3, 10], ["biceps-curl", 3, 12], ["dead-bug", 3, 8]] },
  { id: "full-13", cat: "full", level: 2, name: "Empujar y tirar", desc: "Alterna ejercicios de empujar y de tirar, con piernas entre medias.",
    items: [["chair-incline-pushup", 3, 10], ["db-row", 3, 12], ["sumo-squat", 3, 12], ["reverse-fly", 3, 12], ["glute-bridge", 3, 15], ["knee-plank", 3, 30]] },
  { id: "full-14", cat: "full", level: 2, name: "Piernas y brazos", desc: "Combina un ejercicio de piernas con uno de brazos.",
    items: [["split-squat", 3, 10], ["hammer-curl", 3, 12], ["goblet-squat", 3, 12], ["overhead-triceps", 3, 12], ["calf-raise", 3, 15], ["side-plank-knees", 3, 20]] },
  { id: "full-15", cat: "full", level: 2, name: "Completa en la esterilla", desc: "Casi todo tumbada o a cuatro patas, con mancuernas.",
    items: [["glute-bridge", 3, 15], ["floor-press", 3, 12], ["side-leg-raise", 3, 12], ["floor-fly", 3, 12], ["bird-dog", 3, 10], ["close-press", 3, 10], ["dead-bug", 3, 8]] },
  { id: "full-16", cat: "full", level: 2, name: "Fuerza larga de pie", desc: "Siete ejercicios de fuerza con mancuernas, casi todo de pie.",
    items: [["squat", 3, 15], ["reverse-lunge-curl", 3, 10], ["db-row", 3, 12], ["lateral-raise", 3, 12], ["db-shoulder-press", 3, 10], ["sumo-squat", 3, 12], ["rdl", 3, 12]] },
  { id: "full-17", cat: "full", level: 3, name: "Circuito de 4 vueltas", desc: "Cuatro series de cada ejercicio. Para cuando las demás se queden cortas.",
    items: [["goblet-squat", 4, 12], ["knee-pushup", 4, 10], ["bent-row", 4, 12], ["split-squat", 4, 10], ["scaption", 4, 12], ["bird-dog", 4, 10]] },

  /* ---- Sesión completa: para cuando es la única rutina del día ----
     6 ejercicios de fuerza (mancuernas, peso corporal, esterilla, banda) + estiramientos al final */
  { id: "cmp-1", cat: "complete", level: 2, name: "Pesas y esterilla", desc: "Mancuernas de pie, ejercicios en el suelo y estiramientos.",
    items: [["goblet-squat", 3, 12], ["bent-row", 3, 12], ["floor-press", 3, 12], ["glute-bridge", 3, 15], ["db-shoulder-press", 3, 10], ["dead-bug", 3, 8],
      ["child-pose", 1, 40], ["hamstring-stretch", 1, 30]] },
  { id: "cmp-2", cat: "complete", level: 2, name: "Fuerza de pies a cabeza", desc: "Todo el cuerpo con mancuernas y una silla.",
    items: [["rdl", 3, 12], ["db-row", 3, 12], ["chair-incline-pushup", 3, 10], ["split-squat", 3, 10], ["lateral-raise", 3, 12], ["knee-plank", 3, 30],
      ["chest-stretch", 1, 30], ["quad-stretch", 1, 30]] },
  { id: "cmp-3", cat: "complete", level: 2, name: "Mitad pesas, mitad sin material", desc: "Alterna ejercicios con mancuernas y con tu propio cuerpo.",
    items: [["squat", 3, 15], ["reverse-fly", 3, 12], ["knee-pushup", 3, 10], ["side-leg-raise", 3, 12], ["hammer-curl", 3, 12], ["bird-dog", 3, 10],
      ["cat-cow", 1, 10], ["hamstring-stretch", 1, 30]] },
  { id: "cmp-4", cat: "complete", level: 3, name: "Gran sesión", desc: "La más completa: para los días con muchas ganas.",
    items: [["sumo-squat", 3, 15], ["bent-row", 3, 12], ["floor-fly", 3, 12], ["standing-kickback", 3, 12], ["overhead-triceps", 3, 12], ["scaption", 3, 12], ["side-plank-knees", 3, 20],
      ["child-pose", 1, 40], ["quad-stretch", 1, 30]] },
  { id: "cmp-5", cat: "complete", level: 2, name: "Completa con banda y pesas", desc: "Banda elástica, mancuernas y esterilla.",
    items: [["band-row", 3, 15], ["goblet-squat", 3, 12], ["band-chest-press", 3, 15], ["clamshell", 3, 15], ["band-shoulder-press", 3, 12], ["crunch", 3, 12],
      ["chest-stretch", 1, 30], ["hamstring-stretch", 1, 30]] },

  /* ---- Piernas y glúteos ---- */
  { id: "legs-1", cat: "piernas", level: 1, name: "Piernas básicas", desc: "Lo esencial, con una silla.",
    items: ["sit-stand", "calf-raise", "hip-abduction-stand", "glute-bridge"] },
  { id: "legs-2", cat: "piernas", level: 1, name: "Glúteos en la esterilla", desc: "Tumbada, cómoda y efectiva.",
    items: ["glute-bridge", "side-leg-raise", "clamshell", "standing-kickback"] },
  { id: "legs-3", cat: "piernas", level: 2, name: "Piernas con mancuernas", desc: "Un poco más de carga.",
    items: ["goblet-squat", "rdl", "sumo-squat", "calf-raise"] },
  { id: "legs-4", cat: "piernas", level: 1, name: "Sin bajar al suelo", desc: "Todo de pie o sentada.",
    items: ["sit-stand", "standing-kickback", "hip-abduction-stand", "band-abduction-seated", "calf-raise"] },
  { id: "legs-5", cat: "piernas", level: 3, name: "Reto de piernas", desc: "Tres series y ejercicios más exigentes.",
    items: [["squat", 3, 12], ["split-squat", 3, 8], ["rdl", 3, 10], ["sumo-squat", 3, 10], ["glute-bridge", 3, 15]] },
  { id: "legs-6", cat: "piernas", level: 2, name: "Piernas completas", desc: "Mancuernas, esterilla y sin material.",
    items: [["goblet-squat", 3, 12], ["glute-bridge", 3, 15], ["split-squat", 3, 10], ["clamshell", 3, 15], ["calf-raise", 3, 15]] },

  /* ---- Espalda ---- */
  { id: "back-1", cat: "espalda", level: 1, name: "Postura recta", desc: "Para dejar de encorvarse.",
    items: ["pull-apart", "band-row", "prone-extension", "bird-dog"] },
  { id: "back-2", cat: "espalda", level: 2, name: "Espalda con mancuernas", desc: "Remos y aperturas con pesas.",
    items: ["bent-row", "db-row", "reverse-fly", "shrug"] },
  { id: "back-3", cat: "espalda", level: 1, name: "Espalda con banda", desc: "Solo necesitas la banda elástica.",
    items: ["band-row", "pull-apart", "band-pulldown", "band-external-rotation"] },
  { id: "back-4", cat: "espalda", level: 1, name: "Espalda sin dolor", desc: "Suave, en la esterilla. Alivia la zona lumbar.",
    items: ["cat-cow", "bird-dog", "glute-bridge", "prone-extension", "child-pose"] },
  { id: "back-5", cat: "espalda", level: 2, name: "Espalda completa", desc: "Combina banda y mancuernas.",
    items: ["db-row", "band-pulldown", "reverse-fly", "prone-extension", "pull-apart"] },
  { id: "back-6", cat: "espalda", level: 3, name: "Reto de espalda", desc: "Tres series, mancuernas y suelo.",
    items: [["bent-row", 3, 12], ["db-row", 3, 12], ["reverse-fly", 3, 12], ["prone-extension", 3, 10], ["bird-dog", 3, 10]] },

  /* ---- Pecho ---- */
  { id: "chest-1", cat: "pecho", level: 1, name: "Pecho para empezar", desc: "De pie, sin bajar al suelo.",
    items: ["wall-pushup", "band-chest-press", "pull-apart", "chest-stretch"] },
  { id: "chest-2", cat: "pecho", level: 2, name: "Pecho con mancuernas", desc: "Tumbada en la esterilla.",
    items: ["floor-press", "floor-fly", "close-press", "chest-stretch"] },
  { id: "chest-3", cat: "pecho", level: 2, name: "Flexiones paso a paso", desc: "De la pared a la silla y al suelo.",
    items: ["wall-pushup", "chair-incline-pushup", "knee-pushup", "chest-stretch"] },
  { id: "chest-4", cat: "pecho", level: 2, name: "Pecho y tríceps", desc: "Empujar con fuerza.",
    items: ["floor-press", "chair-incline-pushup", "overhead-triceps", "triceps-kickback"] },
  { id: "chest-5", cat: "pecho", level: 1, name: "Pecho con banda", desc: "Con la banda elástica, de pie.",
    items: ["band-chest-press", "wall-pushup", "band-external-rotation", "pull-apart"] },
  { id: "chest-6", cat: "pecho", level: 3, name: "Reto de pecho", desc: "Flexiones y mancuernas, tres series.",
    items: [["knee-pushup", 3, 10], ["floor-press", 3, 12], ["floor-fly", 3, 12], ["close-press", 3, 10], ["chest-stretch", 1, 30]] },

  /* ---- Hombros ---- */
  { id: "sh-1", cat: "hombros", level: 1, name: "Hombros básicos", desc: "Elevaciones suaves con poco peso.",
    items: ["shoulder-circles", "front-raise", "lateral-raise", "band-external-rotation"] },
  { id: "sh-2", cat: "hombros", level: 2, name: "Hombros sentada", desc: "Más estable para la espalda.",
    items: ["db-shoulder-press", "lateral-raise", "front-raise", "shrug"] },
  { id: "sh-3", cat: "hombros", level: 1, name: "Hombros con banda", desc: "Pisando la banda elástica.",
    items: ["band-shoulder-press", "band-lateral-raise", "band-external-rotation", "pull-apart"] },
  { id: "sh-4", cat: "hombros", level: 1, name: "Hombros sanos", desc: "Movilidad y fuerza para cuidar la articulación.",
    items: ["arm-circles", "band-external-rotation", "scaption", "pull-apart"] },
  { id: "sh-5", cat: "hombros", level: 3, name: "Reto de hombros", desc: "Tres series, cinco ejercicios.",
    items: [["db-shoulder-press", 3, 10], ["scaption", 3, 10], ["lateral-raise", 3, 10], ["reverse-fly", 3, 10], ["front-raise", 3, 10]] },

  /* ---- Brazos ---- */
  { id: "arms-1", cat: "brazos", level: 1, name: "Bíceps y tríceps", desc: "El clásico con mancuernas.",
    items: ["biceps-curl", "triceps-kickback", "hammer-curl", "overhead-triceps"] },
  { id: "arms-2", cat: "brazos", level: 1, name: "Brazos sentada", desc: "Todo en la silla.",
    items: ["seated-curl", "overhead-triceps", "db-shoulder-press", "shrug"] },
  { id: "arms-3", cat: "brazos", level: 1, name: "Brazos con banda", desc: "Pisando la banda.",
    items: ["band-curl", "band-shoulder-press", "band-lateral-raise", "band-chest-press"] },
  { id: "arms-4", cat: "brazos", level: 2, name: "Brazos tonificados", desc: "Variantes para no aburrirse.",
    items: ["hammer-curl", "close-press", "band-curl", "triceps-kickback"] },
  { id: "arms-5", cat: "brazos", level: 3, name: "Reto de brazos", desc: "Tres series de cada.",
    items: [["biceps-curl", 3, 12], ["overhead-triceps", 3, 10], ["hammer-curl", 3, 12], ["close-press", 3, 10], ["triceps-kickback", 3, 10]] },

  /* ---- Abdomen ---- */
  { id: "core-1", cat: "core", level: 1, name: "Abdomen sin suelo", desc: "De pie y sentada.",
    items: ["seated-march", "wall-plank", "seated-rotation", "knee-lift-hold"] },
  { id: "core-2", cat: "core", level: 1, name: "Core en la esterilla", desc: "Sin forzar el cuello.",
    items: ["dead-bug", "bird-dog", "glute-bridge", "heel-taps"] },
  { id: "core-3", cat: "core", level: 2, name: "Abdominales suaves", desc: "Los de toda la vida, bien hechos.",
    items: ["crunch", "heel-taps", "knee-plank", "side-plank-knees"] },
  { id: "core-4", cat: "core", level: 1, name: "Espalda y abdomen", desc: "Para una columna fuerte.",
    items: ["cat-cow", "bird-dog", "prone-extension", "knee-plank"] },
  { id: "core-5", cat: "core", level: 3, name: "Reto de abdomen", desc: "Tres series, cinco ejercicios.",
    items: [["dead-bug", 3, 10], ["knee-plank", 3, 25], ["side-plank-knees", 3, 15], ["crunch", 3, 12], ["bird-dog", 3, 8]] },

  /* ---- Equilibrio ---- */
  { id: "bal-1", cat: "equilibrio", level: 1, name: "Equilibrio con silla", desc: "El primer paso, siempre con apoyo.",
    items: ["weight-shift", "single-leg", "heel-toe-rock", "calf-raise"] },
  { id: "bal-2", cat: "equilibrio", level: 1, name: "Pies seguros", desc: "Tobillos fuertes y ágiles.",
    items: ["ankle-circles", "heel-toe-rock", "calf-raise", "tandem-stance"] },
  { id: "bal-3", cat: "equilibrio", level: 2, name: "Equilibrio en movimiento", desc: "Para el día a día.",
    items: ["march", "knee-lift-hold", "clock-reach", "tandem-stance"] },
  { id: "bal-4", cat: "equilibrio", level: 1, name: "Piernas firmes", desc: "Fuerza en las piernas para no caer.",
    items: ["sit-stand", "hip-abduction-stand", "standing-kickback", "single-leg"] },
  { id: "bal-5", cat: "equilibrio", level: 3, name: "Reto de equilibrio", desc: "Con menos apoyo y más tiempo.",
    items: [["clock-reach", 2, 6], ["single-leg", 3, 30], ["tandem-stance", 3, 30], ["split-squat", 2, 8], ["knee-lift-hold", 2, 8]] },

  /* ---- Estiramientos ---- */
  { id: "mob-1", cat: "movilidad", level: 1, name: "Despertar suave", desc: "Ideal por la mañana, sentada.",
    items: ["neck-stretch", "shoulder-circles", "seated-twist", "ankle-circles"] },
  { id: "mob-2", cat: "movilidad", level: 1, name: "Espalda relajada", desc: "Suelta la tensión de la espalda.",
    items: ["cat-cow", "child-pose", "seated-twist", "chest-stretch"] },
  { id: "mob-3", cat: "movilidad", level: 1, name: "Piernas sueltas", desc: "Caderas, muslos y tobillos.",
    items: ["hip-circles", "hamstring-stretch", "quad-stretch", "ankle-circles"] },
  { id: "mob-4", cat: "movilidad", level: 1, name: "Todo sentada", desc: "Sin levantarte de la silla.",
    items: ["neck-stretch", "shoulder-circles", "seated-twist", "hamstring-stretch", "ankle-circles"] },
  { id: "mob-5", cat: "movilidad", level: 1, name: "Vuelta a la calma", desc: "Perfecta después de entrenar.",
    items: ["chest-stretch", "quad-stretch", "hamstring-stretch", "child-pose"] },
];

/* Calentamiento opcional (se añade al principio de las rutinas de fuerza) */
const WARMUP = [["march", 1, 40], ["arm-circles", 1, 30], ["hip-circles", 1, 30]];

/* Plan semanal sugerido (0 = domingo … 6 = sábado): categoría del día.
   La rutina concreta va rotando cada semana.
   Basado en la OMS (2020) para mayores de 65: fuerza ≥ 2 días/semana y equilibrio ≥ 3 días/semana. */
const WEEK_PLAN = { 1: "full", 2: "core", 3: "piernas", 4: "hombros", 5: "espalda", 6: "movilidad", 0: null };

/* Normaliza los ejercicios de cada rutina a [id, series, cantidad] */
/* Las rutinas de cuerpo completo van en tres bloques: movilidad → fuerza → core (2 rondas). */
const BLOCKS = {
  mov: { name: "Movilidad", emoji: "🧘", hint: "Para soltar el cuerpo" },
  fuerza: { name: "Fuerza", emoji: "💪", hint: "" },
  core: { name: "Core", emoji: "🎯", hint: "" },
};
const CORE_ROUNDS = 2;
const MOB_DEFAULT = { 1: ["march", "arm-circles", "hip-circles"], 2: ["march", "arm-circles", "hip-circles", "cat-cow"] };
const CORE_PAIR = { "bird-dog": "heel-taps", "dead-bug": "knee-plank", "knee-plank": "heel-taps", "side-plank-knees": "dead-bug",
  "seated-march": "seated-rotation", "heel-taps": "knee-plank", "wall-plank": "seated-march", "crunch": "knee-plank", "seated-rotation": "seated-march" };

(function normalize() {
  const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
  const amt = (id) => byId[id].reps || byId[id].secs;
  ROUTINES.forEach((r) => {
    if (r.cat !== "full") return;
    let b = r.blocks;
    if (!b) {
      // rutinas antiguas: se reparten solas en los tres bloques
      const lv = r.level >= 2 ? 2 : 1;
      const it = r.items.map((x) => (Array.isArray(x) ? x : [x, r.level >= 2 ? 3 : 2, amt(x)]));
      const core = it.filter(([id]) => byId[id].zone === "core").slice(0, 2).map(([id, , a]) => [id, a]);
      if (core.length === 1) { const c2 = CORE_PAIR[core[0][0]]; if (c2) core.push([c2, amt(c2)]); }
      if (!core.length) (lv === 1 ? ["knee-plank", "heel-taps"] : ["plank", "leg-raise-hold"]).forEach((id) => core.push([id, amt(id)]));
      b = { mov: r.mov || MOB_DEFAULT[lv], fuerza: it.filter(([id]) => byId[id].zone !== "core"), core };
    }
    const mov = b.mov.map((x) => (Array.isArray(x) ? [x[0], 1, x[1]] : [x, 1, amt(x)]));
    const fz = b.fuerza.map((x) => (Array.isArray(x) ? (x.length === 3 ? x : [x[0], 3, x[1]]) : [x, 3, 10]));
    const core = b.core.map((x) => (Array.isArray(x) ? [x[0], 1, x[1]] : [x, 1, amt(x)]));
    r.items = [...mov, ...fz, ...core];
    r.sections = [
      { key: "mov", from: 0, to: mov.length },
      { key: "fuerza", from: mov.length, to: mov.length + fz.length },
      { key: "core", from: mov.length + fz.length, to: r.items.length, rounds: CORE_ROUNDS },
    ];
    delete r.blocks;
  });
  ROUTINES.forEach((r) => {
    const cat = CATEGORIES.find((c) => c.id === r.cat);
    r.emoji = cat.emoji; r.color = cat.color; r.rest = r.rest || cat.rest;
    r.items = r.items.map((it) => {
      if (Array.isArray(it)) return it;
      const ex = byId[it];
      // estiramientos: 1 serie · rutinas suaves: 2 series · medias y reto: 3 series
      const sets = ex.zone === "movilidad" ? (r.cat === "movilidad" ? 2 : 1) : (r.level >= 2 ? 3 : 2);
      return [it, sets, ex.reps || ex.secs];
    });
  });
})();
