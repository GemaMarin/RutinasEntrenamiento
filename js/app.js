/* =========================================================
   Mi Gimnasio en Casa — lógica de la aplicación
   Sin dependencias. Los datos se guardan en el propio
   navegador (localStorage).
   ========================================================= */
(() => {
  "use strict";

  /* ---------------- Utilidades ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const pad = (n) => String(n).padStart(2, "0");
  const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const localStamp = (d = new Date()) => `${dateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const fmtSecs = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${pad(s % 60)}` : String(s));
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const CHEV = `<svg class="chev" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>`;
  const DAYS_SHORT = ["L", "M", "X", "J", "V", "S", "D"];
  const FEELINGS = [
    { e: "😫", t: "Muy duro" }, { e: "😓", t: "Duro" }, { e: "🙂", t: "Bien" },
    { e: "😄", t: "Genial" }, { e: "🤩", t: "¡Increíble!" },
  ];
  const TIPS = [
    "Calienta siempre 3–5 minutos antes de empezar.",
    "Respira: suelta el aire al hacer el esfuerzo, no lo aguantes.",
    "Mejor despacio y bien que rápido y mal.",
    "Si algo duele (dolor agudo, no cansancio), para y prueba otro ejercicio.",
    "Bebe agua antes, durante y después.",
    "Las agujetas leves son normales los primeros días. ¡Señal de que el cuerpo se adapta!",
    "Cuando 12 repeticiones te resulten fáciles, sube un poco el peso o usa una banda más dura.",
    "Caminar cada día es el mejor complemento a estas rutinas.",
    "Ten una silla cerca para apoyarte en los ejercicios de equilibrio.",
    "Esfuerzo adecuado: deberías poder hablar, pero no cantar.",
    "La constancia gana: 3 días de 20 minutos valen más que un día de una hora.",
  ];

  /* ---------------- Almacenamiento ---------------- */
  const KEY = "mi-gimnasio.v1";
  const DEFAULTS = {
    settings: { name: "", size: "m", voice: true, sound: true, goal: 3, onboarded: false },
    sessions: [], custom: [], videos: {},
  };
  let db = load();
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d && typeof d === "object") {
        // quita de las rutinas propias ejercicios que ya no existan
        (d.custom || []).forEach((c) => { c.items = (c.items || []).filter(([id]) => EX[id]); });
        return { ...JSON.parse(JSON.stringify(DEFAULTS)), ...d, settings: { ...DEFAULTS.settings, ...(d.settings || {}) } };
      }
    } catch (e) { /* datos corruptos o almacenamiento bloqueado */ }
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { toast("⚠️ No se ha podido guardar en este navegador"); }
  }

  /* ---------------- Datos derivados ---------------- */
  const allRoutines = () => [...ROUTINES, ...db.custom];
  const getRoutine = (id) => allRoutines().find((r) => r.id === id);
  const videoOf = (ex) => db.videos[ex.id] || ex.video || "";
  function amountText(ex, amt, short = false) {
    const side = ex.side ? (short ? " /lado" : " con cada lado") : "";
    if (ex.type === "time") return short ? `${fmtSecs(amt)} s${side}` : `${amt} segundos${side}`;
    return short ? `${amt} rep.${side}` : `${amt} repeticiones${side}`;
  }
  function restFor(r, ex) { return ex.zone === "movilidad" ? 10 : r.rest || 40; }
  function estimate(r) {
    let s = 0;
    r.items.forEach(([id, sets, amt]) => {
      const ex = EX[id]; if (!ex) return;
      const per = ex.type === "time" ? amt : amt * 4;
      s += sets * per * (ex.side ? 2 : 1) + sets * restFor(r, ex);
    });
    return Math.max(3, Math.round(s / 60));
  }
  function routineEquip(r) {
    const set = new Set();
    r.items.forEach(([id]) => (EX[id]?.equip || []).forEach((e) => e !== "cuerpo" && set.add(e)));
    return [...set];
  }
  function routineLevel(r) {
    if (r.level) return r.level;
    const lv = r.items.map(([id]) => EX[id]?.level || 1);
    return Math.round(lv.reduce((a, b) => a + b, 0) / (lv.length || 1));
  }
  const levelDots = (n) => `<span class="level-dots" title="Nivel: ${LEVELS[n]}">${[1, 2, 3].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span> ${LEVELS[n]}`;
  const sessionsOn = (key) => db.sessions.filter((s) => s.date.slice(0, 10) === key);
  function weekStart(d = new Date()) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function sessionsThisWeek() {
    const ws = weekStart(); const we = new Date(ws); we.setDate(ws.getDate() + 7);
    return db.sessions.filter((s) => { const d = parseKey(s.date.slice(0, 10)); return d >= ws && d < we; });
  }
  function weekStreak() {
    const weeks = new Set(db.sessions.map((s) => dateKey(weekStart(parseKey(s.date.slice(0, 10))))));
    let w = weekStart(); let n = 0;
    if (!weeks.has(dateKey(w))) w.setDate(w.getDate() - 7);
    while (weeks.has(dateKey(w))) { n++; w.setDate(w.getDate() - 7); }
    return n;
  }

  /* ---------------- Muñeco 3D (carga bajo demanda) ---------------- */
  let threeP = null, figSlow = false;
  function load3D() {
    if (threeP) return threeP;
    const add = (src) => new Promise((res, rej) => {
      const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
    threeP = add("vendor/three.min.js").then(() => add("js/anims.js")).then(() => add("js/figure3d.js"))
      .catch((e) => { threeP = null; throw e; });
    return threeP;
  }
  /* Monta el muñeco en los contenedores .fig3d[data-ex] que aún no lo tengan */
  function mountFigures(root = document) {
    const els = $$(".fig3d:not([data-mounted])", root);
    if (!els.length) return;
    els.forEach((el) => (el.dataset.mounted = "1"));
    load3D().then(() => {
      els.forEach((el) => {
        if (!el.isConnected) return;
        const inst = window.Figure3D.mount(el, el.dataset.ex, { speed: figSlow ? 0.5 : 1 });
        if (inst) { el._inst = inst; el.classList.add("ready"); } else el.classList.add("fail");
      });
    }).catch(() => els.forEach((el) => el.classList.add("fail")));
  }
  const miniSrc = (id) => `img/mini/${id}.webp`;
  const mini = (id, cls = "mini") => `<img class="${cls}" src="${miniSrc(id)}" alt="" loading="lazy" decoding="async">`;
  const figBox = (id, cls = "") => `<div class="fig3d ${cls}" data-ex="${esc(id)}">${mini(id, "fig-ph")}</div>`;
  const catOf = (id) => CATEGORIES.find((c) => c.id === id);
  const withWarmup = (r) => (r.cat && r.cat !== "movilidad" && db.settings.warmup !== false
    ? { ...r, items: [...WARMUP, ...r.items], warm: WARMUP.length } : r);

  /* ---------------- Plantillas comunes ---------------- */
  function routineCard(r) {
    const thumbs = r.items.slice(0, 5).map(([id]) => `<span class="th">${mini(id)}</span>`).join("");
    return `<a class="routine-card" href="#/rutina/${esc(r.id)}" style="--c:${esc(r.color || "#C4553A")}">
      <div class="rc-top"><div class="grow">
        <h3>${esc(r.name)}</h3>
        ${r.desc ? `<p>${esc(r.desc)}</p>` : ""}
        <div class="meta"><span>⏱ ${estimate(withWarmup(r))} min</span><span>${r.items.length} ejercicios</span><span>${levelDots(routineLevel(r))}</span></div>
      </div>${CHEV}</div>
      <div class="thumbs">${thumbs}</div></a>`;
  }
  function exItem(ex, { right = "", href = true, num = "" } = {}) {
    const z = ZONES[ex.zone];
    const inner = `${num ? `<span class="num">${num}</span>` : ""}
      <div class="tile pic" style="--c:${z.color}">${mini(ex.id)}</div>
      <div class="grow"><h4>${esc(ex.name)}</h4><div class="sub">${right || `${ex.equip.map((e) => EQUIP[e].emoji).join(" ")} ${esc(EQUIP[ex.equip[0]].name)} · ${LEVELS[ex.level]}`}</div></div>`;
    return href
      ? `<a class="ex-item" href="#/ejercicio/${ex.id}">${inner}${CHEV}</a>`
      : `<div class="ex-item">${inner}</div>`;
  }
  function viewerBlock(ex) {
    const hasPhoto = PHOTOS.has(ex.id);
    return `<div class="viewer">
      ${hasPhoto ? `<div class="seg viewer-tabs"><button class="on" data-act="vt" data-v="3d">🧍‍♀️ Muñeco 3D</button><button data-act="vt" data-v="foto">📷 Fotos reales</button></div>` : ""}
      ${figBox(ex.id, "big")}
      ${hasPhoto ? `<div class="photo-anim" hidden><img src="img/fotos/${ex.id}-0.jpg" alt="Posición inicial"><img class="b" src="img/fotos/${ex.id}-1.jpg" alt="Posición final"></div>` : ""}
      <div class="viewer-ctrl"><span class="small muted" data-hint>👆 Arrastra para girar el muñeco</span>
        <button class="btn ghost small" data-act="slow">${figSlow ? "🐇 Velocidad normal" : "🐢 Más despacio"}</button></div>
    </div>`;
  }
  function videoBlock(ex) {
    const vid = videoOf(ex);
    if (vid) {
      return `<div class="video-box"><iframe src="https://www.youtube-nocookie.com/embed/${esc(vid)}?rel=0&modestbranding=1" title="Vídeo: ${esc(ex.name)}" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>
        <button class="link-btn small" data-act="set-video" data-id="${ex.id}">Cambiar o quitar el vídeo</button>`;
    }
    const url = "https://www.youtube.com/results?search_query=" + encodeURIComponent(ex.yt || ex.name);
    return `<a class="video-btn" href="${url}" target="_blank" rel="noopener">
        <span class="play"><svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg></span>
        <span><strong>Ver vídeos en YouTube</strong><span>Tutoriales de este ejercicio</span></span>
      </a>
      <button class="link-btn small" data-act="set-video" data-id="${ex.id}">¿Te gusta un vídeo concreto? Guárdalo aquí</button>`;
  }
  function howToHTML(ex) {
    return `<ol class="steps">${ex.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
      ${ex.tips?.length ? `<div class="callout tip"><span class="ic">💡</span><div>${ex.tips.length > 1 ? `<ul>${ex.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : `<p>${esc(ex.tips[0])}</p>`}</div></div>` : ""}
      ${ex.caution ? `<div class="callout warn"><span class="ic">⚠️</span><p>${esc(ex.caution)}</p></div>` : ""}`;
  }
  function weekNumber(d = new Date()) { return Math.floor((weekStart(d) - new Date(2024, 0, 1)) / (7 * 864e5)); }
  function suggestedRoutine(catId, d = new Date()) {
    const list = ROUTINES.filter((r) => r.cat === catId && r.level < 3);
    return list.length ? list[weekNumber(d) % list.length] : null;
  }

  /* =========================================================
     VISTAS
     ========================================================= */
  function viewHome() {
    const now = new Date();
    const h = now.getHours();
    const hi = h < 14 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches";
    const name = db.settings.name ? `, ${esc(db.settings.name)}` : "";
    const today = dateKey(now);
    const doneToday = sessionsOn(today).length > 0;
    const planCat = WEEK_PLAN[now.getDay()];
    const planned = planCat ? suggestedRoutine(planCat, now) : null;
    const dateStr = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    const dateNice = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    let hero;
    if (doneToday) {
      const relax = suggestedRoutine("movilidad", now);
      hero = `<div class="hero rest"><div class="eyebrow">Hoy</div><h2>¡Hecho por hoy! 🎉</h2>
        <p>Muy bien${name}. Descansa, bebe agua y, si te apetece, sal a dar un paseo.</p>
        <a class="btn white" href="#/rutina/${relax.id}">🧘‍♀️ Unos estiramientos suaves</a></div>`;
    } else if (planned) {
      const c = catOf(planned.cat);
      hero = `<div class="hero"><div class="eyebrow">Te propongo para hoy · ${esc(c.name)}</div>
        <h2>${esc(c.emoji)} ${esc(planned.name)}</h2>
        <div class="hero-thumbs">${planned.items.map(([id]) => `<span>${mini(id)}</span>`).join("")}</div>
        <p>⏱ Unos ${estimate(withWarmup(planned))} minutos · ${planned.items.length} ejercicios</p>
        <div class="row"><button class="btn white" data-act="start" data-id="${planned.id}">▶ Empezar ahora</button>
        <a class="btn soft small" style="background:rgba(255,255,255,.18);color:#fff" href="#/categoria/${c.id}">Otra de ${esc(c.name.toLowerCase())}</a></div></div>`;
    } else {
      hero = `<div class="hero rest"><div class="eyebrow">Hoy toca</div><h2>Descanso activo 🚶‍♀️</h2>
        <p>Un paseo de 30 minutos es perfecto. Cuando vuelvas, apúntalo en tu diario.</p>
        <button class="btn white" data-act="add-manual">✍️ Apuntar una actividad</button></div>`;
    }

    const ws = weekStart();
    const week = DAYS_SHORT.map((d, i) => {
      const day = new Date(ws); day.setDate(ws.getDate() + i);
      const k = dateKey(day);
      const done = sessionsOn(k).length > 0;
      return `<div class="day ${done ? "done" : ""} ${k === today ? "today" : ""}"><div class="dot">✓</div>${d}</div>`;
    }).join("");
    const nWeek = sessionsThisWeek().length;
    const goal = db.settings.goal;
    const pct = Math.min(100, Math.round((nWeek / goal) * 100));
    const goalMsg = nWeek >= goal ? "¡Objetivo cumplido! 🏆" : nWeek === 0 ? "¡Vamos a por la primera!" : `Te ${goal - nWeek === 1 ? "falta 1 sesión" : `faltan ${goal - nWeek} sesiones`}`;

    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5);
    const tip = TIPS[dayOfYear % TIPS.length];
    const last = [...db.sessions].sort((a, b) => b.date.localeCompare(a.date))[0];

    return {
      title: "Mi Gimnasio",
      html: `
        <div class="greeting"><h2>${hi}${name} 👋</h2><p>${esc(dateNice)}</p></div>
        ${hero}
        <div class="section card">
          <div class="goal-line"><strong>Esta semana</strong><span class="muted small">${nWeek} de ${goal} sesiones</span></div>
          <div class="progress"><span style="width:${pct}%"></span></div>
          <div class="week">${week}</div>
          <p class="small muted center" style="margin:12px 0 0">${goalMsg}</p>
        </div>
        <div class="section">
          <h3 class="section-title">¿Qué te apetece trabajar hoy?</h3>
          ${categoryGrid()}
        </div>
        <div class="section callout tip"><span class="ic">💡</span><p><strong>Consejo del día:</strong> ${esc(tip)}</p></div>
        ${last ? `<div class="section"><h3 class="section-title">Tu última sesión <a href="#/historial">Diario</a></h3>${logItem(last, false)}</div>` : ""}
      `,
    };
  }

  function categoryGrid() {
    return `<div class="cat-grid">${CATEGORIES.map((c) => {
      const n = ROUTINES.filter((r) => r.cat === c.id).length;
      return `<a class="cat" href="#/categoria/${c.id}" style="--c:${c.color}">
        <span class="em">${c.emoji}</span><strong>${esc(c.name)}</strong><span>${n} rutinas</span></a>`;
    }).join("")}</div>`;
  }

  function viewRoutines() {
    const custom = db.custom.length
      ? `<div class="routine-list">${db.custom.map(routineCard).join("")}</div>`
      : `<div class="card center"><p class="muted" style="margin:0">Aún no has creado ninguna rutina propia.</p></div>`;
    return {
      title: "Rutinas",
      html: `
        <p class="muted" style="margin-top:4px">Elige qué quieres trabajar y luego la rutina que más te apetezca. Todas tienen 4 o 5 ejercicios.</p>
        <div class="section" style="margin-top:12px">${categoryGrid()}</div>
        <div class="section">
          <h3 class="section-title">Mis rutinas</h3>
          ${custom}
          <a class="btn ghost block" style="margin-top:12px" href="#/crear">➕ Crear mi propia rutina</a>
        </div>`,
    };
  }

  function viewCategory(id) {
    const c = catOf(id);
    if (!c) return notFound();
    const list = ROUTINES.filter((r) => r.cat === id);
    return {
      title: c.name, back: true,
      html: `
        <div class="detail-head"><div class="tile lg" style="--c:${c.color}">${c.emoji}</div>
          <div><h2>${esc(c.name)}</h2><p class="muted" style="margin:4px 0 0">${esc(c.desc)}</p></div></div>
        <p class="muted small">Elige la que más te apetezca hoy. Puedes ir cambiando para no aburrirte.</p>
        <div class="routine-list">${list.map(routineCard).join("")}</div>`,
    };
  }

  function viewRoutineDetail(id) {
    const r = getRoutine(id);
    if (!r) return notFound();
    const eq = routineEquip(r);
    const list = r.items.map(([eid, sets, amt], i) => {
      const ex = EX[eid]; if (!ex) return "";
      return exItem(ex, { num: i + 1, right: `${sets > 1 ? `${sets} series × ` : ""}${amountText(ex, amt, true)}` });
    }).join("");
    const isCustom = db.custom.some((c) => c.id === r.id);
    const c = r.cat ? catOf(r.cat) : null;
    const canWarm = r.cat && r.cat !== "movilidad";
    return {
      title: r.name, back: true, cta: true, parent: c ? `#/categoria/${c.id}` : "#/rutinas",
      html: `
        <div class="detail-head"><div class="tile lg" style="--c:${esc(r.color || "#C4553A")}">${esc(r.emoji || "⭐")}</div>
          <div>${c ? `<div class="eyebrow-s">${esc(c.name)}</div>` : ""}<h2>${esc(r.name)}</h2>${r.desc ? `<p class="muted" style="margin:4px 0 0">${esc(r.desc)}</p>` : ""}</div></div>
        <div class="tags">
          <span class="tag">⏱ ${estimate(withWarmup(r))} min</span>
          <span class="tag">${r.items.length} ejercicios</span>
          <span class="tag">${levelDots(routineLevel(r))}</span>
        </div>
        <div class="section card">
          <strong>Necesitas:</strong>
          <div class="tags" style="margin-top:8px">${eq.length ? eq.map((e) => `<span class="tag">${EQUIP[e].emoji} ${EQUIP[e].name}</span>`).join("") : `<span class="tag">🙌 Nada, solo tu cuerpo</span>`}</div>
          <p class="small muted" style="margin:10px 0 0">Descanso entre series: ${r.rest || 40} segundos.</p>
          ${canWarm ? `<div class="switch-row" style="margin-top:8px;border-top:1px solid var(--line);padding-top:12px"><div><strong>Calentamiento</strong><div class="small muted">2 minutos suaves antes de empezar</div></div>
            <label class="switch"><input type="checkbox" id="warmSw" ${db.settings.warmup !== false ? "checked" : ""}><span></span></label></div>` : ""}
        </div>
        <div class="section"><h3 class="section-title">Ejercicios</h3><div class="ex-list">${list}</div></div>
        <div class="section row" style="flex-wrap:wrap">
          ${isCustom
            ? `<a class="btn ghost small" href="#/crear/${esc(r.id)}">✏️ Editar</a><button class="btn danger small" data-act="del-routine" data-id="${esc(r.id)}">🗑 Borrar</button>`
            : `<button class="btn ghost small" data-act="copy-routine" data-id="${esc(r.id)}">📋 Copiar y modificar</button>`}
        </div>
        <div class="sticky-cta"><div><button class="btn block huge" data-act="start" data-id="${esc(r.id)}">▶ Empezar</button></div></div>`,
      after() {
        $("#warmSw")?.addEventListener("change", (e) => { db.settings.warmup = e.target.checked; save(); router(); });
      },
    };
  }

  let exFilter = { q: "", zone: "", equip: "" };
  function viewExercises() {
    const zoneChips = [["", "Todas"], ...Object.entries(ZONES).map(([k, z]) => [k, `${z.emoji} ${z.name}`])]
      .map(([k, t]) => `<button class="chip ${exFilter.zone === k ? "on" : ""}" data-act="f-zone" data-v="${k}">${t}</button>`).join("");
    const eqChips = [["", "Todo el material"], ...Object.entries(EQUIP).map(([k, e]) => [k, `${e.emoji} ${e.name}`])]
      .map(([k, t]) => `<button class="chip ${exFilter.equip === k ? "on" : ""}" data-act="f-equip" data-v="${k}">${t}</button>`).join("");
    return {
      title: "Ejercicios",
      html: `
        <input class="search" type="search" id="exSearch" placeholder="Buscar ejercicio…" value="${esc(exFilter.q)}" autocomplete="off" />
        <div class="chips" style="margin-top:12px">${zoneChips}</div>
        <div class="chips">${eqChips}</div>
        <div id="exResults" class="ex-list" style="margin-top:6px"></div>`,
      after() {
        renderExResults();
        $("#exSearch").addEventListener("input", (e) => { exFilter.q = e.target.value; renderExResults(); });
      },
    };
  }
  function filterExercises(f) {
    const q = norm(f.q || "");
    return EXERCISES.filter((e) =>
      (!f.zone || e.zone === f.zone) &&
      (!f.equip || e.equip.includes(f.equip)) &&
      (!q || norm(e.name + " " + e.summary + " " + ZONES[e.zone].name).includes(q)));
  }
  function renderExResults() {
    const list = filterExercises(exFilter);
    $("#exResults").innerHTML = list.length
      ? `<p class="small muted" style="margin:0">${list.length} ejercicios</p>` + list.map((e) => exItem(e)).join("")
      : `<div class="empty"><div class="big">🔍</div><p>No hay ejercicios con esos filtros.</p></div>`;
  }

  function viewExerciseDetail(id) {
    const ex = EX[id];
    if (!ex) return notFound();
    const z = ZONES[ex.zone];
    const usedIn = allRoutines().filter((r) => r.items.some(([eid]) => eid === id));
    return {
      title: ex.name, back: true, cta: true,
      html: `
        <h2 class="ex-title">${esc(ex.name)}</h2>
        <div class="tags" style="margin:8px 0 12px"><span class="tag">${z.emoji} ${z.name}</span><span class="tag">${levelDots(ex.level)}</span>
          ${ex.equip.map((e) => `<span class="tag">${EQUIP[e].emoji} ${EQUIP[e].name}</span>`).join("")}</div>
        ${viewerBlock(ex)}
        <p class="lead" style="margin-top:14px">${esc(ex.summary)} <span class="tag">🎯 ${amountText(ex, ex.reps || ex.secs)}</span></p>
        <div class="section"><h3 class="section-title">Cómo se hace</h3><div class="stack">${howToHTML(ex)}</div></div>
        <div class="section"><h3 class="section-title">Vídeo</h3>${videoBlock(ex)}</div>
        ${usedIn.length ? `<div class="section"><h3 class="section-title">Aparece en estas rutinas</h3><div class="routine-list">${usedIn.slice(0, 6).map(routineCard).join("")}</div></div>` : ""}
        <div class="sticky-cta"><div><button class="btn block" data-act="try-ex" data-id="${ex.id}">▶ Probar este ejercicio</button></div></div>`,
    };
  }

  /* ---------- Constructor de rutinas ---------- */
  let B = null; // rutina en edición
  const EMOJIS = ["⭐", "💪", "🦵", "🌸", "🔥", "🌞", "🧘‍♀️", "❤️", "🌿", "🎯"];
  const COLORS = { "⭐": "#E8A33D", "💪": "#E8A33D", "🦵": "#E07A5F", "🌸": "#D1495B", "🔥": "#C4553A", "🌞": "#E8A33D", "🧘‍♀️": "#4A9BB5", "❤️": "#D1495B", "🌿": "#5C9E5A", "🎯": "#2F6FA8" };
  function viewBuilder(id) {
    if (id && (!B || B.id !== id)) {
      const src = db.custom.find((c) => c.id === id);
      if (!src) return notFound();
      B = JSON.parse(JSON.stringify(src));
    } else if (!id && (!B || db.custom.some((c) => c.id === B.id))) {
      B = { id: "c-" + uid(), name: "", emoji: "⭐", rest: 40, items: [], custom: true };
    }
    const editing = db.custom.some((c) => c.id === B.id);
    return {
      title: editing ? "Editar rutina" : "Nueva rutina", back: true, cta: true,
      html: `
        <div class="stack">
          <label class="field"><span>Nombre</span><input class="input" id="bName" maxlength="40" placeholder="Ej.: Mi rutina de los lunes" value="${esc(B.name)}"></label>
          <div><strong>Icono</strong><div class="chips" style="margin-top:8px">${EMOJIS.map((e) => `<button class="chip ${B.emoji === e ? "on" : ""}" data-act="b-emoji" data-v="${e}" style="font-size:1.3rem">${e}</button>`).join("")}</div></div>
          <div class="switch-row card"><strong>Descanso entre series</strong>
            <span class="stepper"><button data-act="b-rest" data-d="-5" aria-label="Menos">−</button><output id="bRest">${B.rest}s</output><button data-act="b-rest" data-d="5" aria-label="Más">+</button></span></div>
        </div>
        <div class="section"><h3 class="section-title">Ejercicios <span class="muted small" id="bCount"></span></h3>
          <div id="bItems" class="stack"></div>
          <button class="btn ghost block" style="margin-top:14px" data-act="b-add">➕ Añadir ejercicio</button>
        </div>
        <div class="sticky-cta"><div><button class="btn block" data-act="b-save">💾 Guardar rutina</button></div></div>`,
      after() {
        renderBuilderItems();
        $("#bName").addEventListener("input", (e) => (B.name = e.target.value));
      },
    };
  }
  function renderBuilderItems() {
    const box = $("#bItems"); if (!box) return;
    $("#bCount").textContent = B.items.length ? `${B.items.length} · ⏱ ~${estimate(B)} min` : "";
    box.innerHTML = B.items.length ? B.items.map(([id, sets, amt], i) => {
      const ex = EX[id];
      return `<div class="builder-item">
        <div class="top"><span class="tile pic" style="--c:${ZONES[ex.zone].color};width:48px;height:48px;border-radius:12px">${mini(ex.id)}</span>
          <h4>${esc(ex.name)}</h4>
          <button class="mini-btn" data-act="b-move" data-i="${i}" data-d="-1" aria-label="Subir" ${i === 0 ? "disabled style='opacity:.35'" : ""}><svg viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg></button>
          <button class="mini-btn" data-act="b-move" data-i="${i}" data-d="1" aria-label="Bajar" ${i === B.items.length - 1 ? "disabled style='opacity:.35'" : ""}><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button>
          <button class="mini-btn" data-act="b-del" data-i="${i}" aria-label="Quitar" style="color:var(--danger)"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>
        <div class="controls">
          <span>Series <span class="stepper"><button data-act="b-num" data-i="${i}" data-k="1" data-d="-1">−</button><output>${sets}</output><button data-act="b-num" data-i="${i}" data-k="1" data-d="1">+</button></span></span>
          <span>${ex.type === "time" ? "Segundos" : "Repeticiones"} <span class="stepper"><button data-act="b-num" data-i="${i}" data-k="2" data-d="-1">−</button><output>${amt}</output><button data-act="b-num" data-i="${i}" data-k="2" data-d="1">+</button></span></span>
        </div></div>`;
    }).join("") : `<div class="empty"><div class="big">📝</div><p>Pulsa <strong>Añadir ejercicio</strong> para empezar a montar tu rutina.</p></div>`;
  }
  function openExercisePicker() {
    const f = { q: "", zone: "", equip: "" };
    const draw = (sheet) => {
      const list = filterExercises(f);
      $("#pkList", sheet).innerHTML = list.map((e) => {
        const n = B.items.filter(([id]) => id === e.id).length;
        return `<button class="ex-item" style="width:100%;border:0;text-align:left" data-act="b-pick" data-id="${e.id}">
          <div class="tile pic" style="--c:${ZONES[e.zone].color}">${mini(e.id)}</div>
          <div class="grow"><h4>${esc(e.name)}</h4><div class="sub">${esc(ZONES[e.zone].name)} · ${esc(EQUIP[e.equip[0]].name)}</div></div>
          <span class="tag" style="${n ? "background:var(--sage);color:#fff" : ""}">${n ? "✓ Añadido" : "＋"}</span></button>`;
      }).join("");
    };
    openSheet(`<h2>Añadir ejercicio</h2>
      <input class="search" id="pkSearch" type="search" placeholder="Buscar…" autocomplete="off">
      <div class="chips" style="margin-top:10px">${[["", "Todas"], ...Object.entries(ZONES).map(([k, z]) => [k, `${z.emoji} ${z.name}`])].map(([k, t]) => `<button class="chip ${k === "" ? "on" : ""}" data-pkzone="${k}">${t}</button>`).join("")}</div>
      <div id="pkList" class="ex-list"></div>
      <button class="btn block" style="margin-top:16px" data-act="close-sheet">Listo</button>`, (sheet) => {
      draw(sheet);
      $("#pkSearch", sheet).addEventListener("input", (e) => { f.q = e.target.value; draw(sheet); });
      sheet.addEventListener("click", (e) => {
        const z = e.target.closest("[data-pkzone]");
        if (z) { f.zone = z.dataset.pkzone; $$("[data-pkzone]", sheet).forEach((c) => c.classList.toggle("on", c === z)); draw(sheet); }
      });
      sheet._redraw = () => draw(sheet);
    });
  }

  /* ---------- Historial ---------- */
  let histMonth = new Date(); histMonth.setDate(1);
  function logItem(s, canDelete = true) {
    const d = new Date(s.date);
    const f = FEELINGS[(s.feeling || 3) - 1];
    return `<div class="log-item">
      <span class="e">${esc(s.emoji || "🏋️‍♀️")}</span>
      <div class="grow"><h4>${esc(s.name)}</h4>
        <div class="sub">${d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })} · ${s.minutes} min${s.total ? ` · ${s.exercises}/${s.total} ejercicios` : ""}</div>
        ${s.note ? `<div class="note">“${esc(s.note)}”</div>` : ""}</div>
      <span class="e" title="${f.t}">${f.e}</span>
      ${canDelete ? `<button class="mini-btn" data-act="del-session" data-id="${s.id}" aria-label="Borrar sesión"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>` : ""}
    </div>`;
  }
  function viewHistory() {
    const y = histMonth.getFullYear(), m = histMonth.getMonth();
    const monthSessions = db.sessions.filter((s) => { const d = new Date(s.date); return d.getFullYear() === y && d.getMonth() === m; })
      .sort((a, b) => b.date.localeCompare(a.date));
    const minutes = monthSessions.reduce((a, s) => a + (s.minutes || 0), 0);
    const first = new Date(y, m, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysIn = new Date(y, m + 1, 0).getDate();
    const todayK = dateKey(new Date());
    let cells = DAYS_SHORT.map((d) => `<div class="wd">${d}</div>`).join("");
    for (let i = 0; i < offset; i++) cells += `<div class="cd out"></div>`;
    for (let d = 1; d <= daysIn; d++) {
      const k = dateKey(new Date(y, m, d));
      cells += `<div class="cd ${sessionsOn(k).length ? "has" : ""} ${k === todayK ? "today" : ""}">${d}</div>`;
    }
    const monthName = first.toLocaleDateString("es-ES", { month: "long", year: "numeric" }).replace(/^./, (c) => c.toUpperCase()).replace(" de ", " ");
    const isCurrent = y === new Date().getFullYear() && m === new Date().getMonth();
    return {
      title: "Mi diario",
      html: `
        <div class="stats">
          <div class="stat"><b>${monthSessions.length}</b><span>sesiones este mes</span></div>
          <div class="stat"><b>${minutes}</b><span>minutos este mes</span></div>
          <div class="stat"><b>${weekStreak()}</b><span>semanas seguidas</span></div>
        </div>
        <div class="section card">
          <div class="cal-head">
            <button class="mini-btn" data-act="h-month" data-d="-1" aria-label="Mes anterior"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>
            <strong>${esc(monthName)}</strong>
            <button class="mini-btn" data-act="h-month" data-d="1" aria-label="Mes siguiente" ${isCurrent ? "disabled style='opacity:.35'" : ""}><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button>
          </div>
          <div class="cal">${cells}</div>
        </div>
        <button class="btn ghost block section" data-act="add-manual">✍️ Apuntar otra actividad (paseo, natación…)</button>
        <div class="section"><h3 class="section-title">Sesiones de ${esc(first.toLocaleDateString("es-ES", { month: "long" }))}</h3>
          <div class="stack">${monthSessions.length ? monthSessions.map((s) => logItem(s)).join("") : `<div class="empty"><div class="big">📅</div><p>No hay sesiones este mes todavía.<br>¡Cada entrenamiento que termines aparecerá aquí!</p></div>`}</div>
        </div>`,
    };
  }
  function openManualSheet() {
    const types = [["🚶‍♀️", "Paseo"], ["🧘‍♀️", "Yoga"], ["🏊‍♀️", "Natación"], ["🚴‍♀️", "Bici"], ["🏋️‍♀️", "Gimnasio"]];
    const st = { t: 0, feeling: 3, minutes: 30 };
    openSheet(`<h2>Apuntar actividad</h2>
      <div class="stack">
        <div class="chips" style="flex-wrap:wrap;overflow:visible;margin:0;padding:0">${types.map(([e, t], i) => `<button class="chip ${i === 0 ? "on" : ""}" data-mt="${i}">${e} ${t}</button>`).join("")}</div>
        <label class="field"><span>Día</span><input class="input" type="date" id="mDate" value="${dateKey(new Date())}" max="${dateKey(new Date())}"></label>
        <div class="switch-row card"><strong>Minutos</strong><span class="stepper"><button data-mm="-5">−</button><output id="mMin">30</output><button data-mm="5">+</button></span></div>
        <div><strong>¿Cómo te has sentido?</strong><div class="feel" style="margin-top:8px">${FEELINGS.map((f, i) => `<button data-mf="${i + 1}" class="${i === 2 ? "on" : ""}"><span class="e">${f.e}</span>${f.t}</button>`).join("")}</div></div>
        <label class="field"><span>Nota (opcional)</span><textarea class="input" id="mNote" maxlength="200" placeholder="Ej.: Paseo por el parque con Carmen"></textarea></label>
        <button class="btn block green" id="mSave">Guardar</button>
      </div>`, (sheet) => {
      sheet.addEventListener("click", (e) => {
        const t = e.target.closest("[data-mt]"), mm = e.target.closest("[data-mm]"), mf = e.target.closest("[data-mf]");
        if (t) { st.t = +t.dataset.mt; $$("[data-mt]", sheet).forEach((c) => c.classList.toggle("on", c === t)); }
        if (mm) { st.minutes = Math.max(5, Math.min(300, st.minutes + +mm.dataset.mm)); $("#mMin", sheet).textContent = st.minutes; }
        if (mf) { st.feeling = +mf.dataset.mf; $$("[data-mf]", sheet).forEach((c) => c.classList.toggle("on", c === mf)); }
      });
      $("#mSave", sheet).addEventListener("click", () => {
        const dk = $("#mDate", sheet).value || dateKey(new Date());
        const d = parseKey(dk); const now = new Date(); d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        db.sessions.push({ id: uid(), date: localStamp(d), routineId: null, name: types[st.t][1], emoji: types[st.t][0], minutes: st.minutes, feeling: st.feeling, note: $("#mNote", sheet).value.trim() });
        save(); closeSheet(); toast("✅ ¡Apuntado en tu diario!"); router();
      });
    });
  }

  /* ---------- Ajustes ---------- */
  function viewSettings() {
    const s = db.settings;
    return {
      title: "Ajustes", back: true,
      html: `
        <div class="stack">
          <div class="card stack">
            <label class="field"><span>¿Cómo te llamas?</span><input class="input" id="sName" maxlength="30" value="${esc(s.name)}" placeholder="Tu nombre"></label>
            <div><strong>Tamaño de la letra</strong>
              <div class="seg" style="margin-top:8px">${[["m", "Normal"], ["l", "Grande"], ["xl", "Muy grande"]].map(([k, t]) => `<button data-act="s-size" data-v="${k}" class="${s.size === k ? "on" : ""}">${t}</button>`).join("")}</div></div>
          </div>
          <div class="card">
            <div class="switch-row"><div><strong>Voz que te guía</strong><div class="small muted">Lee en voz alta el ejercicio y el descanso</div></div><label class="switch"><input type="checkbox" id="sVoice" ${s.voice ? "checked" : ""}><span></span></label></div>
            <div class="switch-row"><div><strong>Pitidos</strong><div class="small muted">Aviso al acabar el tiempo</div></div><label class="switch"><input type="checkbox" id="sSound" ${s.sound ? "checked" : ""}><span></span></label></div>
            <div class="switch-row"><div><strong>Objetivo semanal</strong><div class="small muted">Sesiones por semana</div></div>
              <span class="stepper"><button data-act="s-goal" data-d="-1">−</button><output id="sGoal">${s.goal}</output><button data-act="s-goal" data-d="1">+</button></span></div>
          </div>
          <div class="card stack">
            <strong>📲 Ponerla en la pantalla del móvil</strong>
            <p class="small" style="margin:0"><strong>iPhone (Safari):</strong> botón Compartir <span style="font-size:1.1em">⎋</span> → «Añadir a pantalla de inicio».<br>
            <strong>Android (Chrome):</strong> menú ⋮ → «Instalar aplicación» o «Añadir a pantalla de inicio».</p>
          </div>
          <div class="card stack">
            <strong>💾 Copia de seguridad</strong>
            <p class="small muted" style="margin:0">Tu diario se guarda en este móvil. Haz una copia de vez en cuando o para pasarlo a otro dispositivo.</p>
            <div class="row" style="flex-wrap:wrap"><button class="btn ghost small" data-act="export">⬇️ Descargar copia</button>
            <label class="btn ghost small">⬆️ Cargar copia<input type="file" id="sImport" accept="application/json,.json" hidden></label></div>
          </div>
          <div class="callout info"><span class="ic">🩺</span><div><p><strong>Importante:</strong> antes de empezar un programa de ejercicio, consulta con tu médico, sobre todo si tienes problemas de corazón, tensión, articulaciones u osteoporosis. Si sientes mareo, dolor en el pecho o falta de aire, para inmediatamente.</p></div></div>
          <div class="callout tip"><span class="ic">📚</span><p class="small">Las rutinas siguen las recomendaciones de la OMS para mayores de 65 años: ejercicios de fuerza al menos 2 días por semana, equilibrio al menos 3 días y 150–300 minutos de actividad moderada (como caminar) a la semana.</p></div>
          <button class="btn danger block" data-act="reset">Borrar todos mis datos</button>
          <p class="small muted center">Hecha con cariño 💛</p>
        </div>`,
      after() {
        $("#sName").addEventListener("change", (e) => { db.settings.name = e.target.value.trim(); save(); toast("Guardado"); });
        $("#sVoice").addEventListener("change", (e) => { db.settings.voice = e.target.checked; save(); if (e.target.checked) speak("La voz está activada"); });
        $("#sSound").addEventListener("change", (e) => { db.settings.sound = e.target.checked; save(); if (e.target.checked) beep(true); });
        $("#sImport").addEventListener("change", importBackup);
      },
    };
  }
  function applySize() { document.documentElement.dataset.size = db.settings.size; }
  function exportBackup() {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mi-gimnasio-copia-${dateKey(new Date())}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function importBackup(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(reader.result);
        if (!d || !Array.isArray(d.sessions)) throw new Error("formato");
        confirmSheet("¿Cargar esta copia?", `Se sustituirán los datos actuales por los de la copia (${d.sessions.length} sesiones).`, "Cargar copia", () => {
          db = { ...JSON.parse(JSON.stringify(DEFAULTS)), ...d, settings: { ...DEFAULTS.settings, ...(d.settings || {}) } };
          save(); applySize(); toast("✅ Copia cargada"); router();
        });
      } catch (err) { toast("⚠️ Ese archivo no es una copia válida"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function notFound() {
    return { title: "No encontrado", back: true, html: `<div class="empty"><div class="big">🤔</div><p>No hemos encontrado lo que buscabas.</p><a class="btn" href="#/">Ir al inicio</a></div>` };
  }

  /* =========================================================
     ROUTER
     ========================================================= */
  const ROUTES = [
    [/^\/?$/, viewHome, "home"],
    [/^\/rutinas$/, viewRoutines, "rutinas"],
    [/^\/categoria\/([^/]+)$/, viewCategory, "rutinas", "#/rutinas"],
    [/^\/rutina\/([^/]+)$/, viewRoutineDetail, "rutinas", "#/rutinas"],
    [/^\/crear(?:\/([^/]+))?$/, viewBuilder, "rutinas", "#/rutinas"],
    [/^\/ejercicios$/, viewExercises, "ejercicios"],
    [/^\/ejercicio\/([^/]+)$/, viewExerciseDetail, "ejercicios", "#/ejercicios"],
    [/^\/historial$/, viewHistory, "historial"],
    [/^\/ajustes$/, viewSettings, "", "#/"],
  ];
  let navCount = 0, parentHash = "#/";
  function router() {
    const path = decodeURIComponent(location.hash.replace(/^#/, "")) || "/";
    let view = notFound(), tab = "";
    for (const [re, fn, t, parent] of ROUTES) {
      const m = path.match(re);
      if (m) { view = fn(m[1]); tab = t; parentHash = view.parent || parent || "#/"; break; }
    }
    const main = $("#view");
    main.innerHTML = view.html;
    main.classList.toggle("has-cta", !!view.cta);
    $("#pageTitle").textContent = view.title;
    document.title = view.title === "Mi Gimnasio" ? "Mi Gimnasio en Casa" : `${view.title} · Mi Gimnasio`;
    $("#backBtn").hidden = !view.back;
    $$(".tabbar a").forEach((a) => a.classList.toggle("on", a.dataset.tab === tab));
    view.after?.();
    window.Figure3D?.sweep();
    mountFigures(main);
  }
  window.addEventListener("hashchange", () => { navCount++; closeSheet(); router(); window.scrollTo(0, 0); });
  $("#backBtn").addEventListener("click", () => { if (navCount > 0) history.back(); else location.hash = parentHash; });

  /* =========================================================
     HOJAS, AVISOS Y DIÁLOGOS
     ========================================================= */
  function openSheet(html, onMount) {
    const bd = $("#sheet");
    const sh = $(".sheet", bd).cloneNode(false); // elemento nuevo: sin listeners anteriores
    $(".sheet", bd).replaceWith(sh);
    sh.innerHTML = html; bd.hidden = false;
    document.body.classList.add("no-scroll");
    sh.scrollTop = 0;
    onMount?.(sh);
  }
  function closeSheet() {
    const bd = $("#sheet"); if (bd.hidden) return;
    bd.hidden = true; $(".sheet", bd).innerHTML = "";
    if (!P) document.body.classList.remove("no-scroll");
  }
  $("#sheet").addEventListener("click", (e) => { if (e.target.id === "sheet") closeSheet(); });
  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2600);
  }
  function confirmSheet(title, text, okLabel, onOk, danger = false) {
    openSheet(`<h2>${esc(title)}</h2><p>${esc(text)}</p>
      <div class="stack"><button class="btn block ${danger ? "danger" : ""}" id="cOk">${esc(okLabel)}</button>
      <button class="btn ghost block" data-act="close-sheet">Cancelar</button></div>`, (sh) => {
      $("#cOk", sh).addEventListener("click", () => { closeSheet(); onOk(); });
    });
  }
  function parseYouTube(s) {
    s = (s || "").trim();
    const m = s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(s) ? s : "";
  }
  function openVideoSheet(id) {
    const ex = EX[id];
    openSheet(`<h2>Vídeo para «${esc(ex.name)}»</h2>
      <p class="small muted">Busca en YouTube un vídeo que te guste, pulsa «Compartir» → «Copiar enlace» y pégalo aquí.</p>
      <div class="stack"><input class="input" id="vUrl" placeholder="https://youtu.be/…" value="${db.videos[id] ? "https://youtu.be/" + esc(db.videos[id]) : ""}">
      <button class="btn block" id="vSave">Guardar vídeo</button>
      ${db.videos[id] ? `<button class="btn danger block" id="vDel">Quitar vídeo</button>` : ""}
      <button class="btn ghost block" data-act="close-sheet">Cancelar</button></div>`, (sh) => {
      $("#vSave", sh).addEventListener("click", () => {
        const v = parseYouTube($("#vUrl", sh).value);
        if (!v) { toast("⚠️ Ese enlace no parece de YouTube"); return; }
        db.videos[id] = v; save(); closeSheet(); toast("🎬 Vídeo guardado"); router();
      });
      $("#vDel", sh)?.addEventListener("click", () => { delete db.videos[id]; save(); closeSheet(); router(); });
    });
  }

  /* =========================================================
     SONIDO, VOZ Y PANTALLA ENCENDIDA
     ========================================================= */
  let actx = null;
  function ensureAudio() {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
    } catch (e) { /* sin audio */ }
  }
  function beep(final = false) {
    if (!db.settings.sound) return;
    ensureAudio(); if (!actx) return;
    const tones = final ? [[784, 0], [1047, 0.16]] : [[880, 0]];
    tones.forEach(([f, delay]) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = "sine"; o.frequency.value = f;
      const t0 = actx.currentTime + delay, dur = final ? 0.28 : 0.15;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(actx.destination);
      o.start(t0); o.stop(t0 + dur + 0.02);
    });
  }
  let esVoice = null;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const vs = speechSynthesis.getVoices();
    esVoice = vs.find((v) => v.lang === "es-ES") || vs.find((v) => v.lang?.startsWith("es")) || null;
  }
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text) {
    if (!db.settings.voice || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "es-ES"; u.rate = 0.95; if (esVoice) u.voice = esVoice;
      speechSynthesis.speak(u);
    } catch (e) { /* sin voz */ }
  }
  let wakeLock = null;
  async function keepAwake(on) {
    try {
      if (on && "wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen");
      else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) { /* no soportado */ }
  }
  document.addEventListener("visibilitychange", () => { if (P && document.visibilityState === "visible") keepAwake(true); });

  /* =========================================================
     REPRODUCTOR DE ENTRENAMIENTO
     ========================================================= */
  let P = null;
  const RING_C = 2 * Math.PI * 100;

  function buildSteps(r) {
    const steps = [];
    const items = r.items.filter(([id]) => EX[id]);
    items.forEach(([id, sets, amt], i) => {
      const ex = EX[id];
      for (let s = 1; s <= sets; s++) {
        if (ex.type === "time" && ex.side) {
          steps.push({ kind: "work", i, id, set: s, sets, amt, side: "Lado derecho" });
          steps.push({ kind: "switch", i, id, secs: 5 });
          steps.push({ kind: "work", i, id, set: s, sets, amt, side: "Lado izquierdo" });
        } else {
          steps.push({ kind: "work", i, id, set: s, sets, amt });
        }
        const isLast = i === items.length - 1 && s === sets;
        if (!isLast) {
          const nextEx = s < sets ? ex : EX[items[i + 1][0]];
          const secs = ex.zone === "movilidad" || nextEx.zone === "movilidad" ? 10 : r.rest || 40;
          steps.push({ kind: "rest", i, secs });
        }
      }
    });
    return { steps, total: items.length };
  }

  function startWorkout(r) {
    ensureAudio();
    const { steps, total } = buildSteps(r);
    if (!steps.length) { toast("Esta rutina no tiene ejercicios"); return; }
    P = { r, steps, total, warm: r.warm || 0, idx: -1, start: Date.now(), done: new Set(), t: null, feeling: 3, fig: null };
    $("#player").hidden = false;
    document.body.classList.add("no-scroll");
    keepAwake(true);
    P.interval = setInterval(tick, 200);
    goTo(0);
  }
  function stopWorkout() {
    if (!P) return;
    clearInterval(P.interval);
    P.fig?.el._inst?.destroy();
    P = null;
    setTimeout(() => window.Figure3D?.sweep(), 0);
    $("#player").hidden = true; $("#player").innerHTML = "";
    $("#player").classList.remove("resting");
    document.body.classList.remove("no-scroll");
    keepAwake(false);
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }

  function goTo(idx) {
    P.idx = idx; P.t = null;
    const st = P.steps[idx];
    if (st.kind === "rest" || st.kind === "switch") {
      P.t = { total: st.secs, endAt: Date.now() + st.secs * 1000, running: true, remaining: st.secs * 1000 };
    } else {
      const ex = EX[st.id];
      if (ex.type === "time") {
        // el segundo lado arranca solo tras el cambio de lado
        const auto = st.side === "Lado izquierdo";
        P.t = { total: st.amt, remaining: st.amt * 1000, running: auto, started: auto, endAt: Date.now() + st.amt * 1000, lastSec: auto ? st.amt : 0 };
      }
    }
    renderPlayer();
    // voz
    if (st.kind === "work") {
      const ex = EX[st.id];
      const amt = ex.type === "time" ? `${st.amt} segundos` : `${st.amt} repeticiones${ex.side ? " con cada lado" : ""}`;
      if (st.side === "Lado izquierdo") speak("Ahora el lado izquierdo.");
      else if (st.set === 1) speak(`${ex.name}. ${amt}.`);
      else speak(`Serie ${st.set}. ${amt}.`);
    } else if (st.kind === "rest") {
      const nx = nextWork(idx);
      speak(nx && nx.i !== st.i ? `Descansa. Lo siguiente es: ${EX[nx.id].name}.` : "Descansa un momento.");
    } else if (st.kind === "switch") speak("Cambia de lado.");
  }
  const nextWork = (idx) => P.steps.slice(idx + 1).find((s) => s.kind === "work");
  function next() {
    const st = P.steps[P.idx];
    if (st?.kind === "work") P.done.add(st.i);
    if (P.idx + 1 >= P.steps.length) return finish();
    goTo(P.idx + 1);
  }
  function prev() {
    for (let j = P.idx - 1; j >= 0; j--) if (P.steps[j].kind === "work") return goTo(j);
  }
  function skipExercise() {
    const cur = P.steps[P.idx];
    const j = P.steps.findIndex((s, k) => k > P.idx && s.kind === "work" && s.i !== cur.i);
    if (j === -1) return finish();
    goTo(j);
  }

  function tick() {
    if (!P || !P.t || !P.t.running) return;
    const rem = Math.max(0, P.t.endAt - Date.now());
    const sec = Math.ceil(rem / 1000);
    if (sec !== P.t.lastSec) {
      P.t.lastSec = sec;
      if (sec > 0 && sec <= 3) beep();
    }
    updateRing(rem);
    if (rem <= 0) {
      P.t.running = false;
      const st = P.steps[P.idx];
      if (st.kind === "work") beep(true);
      next();
    }
  }
  function updateRing(remMs) {
    const fg = $("#ringFg"), val = $("#ringVal");
    if (!fg || !P?.t) return;
    const frac = Math.max(0, Math.min(1, remMs / (P.t.total * 1000)));
    fg.style.strokeDashoffset = String(RING_C * (1 - frac));
    val.textContent = fmtSecs(Math.ceil(remMs / 1000));
  }
  function toggleTimer() {
    const t = P.t; if (!t) return;
    ensureAudio();
    if (t.running) { t.remaining = Math.max(0, t.endAt - Date.now()); t.running = false; }
    else { t.endAt = Date.now() + t.remaining; t.running = true; t.started = true; if (!t.lastSec) speak("¡Vamos!"); }
    renderPlayer();
  }

  function ringHTML(remMs, total) {
    const frac = Math.max(0, Math.min(1, remMs / (total * 1000)));
    return `<div class="ring"><svg viewBox="0 0 230 230"><circle class="bg" cx="115" cy="115" r="100"/>
      <circle class="fg" id="ringFg" cx="115" cy="115" r="100" stroke-dasharray="${RING_C}" stroke-dashoffset="${RING_C * (1 - frac)}"/></svg>
      <div class="val" id="ringVal">${fmtSecs(Math.ceil(remMs / 1000))}</div></div>`;
  }
  function playerTop(label) {
    const pct = Math.round((P.idx / P.steps.length) * 100);
    return `<div class="p-top">
        <button class="icon-btn" data-act="p-close" aria-label="Cerrar"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        <div class="p-count">${label}</div>
        <button class="icon-btn" data-act="p-info" aria-label="Cómo se hace"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.3-2.5 3.9"/><circle cx="12" cy="17.3" r=".6" fill="currentColor"/></svg></button>
      </div><div class="p-bar"><span style="width:${pct}%"></span></div>`;
  }
  function renderPlayer() {
    const el = $("#player");
    const st = P.steps[P.idx];
    el.classList.toggle("resting", st.kind === "rest" || st.kind === "switch");

    if (st.kind === "rest" || st.kind === "switch") {
      const nx = nextWork(P.idx);
      const nex = nx && EX[nx.id];
      const rem = P.t.running ? P.t.endAt - Date.now() : P.t.remaining;
      el.innerHTML = `${playerTop(st.kind === "switch" ? "Cambio de lado" : "Descanso")}
        <div class="p-body">
          <div class="p-label">${st.kind === "switch" ? "Cambia de lado" : "Descansa y respira"}</div>
          ${ringHTML(rem, P.t.total)}
          ${nex ? `<div class="p-next">
            <div class="grow"><div class="small muted" style="font-weight:800">${nx.i === st.i ? `SIGUIENTE: SERIE ${nx.set} DE ${nx.sets}` : "SIGUIENTE EJERCICIO"}</div>
            <strong>${esc(nex.name)}</strong><div class="small muted">${amountText(nex, nx.amt)}</div></div></div>
            <div id="pFigSlot" class="p-fig-slot small"></div>` : ""}
        </div>
        <div class="p-actions">
          <div class="row"><button class="btn ghost" data-act="p-more">+15 s</button><button class="btn green" data-act="p-next">Seguir ›</button></div>
        </div>`;
      if (nex) placePlayerFig(nx.id);
      return;
    }

    const ex = EX[st.id], z = ZONES[ex.zone];
    const dots = st.sets > 1 ? `<div class="p-set">${Array.from({ length: st.sets }, (_, k) => `<i class="${k + 1 < st.set ? "on" : k + 1 === st.set ? "cur" : ""}"></i>`).join("")}</div>` : "";
    const setLabel = [st.sets > 1 ? `Serie ${st.set} de ${st.sets}` : "", st.side || ""].filter(Boolean).join(" · ");
    let main, action;
    if (ex.type === "time") {
      const rem = P.t.running ? P.t.endAt - Date.now() : P.t.remaining;
      main = ringHTML(rem, P.t.total);
      action = `<button class="btn huge block ${P.t.running ? "ghost" : ""}" data-act="p-toggle">${P.t.running ? "⏸ Pausa" : P.t.started ? "▶ Continuar" : "▶ Empezar"}</button>`;
    } else {
      main = `<div class="p-big">${st.amt}<small>repeticiones${ex.side ? " con cada lado" : ""}</small></div>`;
      action = `<button class="btn huge block green" data-act="p-next">✓ ¡Hecho!</button>`;
    }
    const label = st.i < P.warm ? `Calentamiento ${st.i + 1} de ${P.warm}` : `Ejercicio ${st.i - P.warm + 1} de ${P.total - P.warm}`;
    el.innerHTML = `${playerTop(label)}
      <div class="p-body">
        <div id="pFigSlot" class="p-fig-slot"></div>
        <div class="p-name">${esc(ex.name)}</div>
        ${setLabel ? `<div class="p-label">${setLabel}</div>` : ""}
        ${dots}
        ${main}
        ${ex.tips?.[0] ? `<p class="p-tip">💡 ${esc(ex.tips[0])}</p>` : ""}
        <button class="link-btn" data-act="p-info">¿Cómo se hace? Ver explicación</button>
      </div>
      <div class="p-actions">
        ${action}
        <div class="row">
          <button class="btn ghost small" data-act="p-prev" ${P.steps.slice(0, P.idx).some((s) => s.kind === "work") ? "" : "disabled style='opacity:.4'"}>‹ Anterior</button>
          <button class="btn ghost small" data-act="p-skip">Saltar ejercicio ›</button>
        </div>
      </div>`;
    placePlayerFig(ex.id);
  }
  /* El muñeco del reproductor se reutiliza entre pantallas para no recargarlo */
  function placePlayerFig(id) {
    const slot = $("#pFigSlot"); if (!slot) return;
    const small = slot.classList.contains("small");
    if (P.fig && P.fig.id === id) { P.fig.el.classList.toggle("small", small); slot.replaceWith(P.fig.el); return; }
    P.fig?.el._inst?.destroy();
    const wrap = document.createElement("div");
    wrap.innerHTML = figBox(id, "p-fig" + (small ? " small" : ""));
    const el = wrap.firstElementChild;
    slot.replaceWith(el);
    P.fig = { id, el };
    mountFigures(el.parentNode);
  }
  function playerInfo() {
    const st = P.steps[P.idx];
    const id = st.kind === "work" ? st.id : nextWork(P.idx)?.id;
    if (!id) return;
    if (P.t?.running && st.kind === "work") toggleTimer();
    const ex = EX[id];
    openSheet(`<h2>${esc(ex.name)}</h2><p class="lead">${esc(ex.summary)}</p>
      <div class="stack">${videoBlock(ex)}${howToHTML(ex)}
      <button class="btn block" data-act="close-sheet">Entendido</button></div>`);
  }
  function finish() {
    if (P.t) P.t.running = false;
    const mins = Math.max(1, Math.round((Date.now() - P.start) / 60000));
    P.minutes = mins;
    const el = $("#player");
    el.classList.remove("resting");
    beep(true);
    speak("¡Enhorabuena! Has terminado el entrenamiento.");
    el.innerHTML = `
      <div class="p-body" style="justify-content:flex-start;padding-top:28px">
        <div class="confetti">🎉</div>
        <div class="p-name">¡Enhorabuena${db.settings.name ? ", " + esc(db.settings.name) : ""}!</div>
        <p class="muted" style="margin:0">Has terminado <strong>${esc(P.r.name)}</strong></p>
        <div class="stats" style="width:100%;margin-top:10px">
          <div class="stat"><b>${mins}</b><span>minutos</span></div>
          <div class="stat"><b>${P.done.size}</b><span>ejercicios</span></div>
          <div class="stat"><b>${sessionsThisWeek().length + 1}</b><span>esta semana</span></div>
        </div>
        <div style="width:100%;text-align:left;margin-top:14px"><strong>¿Cómo te has sentido?</strong>
          <div class="feel" style="margin-top:8px">${FEELINGS.map((f, i) => `<button data-act="p-feel" data-v="${i + 1}" class="${i === 2 ? "on" : ""}"><span class="e">${f.e}</span>${f.t}</button>`).join("")}</div></div>
        <label class="field" style="width:100%;text-align:left;margin-top:10px"><span>Nota (opcional)</span>
          <textarea class="input" id="pNote" maxlength="200" placeholder="Ej.: Hoy he subido a 3 kg en el curl"></textarea></label>
      </div>
      <div class="p-actions">
        <button class="btn huge block green" data-act="p-save">💾 Guardar en mi diario</button>
        <button class="btn ghost small block" data-act="p-discard">Salir sin guardar</button>
      </div>`;
    P.finished = true;
  }
  function saveSession() {
    db.sessions.push({
      id: uid(), date: localStamp(),
      routineId: P.r.id, name: P.r.name, emoji: P.r.emoji || "🏋️‍♀️",
      minutes: P.minutes, exercises: P.done.size, total: P.total,
      feeling: P.feeling, note: ($("#pNote")?.value || "").trim(),
    });
    save();
    stopWorkout();
    toast("✅ ¡Guardado en tu diario!");
    if (location.hash === "#/" || location.hash === "") router(); else location.hash = "#/";
  }
  function closePlayerAsk() {
    if (P.finished) { stopWorkout(); return; }
    if (P.t?.running && P.steps[P.idx].kind === "work") toggleTimer();
    openSheet(`<h2>¿Quieres parar?</h2><p>Puedes seguir, terminar ahora y apuntar lo que has hecho, o salir sin guardar.</p>
      <div class="stack">
        <button class="btn block green" data-act="close-sheet">💪 Seguir entrenando</button>
        <button class="btn block" data-act="p-end">Terminar y guardar</button>
        <button class="btn ghost block" data-act="p-discard">Salir sin guardar</button>
      </div>`);
  }

  /* =========================================================
     ACCIONES (delegación de eventos)
     ========================================================= */
  const ACTIONS = {
    "start": (el) => { const r = getRoutine(el.dataset.id); if (r) startWorkout(withWarmup(r)); },
    "vt": (el) => {
      const v = el.closest(".viewer"), foto = el.dataset.v === "foto";
      $$("[data-act='vt']", v).forEach((b) => b.classList.toggle("on", b === el));
      $(".fig3d", v).hidden = foto; $(".photo-anim", v).hidden = !foto;
      $("[data-hint]", v).textContent = foto ? "📷 Fotos de una persona real (inicio y final)" : "👆 Arrastra para girar el muñeco";
    },
    "slow": (el) => {
      figSlow = !figSlow;
      $$(".fig3d").forEach((f) => f._inst?.setSpeed(figSlow ? 0.5 : 1));
      el.textContent = figSlow ? "🐇 Velocidad normal" : "🐢 Más despacio";
    },
    "try-ex": (el) => {
      const ex = EX[el.dataset.id];
      startWorkout({ id: "ex-" + ex.id, name: ex.name, emoji: ZONES[ex.zone].emoji, rest: 40, items: [[ex.id, 2, ex.reps || ex.secs]] });
    },
    "close-sheet": () => closeSheet(),
    "set-video": (el) => openVideoSheet(el.dataset.id),
    "f-zone": (el) => { exFilter.zone = el.dataset.v; router(); },
    "f-equip": (el) => { exFilter.equip = el.dataset.v; router(); },
    "copy-routine": (el) => {
      const r = getRoutine(el.dataset.id);
      B = { id: "c-" + uid(), name: r.name + " (mía)", emoji: r.emoji, color: r.color, rest: r.rest, items: r.items.map((x) => [...x]), custom: true, _draft: true };
      location.hash = "#/crear";
    },
    "del-routine": (el) => confirmSheet("¿Borrar esta rutina?", "Esta acción no se puede deshacer. Tu diario no se borra.", "Sí, borrar", () => {
      db.custom = db.custom.filter((c) => c.id !== el.dataset.id); save(); toast("Rutina borrada"); location.hash = "#/rutinas";
    }, true),
    // constructor
    "b-emoji": (el) => { B.emoji = el.dataset.v; B.color = COLORS[B.emoji]; $$("[data-act='b-emoji']").forEach((c) => c.classList.toggle("on", c === el)); },
    "b-rest": (el) => { B.rest = Math.max(10, Math.min(180, B.rest + +el.dataset.d)); $("#bRest").textContent = B.rest + "s"; renderBuilderItems(); },
    "b-add": () => openExercisePicker(),
    "b-pick": (el) => {
      const ex = EX[el.dataset.id];
      B.items.push([ex.id, ex.zone === "movilidad" ? 1 : 2, ex.reps || ex.secs]);
      renderBuilderItems(); toast(`➕ ${ex.name}`);
      $(".sheet")._redraw?.();
    },
    "b-del": (el) => { B.items.splice(+el.dataset.i, 1); renderBuilderItems(); },
    "b-move": (el) => {
      const i = +el.dataset.i, j = i + +el.dataset.d;
      if (j < 0 || j >= B.items.length) return;
      [B.items[i], B.items[j]] = [B.items[j], B.items[i]]; renderBuilderItems();
    },
    "b-num": (el) => {
      const it = B.items[+el.dataset.i], k = +el.dataset.k, ex = EX[it[0]];
      if (k === 1) it[1] = Math.max(1, Math.min(6, it[1] + +el.dataset.d));
      else { const step = ex.type === "time" ? 5 : 1; it[2] = Math.max(step, Math.min(ex.type === "time" ? 180 : 40, it[2] + step * +el.dataset.d)); }
      renderBuilderItems();
    },
    "b-save": () => {
      B.name = ($("#bName")?.value || "").trim();
      if (!B.name) { toast("✏️ Ponle un nombre a la rutina"); $("#bName")?.focus(); return; }
      if (!B.items.length) { toast("➕ Añade al menos un ejercicio"); return; }
      const clean = { id: B.id, name: B.name, emoji: B.emoji, color: B.color || COLORS[B.emoji] || "#C4553A", rest: B.rest, items: B.items, custom: true, desc: "Rutina creada por ti" };
      const i = db.custom.findIndex((c) => c.id === B.id);
      if (i >= 0) db.custom[i] = clean; else db.custom.push(clean);
      save(); toast("💾 Rutina guardada"); const id = B.id; B = null;
      location.hash = "#/rutina/" + id;
    },
    // historial
    "h-month": (el) => { histMonth.setMonth(histMonth.getMonth() + +el.dataset.d); router(); },
    "add-manual": () => openManualSheet(),
    "del-session": (el) => confirmSheet("¿Borrar esta sesión?", "Se quitará de tu diario.", "Sí, borrar", () => {
      db.sessions = db.sessions.filter((s) => s.id !== el.dataset.id); save(); router();
    }, true),
    // ajustes
    "s-size": (el) => { db.settings.size = el.dataset.v; save(); applySize(); $$("[data-act='s-size']").forEach((b) => b.classList.toggle("on", b === el)); },
    "s-goal": (el) => { db.settings.goal = Math.max(1, Math.min(7, db.settings.goal + +el.dataset.d)); save(); $("#sGoal").textContent = db.settings.goal; },
    "export": () => exportBackup(),
    "reset": () => confirmSheet("¿Borrar todos los datos?", "Se borrarán tu diario, tus rutinas y tus ajustes de este dispositivo. No se puede deshacer.", "Sí, borrar todo", () => {
      db = JSON.parse(JSON.stringify(DEFAULTS)); db.settings.onboarded = true; save(); applySize(); toast("Datos borrados"); location.hash = "#/";
    }, true),
    // reproductor
    "p-close": () => closePlayerAsk(),
    "p-info": () => playerInfo(),
    "p-next": () => next(),
    "p-prev": () => prev(),
    "p-skip": () => skipExercise(),
    "p-toggle": () => toggleTimer(),
    "p-more": () => { P.t.endAt += 15000; P.t.total += 15; updateRing(P.t.endAt - Date.now()); },
    "p-feel": (el) => { P.feeling = +el.dataset.v; $$("[data-act='p-feel']").forEach((b) => b.classList.toggle("on", b === el)); },
    "p-save": () => saveSession(),
    "p-end": () => { closeSheet(); finish(); },
    "p-discard": () => { closeSheet(); stopWorkout(); },
  };
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]");
    if (!el || el.disabled) return;
    const fn = ACTIONS[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el); }
  });

  /* =========================================================
     BIENVENIDA (primera vez)
     ========================================================= */
  function onboarding() {
    openSheet(`<div class="center"><div style="font-size:3.5rem">👋</div><h2>¡Bienvenida a tu gimnasio en casa!</h2></div>
      <div class="stack">
        <p>Aquí tienes rutinas sencillas con <strong>mancuernas, bandas, esterilla</strong> o solo con tu cuerpo. La app te guía paso a paso, con temporizador y voz.</p>
        <label class="field"><span>¿Cómo te llamas?</span><input class="input" id="oName" maxlength="30" placeholder="Tu nombre"></label>
        <div class="callout info"><span class="ic">🩺</span><p class="small">Antes de empezar, consulta con tu médico. Escucha a tu cuerpo: si algo duele, para.</p></div>
        <button class="btn block huge" id="oGo">¡Empezar!</button>
      </div>`, (sh) => {
      $("#oGo", sh).addEventListener("click", () => {
        db.settings.name = $("#oName", sh).value.trim(); db.settings.onboarded = true; save(); closeSheet(); router();
      });
    });
  }

  /* ---------------- Arranque ---------------- */
  applySize();
  router();
  if (!db.settings.onboarded) onboarding();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js", { updateViaCache: "none" })
        .then((reg) => reg.update())
        .catch(() => {});
    });
    // Cuando se instala una versión nueva, recarga una vez para mostrarla (si no se está entrenando)
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController || reloaded || P) return;
      reloaded = true;
      location.reload();
    });
  }
})();
