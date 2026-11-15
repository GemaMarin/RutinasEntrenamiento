/* =========================================================
   ANIMACIONES DEL MUÑECO 3D
   ---------------------------------------------------------
   Cada ejercicio tiene una lista de "fotogramas" (poses) y el
   muñeco pasa de uno a otro en bucle.
   Ángulos en grados:
     spine/chest/neck: [flexión(+ adelante), inclinación lateral, giro]
     hipL/hipR:        [flexión(+ adelante), apertura, rotación]
     kneeL/kneeR:      flexión de rodilla
     ankleL/ankleR:    + punta abajo / − punta arriba
     shL/shR:          [flexión(+ adelante), apertura lateral, giro del brazo, apertura horizontal]
     elL/elR:          flexión del codo
     rot:              giro del cuerpo entero [x, y, z] (−90 = boca arriba, 90 = boca abajo)
   Opciones: ground ("feet" | "all" | "seat"), anchor ("feet" | "pelvis" | "knees" | "footL" | "footR"),
             at [x, z], props (chair, mat, wall, dumbbells, goblet, band), cam (0 = de frente, 90 = de lado),
             seq (orden de fotogramas), move/hold (segundos)
   ========================================================= */
(function () {
  const P = (...o) => Object.assign({}, ...o);
  const mirror = (pose) => {
    const m = { ...pose };
    [["hipL", "hipR"], ["kneeL", "kneeR"], ["ankleL", "ankleR"], ["shL", "shR"], ["elL", "elR"], ["shPL", "shPR"]].forEach(([a, b]) => {
      m[a] = pose[b]; m[b] = pose[a];
      if (m[a] === undefined) delete m[a];
      if (m[b] === undefined) delete m[b];
    });
    ["spine", "chest", "neck"].forEach((k) => { if (pose[k]) m[k] = [pose[k][0], -pose[k][1], -pose[k][2]]; });
    return m;
  };

  /* ---------- Piezas reutilizables ---------- */
  const CHAIR_FRONT = { type: "chair", place: "backAtHands" };
  const IK_CHAIR = { hands: "both", y: 0.95, pole: [0.6, -0.5, -0.6] };
  const HOLD = { shL: [36, 6, 0], shR: [36, 6, 0], elL: 12, elR: 12 };           // manos en el respaldo
  const HOLD_R = { shR: [36, 6, 0], elR: 12 };
  const SEATED = { hipL: [88, 6, 0], hipR: [88, 6, 0], kneeL: 86, kneeR: 86, ankleL: 2, ankleR: 2 };
  const SEAT_OPTS = { ground: "seat", anchor: "pelvis", at: [0, -0.06], props: [{ type: "chair" }], cam: 50 };
  const SUPINE = { rot: [-90, 0, 0] };
  const KNEES_BENT = { hipL: [55, 4, 0], hipR: [55, 4, 0], kneeL: 105, kneeR: 105, ankleL: 40, ankleR: 40 };
  const ARMS_FLOOR = { shL: [0, 18, 0], shR: [0, 18, 0], elL: 0, elR: 0 };
  const LYING = { ground: "all", anchor: "pelvis", lying: true, cam: 70, pitch: 22 };
  const PRONE = { rot: [90, 0, 0] };
  const FOUR = { rot: [90, 0, 0], hipL: [90, 2, 0], hipR: [90, 2, 0], kneeL: 90, kneeR: 90, ankleL: 45, ankleR: 45,
    shL: [90, 2, 0], shR: [90, 2, 0], elL: 0, elR: 0, neck: [-25, 0, 0] };
  const SIDE = { rot: [0, 0, 90] };
  const BENT_OVER = { rot: [50, 0, 0], hipL: [62, 6, 0], hipR: [62, 6, 0], kneeL: 22, kneeR: 22, ankleL: -10, ankleR: -10, neck: [-25, 0, 0] };
  const MAT = (rot = 0, len) => ({ type: "mat", rot, len });
  const DB = { type: "dumbbells" };
  const ON_BAND = { type: "band", links: [["handL", "footL"], ["handR", "footR"]] };

  window.ANIMS = {
    /* ================= PIERNAS Y GLÚTEOS ================= */
    "sit-stand": {
      props: [{ type: "chair" }], anchor: "feet", at: [0, 0.4], cam: 70,
      frames: [
        P(SEATED, { spine: [8, 0, 0], shL: [80, 0, 0], shR: [80, 0, 0], elL: 0, elR: 0 }),
        P({ hipL: [100, 6, 0], hipR: [100, 6, 0], kneeL: 82, kneeR: 82, ankleL: -8, ankleR: -8, spine: [32, 0, 0], shL: [70, 0, 0], shR: [70, 0, 0], elL: 0, elR: 0 }),
        P({ shL: [80, 0, 0], shR: [80, 0, 0], elL: 0, elR: 0 }),
      ],
      seq: [0, 1, 2, 1], move: 0.9, hold: 0.3,
    },
    "squat": {
      cam: 70,
      frames: [
        { shL: [10, 6, 0], shR: [10, 6, 0] },
        { hipL: [78, 10, 6], hipR: [78, 10, 6], kneeL: 88, kneeR: 88, ankleL: -18, ankleR: -18, spine: [24, 0, 0], shL: [80, 0, 0], shR: [80, 0, 0], elL: 0, elR: 0 },
      ],
    },
    "goblet-squat": {
      cam: 55, props: [{ type: "goblet" }],
      frames: [
        { shL: [28, 0, 0, -38], shR: [28, 0, 0, -38], elL: 128, elR: 128 },
        { hipL: [88, 14, 10], hipR: [88, 14, 10], kneeL: 98, kneeR: 98, ankleL: -20, ankleR: -20, spine: [26, 0, 0], shL: [30, 0, 0, -38], shR: [30, 0, 0, -38], elL: 128, elR: 128 },
      ],
    },
    "sumo-squat": {
      cam: 30, props: [{ type: "single" }],
      frames: [
        { hipL: [0, 22, 32], hipR: [0, 22, 32], shL: [6, -14, 0], shR: [6, -14, 0], elL: 4, elR: 4 },
        { hipL: [62, 30, 32], hipR: [62, 30, 32], kneeL: 72, kneeR: 72, ankleL: -10, ankleR: -10, spine: [10, 0, 0], shL: [14, -14, 0], shR: [14, -14, 0], elL: 4, elR: 4 },
      ],
    },
    "split-squat": {
      cam: 80,
      frames: [
        { hipL: [26, 4, 0], hipR: [-16, 4, 0], kneeL: 4, kneeR: 6, ankleL: 0, ankleR: 12, shL: [0, 20, 0], shR: [0, 20, 0] },
        { hipL: [74, 4, 0], hipR: [-4, 4, 0], kneeL: 88, kneeR: 94, ankleL: -14, ankleR: 40, shL: [0, 20, 0], shR: [0, 20, 0] },
      ],
    },
    "glute-bridge": {
      ...LYING, anchor: "feet", props: [MAT()],
      frames: [
        P(SUPINE, KNEES_BENT, ARMS_FLOOR),
        P({ rot: [-117, 0, 0], hipL: [8, 4, 0], hipR: [8, 4, 0], kneeL: 100, kneeR: 100, ankleL: 50, ankleR: 50 }, { shL: [-26, 18, 0], shR: [-26, 18, 0], elL: 0, elR: 0 }),
      ],
    },
    "calf-raise": {
      props: [CHAIR_FRONT], ik: IK_CHAIR, cam: 75,
      frames: [P(HOLD), P(HOLD, { ankleL: 30, ankleR: 30 })],
      move: 0.8, hold: 0.5,
    },
    "hip-abduction-stand": {
      props: [CHAIR_FRONT], ik: IK_CHAIR, anchor: "pelvis", cam: 165, pitch: 8,
      frames: [P(HOLD), P(HOLD, { hipL: [0, 32, 0], spine: [0, -4, 0] })],
    },
    "standing-kickback": {
      props: [CHAIR_FRONT], ik: IK_CHAIR, anchor: "pelvis", cam: 80,
      frames: [P(HOLD, { spine: [8, 0, 0] }), P(HOLD, { spine: [12, 0, 0], hipL: [-28, 0, 0], kneeL: 12 })],
    },
    "band-abduction-seated": {
      ...SEAT_OPTS, cam: 10, props: [{ type: "chair" }, { type: "band", links: [["kneeL", "kneeR"]] }],
      frames: [
        P(SEATED, { hipL: [88, 3, 0], hipR: [88, 3, 0], shL: [10, 20, 0], shR: [10, 20, 0], elL: 40, elR: 40 }),
        P(SEATED, { hipL: [88, 22, 0], hipR: [88, 22, 0], shL: [10, 20, 0], shR: [10, 20, 0], elL: 40, elR: 40 }),
      ],
    },
    "rdl": {
      cam: 80, props: [DB],
      frames: [
        { shL: [4, 4, 0], shR: [4, 4, 0], elL: 0, elR: 0 },
        { rot: [62, 0, 0], hipL: [72, 4, 0], hipR: [72, 4, 0], kneeL: 20, kneeR: 20, ankleL: -10, ankleR: -10, shL: [62, 4, 0], shR: [62, 4, 0], elL: 0, elR: 0, neck: [-20, 0, 0] },
      ],
    },
    "side-leg-raise": {
      ...LYING, cam: 5, pitch: 25, props: [MAT(90)],
      frames: [
        P(SIDE, { hipR: [25, 0, 0], kneeR: 50, hipL: [0, 0, 0], shR: [175, 0, 0], elR: 70, shL: [60, 0, 0], elL: 30, neck: [0, 8, 0] }),
        P(SIDE, { hipR: [25, 0, 0], kneeR: 50, hipL: [0, 36, 0], shR: [175, 0, 0], elR: 70, shL: [60, 0, 0], elL: 30, neck: [0, 8, 0] }),
      ],
    },
    "clamshell": {
      ...LYING, cam: 5, pitch: 25, props: [MAT(90), { type: "band", links: [["kneeL", "kneeR"]] }],
      frames: [
        P(SIDE, { hipR: [50, 0, 0], kneeR: 90, hipL: [50, 0, 0], kneeL: 90, shR: [175, 0, 0], elR: 70, shL: [60, 0, 0], elL: 30, neck: [0, 8, 0] }),
        P(SIDE, { hipR: [50, 0, 0], kneeR: 90, hipL: [50, 30, -38], kneeL: 90, shR: [175, 0, 0], elR: 70, shL: [60, 0, 0], elL: 30, neck: [0, 8, 0] }),
      ],
    },

    /* ================= ESPALDA ================= */
    "band-row": {
      ground: "all", anchor: "pelvis", cam: 80, props: [MAT(), { type: "band", links: [["handL", "toeL"], ["handR", "toeR"]] }],
      frames: [
        { hipL: [88, 4, 0], hipR: [88, 4, 0], kneeL: 4, kneeR: 4, ankleL: -10, ankleR: -10, spine: [8, 0, 0], shL: [72, 6, 0], shR: [72, 6, 0], elL: 0, elR: 0 },
        { hipL: [88, 4, 0], hipR: [88, 4, 0], kneeL: 4, kneeR: 4, ankleL: -10, ankleR: -10, spine: [-2, 0, 0], shL: [-18, 10, 0], shR: [-18, 10, 0], elL: 105, elR: 105, shPL: [0, -0.02], shPR: [0, -0.02] },
      ],
    },
    "db-row": {
      cam: 70, ik: { hands: "L", y: 0.5, pole: [0.3, -0.2, -1] }, props: [{ type: "chair", place: "seatAtHandL" }, { type: "dumbbellR" }],
      frames: [
        P(BENT_OVER, { shL: [72, 4, 0], elL: 0, shR: [50, 4, 0], elR: 0 }),
        P(BENT_OVER, { shL: [72, 4, 0], elL: 0, shR: [-5, 10, 0], elR: 95 }),
      ],
    },
    "bent-row": {
      cam: 70, props: [DB],
      frames: [
        P(BENT_OVER, { shL: [50, 4, 0], shR: [50, 4, 0], elL: 0, elR: 0 }),
        P(BENT_OVER, { shL: [-5, 12, 0], shR: [-5, 12, 0], elL: 95, elR: 95 }),
      ],
    },
    "pull-apart": {
      cam: 25, pitch: 15, props: [{ type: "band", links: [["handL", "handR"]] }],
      frames: [
        { shL: [90, 0, 0, 8], shR: [90, 0, 0, 8], elL: 4, elR: 4 },
        { shL: [90, 0, 0, 82], shR: [90, 0, 0, 82], elL: 4, elR: 4, shPL: [0, -0.02], shPR: [0, -0.02] },
      ],
    },
    "prone-extension": {
      ...LYING, cam: 80, props: [MAT()],
      frames: [
        P(PRONE, { shL: [0, 14, 0], shR: [0, 14, 0], elL: 0, elR: 0, ankleL: 60, ankleR: 60 }),
        P(PRONE, { spine: [-14, 0, 0], chest: [-12, 0, 0], neck: [-8, 0, 0], shL: [-12, 16, 0], shR: [-12, 16, 0], elL: 0, elR: 0, ankleL: 60, ankleR: 60 }),
      ],
    },
    "band-pulldown": {
      ...SEAT_OPTS, cam: 15, props: [{ type: "chair" }, { type: "band", links: [["handL", "handR"]] }],
      frames: [
        P(SEATED, { shL: [10, 155, 90], shR: [10, 155, 90], elL: 8, elR: 8 }),
        P(SEATED, { shL: [0, 85, 90], shR: [0, 85, 90], elL: 95, elR: 95 }),
      ],
    },
    "reverse-fly": {
      cam: 25, pitch: 20, props: [DB],
      frames: [
        P(BENT_OVER, { shL: [50, 0, 0], shR: [50, 0, 0], elL: 12, elR: 12 }),
        P(BENT_OVER, { shL: [15, 80, 0], shR: [15, 80, 0], elL: 12, elR: 12 }),
      ],
    },
    "shrug": {
      cam: 30, props: [DB],
      frames: [
        { shL: [0, 6, 0], shR: [0, 6, 0], elL: 0, elR: 0 },
        { shL: [0, 6, 0], shR: [0, 6, 0], elL: 0, elR: 0, shPL: [0.045, -0.01], shPR: [0.045, -0.01] },
      ],
      move: 0.7, hold: 0.4,
    },

    /* ================= PECHO ================= */
    "wall-pushup": {
      cam: 125, ik: { hands: "both", pole: [0.7, -0.6, -0.4] }, props: [{ type: "wall", place: "wallAtHands" }],
      frames: [
        { rot: [14, 0, 0], shL: [76, 8, 0, 12], shR: [76, 8, 0, 12], elL: 0, elR: 0, ankleL: -8, ankleR: -8 },
        { rot: [26, 0, 0], ankleL: 4, ankleR: 4 },
      ],
    },
    "knee-pushup": {
      ...LYING, anchor: "knees", cam: 75, ik: { hands: "both", pole: [0.8, 0.2, -0.6] }, props: [MAT()],
      frames: [
        { rot: [70, 0, 0], hipL: [0, 4, 0], hipR: [0, 4, 0], kneeL: 100, kneeR: 100, ankleL: 40, ankleR: 40, shL: [70, 12, 0], shR: [70, 12, 0], elL: 0, elR: 0, neck: [-15, 0, 0] },
        { rot: [84, 0, 0], hipL: [0, 4, 0], hipR: [0, 4, 0], kneeL: 100, kneeR: 100, ankleL: 40, ankleR: 40, neck: [-15, 0, 0] },
      ],
    },
    "floor-press": {
      ...LYING, props: [MAT(), DB],
      frames: [
        P(SUPINE, KNEES_BENT, { shL: [0, 55, 0], shR: [0, 55, 0], elL: 90, elR: 90 }),
        P(SUPINE, KNEES_BENT, { shL: [90, 4, 0], shR: [90, 4, 0], elL: 0, elR: 0 }),
      ],
    },
    "floor-fly": {
      ...LYING, cam: 40, pitch: 35, props: [MAT(), { type: "dumbbells", grip: "neutral" }],
      frames: [
        P(SUPINE, KNEES_BENT, { shL: [90, 0, 0, 72], shR: [90, 0, 0, 72], elL: 18, elR: 18 }),
        P(SUPINE, KNEES_BENT, { shL: [90, 0, 0, 6], shR: [90, 0, 0, 6], elL: 12, elR: 12 }),
      ],
    },
    "band-chest-press": {
      cam: 40, props: [{ type: "band", links: [["handL", "back"], ["back", "handR"]] }],
      frames: [
        { shL: [0, 78, 0], shR: [0, 78, 0], elL: 95, elR: 95 },
        { shL: [86, 0, 0, 10], shR: [86, 0, 0, 10], elL: 4, elR: 4 },
      ],
    },
    "chair-incline-pushup": {
      cam: 85, ik: { hands: "both", y: 0.5, pole: [0.8, 0, -0.6] }, props: [{ type: "chair", place: "seatAtHands" }],
      frames: [
        { rot: [52, 0, 0], shL: [58, 10, 0, 6], shR: [58, 10, 0, 6], elL: 0, elR: 0, ankleL: -20, ankleR: -20, neck: [-10, 0, 0] },
        { rot: [62, 0, 0], ankleL: -12, ankleR: -12, neck: [-10, 0, 0] },
      ],
    },

    /* ================= HOMBROS ================= */
    "db-shoulder-press": {
      ...SEAT_OPTS, cam: 20, props: [{ type: "chair" }, DB],
      frames: [
        P(SEATED, { shL: [6, 88, 90], shR: [6, 88, 90], elL: 95, elR: 95 }),
        P(SEATED, { shL: [6, 165, 90], shR: [6, 165, 90], elL: 12, elR: 12 }),
      ],
    },
    "lateral-raise": {
      cam: 10, props: [DB],
      frames: [
        { shL: [0, 10, 0], shR: [0, 10, 0], elL: 12, elR: 12 },
        { shL: [0, 84, 0], shR: [0, 84, 0], elL: 14, elR: 14 },
      ],
    },
    "front-raise": {
      cam: 65, props: [DB],
      frames: [
        { shL: [2, 6, 0], shR: [2, 6, 0], elL: 4, elR: 4 },
        { shL: [84, 6, 0], shR: [84, 6, 0], elL: 4, elR: 4 },
      ],
    },
    "scaption": {
      cam: 25, pitch: 14, props: [DB],
      frames: [
        { shL: [2, 6, 0, 30], shR: [2, 6, 0, 30], elL: 4, elR: 4 },
        { shL: [86, 0, 0, 32], shR: [86, 0, 0, 32], elL: 4, elR: 4 },
      ],
    },
    "band-external-rotation": {
      cam: 15, pitch: 30, props: [{ type: "band", links: [["handL", "handR"]] }],
      frames: [
        { shL: [0, 4, 0], shR: [0, 4, 0], elL: 90, elR: 90 },
        { shL: [0, 4, 55], shR: [0, 4, 55], elL: 90, elR: 90 },
      ],
    },
    "band-shoulder-press": {
      cam: 15, props: [ON_BAND],
      frames: [
        { hipL: [0, 6, 0], hipR: [0, 6, 0], shL: [6, 88, 90], shR: [6, 88, 90], elL: 95, elR: 95 },
        { hipL: [0, 6, 0], hipR: [0, 6, 0], shL: [6, 165, 90], shR: [6, 165, 90], elL: 12, elR: 12 },
      ],
    },
    "band-lateral-raise": {
      cam: 10, props: [ON_BAND],
      frames: [
        { hipL: [0, 6, 0], hipR: [0, 6, 0], shL: [0, 10, 0], shR: [0, 10, 0], elL: 10, elR: 10 },
        { hipL: [0, 6, 0], hipR: [0, 6, 0], shL: [0, 80, 0], shR: [0, 80, 0], elL: 12, elR: 12 },
      ],
    },

    /* ================= BRAZOS ================= */
    "biceps-curl": {
      cam: 55, props: [DB],
      frames: [{ shL: [0, 6, 0], shR: [0, 6, 0], elL: 4, elR: 4 }, { shL: [6, 6, 0], shR: [6, 6, 0], elL: 138, elR: 138 }],
    },
    "hammer-curl": {
      cam: 55, props: [{ type: "dumbbells", grip: "neutral" }],
      frames: [{ shL: [0, 6, 0], shR: [0, 6, 0], elL: 4, elR: 4 }, { shL: [6, 6, 0], shR: [6, 6, 0], elL: 138, elR: 138 }],
    },
    "seated-curl": {
      ...SEAT_OPTS, cam: 55, props: [{ type: "chair" }, DB],
      frames: [P(SEATED, { shL: [0, 12, 0], shR: [0, 12, 0], elL: 4, elR: 4 }), P(SEATED, { shL: [6, 12, 0], shR: [6, 12, 0], elL: 138, elR: 138 })],
    },
    "band-curl": {
      cam: 55, props: [ON_BAND],
      frames: [{ shL: [0, 6, 0], shR: [0, 6, 0], elL: 4, elR: 4 }, { shL: [6, 6, 0], shR: [6, 6, 0], elL: 135, elR: 135 }],
    },
    "overhead-triceps": {
      ...SEAT_OPTS, cam: 70, props: [{ type: "chair" }, { type: "single" }],
      frames: [
        P(SEATED, { shL: [172, -6, 0], shR: [172, -6, 0], elL: 14, elR: 14 }),
        P(SEATED, { shL: [176, -6, 0], shR: [176, -6, 0], elL: 125, elR: 125 }),
      ],
    },
    "triceps-kickback": {
      cam: 75, ik: { hands: "L", y: 0.5, pole: [0.3, -0.2, -1] }, props: [{ type: "chair", place: "seatAtHandL" }, { type: "dumbbellR" }],
      frames: [
        P(BENT_OVER, { shL: [72, 4, 0], elL: 0, shR: [-28, 6, 0], elR: 95 }),
        P(BENT_OVER, { shL: [72, 4, 0], elL: 0, shR: [-34, 6, 0], elR: 4 }),
      ],
    },
    "close-press": {
      ...LYING, props: [MAT(), { type: "dumbbells", grip: "neutral" }],
      frames: [
        P(SUPINE, KNEES_BENT, { shL: [10, 12, -80], shR: [10, 12, -80], elL: 120, elR: 120 }),
        P(SUPINE, KNEES_BENT, { shL: [90, 0, -80], shR: [90, 0, -80], elL: 0, elR: 0 }),
      ],
    },

    /* ================= ABDOMEN Y CORE ================= */
    "bird-dog": {
      ...LYING, anchor: "knees", cam: 70, props: [MAT()],
      frames: [
        P(FOUR),
        P(FOUR, { shL: [178, 4, 0], hipR: [0, 2, 0], kneeR: 4, ankleR: 30 }),
        P(FOUR, { shR: [178, 4, 0], hipL: [0, 2, 0], kneeL: 4, ankleL: 30 }),
      ],
      seq: [0, 1, 0, 2], hold: 0.7,
    },
    "dead-bug": {
      ...LYING, cam: 60, props: [MAT()],
      frames: [
        P(SUPINE, { hipL: [90, 6, 0], hipR: [90, 6, 0], kneeL: 90, kneeR: 90, ankleL: 10, ankleR: 10, shL: [90, 6, 0], shR: [90, 6, 0], elL: 0, elR: 0 }),
        P(SUPINE, { hipL: [90, 6, 0], hipR: [22, 6, 0], kneeL: 90, kneeR: 8, ankleL: 10, ankleR: 10, shL: [168, 6, 0], shR: [90, 6, 0], elL: 0, elR: 0 }),
        P(SUPINE, { hipL: [22, 6, 0], hipR: [90, 6, 0], kneeL: 8, kneeR: 90, ankleL: 10, ankleR: 10, shL: [90, 6, 0], shR: [168, 6, 0], elL: 0, elR: 0 }),
      ],
      seq: [0, 1, 0, 2], hold: 0.4,
    },
    "wall-plank": {
      cam: 125, props: [{ type: "wall", place: "wallAtHands" }],
      frames: [
        { rot: [24, 0, 0], shL: [58, 8, -70], shR: [58, 8, -70], elL: 100, elR: 100, ankleL: 0, ankleR: 0 },
        { rot: [25, 0, 0], shL: [59, 8, -70], shR: [59, 8, -70], elL: 102, elR: 102, ankleL: 1, ankleR: 1, chest: [1, 0, 0] },
      ],
      move: 1.6, hold: 0.2,
    },
    "knee-plank": {
      ...LYING, anchor: "knees", cam: 80, props: [MAT()],
      frames: [
        { rot: [80, 0, 0], hipL: [0, 4, 0], hipR: [0, 4, 0], kneeL: 95, kneeR: 95, ankleL: 40, ankleR: 40, shL: [80, 10, 0], shR: [80, 10, 0], elL: 90, elR: 90, neck: [-12, 0, 0] },
        { rot: [81, 0, 0], hipL: [0, 4, 0], hipR: [0, 4, 0], kneeL: 95, kneeR: 95, ankleL: 40, ankleR: 40, shL: [81, 10, 0], shR: [81, 10, 0], elL: 91, elR: 91, neck: [-12, 0, 0], chest: [1, 0, 0] },
      ],
      move: 1.6, hold: 0.2,
    },
    "crunch": {
      ...LYING, props: [MAT()],
      frames: [
        P(SUPINE, KNEES_BENT, { shL: [20, 6, 0], shR: [20, 6, 0], elL: 0, elR: 0 }),
        P(SUPINE, KNEES_BENT, { spine: [20, 0, 0], chest: [14, 0, 0], neck: [12, 0, 0], shL: [50, 6, 0], shR: [50, 6, 0], elL: 0, elR: 0 }),
      ],
    },
    "side-plank-knees": {
      ground: "all", anchor: "knees", lying: true, cam: 2, pitch: 15, props: [MAT(90)],
      frames: [
        P({ rot: [0, 0, 80], hipL: [-5, 0, 0], hipR: [-5, 0, 0], kneeL: 95, kneeR: 95, shR: [0, 80, 0], elR: 90, shL: [0, 4, 0], elL: 6 }),
        P({ rot: [0, 0, 66], hipL: [-5, 0, 0], hipR: [-5, 0, 0], kneeL: 95, kneeR: 95, shR: [0, 66, 0], elR: 90, shL: [0, 4, 0], elL: 6 }),
      ],
    },
    "seated-march": {
      ...SEAT_OPTS, cam: 65,
      frames: [
        P(SEATED, { shL: [0, 25, 0], shR: [0, 25, 0], elL: 10, elR: 10 }),
        P(SEATED, { hipL: [118, 6, 0], kneeL: 92, shL: [0, 25, 0], shR: [0, 25, 0], elL: 10, elR: 10 }),
        P(SEATED, { hipR: [118, 6, 0], kneeR: 92, shL: [0, 25, 0], shR: [0, 25, 0], elL: 10, elR: 10 }),
      ],
      seq: [0, 1, 0, 2], move: 0.7, hold: 0.2,
    },
    "heel-taps": {
      ...LYING, cam: 70, props: [MAT()],
      frames: [
        P(SUPINE, ARMS_FLOOR, { hipL: [90, 6, 0], hipR: [90, 6, 0], kneeL: 90, kneeR: 90, ankleL: 10, ankleR: 10 }),
        P(SUPINE, ARMS_FLOOR, { hipL: [40, 6, 0], hipR: [90, 6, 0], kneeL: 92, kneeR: 90, ankleL: 30, ankleR: 10 }),
        P(SUPINE, ARMS_FLOOR, { hipL: [90, 6, 0], hipR: [40, 6, 0], kneeL: 90, kneeR: 92, ankleL: 10, ankleR: 30 }),
      ],
      seq: [0, 1, 0, 2],
    },
    "seated-rotation": {
      ...SEAT_OPTS, cam: 20, props: [{ type: "chair" }, { type: "goblet" }],
      frames: [
        P(SEATED, { shL: [40, 0, 0, -30], shR: [40, 0, 0, -30], elL: 105, elR: 105 }),
        P(SEATED, { spine: [0, 0, 28], chest: [0, 0, 14], shL: [40, 0, 0, -30], shR: [40, 0, 0, -30], elL: 105, elR: 105 }),
        P(SEATED, { spine: [0, 0, -28], chest: [0, 0, -14], shL: [40, 0, 0, -30], shR: [40, 0, 0, -30], elL: 105, elR: 105 }),
      ],
      seq: [0, 1, 0, 2],
    },

    /* ================= EQUILIBRIO ================= */
    "single-leg": {
      props: [CHAIR_FRONT], ik: IK_CHAIR, anchor: "pelvis", cam: 55,
      frames: [P(HOLD), P(HOLD, { hipL: [18, 0, 0], kneeL: 70 })],
      move: 0.9, hold: 1.2,
    },
    "tandem-stance": {
      anchor: "pelvis", cam: 60,
      frames: [
        { hipL: [12, -6, 0], hipR: [-10, -6, 0], kneeL: 2, kneeR: 2, ankleL: -6, ankleR: 8, shL: [0, 40, 0], shR: [0, 40, 0], elL: 10, elR: 10 },
        { hipL: [12, -6, 0], hipR: [-10, -6, 0], kneeL: 2, kneeR: 2, ankleL: -6, ankleR: 8, shL: [0, 34, 0], shR: [0, 46, 0], elL: 10, elR: 10, spine: [0, 3, 0] },
      ],
      move: 1.4, hold: 0.3,
    },
    "weight-shift": {
      anchor: "feet", cam: 165, props: [CHAIR_FRONT], ik: IK_CHAIR,
      frames: [
        P(HOLD, { hipL: [0, 8, 0], hipR: [0, 8, 0] }),
        P(HOLD, { rot: [0, 0, 6], hipL: [0, 2, 0], hipR: [0, 18, 0], kneeR: 14, spine: [0, -6, 0] }),
        P(HOLD, { rot: [0, 0, -6], hipL: [0, 18, 0], hipR: [0, 2, 0], kneeL: 14, spine: [0, 6, 0] }),
      ],
      seq: [0, 1, 0, 2],
    },
    "clock-reach": {
      props: [{ type: "chair", pos: [-0.62, 0], rot: -90 }], anchor: "pelvis", cam: 30,
      frames: [
        { hipL: [16, 0, 0], kneeL: 45, shR: [4, 22, 0], elR: 6, shL: [90, 0, 0], elL: 0 },
        { hipL: [16, 0, 0], kneeL: 45, shR: [4, 22, 0], elR: 6, shL: [0, 90, 0], elL: 0 },
        { hipL: [16, 0, 0], kneeL: 45, shR: [4, 22, 0], elR: 6, shL: [-35, 20, 0], elL: 0, chest: [0, 0, 8] },
      ],
      seq: [0, 1, 2, 1], hold: 0.6,
    },
    "knee-lift-hold": {
      props: [CHAIR_FRONT], ik: IK_CHAIR, anchor: "pelvis", cam: 70,
      frames: [P(HOLD), P(HOLD, { hipL: [80, 0, 0], kneeL: 90 }), P(HOLD, { hipR: [80, 0, 0], kneeR: 90 })],
      seq: [0, 1, 0, 2], hold: 0.9,
    },
    "heel-toe-rock": {
      props: [CHAIR_FRONT], ik: IK_CHAIR, cam: 80,
      frames: [P(HOLD), P(HOLD, { ankleL: 28, ankleR: 28 }), P(HOLD, { ankleL: -22, ankleR: -22 })],
      seq: [0, 1, 0, 2], move: 0.8,
    },

    /* ================= MOVILIDAD Y ESTIRAMIENTOS ================= */
    "march": {
      anchor: "pelvis", cam: 60,
      frames: [
        {},
        { hipL: [60, 0, 0], kneeL: 75, shR: [35, 6, 0], shL: [-20, 6, 0], elR: 40, elL: 20 },
        { hipR: [60, 0, 0], kneeR: 75, shL: [35, 6, 0], shR: [-20, 6, 0], elL: 40, elR: 20 },
      ],
      seq: [0, 1, 0, 2], move: 0.45, hold: 0,
    },
    "shoulder-circles": {
      cam: 70,
      frames: [
        { shPL: [0, 0.03], shPR: [0, 0.03] },
        { shPL: [0.045, 0], shPR: [0.045, 0] },
        { shPL: [0, -0.035], shPR: [0, -0.035] },
        { shPL: [-0.015, 0], shPR: [-0.015, 0] },
      ],
      seq: [0, 1, 2, 3], move: 0.5, hold: 0,
    },
    "arm-circles": {
      cam: 20,
      frames: [
        { shL: [0, 90, 0], shR: [0, 90, 0], elL: 0, elR: 0 },
        { shL: [15, 100, 0], shR: [15, 100, 0], elL: 0, elR: 0 },
        { shL: [0, 110, 0], shR: [0, 110, 0], elL: 0, elR: 0 },
        { shL: [-15, 100, 0], shR: [-15, 100, 0], elL: 0, elR: 0 },
      ],
      seq: [0, 1, 2, 3], move: 0.35, hold: 0,
    },
    "hip-circles": {
      cam: 30,
      frames: [
        { rot: [0, 0, 8], spine: [0, -10, 0], hipL: [0, 4, 0], hipR: [0, 12, 0], shL: [0, 35, 0], shR: [0, 35, 0], elL: 100, elR: 100 },
        { rot: [8, 0, 0], spine: [-10, 0, 0], hipL: [8, 8, 0], hipR: [8, 8, 0], shL: [0, 35, 0], shR: [0, 35, 0], elL: 100, elR: 100 },
        { rot: [0, 0, -8], spine: [0, 10, 0], hipL: [0, 12, 0], hipR: [0, 4, 0], shL: [0, 35, 0], shR: [0, 35, 0], elL: 100, elR: 100 },
        { rot: [-8, 0, 0], spine: [10, 0, 0], hipL: [-8, 8, 0], hipR: [-8, 8, 0], shL: [0, 35, 0], shR: [0, 35, 0], elL: 100, elR: 100 },
      ],
      seq: [0, 1, 2, 3], move: 0.6, hold: 0,
    },
    "cat-cow": {
      ...LYING, anchor: "knees", cam: 85, ik: { hands: "both", pole: [0.2, 0, 1] }, props: [MAT()],
      frames: [
        P(FOUR, { rot: [76, 0, 0], hipL: [76, 2, 0], hipR: [76, 2, 0], spine: [16, 0, 0], chest: [12, 0, 0], neck: [30, 0, 0] }),
        P(FOUR, { rot: [100, 0, 0], hipL: [100, 2, 0], hipR: [100, 2, 0], spine: [-12, 0, 0], chest: [-8, 0, 0], neck: [-38, 0, 0] }),
      ],
      move: 1.4, hold: 0.5,
    },
    "seated-twist": {
      ...SEAT_OPTS, cam: 15,
      frames: [
        P(SEATED, { shL: [28, 0, 0, -55], shR: [28, 0, 0, -55], elL: 128, elR: 128 }),
        P(SEATED, { spine: [0, 0, 30], chest: [0, 0, 18], neck: [0, 0, 15], shL: [28, 0, 0, -55], shR: [28, 0, 0, -55], elL: 128, elR: 128 }),
        P(SEATED, { spine: [0, 0, -30], chest: [0, 0, -18], neck: [0, 0, -15], shL: [28, 0, 0, -55], shR: [28, 0, 0, -55], elL: 128, elR: 128 }),
      ],
      seq: [0, 1, 0, 2], hold: 0.6,
    },
    "hamstring-stretch": {
      ...SEAT_OPTS, cam: 80,
      frames: [
        P(SEATED, { hipL: [70, 4, 0], kneeL: 2, ankleL: -20, shL: [0, 8, 0], shR: [0, 8, 0], elL: 30, elR: 30 }),
        P(SEATED, { rot: [32, 0, 0], hipL: [102, 4, 0], hipR: [120, 6, 0], kneeL: 2, ankleL: -20, shL: [60, 8, 0], shR: [60, 8, 0], elL: 10, elR: 10 }),
      ],
      move: 1.5, hold: 1.2,
    },
    "quad-stretch": {
      props: [{ type: "chair", pos: [-0.62, 0], rot: -90 }], anchor: "pelvis", cam: 75,
      frames: [
        { shR: [4, 22, 0], elR: 6 },
        { shR: [4, 22, 0], elR: 6, hipL: [-12, 0, 0], kneeL: 140, ankleL: 30, shL: [-45, 10, 0], elL: 30 },
      ],
      move: 1.3, hold: 1.2,
    },
    "chest-stretch": {
      cam: 70,
      frames: [
        { shL: [0, 8, 0], shR: [0, 8, 0], elL: 6, elR: 6 },
        { shL: [-38, 14, 0, -20], shR: [-38, 14, 0, -20], elL: 6, elR: 6, chest: [-6, 0, 0], neck: [-6, 0, 0], shPL: [0, -0.02], shPR: [0, -0.02] },
      ],
      move: 1.3, hold: 1.2,
    },
    "child-pose": {
      ...LYING, anchor: "knees", cam: 75, props: [MAT()],
      frames: [
        P(FOUR),
        { rot: [115, 0, 0], hipL: [165, 8, 0], hipR: [165, 8, 0], kneeL: 140, kneeR: 140, ankleL: 70, ankleR: 70, shL: [200, 6, 0], shR: [200, 6, 0], elL: 0, elR: 0, spine: [8, 0, 0], neck: [6, 0, 0] },
      ],
      move: 1.6, hold: 1.4,
    },
    "neck-stretch": {
      ...SEAT_OPTS, cam: 10,
      frames: [P(SEATED, { shL: [0, 8, 0], shR: [0, 8, 0] }), P(SEATED, { neck: [0, 30, 0] }), P(SEATED, { neck: [0, -30, 0] })],
      seq: [0, 1, 0, 2], move: 1.2, hold: 1,
    },
    "ankle-circles": {
      ...SEAT_OPTS, cam: 80,
      frames: [
        P(SEATED, { hipL: [100, 6, 0], kneeL: 30, ankleL: 30, shL: [0, 25, 0], shR: [0, 25, 0], elL: 20, elR: 20 }),
        P(SEATED, { hipL: [100, 6, 0], kneeL: 30, ankleL: -25, shL: [0, 25, 0], shR: [0, 25, 0], elL: 20, elR: 20 }),
      ],
      move: 0.8, hold: 0.2,
    },
  };
})();
