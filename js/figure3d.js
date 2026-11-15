/* =========================================================
   Muñeco 3D animado (usa three.js, cargado bajo demanda)
   ---------------------------------------------------------
   Figure3D.mount(contenedor, idEjercicio) -> { destroy() }
   Las animaciones de cada ejercicio están en js/anims.js
   ========================================================= */
(function () {
  "use strict";
  const D = Math.PI / 180;

  /* ---------- Medidas del cuerpo (≈ metros) ---------- */
  const B = {
    hipW: 0.095, thigh: 0.42, shin: 0.41, footL: 0.2, ankleH: 0.06,
    spine: 0.2, chest: 0.26, neck: 0.06, headR: 0.105,
    shW: 0.175, shY: 0.23, upper: 0.28, fore: 0.25, hand: 0.07,
  };
  const COL = {
    skin: 0xF2C6A6, shirt: 0xE07A5F, pants: 0x3D4466, shoe: 0xF7F3EE, sole: 0x8C8C9A,
    hair: 0x7A5240, wood: 0xC99A6A, woodDark: 0xA87D52, metal: 0x50566E,
    band: 0x5FB38A, mat: 0x8CC5B3, wall: 0xEFE7DC, floor: 0xF3E9DD,
  };

  /* ---------- Pose neutra ---------- */
  const NEUTRAL = {
    pos: [0, 1, 0], rot: [0, 0, 0],
    spine: [0, 0, 0], chest: [0, 0, 0], neck: [0, 0, 0],
    hipL: [0, 0, 0], hipR: [0, 0, 0], kneeL: 0, kneeR: 0, ankleL: 0, ankleR: 0,
    shL: [0, 8, 0, 0], shR: [0, 8, 0, 0], elL: 6, elR: 6, wrL: 0, wrR: 0,
    shPL: [0, 0], shPR: [0, 0], // encoger hombros [arriba, adelante]
  };
  const KEYS = Object.keys(NEUTRAL);

  function mat(color, rough = 0.75) {
    return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.02 });
  }
  function capsule(r, len, color) {
    const g = new THREE.CapsuleGeometry(r, Math.max(0.001, len), 6, 14);
    const m = new THREE.Mesh(g, mat(color));
    return m;
  }
  /* segmento que cuelga hacia -Y desde el origen del padre */
  function limb(parent, r, len, color, r2) {
    const m = r2 ? taper(r, r2, len, color) : capsule(r, len - r * 0.4, color);
    m.position.y = -len / 2;
    parent.add(m);
    return m;
  }
  function taper(r1, r2, len, color) {
    const grp = new THREE.Group();
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, len, 16), mat(color));
    const s1 = new THREE.Mesh(new THREE.SphereGeometry(r1, 16, 12), mat(color)); s1.position.y = len / 2;
    const s2 = new THREE.Mesh(new THREE.SphereGeometry(r2, 16, 12), mat(color)); s2.position.y = -len / 2;
    grp.add(cyl, s1, s2);
    return grp;
  }
  function joint(parent, x, y, z, name, body) {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.rotation.order = "ZXY";
    parent.add(o);
    if (name) body.j[name] = o;
    return o;
  }
  function marker(parent, x, y, z, name, body, r = 0.05) {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    body.pts.push({ o, r, name });
    if (name) body.m[name] = o;
    return o;
  }

  /* ---------- Construcción del muñeco ---------- */
  function buildBody() {
    const body = { j: {}, m: {}, pts: [] };
    const root = new THREE.Group();
    root.rotation.order = "YXZ";
    body.root = root;

    // pelvis
    const pel = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), mat(COL.pants));
    pel.scale.set(0.15, 0.1, 0.105); pel.position.y = 0.01;
    root.add(pel);
    marker(root, 0, -0.05, 0, "pelvis", body, 0.1);
    marker(root, 0, -0.03, -0.08, "butt", body, 0.06);

    // columna y tronco
    const spine = joint(root, 0, 0.04, 0, "spine", body);
    const abd = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), mat(COL.shirt));
    abd.scale.set(0.135, 0.13, 0.095); abd.position.y = 0.1;
    spine.add(abd);
    const chest = joint(spine, 0, B.spine, 0, "chest", body);
    const torso = new THREE.Mesh(new THREE.SphereGeometry(1, 22, 16), mat(COL.shirt));
    torso.scale.set(0.175, 0.17, 0.11); torso.position.y = 0.11;
    chest.add(torso);
    marker(chest, 0, 0.12, -0.09, "back", body, 0.04);
    marker(chest, 0, 0.12, 0.09, "front", body, 0.04);
    marker(chest, 0, 0.12, 0.13, "chestFront", body, 0.01);
    // cuello y cabeza
    const neck = joint(chest, 0, B.chest, 0, "neck", body);
    const nk = capsule(0.045, 0.05, COL.skin); nk.position.y = 0.03; neck.add(nk);
    const head = new THREE.Mesh(new THREE.SphereGeometry(B.headR, 24, 18), mat(COL.skin));
    head.scale.set(0.95, 1.08, 1); head.position.y = 0.15;
    neck.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(B.headR * 1.04, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(COL.hair, 0.9));
    hair.position.set(0, 0.16, -0.008); hair.rotation.x = -0.22; neck.add(hair);
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), mat(COL.hair, 0.9));
    bun.position.set(0, 0.22, -0.09); neck.add(bun);
    // ojos y nariz para saber hacia dónde mira
    [-1, 1].forEach((s) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), mat(0x3a2a22));
      eye.position.set(0.036 * s, 0.165, 0.094); neck.add(eye);
    });
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), mat(0xE8B090));
    nose.position.set(0, 0.14, 0.104); neck.add(nose);
    marker(neck, 0, 0.15, 0, "head", body, B.headR);

    // brazos
    [["L", 1], ["R", -1]].forEach(([s, x]) => {
      const base = joint(chest, B.shW * x, B.shY, 0, "shBase" + s, body);
      const yawJ = joint(base, 0, 0, 0, "shYaw" + s, body);
      const sh = joint(yawJ, 0, 0, 0, "sh" + s, body);
      const shBall = new THREE.Mesh(new THREE.SphereGeometry(0.058, 16, 12), mat(COL.shirt));
      sh.add(shBall);
      limb(sh, 0.05, B.upper, COL.skin, 0.043);
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.056, 0.1, 16), mat(COL.shirt));
      sleeve.position.y = -0.04; sh.add(sleeve);
      marker(sh, 0, 0, 0, "shoulder" + s, body, 0.06);
      const el = joint(sh, 0, -B.upper, 0, "el" + s, body);
      marker(el, 0, 0, 0, "elbow" + s, body, 0.045);
      limb(el, 0.042, B.fore, COL.skin, 0.034);
      const wr = joint(el, 0, -B.fore, 0, "wr" + s, body);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), mat(COL.skin));
      hand.scale.set(0.03, 0.055, 0.042); hand.position.y = -0.045;
      wr.add(hand);
      marker(wr, 0, -0.05, 0, "hand" + s, body, 0.04);
    });

    // piernas
    [["L", 1], ["R", -1]].forEach(([s, x]) => {
      const hip = joint(root, B.hipW * x, -0.02, 0, "hip" + s, body);
      limb(hip, 0.072, B.thigh, COL.pants, 0.056);
      const kn = joint(hip, 0, -B.thigh, 0, "knee" + s, body);
      marker(kn, 0, 0, 0, "knee" + s, body, 0.055);
      limb(kn, 0.054, B.shin, COL.pants, 0.042);
      const an = joint(kn, 0, -B.shin, 0, "ankle" + s, body);
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.07, B.footL + 0.04), mat(COL.shoe, 0.6));
      shoe.position.set(0, -B.ankleH * 0.6, B.footL / 2 - 0.045);
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, B.footL + 0.05), mat(COL.sole));
      sole.position.set(0, -B.ankleH - 0.005, B.footL / 2 - 0.045);
      an.add(shoe, sole);
      marker(an, 0, -B.ankleH, -0.06, "heel" + s, body, 0.012);
      marker(an, 0, -B.ankleH, B.footL - 0.02, "toe" + s, body, 0.012);
      marker(an, 0, -B.ankleH * 0.3, B.footL * 0.4, "foot" + s, body, 0.02);
    });
    return body;
  }

  /* ---------- Aplicar una pose ---------- */
  function applyPose(body, p) {
    const j = body.j, r = body.root;
    r.position.set(p.pos[0], p.pos[1], p.pos[2]);
    r.rotation.set(p.rot[0] * D, p.rot[1] * D, p.rot[2] * D);
    // columna: [flexión, inclinación lateral, giro]
    j.spine.rotation.set(p.spine[0] * D, p.spine[2] * D, p.spine[1] * D);
    j.chest.rotation.set(p.chest[0] * D, p.chest[2] * D, p.chest[1] * D);
    j.neck.rotation.set(p.neck[0] * D, p.neck[2] * D, p.neck[1] * D);
    // caderas: [flexión, abducción, rotación]
    j.hipL.rotation.set(-p.hipL[0] * D, p.hipL[2] * D, p.hipL[1] * D);
    j.hipR.rotation.set(-p.hipR[0] * D, -p.hipR[2] * D, -p.hipR[1] * D);
    j.kneeL.rotation.set(p.kneeL * D, 0, 0);
    j.kneeR.rotation.set(p.kneeR * D, 0, 0);
    j.ankleL.rotation.set(p.ankleL * D, 0, 0);
    j.ankleR.rotation.set(p.ankleR * D, 0, 0);
    // hombros: [flexión, abducción, giro]
    j.shL.rotation.set(-p.shL[0] * D, p.shL[2] * D, p.shL[1] * D);
    j.shR.rotation.set(-p.shR[0] * D, -p.shR[2] * D, -p.shR[1] * D);
    j.shYawL.rotation.set(0, (p.shL[3] || 0) * D, 0);
    j.shYawR.rotation.set(0, -(p.shR[3] || 0) * D, 0);
    j.shBaseL.position.set(B.shW, B.shY + p.shPL[0], p.shPL[1]);
    j.shBaseR.position.set(-B.shW, B.shY + p.shPR[0], p.shPR[1]);
    j.elL.rotation.set(-p.elL * D, 0, 0);
    j.elR.rotation.set(-p.elR * D, 0, 0);
    j.wrL.rotation.set(-p.wrL * D, 0, 0);
    j.wrR.rotation.set(-p.wrR * D, 0, 0);
  }

  const tmpV = new THREE.Vector3();
  function wp(o) { return o.getWorldPosition(new THREE.Vector3()); }

  /* Ajusta la posición para que apoye en el suelo / la silla y no "patine" */
  function settle(body, anim, p) {
    const root = body.root;
    root.updateMatrixWorld(true);
    const m = body.m;
    // ancla horizontal
    const anchor = anim.anchor || "feet";
    let a = null;
    if (anchor === "feet") a = wp(m.heelL).add(wp(m.heelR)).add(wp(m.toeL)).add(wp(m.toeR)).multiplyScalar(0.25);
    else if (anchor === "footL") a = wp(m.heelL).add(wp(m.toeL)).multiplyScalar(0.5);
    else if (anchor === "footR") a = wp(m.heelR).add(wp(m.toeR)).multiplyScalar(0.5);
    else if (anchor === "knees") a = wp(m.kneeL).add(wp(m.kneeR)).multiplyScalar(0.5);
    else if (anchor === "hands") a = wp(m.handL).add(wp(m.handR)).multiplyScalar(0.5);
    else if (anchor === "pelvis") a = wp(m.pelvis);
    if (a) {
      const at = anim.at || [0, 0];
      root.position.x += at[0] - a.x;
      root.position.z += at[1] - a.z;
    }
    // apoyo vertical
    const g = anim.ground || "feet";
    if (g === "none") { root.updateMatrixWorld(true); return; }
    root.updateMatrixWorld(true);
    let pts;
    if (g === "feet") pts = body.pts.filter((q) => /^(heel|toe)/.test(q.name));
    else if (g === "seat") {
      const y = wp(m.butt).y - 0.06;
      root.position.y += (anim.seatH || 0.46) - y;
      root.updateMatrixWorld(true);
      return;
    } else pts = body.pts;
    let min = Infinity;
    pts.forEach((q) => { const y = q.o.getWorldPosition(tmpV).y - q.r; if (y < min) min = y; });
    root.position.y += (anim.floorY || 0) - min;
    root.updateMatrixWorld(true);
  }

  /* ---------- Cinemática inversa de brazos (manos fijas) ---------- */
  const _q = new THREE.Quaternion(), _m = new THREE.Matrix4();
  function solveArm(body, side, target, pole) {
    const sh = body.j["sh" + side], el = body.j["el" + side];
    const S = sh.getWorldPosition(new THREE.Vector3());
    const a = B.upper, b = B.fore + 0.05;
    const st = new THREE.Vector3().subVectors(target, S);
    const dist = Math.min(Math.max(st.length(), 0.05), a + b - 0.002);
    const u = st.normalize();
    const cosA = (a * a + dist * dist - b * b) / (2 * a * dist);
    const A = Math.acos(Math.min(1, Math.max(-1, cosA)));
    const pl = new THREE.Vector3(...pole);
    if (side === "R") pl.x = -pl.x;
    const perp = pl.sub(u.clone().multiplyScalar(pl.dot(u)));
    if (perp.lengthSq() < 1e-6) perp.set(0, 0, -1);
    perp.normalize();
    const d1 = u.clone().multiplyScalar(Math.cos(A)).addScaledVector(perp, Math.sin(A)).normalize();
    const E = S.clone().addScaledVector(d1, a);
    const d2 = new THREE.Vector3().subVectors(S.clone().addScaledVector(u, dist), E).normalize();
    // ejes del brazo: Y = -d1 ; Z = hacia donde se dobla el antebrazo
    const Y = d1.clone().negate();
    let Z = d2.clone().sub(d1.clone().multiplyScalar(d2.dot(d1)));
    if (Z.lengthSq() < 1e-6) Z = perp.clone();
    Z.normalize();
    const X = new THREE.Vector3().crossVectors(Y, Z).normalize();
    _m.makeBasis(X, Y, Z);
    const qw = new THREE.Quaternion().setFromRotationMatrix(_m);
    sh.parent.getWorldQuaternion(_q);
    sh.quaternion.copy(_q.invert().multiply(qw));
    const flex = Math.acos(Math.min(1, Math.max(-1, d1.dot(d2))));
    el.rotation.set(-flex, 0, 0);
    sh.updateMatrixWorld(true);
  }

  /* ---------- Accesorios ---------- */
  function buildChair(color = COL.wood) {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.44), mat(color, 0.6));
    seat.position.y = 0.435; g.add(seat);
    [[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.04), mat(COL.woodDark, 0.6));
      leg.position.set(x, 0.21, z); g.add(leg);
    });
    [-0.2, 0.2].forEach((x) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.48, 0.04), mat(COL.woodDark, 0.6));
      post.position.set(x, 0.68, -0.2); g.add(post);
    });
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.03), mat(color, 0.6));
    back.position.set(0, 0.84, -0.2); g.add(back);
    return g;
  }
  function buildDumbbell() {
    const g = new THREE.Group();
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 10), mat(0x9AA0B4, 0.4));
    bar.rotation.z = Math.PI / 2; g.add(bar);
    [-1, 1].forEach((s) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 6), mat(COL.metal, 0.5));
      w.rotation.z = Math.PI / 2; w.position.x = 0.085 * s; g.add(w);
    });
    return g;
  }
  function buildMat(len = 1.8) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.012, len), mat(COL.mat, 0.95));
    m.position.y = 0.006;
    return m;
  }
  function buildWall() {
    const m = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 0.06), mat(COL.wall, 0.95));
    m.position.y = 1.1;
    return m;
  }
  function bandMesh() {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8), mat(COL.band, 0.6));
    m.userData.band = true;
    return m;
  }
  const UP = new THREE.Vector3(0, 1, 0);
  function placeBand(mesh, a, b) {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = Math.max(0.001, d.length());
    mesh.position.copy(a).addScaledVector(d, 0.5);
    mesh.scale.set(1, len, 1);
    mesh.quaternion.setFromUnitVectors(UP, d.normalize());
  }

  /* ---------- Interpolación ---------- */
  const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
  function fullPose(partial) {
    const p = {};
    KEYS.forEach((k) => {
      const v = partial[k] !== undefined ? partial[k] : NEUTRAL[k];
      p[k] = Array.isArray(v) ? NEUTRAL[k].map((d, i) => (v[i] !== undefined ? v[i] : d)) : v;
    });
    return p;
  }
  function lerpPose(a, b, t) {
    const p = {};
    KEYS.forEach((k) => {
      p[k] = Array.isArray(a[k]) ? a[k].map((v, i) => v + (b[k][i] - v) * t) : a[k] + (b[k] - a[k]) * t;
    });
    return p;
  }

  /* ---------- Montaje de la escena ---------- */
  let active = []; // instancias vivas

  function mount(container, exId, opts = {}) {
    const anim = (window.ANIMS || {})[exId];
    if (!anim || !window.THREE) return null;

    const W = () => container.clientWidth || 300, H = () => container.clientHeight || 260;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W(), H());
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, W() / H(), 0.05, 50);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xE8D8C8, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(2, 4, 3); scene.add(sun);
    const fill = new THREE.DirectionalLight(0xFFE8D8, 0.6);
    fill.position.set(-3, 2, -2); scene.add(fill);

    const stage = new THREE.Group();
    scene.add(stage);

    // suelo
    const floor = new THREE.Mesh(new THREE.CircleGeometry(3, 64), new THREE.MeshStandardMaterial({ color: COL.floor, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.001;
    stage.add(floor);
    // sombra suave
    const sc = document.createElement("canvas"); sc.width = sc.height = 128;
    const cx = sc.getContext("2d");
    const grd = cx.createRadialGradient(64, 64, 4, 64, 64, 64);
    grd.addColorStop(0, "rgba(60,40,30,.32)"); grd.addColorStop(1, "rgba(60,40,30,0)");
    cx.fillStyle = grd; cx.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002;
    stage.add(shadow);

    const body = buildBody();
    stage.add(body.root);

    const frames = anim.frames.map(fullPose);
    const seq0 = (anim.seq || frames.map((_, i) => i))[0];
    // posición de las manos en el primer fotograma (para manos fijas y colocar accesorios)
    applyPose(body, frames[seq0]); settle(body, anim, null);
    const hand0 = { L: wp(body.m.handL), R: wp(body.m.handR) };
    const ik = anim.ik ? { sides: anim.ik.hands === "L" ? ["L"] : anim.ik.hands === "R" ? ["R"] : ["L", "R"], pole: anim.ik.pole || [0.5, -0.4, -1], t: {} } : null;
    if (ik) ik.sides.forEach((sd) => { ik.t[sd] = hand0[sd].clone(); if (anim.ik.y !== undefined) ik.t[sd].y = anim.ik.y; });
    const handsMid = hand0.L.clone().add(hand0.R).multiplyScalar(0.5);

    // accesorios
    const bands = [];
    (anim.props || []).forEach((pr) => {
      const t = typeof pr === "string" ? { type: pr } : pr;
      let o = null;
      if (t.type === "chair") o = buildChair();
      else if (t.type === "mat") o = buildMat(t.len);
      else if (t.type === "wall") o = buildWall();
      else if (t.type === "dumbbells" || t.type === "dumbbellL" || t.type === "dumbbellR") {
        const sides = t.type === "dumbbells" ? ["L", "R"] : [t.type.slice(-1)];
        sides.forEach((s) => {
          const db = buildDumbbell();
          db.position.set(0, -0.055, 0);
          if (t.grip === "neutral") db.rotation.y = Math.PI / 2;
          body.j["wr" + s].add(db);
        });
      } else if (t.type === "goblet") {          // una mancuerna vertical pegada al pecho
        const db = buildDumbbell(); db.rotation.z = Math.PI / 2;
        db.position.set(0, t.y ?? 0.04, t.z ?? 0.2);
        body.j.chest.add(db);
      } else if (t.type === "single") {          // una mancuerna vertical sujeta con las dos manos
        const db = buildDumbbell(); db.rotation.z = Math.PI / 2;
        db.position.set(-0.08, -0.07, 0);
        body.j.wrR.add(db);
      } else if (t.type === "band") {
        (t.links || []).forEach((lk) => { const m = bandMesh(); stage.add(m); bands.push({ m, lk }); });
      }
      if (o) {
        o.position.x = t.pos?.[0] || 0; o.position.z = t.pos?.[1] || 0; if (t.y !== undefined) o.position.y = t.y;
        o.rotation.y = (t.rot || 0) * D;
        // colocar respecto a las manos del primer fotograma
        if (t.place === "wallAtHands") o.position.z = handsMid.z + 0.065;
        if (t.place === "backAtHands") { o.rotation.y = 0; o.position.set(handsMid.x, 0, handsMid.z + 0.2); }
        if (t.place === "seatAtHands") { o.rotation.y = Math.PI; o.position.set(handsMid.x, 0, handsMid.z + 0.08); }
        if (t.place === "seatAtHandL") { o.rotation.y = Math.PI; o.position.set(hand0.L.x - 0.05, 0, hand0.L.z + 0.06); }
        stage.add(o);
      }
    });

    // tiempos: [mover, mantener] por fotograma
    const moveT = anim.move || 1.1, holdT = anim.hold ?? 0.35;
    const seq = anim.seq || frames.map((_, i) => i);
    const cycle = seq.length;
    const segT = moveT + holdT;

    function pointFor(lk) {
      if (Array.isArray(lk)) return new THREE.Vector3(lk[0], lk[1], lk[2]);
      return body.m[lk].getWorldPosition(new THREE.Vector3());
    }

    function poseAt(time) {
      const total = cycle * segT;
      let t = ((time % total) + total) % total;
      const i = Math.floor(t / segT);
      const local = t - i * segT;
      const a = frames[seq[i]], b = frames[seq[(i + 1) % cycle]];
      const k = local < holdT ? 0 : ease(Math.min(1, (local - holdT) / moveT));
      return lerpPose(a, b, k);
    }
    function update(time) {
      applyPose(body, poseAt(time));
      settle(body, anim, null);
      if (ik) ik.sides.forEach((sd) => solveArm(body, sd, ik.t[sd], ik.pole));
      const pel = body.m.pelvis.getWorldPosition(new THREE.Vector3());
      const s = Math.max(0.6, 1.1 - pel.y * 0.2);
      shadow.position.set(pel.x, 0.002, pel.z); shadow.scale.set(s * 1.1, s * (anim.lying ? 2 : 1.1), 1);
      bands.forEach(({ m, lk }) => placeBand(m, pointFor(lk[0]), pointFor(lk[1])));
    }

    // encuadre: mide la figura en todos los fotogramas
    const box = new THREE.Box3();
    for (let i = 0; i < cycle; i++) {
      applyPose(body, frames[seq[i]]); settle(body, anim, null);
      body.pts.forEach((q) => box.expandByPoint(q.o.getWorldPosition(new THREE.Vector3())));
    }
    stage.children.forEach((c) => { if (c !== floor && c !== shadow && c !== body.root && !c.userData.band) box.expandByObject(c); });
    box.min.y = Math.min(box.min.y, 0);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const camYaw = (anim.cam ?? 35) * D;   // 0 = de frente, 90 = de lado
    const camPitch = (anim.pitch ?? 12) * D;
    let yaw = camYaw;
    function placeCamera() {
      const aspect = W() / H();
      const fit = Math.max(size.y, Math.max(size.x, size.z) / aspect) * 0.56 + 0.18;
      const dist = fit / Math.tan((camera.fov * D) / 2);
      camera.position.set(center.x + Math.sin(yaw) * Math.cos(camPitch) * dist, center.y + Math.sin(camPitch) * dist, center.z + Math.cos(yaw) * Math.cos(camPitch) * dist);
      camera.lookAt(center);
    }
    placeCamera();

    // girar arrastrando
    let drag = null;
    const el = renderer.domElement;
    el.style.touchAction = "pan-y";
    el.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, yaw }; el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", (e) => { if (!drag) return; yaw = drag.yaw - (e.clientX - drag.x) * 0.012; placeCamera(); });
    const endDrag = () => (drag = null);
    el.addEventListener("pointerup", endDrag); el.addEventListener("pointercancel", endDrag);

    const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); placeCamera(); });
    ro.observe(container);

    let raf = 0, last = performance.now(), simT = opts.time || 0, paused = false, visible = true;
    let speed = opts.speed || 1;
    function loop(now) {
      raf = requestAnimationFrame(loop);
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000)); last = now;
      if (paused || !visible) return;
      simT += dt * speed;
      update(simT);
      renderer.render(scene, camera);
    }
    const io = new IntersectionObserver((ents) => { visible = ents[0].isIntersecting; });
    io.observe(container);
    // primer fotograma inmediato
    update(opts.time || 0); renderer.render(scene, camera);
    if (!opts.still) raf = requestAnimationFrame(loop);

    const inst = {
      destroy() {
        cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
        scene.traverse((o) => { o.geometry?.dispose(); if (o.material) { o.material.map?.dispose(); o.material.dispose(); } });
        renderer.dispose(); renderer.forceContextLoss?.();
        el.remove();
        active = active.filter((x) => x !== inst);
      },
      pause(v = true) { paused = v; },
      setSpeed(v) { speed = v; },
      container,
      renderAt(time) { update(time); renderer.render(scene, camera); },
    };
    active.push(inst);
    return inst;
  }

  // Limpia instancias cuyo contenedor ya no está en la página
  function sweep() { active.slice().forEach((i) => { if (!document.body.contains(i.container)) i.destroy(); }); }

  window.Figure3D = { mount, sweep, has: (id) => !!(window.ANIMS || {})[id] };
})();
