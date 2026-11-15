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
    settings: { name: "", size: "m", voice: true, sound: true, goal: 3, onboarded: false, theme: "salvia" },
    sessions: [], custom: [], videos: {}, favs: [],
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
  /* ---------- Favoritas y duración ---------- */
  const HEART = `<svg viewBox="0 0 24 24"><path d="M12 20.3s-7.4-4.5-9.1-9.1C1.7 7.8 4 4.6 7.4 4.6c2 0 3.6 1.1 4.6 2.7 1-1.6 2.6-2.7 4.6-2.7 3.4 0 5.7 3.2 4.5 6.6-1.7 4.6-9.1 9.1-9.1 9.1z"/></svg>`;
  const SHARE = `<svg viewBox="0 0 24 24"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>`;
  const isFav = (id) => (db.favs || []).includes(id);
  const DURS = [["", "Todas"], ["short", "⚡ Hasta 15 min"], ["mid", "⏱ 15–20 min"], ["long", "🔥 Más de 20 min"]];
  let durFilter = "";
  const routineMins = (r) => estimate(withWarmup(r));
  const durOf = (r) => { const m = routineMins(r); return m <= 15 ? "short" : m <= 20 ? "mid" : "long"; };
  const durChips = () => `<div class="chips dur-chips">${DURS.map(([k, t]) => `<button class="chip ${durFilter === k ? "on" : ""}" data-act="dur" data-v="${k}">${t}</button>`).join("")}</div>`;
  const catStyle = (c) => (c ? `--c:${c.color};--cbg:${c.bg}` : "--c:var(--primary);--cbg:var(--surface-2)");
  const favBtn = (id, cls = "") => `<button class="fav ${cls} ${isFav(id) ? "on" : ""}" data-act="fav" data-id="${esc(id)}" aria-label="${isFav(id) ? "Quitar de favoritas" : "Guardar en favoritas"}">${HEART}</button>`;

  function routineCard(r, { showCat = true } = {}) {
    const c = r.cat ? catOf(r.cat) : null;
    const thumbs = r.items.slice(0, 5).map(([id]) => `<span class="th">${mini(id)}</span>`).join("");
    return `<a class="routine-card" href="#/rutina/${esc(r.id)}" style="${catStyle(c)}">
      <div class="rc-top"><div class="grow">
        ${showCat && c ? `<span class="rc-cat">${c.emoji} ${esc(c.name)}</span>` : ""}
        <h3>${esc(r.name)}</h3>
        ${r.desc ? `<p>${esc(r.desc)}</p>` : ""}
        <div class="meta"><span>⏱ ${routineMins(r)} min</span><span>${r.items.length} ejercicios</span><span>${levelDots(routineLevel(r))}</span></div>
      </div>${favBtn(r.id)}</div>
      <div class="thumbs">${thumbs}</div></a>`;
  }
  function miniRoutineCard(r) {
    const c = r.cat ? catOf(r.cat) : null;
    return `<a class="mini-routine" href="#/rutina/${esc(r.id)}" style="${catStyle(c)}">
      <span class="eyebrow-s">${c ? `${c.emoji} ${esc(c.name)}` : "Mi rutina"} · ${routineMins(r)} min</span><h4>${esc(r.name)}</h4>
      <div class="thumbs">${r.items.slice(0, 4).map(([id]) => `<span class="th">${mini(id)}</span>`).join("")}</div></a>`;
  }
  const favRoutines = () => (db.favs || []).map(getRoutine).filter(Boolean);

  /* ---------- Imagen para compartir ---------- */
  function roundRect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function wrapText(g, text, x, y, maxW, lh, maxLines = 3) {
    const words = String(text).split(" "); let line = "", lines = [];
    words.forEach((w) => { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
    lines.push(line); lines = lines.slice(0, maxLines);
    lines.forEach((l, i) => g.fillText(l, x, y + i * lh));
    return lines.length;
  }
  const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  async function sessionImage(s) {
    const W = 1080, H = 1350, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    try { await document.fonts?.ready; } catch (e) { /* sin fuentes */ }
    const F = (w, px) => `${w} ${px}px "Plus Jakarta Sans", system-ui, sans-serif`;
    const t = ACT[typeOf(s)], r = s.routineId && getRoutine(s.routineId), c = r?.cat ? catOf(r.cat) : null;
    const accent = c?.color || t.color, pastel = c?.bg || "#E9F3EE";
    const bgGr = g.createLinearGradient(0, 0, W, H); bgGr.addColorStop(0, pastel); bgGr.addColorStop(1, "#FFFFFF");
    g.fillStyle = bgGr; g.fillRect(0, 0, W, H);
    g.fillStyle = accent; g.globalAlpha = .12;
    g.beginPath(); g.arc(W - 120, 140, 220, 0, 7); g.fill();
    g.beginPath(); g.arc(90, H - 120, 180, 0, 7); g.fill(); g.globalAlpha = 1;
    // marca
    g.fillStyle = "#1D2925"; g.font = F(800, 40); g.textAlign = "left"; g.fillText("Mi Gimnasio en Casa", 80, 110);
    // tarjeta
    g.save(); g.shadowColor = "rgba(20,30,25,.12)"; g.shadowBlur = 50; g.shadowOffsetY = 18;
    roundRect(g, 70, 160, W - 140, H - 300, 56); g.fillStyle = "#FFFFFF"; g.fill(); g.restore();
    // ilustración
    const cx = W / 2, cy = 430;
    g.fillStyle = pastel; g.beginPath(); g.arc(cx, cy, 190, 0, 7); g.fill();
    const img = r ? await loadImg(miniSrc(r.items[0][0])) : null;
    if (img) {
      g.save(); g.beginPath(); g.arc(cx, cy, 190, 0, 7); g.clip();
      g.drawImage(img, cx - 245, cy - 255, 490, 490); g.restore();
    } else {
      g.font = F(400, 190); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t.emoji, cx, cy + 10); g.textBaseline = "alphabetic";
    }
    // fecha y título
    const d = new Date(s.date);
    g.textAlign = "center"; g.fillStyle = accent; g.font = F(800, 34);
    g.fillText(d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }).toUpperCase(), cx, 700);
    g.fillStyle = "#1D2925"; g.font = F(800, 70);
    const nl = wrapText(g, s.name || t.name, cx, 790, W - 260, 82, 2);
    // datos
    const f = FEELINGS[(s.feeling || 3) - 1];
    const stats = [["⏱", fmtMin(s.minutes || 0), "de actividad"]];
    if (s.km) stats.push(["👟", `${s.km.toLocaleString("es-ES")} km`, "recorridos"]);
    else if (s.total) stats.push(["💪", `${s.exercises ?? s.total}`, "ejercicios"]);
    else {
      const ws = weekStart(new Date(s.date)), n = db.sessions.filter((x) => { const dx = new Date(x.date); return dx >= ws && x.date <= s.date; }).length;
      stats.push(["📅", `${Math.max(1, n)}ª`, "de la semana"]);
    }
    stats.push([f.e, f.t, "me he sentido"]);
    const y0 = 790 + nl * 82 + 40, bw = 270, gap = 24, x0 = cx - (bw * 3 + gap * 2) / 2;
    stats.forEach(([e, v, l], i) => {
      const x = x0 + i * (bw + gap);
      roundRect(g, x, y0, bw, 230, 36); g.fillStyle = pastel; g.fill();
      g.textAlign = "center"; g.font = F(400, 60); g.fillStyle = "#1D2925"; g.fillText(e, x + bw / 2, y0 + 82);
      g.font = F(800, 40); g.fillText(v, x + bw / 2, y0 + 150);
      g.font = F(600, 28); g.fillStyle = "#56645F"; g.fillText(l, x + bw / 2, y0 + 195);
    });
    // pie
    const streak = weekStreak();
    g.textAlign = "center"; g.fillStyle = "#56645F"; g.font = F(700, 36);
    const who = db.settings.name ? `${db.settings.name}` : "";
    const foot = streak >= 2 ? `🔥 ${streak} semanas seguidas activa` : "💚 Cada día un poco mejor";
    g.fillText(who ? `${who} · ${foot}` : foot, cx, H - 70);
    return new Promise((res) => cv.toBlob(res, "image/png"));
  }
  async function shareSession(s) {
    const blob = await sessionImage(s);
    if (!blob) { toast("No se ha podido crear la imagen"); return; }
    const file = new File([blob], `mi-actividad-${s.date.slice(0, 10)}.png`, { type: "image/png" });
    const text = `${s.name} · ${fmtMin(s.minutes || 0)} 💪`;
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: s.name, text }); return; }
    } catch (e) { if (e.name === "AbortError") return; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast("📥 Imagen guardada. Ya puedes enviarla");
  }
  /* Después de guardar: tarjeta para compartir (y logro nuevo si lo hay) */
  function afterSave(rec, before) {
    const fresh = achievementsState().list.filter((b) => b.ok && !before.includes(b.id));
    const b = fresh[fresh.length - 1];
    if (b) beep(true);
    setTimeout(() => {
      openSheet(`<div class="saved-sheet">
        <div class="saved-top"><span class="saved-ok">${ICON.check}</span><div><strong>¡Guardado en tu diario!</strong><span class="small muted">¿Quieres compartirlo con alguien?</span></div></div>
        ${b ? `<button class="new-badge" data-act="badge" data-id="${b.id}">${medal(b, "sm")}<span class="grow"><span class="eyebrow-s">¡Nuevo logro!</span><strong>${esc(b.name)}</strong><span class="small muted">${esc(b.desc)}</span></span></button>` : ""}
        <div class="share-preview"><div class="sp-loading">Preparando la imagen…</div><img id="shImg" alt="Tarjeta de la actividad" hidden></div>
        <button class="btn block huge" id="shGo">${SHARE} Compartir</button>
        <button class="btn ghost block" data-act="close-sheet">Ahora no</button></div>`, async (sh) => {
        $("#shGo", sh).addEventListener("click", () => shareSession(rec));
        const blob = await sessionImage(rec);
        const im = $("#shImg", sh);
        if (blob && im) { im.src = URL.createObjectURL(blob); im.hidden = false; $(".sp-loading", sh)?.remove(); }
      });
    }, 350);
  }

  function exItem(ex, { right = "", href = true, num = "" } = {}) {
    const z = ZONES[ex.zone];
    const inner = `${num ? `<span class="num">${num}</span>` : ""}
      <div class="tile pic" style="background:${catOf(ex.zone)?.bg || "var(--surface-2)"}">${mini(ex.id)}</div>
      <div class="grow"><h4>${esc(ex.name)}</h4><div class="sub">${right || `${ex.equip.map((e) => EQUIP[e].emoji).join(" ")} ${esc(EQUIP[ex.equip[0]].name)} · ${LEVELS[ex.level]}`}</div></div>`;
    return href
      ? `<a class="ex-item" href="#/ejercicio/${ex.id}">${inner}${CHEV}</a>`
      : `<div class="ex-item">${inner}</div>`;
  }
  function viewerBlock(ex) {
    const hasPhoto = PHOTOS.has(ex.id);
    return `<div class="viewer">
      ${hasPhoto ? `<div class="seg viewer-tabs"><button class="on" data-act="vt" data-v="3d">Muñeco 3D</button><button data-act="vt" data-v="foto">Fotos reales</button></div>` : ""}
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
  const CAT_IMG = { full: "squat", piernas: "glute-bridge", espalda: "band-row", pecho: "floor-press", hombros: "lateral-raise",
    brazos: "biceps-curl", core: "bird-dog", equilibrio: "single-leg", movilidad: "cat-cow" };
  const ICON = {
    play: `<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/></svg>`,
    check: `<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  };

  function viewHome() {
    const now = new Date(), h = now.getHours();
    const hi = h < 14 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches";
    const name = db.settings.name;
    const dateStr = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }).replace(/^./, (c) => c.toUpperCase());
    const today = dateKey(now), todays = sessionsOn(today);
    const planCat = WEEK_PLAN[now.getDay()], planned = planCat ? suggestedRoutine(planCat, now) : null;

    // 1) Lo grande: la rutina de hoy
    const sugg = planned || suggestedRoutine("movilidad", now);
    const sc = catOf(sugg.cat);
    const imgs = sugg.items.slice(0, 3).map(([id]) => `<img src="${miniSrc(id)}" alt="">`).join("");
    const trainCard = `<div class="tcard train-card hero-train">
      <div class="today-art" style="${catStyle(sc)}"><span class="badge-day">${planned ? "✨ Tu rutina de hoy" : "🌿 Hoy, algo suave"}</span>${imgs}</div>
      <div class="today-body">
        <span class="eyebrow-s">${sc.emoji} ${esc(sc.name)} · ${routineMins(sugg)} min · ${sugg.items.length} ejercicios</span>
        <h3>${esc(sugg.name)}</h3>
        ${sugg.desc ? `<p>${esc(sugg.desc)}</p>` : ""}
        <div class="row"><button class="btn grow huge" data-act="start" data-id="${sugg.id}">${ICON.play} Empezar</button>
          <a class="btn ghost huge" href="#/rutina/${sugg.id}">Ver</a></div>
        <a class="link-other" href="#/rutinas">Elegir otra rutina ›</a>
      </div></div>`;

    // 2) Lo pequeño: apuntar otra actividad en un toque
    const doneMins = todays.reduce((acc, x) => acc + (x.minutes || 0), 0);
    const quickLog = `<div class="quick-log">
      <div class="ql-top"><strong>¿Has hecho otra actividad?</strong>
        ${todays.length ? `<span class="ql-done">${ICON.check} Hoy: ${todays.map((x) => esc(x.name)).join(", ")} · ${fmtMin(doneMins)}</span>` : `<span class="small muted">Apúntala en un toque</span>`}</div>
      <div class="ql-row">${ACT_TYPES.map((t) => `<button class="ql-btn" data-act="add-activity" data-type="${t.id}" style="--c:${t.color}" aria-label="Apuntar ${t.name}">
        <span>${t.emoji}</span><small>${t.name}</small></button>`).join("")}</div>
    </div>`;
    const card = `${trainCard}<div class="section">${quickLog}</div>`;

    const ws = weekStart();
    const week = DAYS_SHORT.map((d, i) => {
      const day = new Date(ws); day.setDate(ws.getDate() + i);
      const k = dateKey(day), done = sessionsOn(k).length > 0;
      return `<div class="day ${done ? "done" : ""} ${k === today ? "today" : ""}"><div class="dot">${done ? ICON.check : day.getDate()}</div>${d}</div>`;
    }).join("");
    const wk = sessionsThisWeek(), nWeek = wk.length, goal = db.settings.goal;
    const minsWeek = wk.reduce((a, s) => a + (s.minutes || 0), 0);
    const streak = weekStreak(), ach = achievementsState();

    // Volver a hacer: últimas rutinas distintas
    const seen = new Set(), recent = [];
    [...db.sessions].sort((a, b) => b.date.localeCompare(a.date)).forEach((s) => {
      const r = s.routineId && getRoutine(s.routineId);
      if (r && !seen.has(r.id)) { seen.add(r.id); recent.push(r); }
    });
    const again = recent.length ? recent.slice(0, 4) : ["full-1", "bal-1", "mob-2"].map(getRoutine).filter(Boolean);
    const againCards = again.map(miniRoutineCard).join("");
    const favs = favRoutines();

    return {
      title: "",
      html: `
        <div class="home-head"><h2>${hi}${name ? `, ${esc(name)}` : ""}</h2><p>${esc(dateStr)}</p></div>
        ${card}
        <div class="section card week-card">
          <div class="week-top"><strong>Esta semana</strong><span class="pill">${nWeek} de ${goal}</span></div>
          <div class="week">${week}</div>
          <div class="progress"><span style="width:${Math.min(100, (nWeek / goal) * 100)}%"></span></div>
        </div>
        <div class="section quick-stats">
          <a class="qs qs-a" href="#/historial"><b>${minsWeek}<small> min</small></b><span>esta semana</span></a>
          <a class="qs qs-b" href="#/historial"><b>${streak}<small> ${streak === 1 ? "sem." : "sem."}</small></b><span>de racha</span></a>
          <a class="qs qs-c" href="#/logros"><b>${ach.got}<small> / ${ach.total}</small></b><span>logros</span></a>
        </div>
        ${favs.length ? `<div class="section">
          <h3 class="section-title">❤️ Tus favoritas <a href="#/rutinas">Ver todas</a></h3>
          <div class="hscroll">${favs.map(miniRoutineCard).join("")}</div>
        </div>` : ""}
        <div class="section">
          <h3 class="section-title">${recent.length ? "Volver a hacer" : "Para empezar"} <a href="#/rutinas">Ver todas</a></h3>
          <div class="hscroll">${againCards}</div>
        </div>`,
    };
  }

  function categoryGrid() {
    return `<div class="cat-grid">${CATEGORIES.map((c) => {
      const n = ROUTINES.filter((r) => r.cat === c.id).length;
      return `<a class="cat" href="#/categoria/${c.id}" style="${catStyle(c)}">
        <span class="cat-img"><span class="cat-emoji">${c.emoji}</span><img src="${miniSrc(CAT_IMG[c.id])}" alt="" loading="lazy"></span>
        <span class="cat-txt"><strong>${esc(c.name)}</strong><span class="n">${n} rutinas</span></span></a>`;
    }).join("")}</div>`;
  }

  function viewRoutines() {
    const favs = favRoutines();
    const custom = db.custom.length
      ? `<div class="routine-list">${db.custom.map((r) => routineCard(r)).join("")}</div>`
      : `<div class="card center"><p class="muted" style="margin:0">Aún no has creado ninguna rutina propia.</p></div>`;
    const filtered = durFilter ? allRoutines().filter((r) => durOf(r) === durFilter).sort((x, y) => routineMins(x) - routineMins(y)) : [];
    return {
      title: "Entrenar",
      html: `
        <div class="seg top-seg"><a href="#/rutinas" class="on">Rutinas</a><a href="#/ejercicios">Ejercicios</a></div>
        <div class="section" style="margin-top:4px">
          <h3 class="section-title">❤️ Tus favoritas</h3>
          ${favs.length ? `<div class="hscroll">${favs.map(miniRoutineCard).join("")}</div>`
            : `<div class="fav-empty">Pulsa el ${HEART} de una rutina para tenerla siempre a mano aquí.</div>`}
        </div>
        <div class="section">
          <h3 class="section-title">¿Cuánto tiempo tienes?</h3>
          ${durChips()}
        </div>
        ${durFilter
          ? `<div class="section" style="margin-top:8px"><p class="small muted" style="margin:0 0 10px">${filtered.length} rutinas · ordenadas de más corta a más larga</p>
              <div class="routine-list">${filtered.map((r) => routineCard(r)).join("")}</div></div>`
          : `<div class="section" style="margin-top:8px">
              <h3 class="section-title">¿Qué quieres trabajar?</h3>${categoryGrid()}</div>
             <div class="section">
              <h3 class="section-title">Mis rutinas</h3>
              ${custom}
              <a class="btn ghost block" style="margin-top:12px" href="#/crear">➕ Crear mi propia rutina</a>
            </div>`}`,
    };
  }

  function viewCategory(id) {
    const c = catOf(id);
    if (!c) return notFound();
    const all = ROUTINES.filter((r) => r.cat === id);
    const list = durFilter ? all.filter((r) => durOf(r) === durFilter) : all;
    return {
      title: c.name, back: true,
      html: `
        <div class="cat-hero" style="${catStyle(c)}">
          <div class="ch-img">${mini(CAT_IMG[c.id])}</div>
          <div><span class="ch-emoji">${c.emoji}</span><h2>${esc(c.name)}</h2><p>${esc(c.desc)}</p></div>
        </div>
        <div class="section">${durChips()}</div>
        <div class="routine-list" style="margin-top:6px">${list.length ? list.map((r) => routineCard(r, { showCat: false })).join("")
          : `<div class="card center muted">No hay rutinas de esta duración aquí. Prueba con otra.</div>`}</div>`,
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
        <div class="detail-head"><div class="tile lg" style="background:${c?.bg || "var(--surface-2)"}">${r.items[0] ? mini(r.items[0][0]) : ""}</div>
          <div class="grow">${c ? `<div class="eyebrow-s">${c.emoji} ${esc(c.name)}</div>` : ""}<h2>${esc(r.name)}</h2>${r.desc ? `<p class="muted" style="margin:4px 0 0">${esc(r.desc)}</p>` : ""}</div>
          ${favBtn(r.id, "big")}</div>
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
        <div class="sticky-cta"><div><button class="btn block huge" data-act="start" data-id="${esc(r.id)}">${ICON.play} Empezar</button></div></div>`,
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
      title: "Entrenar",
      html: `
        <div class="seg top-seg"><a href="#/rutinas" class="">Rutinas</a><a href="#/ejercicios" class="on">Ejercicios</a></div>
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
        ${usedIn.length ? `<div class="section"><h3 class="section-title">Aparece en estas rutinas</h3><div class="routine-list">${usedIn.slice(0, 6).map((r) => routineCard(r)).join("")}</div></div>` : ""}
        <div class="sticky-cta"><div><button class="btn block" data-act="try-ex" data-id="${ex.id}">${ICON.play} Probar este ejercicio</button></div></div>`,
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
        <div class="top"><span class="tile pic" style="background:${catOf(ex.zone)?.bg};width:48px;height:48px;border-radius:12px">${mini(ex.id)}</span>
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
          <div class="tile pic" style="background:${catOf(e.zone)?.bg}">${mini(e.id)}</div>
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

  /* ---------- Actividades y diario ---------- */
  // Colores validados para daltonismo (orden fijo; el color sigue a la actividad, nunca al ranking)
  const ACT_TYPES = [
    { id: "gym", name: "Gimnasio", emoji: "🏋️‍♀️", color: "#2a78d6", ink: "#fff" },
    { id: "paseo", name: "Paseo", emoji: "🚶‍♀️", color: "#eb6834", ink: "#fff", km: true },
    { id: "natacion", name: "Natación", emoji: "🏊‍♀️", color: "#1baf7a", ink: "#14161f" },
    { id: "bici", name: "Bici", emoji: "🚴‍♀️", color: "#eda100", ink: "#14161f", km: true },
    { id: "yoga", name: "Yoga", emoji: "🧘‍♀️", color: "#e87ba4", ink: "#14161f" },
    { id: "otra", name: "Otra", emoji: "✨", color: "#008300", ink: "#fff" },
  ];
  const ACT = Object.fromEntries(ACT_TYPES.map((t) => [t.id, t]));
  const INTENSITY = [["🙂", "Suave"], ["😅", "Moderado"], ["🔥", "Intenso"]];
  const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`);
  const shortDate = (d) => d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "");

  function typeOf(s) {
    if (s.type && ACT[s.type]) return s.type;
    if (s.routineId) return "gym";
    const n = norm(s.name || "");
    if (n.includes("paseo") || n.includes("camin")) return "paseo";
    if (n.includes("yoga") || n.includes("pilates")) return "yoga";
    if (n.includes("nata")) return "natacion";
    if (n.includes("bici")) return "bici";
    if (n.includes("gimnas")) return "gym";
    return "otra";
  }
  /* Zonas trabajadas: usan los mismos ids que las categorías (full, piernas, espalda…) */
  function areasOfRoutine(r) {
    if (!r) return [];
    if (r.cat) return [r.cat];
    const items = r.items.slice(r.warm || 0);
    return [...new Set(items.map(([e]) => EX[e]?.zone).filter(Boolean))];
  }
  function areasOf(s) {
    if (Array.isArray(s.areas)) return s.areas;
    if (!s.routineId) return [];
    if (s.routineId.startsWith("ex-")) { const ex = EX[s.routineId.slice(3)]; return ex ? [ex.zone] : []; }
    return areasOfRoutine(getRoutine(s.routineId));
  }

  /* ----- Formulario para apuntar / editar una actividad ----- */
  function openActivitySheet(s0 = null, preset = null) {
    const isWorkout = !!s0?.routineId;
    const st = {
      type: s0 ? typeOf(s0) : (preset && ACT[preset] ? preset : "gym"),
      minutes: s0?.minutes || 30, feeling: s0?.feeling || 3, intensity: s0?.intensity || 2,
      areas: new Set(s0 ? areasOf(s0) : []), km: s0?.km || 0,
    };
    const today = dateKey(new Date()), yest = dateKey(new Date(Date.now() - 864e5));
    const d0 = s0 ? s0.date.slice(0, 10) : today;
    openSheet(`<h2>${s0 ? "Editar actividad" : "¿Qué has hecho hoy?"}</h2>
      <div class="stack">
        <div class="act-grid">${ACT_TYPES.map((t) => `<button class="act-type ${t.id === st.type ? "on" : ""}" data-at="${t.id}" style="--c:${t.color}" ${isWorkout && t.id !== "gym" ? "disabled" : ""}>
          <span class="em">${t.emoji}</span>${t.name}</button>`).join("")}</div>
        ${isWorkout ? `<p class="small muted" style="margin:0">Rutina: <strong>${esc(s0.name)}</strong></p>` : ""}
        <label class="field" id="aOther"><span>¿Qué actividad?</span><input class="input" id="aName" maxlength="30" placeholder="Ej.: Baile, Pilates, Tenis…" value="${esc(s0 && typeOf(s0) === "otra" ? s0.name : "")}"></label>
        <div id="aAreas"><strong>¿Qué has trabajado?</strong> <span class="small muted">(puedes elegir varias)</span>
          <div class="chips wrap" style="margin-top:8px">${CATEGORIES.map((c) => `<button class="chip ${st.areas.has(c.id) ? "on" : ""}" data-aa="${c.id}">${c.emoji} ${esc(c.name)}</button>`).join("")}</div></div>
        <div class="card dur">
          <strong>¿Cuánto tiempo?</strong>
          <div class="dur-row"><button class="round" data-am="-5" aria-label="Menos">−</button><output id="aMin">${st.minutes}</output><span class="unit">min</span><button class="round" data-am="5" aria-label="Más">+</button></div>
          <div class="chips wrap center-chips">${[15, 30, 45, 60, 90].map((m) => `<button class="chip ${m === st.minutes ? "on" : ""}" data-aq="${m}">${m < 60 ? m + " min" : fmtMin(m)}</button>`).join("")}</div>
        </div>
        <div class="switch-row card" id="aKm"><div><strong>Distancia</strong><div class="small muted">Opcional</div></div>
          <span class="stepper"><button data-ak="-0.5" aria-label="Menos">−</button><output id="aKmV">${st.km} km</output><button data-ak="0.5" aria-label="Más">+</button></span></div>
        <div><strong>Esfuerzo</strong>
          <div class="seg seg-icons" style="margin-top:8px">${INTENSITY.map(([e, t], i) => `<button data-ai="${i + 1}" class="${i + 1 === st.intensity ? "on" : ""}"><span class="se">${e}</span>${t}</button>`).join("")}</div></div>
        <div><strong>¿Cómo te has sentido?</strong>
          <div class="feel" style="margin-top:8px">${FEELINGS.map((f, i) => `<button data-mf="${i + 1}" class="${i + 1 === st.feeling ? "on" : ""}"><span class="e">${f.e}</span>${f.t}</button>`).join("")}</div></div>
        <div><strong>¿Cuándo?</strong>
          <div class="row" style="margin-top:8px;flex-wrap:wrap">
            <button class="chip ${d0 === today ? "on" : ""}" data-ad="${today}">Hoy</button>
            <button class="chip ${d0 === yest ? "on" : ""}" data-ad="${yest}">Ayer</button>
            <input class="input grow" type="date" id="aDate" value="${d0}" max="${today}" style="min-width:150px">
          </div></div>
        <label class="field"><span>Comentario <span class="small muted">(opcional)</span></span>
          <textarea class="input" id="aNote" maxlength="200" placeholder="Ej.: Paseo por el parque con Carmen">${esc(s0?.note || "")}</textarea></label>
        <button class="btn block huge green" id="aSave">${s0 ? "💾 Guardar cambios" : "✅ Guardar en mi diario"}</button>
        ${s0 ? `<button class="btn soft block" id="aShare">${SHARE} Compartir esta actividad</button>
          <button class="btn danger block" id="aDel">Borrar esta actividad</button>` : ""}
      </div>`, (sh) => {
      const sync = () => {
        const t = ACT[st.type];
        $("#aOther", sh).hidden = st.type !== "otra";
        $("#aAreas", sh).hidden = st.type !== "gym";
        $("#aKm", sh).hidden = !t.km;
        $("#aMin", sh).textContent = st.minutes;
        $("#aKmV", sh).textContent = `${st.km.toLocaleString("es-ES")} km`;
        $$("[data-aq]", sh).forEach((b) => b.classList.toggle("on", +b.dataset.aq === st.minutes));
      };
      sync();
      sh.addEventListener("click", (e) => {
        const at = e.target.closest("[data-at]"), aa = e.target.closest("[data-aa]"), am = e.target.closest("[data-am]"),
          aq = e.target.closest("[data-aq]"), ak = e.target.closest("[data-ak]"), ai = e.target.closest("[data-ai]"),
          mf = e.target.closest("[data-mf]"), ad = e.target.closest("[data-ad]");
        if (at && !at.disabled) { st.type = at.dataset.at; $$("[data-at]", sh).forEach((b) => b.classList.toggle("on", b === at)); }
        if (aa) { const id = aa.dataset.aa; st.areas.has(id) ? st.areas.delete(id) : st.areas.add(id); aa.classList.toggle("on", st.areas.has(id)); }
        if (am) st.minutes = Math.max(5, Math.min(600, st.minutes + +am.dataset.am));
        if (aq) st.minutes = +aq.dataset.aq;
        if (ak) st.km = Math.max(0, Math.min(200, Math.round((st.km + +ak.dataset.ak) * 10) / 10));
        if (ai) { st.intensity = +ai.dataset.ai; $$("[data-ai]", sh).forEach((b) => b.classList.toggle("on", b === ai)); }
        if (mf) { st.feeling = +mf.dataset.mf; $$("[data-mf]", sh).forEach((b) => b.classList.toggle("on", b === mf)); }
        if (ad) { $("#aDate", sh).value = ad.dataset.ad; $$("[data-ad]", sh).forEach((b) => b.classList.toggle("on", b === ad)); }
        if (at || am || aq || ak) sync();
      });
      $("#aDate", sh).addEventListener("change", (e) => $$("[data-ad]", sh).forEach((b) => b.classList.toggle("on", b.dataset.ad === e.target.value)));
      $("#aSave", sh).addEventListener("click", () => {
        const before = earnedIds();
        const t = ACT[st.type];
        const dk = $("#aDate", sh).value || today;
        let date;
        if (s0 && s0.date.slice(0, 10) === dk) date = s0.date;
        else { const d = parseKey(dk), n = new Date(); d.setHours(n.getHours(), n.getMinutes(), n.getSeconds()); date = localStamp(d); }
        const rec = {
          ...(s0 || {}), id: s0?.id || uid(), date, type: st.type,
          name: isWorkout ? s0.name : st.type === "otra" ? ($("#aName", sh).value.trim() || "Otra actividad") : t.name,
          emoji: isWorkout ? s0.emoji : t.emoji,
          minutes: st.minutes, feeling: st.feeling, intensity: st.intensity,
          note: $("#aNote", sh).value.trim(),
        };
        if (t.km && st.km > 0) rec.km = st.km; else delete rec.km;
        if (st.type === "gym") rec.areas = [...st.areas]; else delete rec.areas;
        if (s0) db.sessions = db.sessions.map((x) => (x.id === s0.id ? rec : x));
        else db.sessions.push(rec);
        save(); closeSheet();
        router();
        if (s0) { toast("💾 Cambios guardados"); celebrateNew(before); } else afterSave(rec, before);
      });
      $("#aShare", sh)?.addEventListener("click", () => shareSession(s0));
      $("#aDel", sh)?.addEventListener("click", () => confirmSheet("¿Borrar esta actividad?", "Se quitará de tu diario.", "Sí, borrar", () => {
        db.sessions = db.sessions.filter((x) => x.id !== s0.id); save(); toast("Actividad borrada"); router();
      }, true));
    });
  }

  /* ----- Diario ----- */
  let histMonth = new Date(); histMonth.setDate(1);
  let showAllLogs = false;
  function logItem(s, canEdit = true) {
    const t = ACT[typeOf(s)], d = new Date(s.date), f = FEELINGS[(s.feeling || 3) - 1];
    const areas = typeOf(s) === "gym" ? areasOf(s).map((a) => catOf(a)).filter(Boolean) : [];
    const extra = [fmtMin(s.minutes || 0), s.km ? `${s.km.toLocaleString("es-ES")} km` : ""].filter(Boolean).join(" · ");
    const tag = canEdit ? "button" : "div";
    return `<${tag} class="log-item" ${canEdit ? `data-act="edit-session" data-id="${esc(s.id)}" aria-label="Editar ${esc(s.name || t.name)}"` : ""} style="--c:${t.color}">
      <span class="log-ic">${t.emoji}</span>
      <div class="grow"><h4>${esc(s.name || t.name)}</h4>
        <div class="sub">${esc(d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }))} · ${esc(extra)}</div>
        ${areas.length ? `<div class="mini-tags">${areas.map((c) => `<span>${c.emoji} ${esc(c.name)}</span>`).join("")}</div>` : ""}
        ${s.note ? `<div class="note">“${esc(s.note)}”</div>` : ""}</div>
      <span class="e" title="${f.t}">${f.e}</span></${tag}>`;
  }

  /* Semana a semana: una sola serie, sencilla */
  function weeklyData() {
    const w0 = weekStart(), weeks = [];
    for (let i = 7; i >= 0; i--) {
      const s = new Date(w0); s.setDate(w0.getDate() - 7 * i);
      const e = new Date(s); e.setDate(s.getDate() + 7);
      weeks.push({ s, e, total: 0, n: 0 });
    }
    db.sessions.forEach((x) => {
      const d = new Date(x.date), w = weeks.find((w) => d >= w.s && d < w.e);
      if (w) { w.total += x.minutes || 0; w.n++; }
    });
    return weeks;
  }
  function weeklyBars(sel = 7) {
    const weeks = weeklyData();
    if (!weeks.some((w) => w.total)) return `<p class="small muted center" style="margin:8px 0">Aún no hay actividad en las últimas semanas.</p>`;
    const W = 320, H = 150, T = 22, Bm = 24, gap = 10;
    const bw = (W - gap * 7) / 8, max = Math.max(...weeks.map((w) => w.total));
    const best = weeks.findIndex((w) => w.total === max);
    const ph = H - T - Bm;
    const bars = weeks.map((w, i) => {
      const x = i * (bw + gap), h = w.total ? Math.max(6, (w.total / max) * ph) : 0, y = T + ph - h;
      const lab = i === 7 ? "Esta" : `${w.s.getDate()}/${w.s.getMonth() + 1}`;
      const showVal = (i === sel || i === best) && w.total;
      return `<g class="wb ${i === sel ? "sel" : ""} ${i === 7 ? "now" : ""}" data-wk="${i}" role="button" tabindex="0" aria-label="Semana del ${shortDate(w.s)}: ${w.total} minutos">
        <rect class="hit" x="${x - gap / 2}" y="0" width="${bw + gap}" height="${H}"/>
        ${h ? `<path class="bar" d="${roundTop(x, y, bw, h, 6)}"/>` : `<rect class="zero" x="${x}" y="${T + ph - 3}" width="${bw}" height="3" rx="1.5"/>`}
        ${showVal ? `<text class="val" x="${x + bw / 2}" y="${y - 6}" text-anchor="middle">${w.total}</text>` : ""}
        <text class="xl" x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${lab}</text></g>`;
    }).join("");
    const w = weeks[sel];
    return `<svg class="chart wbars" viewBox="0 0 ${W} ${H}" role="img" aria-label="Minutos de actividad por semana">${bars}</svg>
      <p class="wk-cap">${w.total ? `Semana del ${shortDate(w.s)}: <b>${fmtMin(w.total)}</b> en ${w.n} ${w.n === 1 ? "actividad" : "actividades"}` : `Semana del ${shortDate(w.s)}: sin actividad`}</p>`;
  }
  const roundTop = (x, y, w, h, r) => {
    r = Math.min(r, w / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  };

  function viewHistory() {
    const y = histMonth.getFullYear(), m = histMonth.getMonth();
    const list = db.sessions.filter((s) => { const d = new Date(s.date); return d.getFullYear() === y && d.getMonth() === m; })
      .sort((a, b) => b.date.localeCompare(a.date));
    const minutes = list.reduce((a, s) => a + (s.minutes || 0), 0);
    const days = new Set(list.map((s) => s.date.slice(0, 10))).size;
    const km = list.reduce((a, s) => a + (s.km || 0), 0);
    const avgFeel = list.length ? FEELINGS[Math.round(list.reduce((a, s) => a + (s.feeling || 3), 0) / list.length) - 1] : null;
    const first = new Date(y, m, 1);
    const monthName = first.toLocaleDateString("es-ES", { month: "long" }).replace(/^./, (c) => c.toUpperCase());
    const isCurrent = y === new Date().getFullYear() && m === new Date().getMonth();
    const streak = weekStreak();

    // Calendario
    const offset = (first.getDay() + 6) % 7, daysIn = new Date(y, m + 1, 0).getDate(), todayK = dateKey(new Date());
    let cells = DAYS_SHORT.map((d) => `<div class="wd">${d}</div>`).join("");
    for (let i = 0; i < offset; i++) cells += `<div class="cd out"></div>`;
    for (let d = 1; d <= daysIn; d++) {
      const k = dateKey(new Date(y, m, d));
      const ts = [...new Set(sessionsOn(k).map(typeOf))];
      cells += ts.length
        ? `<div class="cd has ${k === todayK ? "today" : ""}" style="--c:${ACT[ts[0]].color}" title="${ts.map((t) => ACT[t].name).join(", ")}"><span class="ce">${ACT[ts[0]].emoji}</span>${ts.length > 1 ? `<span class="cplus">+${ts.length - 1}</span>` : ""}</div>`
        : `<div class="cd ${k === todayK ? "today" : ""}">${d}</div>`;
    }

    // Lo que has hecho
    const by = {}; list.forEach((s) => { const t = typeOf(s); by[t] = by[t] || { m: 0, n: 0 }; by[t].m += s.minutes || 0; by[t].n++; });
    const types = Object.keys(by).sort((a, b) => by[b].m - by[a].m);
    const maxT = Math.max(1, ...types.map((t) => by[t].m));
    const doneRows = types.map((t) => `<div class="done-row" style="--c:${ACT[t].color}">
        <span class="log-ic">${ACT[t].emoji}</span>
        <div class="grow"><div class="dr-top"><strong>${ACT[t].name}</strong><span>${fmtMin(by[t].m)}</span></div>
          <div class="dr-bar"><span style="width:${(by[t].m / maxT) * 100}%"></span></div>
          <div class="small muted">${by[t].n} ${by[t].n === 1 ? "vez" : "veces"}</div></div></div>`).join("");

    // Partes del cuerpo
    const cnt = {};
    list.filter((s) => typeOf(s) === "gym").forEach((s) => areasOf(s).forEach((a) => (cnt[a] = (cnt[a] || 0) + 1)));
    const anyArea = Object.keys(cnt).length > 0;
    const body = CATEGORIES.map((c) => `<div class="bchip ${cnt[c.id] ? "on" : ""}" style="--c:${c.color}">
        <span class="be">${c.emoji}</span><span class="bn">${esc(c.name)}</span>${cnt[c.id] ? `<b>${cnt[c.id]}</b>` : ""}</div>`).join("");

    const shown = showAllLogs ? list : list.slice(0, 4);
    const b = achievementsState();

    const sentence = list.length
      ? `${fmtMin(minutes)} de movimiento en ${days} ${days === 1 ? "día" : "días"}`
      : isCurrent ? "Pulsa el botón ＋ para apuntar tu primera actividad del mes" : "Este mes no hubo actividad";

    return {
      title: "Mi diario",
      html: `
        <div class="diary-hero">
          <div class="dh-nav">
            <button class="dh-arrow" data-act="h-month" data-d="-1" aria-label="Mes anterior"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>
            <span>${esc(monthName)} ${y !== new Date().getFullYear() ? y : ""}</span>
            <button class="dh-arrow" data-act="h-month" data-d="1" aria-label="Mes siguiente" ${isCurrent ? "disabled" : ""}><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button>
          </div>
          <div class="dh-big"><b>${list.length}</b><span>${list.length === 1 ? "actividad" : "actividades"}</span></div>
          <p class="dh-sub">${sentence}</p>
          ${list.length ? `<div class="dh-pills">
            ${streak && isCurrent ? `<span>🔥 ${streak} ${streak === 1 ? "semana" : "semanas"} seguidas</span>` : ""}
            ${avgFeel ? `<span>${avgFeel.e} ${avgFeel.t} de media</span>` : ""}
            ${km ? `<span>👟 ${km.toLocaleString("es-ES", { maximumFractionDigits: 1 })} km</span>` : ""}
          </div>` : ""}
        </div>

        <div class="section card">
          <div class="cal">${cells}</div>
        </div>

        ${list.length ? `
        <div class="section card">
          <h3 class="card-title">Lo que has hecho</h3>
          <div class="stack">${doneRows}</div>
        </div>` : ""}

        <div class="section card">
          <h3 class="card-title">Semana a semana</h3>
          <p class="small muted card-sub">Minutos de actividad. Toca una barra para ver la semana.</p>
          <div id="wkChart">${weeklyBars()}</div>
        </div>

        ${list.length ? `
        <div class="section card">
          <h3 class="card-title">Partes del cuerpo</h3>
          <p class="small muted card-sub">${anyArea ? "Lo que has trabajado en el gimnasio este mes." : "Cuando apuntes gimnasio, marca qué has trabajado y aparecerá aquí."}</p>
          <div class="bchips">${body}</div>
        </div>

        <div class="section">
          <h3 class="section-title">Tus actividades</h3>
          <div class="stack">${shown.map((s) => logItem(s)).join("")}</div>
          ${list.length > 4 ? `<button class="btn ghost block" style="margin-top:12px" data-act="toggle-logs">${showAllLogs ? "Ver menos" : `Ver las ${list.length}`}</button>` : ""}
        </div>` : ""}

        <a class="section ach-teaser" href="#/logros">
          <span class="at-medals">${b.recent.map((x) => `<span>${x.e}</span>`).join("") || "<span>🏅</span>"}</span>
          <span class="grow"><strong>Mis logros</strong><span class="small muted">${b.got} de ${b.total} conseguidos</span></span>${CHEV}
        </a>`,
      after() {
        const box = $("#wkChart");
        const pick = (g) => g && (box.innerHTML = weeklyBars(+g.dataset.wk));
        box?.addEventListener("click", (e) => pick(e.target.closest("[data-wk]")));
        box?.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(e.target.closest("[data-wk]")); } });
      },
    };
  }

  /* ---------- LOGROS ---------- */
  const BADGE_GROUPS = [
    { id: "const", name: "Constancia", c1: "#F7D774", c2: "#E3A21A" },
    { id: "racha", name: "Rachas", c1: "#FFB38A", c2: "#E8613C" },
    { id: "tiempo", name: "Tiempo", c1: "#9CC8F5", c2: "#2F7AD0" },
    { id: "var", name: "Variedad", c1: "#A8E0B0", c2: "#3E9B57" },
  ];
  const BADGES = [
    { g: "const", id: "n1", e: "🌱", name: "Primer paso", desc: "Apunta tu primera actividad", v: (m) => m.n, goal: 1, u: ["actividad", "actividades"] },
    { g: "const", id: "n10", e: "🎯", name: "Constante", desc: "10 actividades", v: (m) => m.n, goal: 10, u: ["actividad", "actividades"] },
    { g: "const", id: "n25", e: "🏅", name: "Imparable", desc: "25 actividades", v: (m) => m.n, goal: 25, u: ["actividad", "actividades"] },
    { g: "const", id: "n50", e: "🏆", name: "Campeona", desc: "50 actividades", v: (m) => m.n, goal: 50, u: ["actividad", "actividades"] },
    { g: "const", id: "n100", e: "👑", name: "Leyenda", desc: "100 actividades", v: (m) => m.n, goal: 100, u: ["actividad", "actividades"] },
    { g: "racha", id: "s2", e: "🔥", name: "En racha", desc: "Activa 2 semanas seguidas", v: (m) => m.streak, goal: 2, u: ["semana", "semanas"] },
    { g: "racha", id: "s4", e: "💪", name: "Hábito", desc: "Activa 4 semanas seguidas", v: (m) => m.streak, goal: 4, u: ["semana", "semanas"] },
    { g: "racha", id: "s8", e: "🌟", name: "Estrella", desc: "Activa 8 semanas seguidas", v: (m) => m.streak, goal: 8, u: ["semana", "semanas"] },
    { g: "racha", id: "s12", e: "💎", name: "Diamante", desc: "Activa 12 semanas seguidas", v: (m) => m.streak, goal: 12, u: ["semana", "semanas"] },
    { g: "tiempo", id: "t60", e: "⏰", name: "Primera hora", desc: "60 minutos en total", v: (m) => m.mins, goal: 60, u: ["minuto", "minutos"] },
    { g: "tiempo", id: "long", e: "🏔️", name: "Gran sesión", desc: "Una actividad de 1 hora o más", v: (m) => m.long, goal: 60, u: ["minuto", "minutos"] },
    { g: "tiempo", id: "t600", e: "⏱️", name: "10 horas", desc: "10 horas en total", v: (m) => m.mins, goal: 600, u: ["minuto", "minutos"] },
    { g: "tiempo", id: "t1500", e: "🚀", name: "25 horas", desc: "25 horas en total", v: (m) => m.mins, goal: 1500, u: ["minuto", "minutos"] },
    { g: "var", id: "types3", e: "🎨", name: "Variada", desc: "3 tipos de actividad distintos", v: (m) => m.types, goal: 3, u: ["tipo", "tipos"] },
    { g: "var", id: "areas5", e: "🧭", name: "Exploradora", desc: "Trabaja 5 partes del cuerpo distintas", v: (m) => m.areas, goal: 5, u: ["parte", "partes"] },
    { g: "var", id: "areas8", e: "🌈", name: "Cuerpo entero", desc: "Trabaja todas las partes del cuerpo", v: (m) => m.areas, goal: 8, u: ["parte", "partes"] },
    { g: "var", id: "gym20", e: "🏋️‍♀️", name: "Fuerte", desc: "20 sesiones de gimnasio", v: (m) => m.gym, goal: 20, u: ["sesión", "sesiones"] },
    { g: "var", id: "bal10", e: "⚖️", name: "Equilibrista", desc: "10 sesiones de equilibrio", v: (m) => m.balance, goal: 10, u: ["sesión", "sesiones"] },
    { g: "var", id: "km20", e: "🚶‍♀️", name: "Caminante", desc: "20 km de paseo", v: (m) => m.km, goal: 20, u: ["km", "km"] },
  ];
  function bestWeekStreak(S = db.sessions) {
    const weeks = [...new Set(S.map((s) => dateKey(weekStart(new Date(s.date)))))].sort();
    let best = 0, cur = 0, prev = null;
    weeks.forEach((k) => { const d = parseKey(k); cur = prev && (d - prev) / 864e5 < 8 ? cur + 1 : 1; best = Math.max(best, cur); prev = d; });
    return best;
  }
  function metrics(S) {
    const m = { n: S.length, mins: 0, long: 0, km: 0, gym: 0, balance: 0, types: 0, areas: 0 };
    const types = new Set(), areas = new Set();
    S.forEach((s) => {
      const t = typeOf(s), ar = areasOf(s);
      m.mins += s.minutes || 0; m.long = Math.max(m.long, s.minutes || 0); types.add(t);
      if (t === "paseo") m.km += s.km || 0;
      if (t === "gym") { m.gym++; ar.forEach((a) => a !== "full" && areas.add(a)); if (ar.includes("full")) ["piernas", "espalda", "pecho", "hombros", "brazos", "core"].forEach((a) => areas.add(a)); }
      if (ar.includes("equilibrio")) m.balance++;
    });
    m.types = types.size; m.areas = areas.size; m.streak = bestWeekStreak(S);
    return m;
  }
  /* Estado de todos los logros, con la fecha en que se consiguió cada uno */
  function achievementsState() {
    const S = [...db.sessions].sort((a, b) => a.date.localeCompare(b.date));
    const m = metrics(S);
    const when = {};
    let pending = BADGES.filter((b) => b.v(m) >= b.goal);
    for (let i = 0; i < S.length && pending.length; i++) {
      const mi = metrics(S.slice(0, i + 1));
      pending = pending.filter((b) => { if (b.v(mi) >= b.goal) { when[b.id] = S[i].date; return false; } return true; });
    }
    const list = BADGES.map((b) => ({ ...b, val: b.v(m), ok: b.v(m) >= b.goal, when: when[b.id] }));
    const got = list.filter((b) => b.ok);
    const recent = [...got].sort((a, b) => (b.when || "").localeCompare(a.when || "")).slice(0, 3);
    const next = list.filter((b) => !b.ok).sort((a, b) => b.val / b.goal - a.val / a.goal)[0];
    return { list, got: got.length, total: list.length, recent, next };
  }
  const earnedIds = () => achievementsState().list.filter((b) => b.ok).map((b) => b.id);
  function leftText(b) {
    const r = Math.max(0, b.goal - b.val);
    const v = b.u[0] === "km" ? r.toLocaleString("es-ES", { maximumFractionDigits: 1 }) : Math.ceil(r);
    return `Te ${r === 1 ? "falta" : "faltan"} ${v} ${r === 1 ? b.u[0] : b.u[1]}`;
  }
  function medal(b, size = "") {
    const g = BADGE_GROUPS.find((x) => x.id === b.g);
    const pct = Math.min(100, Math.round((b.val / b.goal) * 100));
    return `<span class="medal-ring ${size} ${b.ok ? "ok" : ""}" style="--m1:${g.c1};--m2:${g.c2};--p:${b.ok ? 100 : pct}%">
      <span class="medal">${b.e}</span>${b.ok ? "" : `<span class="lock">🔒</span>`}</span>`;
  }
  function viewAchievements() {
    const st = achievementsState();
    const pct = st.got / st.total;
    const R = 46, C = 2 * Math.PI * R;
    const msg = st.got === 0 ? "Tu colección de medallas te espera. ¡Apunta tu primera actividad!"
      : st.got === st.total ? "¡Los tienes todos! Eres increíble 👑"
      : st.got >= st.total / 2 ? "¡Vas genial! Ya tienes más de la mitad." : "¡Buen comienzo! Cada actividad suma.";
    const groups = BADGE_GROUPS.map((g) => {
      const items = st.list.filter((b) => b.g === g.id);
      return `<div class="section">
        <h3 class="section-title">${g.name} <span class="muted small">${items.filter((b) => b.ok).length} de ${items.length}</span></h3>
        <div class="medals">${items.map((b) => `<button class="medal-card ${b.ok ? "ok" : ""}" data-act="badge" data-id="${b.id}">
          ${medal(b)}<strong>${esc(b.name)}</strong>
          <span class="mc-sub">${b.ok ? (b.when ? `✓ ${shortDate(new Date(b.when))}` : "✓ Conseguido") : `${b.u[0] === "km" ? b.val.toLocaleString("es-ES", { maximumFractionDigits: 1 }) : Math.floor(b.val)} / ${b.goal}`}</span>
        </button>`).join("")}</div></div>`;
    }).join("");
    return {
      title: "Mis logros",
      html: `
        <div class="ach-hero">
          <svg class="ach-ring" viewBox="0 0 110 110" aria-hidden="true">
            <circle cx="55" cy="55" r="${R}" class="bg"/>
            <circle cx="55" cy="55" r="${R}" class="fg" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/>
          </svg>
          <div class="ach-count"><b>${st.got}</b><span>de ${st.total}</span></div>
          <p>${msg}</p>
        </div>
        ${st.next ? `<button class="next-badge section" data-act="badge" data-id="${st.next.id}">
          ${medal(st.next, "sm")}
          <span class="grow"><span class="eyebrow-s">Tu próximo logro</span><strong>${esc(st.next.name)}</strong>
            <span class="nb-bar"><span style="width:${Math.min(100, (st.next.val / st.next.goal) * 100)}%"></span></span>
            <span class="small muted">${leftText(st.next)}</span></span></button>` : ""}
        ${groups}`,
    };
  }
  function openBadgeSheet(id) {
    const b = achievementsState().list.find((x) => x.id === id); if (!b) return;
    openSheet(`<div class="badge-sheet">
        ${medal(b, "xl")}
        <h2>${esc(b.name)}</h2>
        <p class="muted">${esc(b.desc)}</p>
        ${b.ok
          ? `<p class="bs-ok">✓ Conseguido${b.when ? ` el ${new Date(b.when).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}` : ""}</p>`
          : `<div class="nb-bar big"><span style="width:${Math.min(100, (b.val / b.goal) * 100)}%"></span></div><p><strong>${leftText(b)}</strong></p>`}
        <button class="btn block" data-act="close-sheet">${b.ok ? "¡Genial!" : "¡A por ello!"}</button></div>`);
  }
  /* Si al guardar se consigue un logro nuevo, lo celebramos */
  function celebrateNew(before) {
    const after = achievementsState();
    const fresh = after.list.filter((b) => b.ok && !before.includes(b.id));
    if (!fresh.length) return;
    const b = fresh[fresh.length - 1];
    setTimeout(() => {
      beep(true);
      openSheet(`<div class="badge-sheet celebrate">
        <div class="confetti-row">🎉 ✨ 🎊</div>
        <div class="eyebrow-s">¡Nuevo logro!</div>
        ${medal(b, "xl")}
        <h2>${esc(b.name)}</h2>
        <p class="muted">${esc(b.desc)}</p>
        ${fresh.length > 1 ? `<p class="small">Y ${fresh.length - 1} ${fresh.length === 2 ? "logro más" : "logros más"} 🏅</p>` : ""}
        <div class="stack"><a class="btn block" href="#/logros">Ver mis logros</a>
        <button class="btn ghost block" data-act="close-sheet">¡Genial!</button></div></div>`);
    }, 450);
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
            <div><strong>Color de la app</strong>
              <div class="theme-pick">${THEMES.map(([k, t, c]) => `<button data-act="s-theme" data-v="${k}" class="${(s.theme || "salvia") === k ? "on" : ""}"><i style="background:${c}"></i>${t}</button>`).join("")}</div></div>
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
  const THEMES = [["salvia", "Salvia", "#3E7C6A"], ["lavanda", "Lavanda", "#6B5FC7"], ["oceano", "Océano", "#2D7BA6"], ["terracota", "Terracota", "#B9654E"]];
  function applyTheme() {
    const t = THEMES.some(([k]) => k === db.settings.theme) ? db.settings.theme : "salvia";
    document.documentElement.dataset.theme = t;
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg || "#F5F7F4");
  }
  function applySize() { document.documentElement.dataset.size = db.settings.size; applyTheme(); }
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
    [/^\/rutinas$/, viewRoutines, "entrenar"],
    [/^\/categoria\/([^/]+)$/, viewCategory, "entrenar", "#/rutinas"],
    [/^\/rutina\/([^/]+)$/, viewRoutineDetail, "entrenar", "#/rutinas"],
    [/^\/crear(?:\/([^/]+))?$/, viewBuilder, "entrenar", "#/rutinas"],
    [/^\/ejercicios$/, viewExercises, "entrenar"],
    [/^\/ejercicio\/([^/]+)$/, viewExerciseDetail, "entrenar", "#/ejercicios"],
    [/^\/historial$/, viewHistory, "historial"],
    [/^\/logros$/, viewAchievements, "logros"],
    [/^\/ajustes$/, viewSettings, "", "#/"],
  ];
  let navCount = 0, parentHash = "#/";
  function router(opts = {}) {
    const path = decodeURIComponent(location.hash.replace(/^#/, "")) || "/";
    let view = notFound(), tab = "";
    for (const [re, fn, t, parent] of ROUTES) {
      const m = path.match(re);
      if (m) { view = fn(m[1]); tab = t; parentHash = view.parent || parent || "#/"; break; }
    }
    const main = $("#view");
    main.classList.remove("enter");
    main.innerHTML = view.html;
    if (!opts.quiet) { void main.offsetWidth; main.classList.add("enter"); }
    document.body.dataset.sec = tab || "";
    main.classList.toggle("has-cta", !!view.cta);
    $("#pageTitle").textContent = view.title;
    document.title = view.title ? `${view.title} · Mi Gimnasio` : "Mi Gimnasio en Casa";
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
  let sheetT = 0;
  function openSheet(html, onMount) {
    const bd = $("#sheet");
    clearTimeout(sheetT); bd.classList.remove("closing");
    const sh = $(".sheet", bd).cloneNode(false); // elemento nuevo: sin listeners anteriores
    $(".sheet", bd).replaceWith(sh);
    sh.innerHTML = html; bd.hidden = false;
    document.body.classList.add("no-scroll");
    sh.scrollTop = 0;
    onMount?.(sh);
  }
  function closeSheet() {
    const bd = $("#sheet"); if (bd.hidden || bd.classList.contains("closing")) return;
    const done = () => { bd.hidden = true; bd.classList.remove("closing"); $(".sheet", bd).innerHTML = ""; if (!P) document.body.classList.remove("no-scroll"); };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return done();
    bd.classList.add("closing");
    sheetT = setTimeout(done, 210);
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
      action = `<button class="btn huge block ${P.t.running ? "ghost" : ""}" data-act="p-toggle">${P.t.running ? "Pausa" : P.t.started ? `${ICON.play} Continuar` : `${ICON.play} Empezar`}</button>`;
    } else {
      main = `<div class="p-big">${st.amt}<small>repeticiones${ex.side ? " con cada lado" : ""}</small></div>`;
      action = `<button class="btn huge block green" data-act="p-next">${ICON.check} ¡Hecho!</button>`;
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
        <div style="width:100%;text-align:left;margin-top:12px"><strong>Esfuerzo</strong>
          <div class="seg seg-icons" style="margin-top:8px">${INTENSITY.map(([e, t], i) => `<button data-act="p-int" data-v="${i + 1}" class="${i === 1 ? "on" : ""}"><span class="se">${e}</span>${t}</button>`).join("")}</div></div>
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
    const before = earnedIds();
    const rec = {
      id: uid(), date: localStamp(),
      type: "gym", routineId: P.r.id, name: P.r.name, emoji: P.r.emoji || "🏋️‍♀️",
      areas: areasOfRoutine(P.r), intensity: P.intensity || 2,
      minutes: P.minutes, exercises: Math.max(0, P.done.size - [...P.done].filter((i) => i < P.warm).length), total: P.total - P.warm,
      feeling: P.feeling, note: ($("#pNote")?.value || "").trim(),
    };
    db.sessions.push(rec);
    save();
    stopWorkout();
    if (location.hash === "#/" || location.hash === "") router(); else location.hash = "#/";
    afterSave(rec, before);
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
    "h-month": (el) => { histMonth.setMonth(histMonth.getMonth() + +el.dataset.d); showAllLogs = false; router(); },
    "add-manual": () => openActivitySheet(),
    "add-activity": (el) => { if (!P) openActivitySheet(null, el.dataset.type); },
    "fav": (el) => {
      const id = el.dataset.id; db.favs = db.favs || [];
      const on = !db.favs.includes(id);
      db.favs = on ? [...db.favs, id] : db.favs.filter((x) => x !== id);
      save(); navigator.vibrate?.(8);
      toast(on ? "❤️ Guardada en favoritas" : "Quitada de favoritas");
      const y = window.scrollY; router({ quiet: true }); window.scrollTo(0, y);
    },
    "dur": (el) => { durFilter = el.dataset.v; const y = window.scrollY; router({ quiet: true }); window.scrollTo(0, y); },
    "toggle-logs": () => { showAllLogs = !showAllLogs; router(); },
    "badge": (el) => openBadgeSheet(el.dataset.id),
    "edit-session": (el) => { const s = db.sessions.find((x) => x.id === el.dataset.id); if (s) openActivitySheet(s); },
    "del-session": (el) => confirmSheet("¿Borrar esta sesión?", "Se quitará de tu diario.", "Sí, borrar", () => {
      db.sessions = db.sessions.filter((s) => s.id !== el.dataset.id); save(); router();
    }, true),
    // ajustes
    "s-theme": (el) => { db.settings.theme = el.dataset.v; save(); applyTheme(); $$("[data-act='s-theme']").forEach((b) => b.classList.toggle("on", b === el)); },
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
    "p-int": (el) => { P.intensity = +el.dataset.v; $$("[data-act='p-int']").forEach((b) => b.classList.toggle("on", b === el)); },
    "p-feel": (el) => { P.feeling = +el.dataset.v; $$("[data-act='p-feel']").forEach((b) => b.classList.toggle("on", b === el)); },
    "p-save": () => saveSession(),
    "p-end": () => { closeSheet(); finish(); },
    "p-discard": () => { closeSheet(); stopWorkout(); },
  };
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]");
    if (!el || el.disabled) return;
    const fn = ACTIONS[el.dataset.act];
    if (fn) {
      e.preventDefault();
      if (["start", "p-next", "p-save", "add-activity", "try-ex"].includes(el.dataset.act)) navigator.vibrate?.(8);
      fn(el);
    }
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
