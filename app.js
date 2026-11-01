// ============================================================
// Askesis — app.js
// PWA con Firebase: Authentication + Firestore en tiempo real,
// navegación con History API (botón atrás real, doble-atrás para salir).
// La app no se revela hasta que termina el ritual de entrada (ritual.js).
// ============================================================

import { firebaseConfig } from "./firebase-config.js";
import { PLANS, TEMAS, DAY_TYPE_COLORS, DEFAULT_PLAN_ID } from "./data.js";
import { proveerFrase, ritualTerminado } from "./ritual.js";
import { fraseDelDia, fraseLocal } from "./destino.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, sendPasswordResetEmail,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult,
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, getDoc, setDoc, deleteDoc, collection,
  onSnapshot, getDocs, runTransaction,
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// Mientras firebase-config.js tenga los valores de plantilla, la app lo
// dice en el login en vez de fallar con un error críptico.
const FIREBASE_LISTO = !!firebaseConfig.apiKey && !String(firebaseConfig.apiKey).startsWith("PEGA_");
// Red de seguridad: si la pantalla de entrada fallara, la app no se queda
// bloqueada detrás de ella (espera máx. 8 s por la frase + 50 s de lectura + margen).
const ritualListo = Promise.race([
  ritualTerminado,
  new Promise((r) => setTimeout(r, 90000)),
]).then(() => { const el = document.getElementById("ritual"); if (el) el.remove(); });

const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const googleProvider = new GoogleAuthProvider();
const db = initializeFirestore(fbApp, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

const $ = (sel) => document.querySelector(sel);

// ============ STATE ============
const state = {
  uid: null, correo: null,
  historialCache: [], unsubHistorial: null, unsubConfig: null, unsubProgresoActual: null,
  planActivo: DEFAULT_PLAN_ID, tema: "base",
};
let currentView = null;   // dayId, "historial" o "config"
let historyMode = "lista";
let activeTimerKey = null, timerInterval = null, alarmInterval = null;
let authMode = "login";

// UI state que debe sobrevivir a los re-renders disparados por Firestore
// (evita que el auto-colapso se dispare de más al recibir un snapshot).
const dayUIState = {}; // dayKey -> { openExercises: Set, collapsibleOverride: {warmup, stretch} }
function getUIState(dayKey) {
  if (!dayUIState[dayKey]) dayUIState[dayKey] = { openExercises: new Set(), collapsibleOverride: {} };
  return dayUIState[dayKey];
}

function activePlan() { return PLANS[state.planActivo] || PLANS[DEFAULT_PLAN_ID]; }
function calendarOrder(weekday) { return weekday === 0 ? 7 : weekday; } // lunes=1 ... domingo=7

// ============ AUTH UI ============
function setAuthMode(mode) {
  authMode = mode;
  $("#tab-login").classList.toggle("active", mode === "login");
  $("#tab-register").classList.toggle("active", mode === "register");
  $("#auth-submit").textContent = mode === "login" ? "Iniciar sesión" : "Crear cuenta";
  hideAuthError();
}
function showAuthError(msg) { const el = $("#auth-error"); el.textContent = msg; el.classList.remove("hidden"); }
function hideAuthError() { $("#auth-error").classList.add("hidden"); }

function traducirErrorAuth(err) {
  const code = err && err.code ? err.code : "";
  const map = {
    "auth/invalid-email": "Correo inválido.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/email-already-in-use": "Ya existe una cuenta con ese correo — intenta iniciar sesión.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/network-request-failed": "Sin conexión a internet.",
    "auth/unauthorized-domain": "Este dominio no está autorizado en Firebase (agrégalo en Firebase → Authentication → Settings → Authorized domains).",
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "La configuración de Firebase no es válida — revisa firebase-config.js.",
    "auth/invalid-api-key": "La configuración de Firebase no es válida — revisa firebase-config.js.",
  };
  return map[code] || (err && err.message) || "Ocurrió un error. Intenta de nuevo.";
}

function initAuthUI() {
  $("#tab-login").onclick = () => setAuthMode("login");
  $("#tab-register").onclick = () => setAuthMode("register");

  $("#toggle-password").onclick = () => {
    const input = $("#auth-password");
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    $("#eye-open").classList.toggle("hidden", isHidden);
    $("#eye-closed").classList.toggle("hidden", !isHidden);
    $("#toggle-password").setAttribute("aria-label", isHidden ? "Ocultar contraseña" : "Mostrar contraseña");
  };

  $("#auth-form").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    hideAuthError();
    const email = $("#auth-email").value.trim();
    const password = $("#auth-password").value;
    const btn = $("#auth-submit");
    btn.disabled = true;
    try {
      if (authMode === "login") await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) { showAuthError(traducirErrorAuth(err)); }
    finally { btn.disabled = false; }
  });

  $("#auth-forgot").addEventListener("click", async () => {
    hideAuthError();
    const email = $("#auth-email").value.trim();
    if (!email) { showAuthError("Escribe tu correo arriba primero, y luego toca este enlace."); return; }
    try { await sendPasswordResetEmail(auth, email); alert(`Te enviamos un correo a ${email} para restablecer tu contraseña.`); }
    catch (err) { showAuthError(traducirErrorAuth(err)); }
  });

  $("#auth-google-btn").addEventListener("click", async () => {
    hideAuthError();
    try { await signInWithRedirect(auth, googleProvider); }
    catch (err) { showAuthError(traducirErrorAuth(err)); }
  });
}
initAuthUI();

getRedirectResult(auth).catch((err) => {
  const el = document.getElementById("auth-error");
  if (el) { el.textContent = traducirErrorAuth(err); el.classList.remove("hidden"); }
});

function unsubAll() {
  [state.unsubHistorial, state.unsubConfig, state.unsubProgresoActual].forEach((u) => u && u());
  state.unsubHistorial = state.unsubConfig = state.unsubProgresoActual = null;
}
async function cerrarSesion() { unsubAll(); await signOut(auth); }

// La frase del día: se entrega a la pantalla de entrada una sola vez (la primera
// resolución de sesión). Con sesión, es la frase compartida entre dispositivos;
// sin sesión, la copia local (que se registrará al iniciar sesión).
let fraseEntregada = false;
function entregarFrase(user) {
  if (!user) {
    if (!fraseEntregada) { fraseEntregada = true; proveerFrase(fraseLocal()); }
    return;
  }
  const promesa = fraseDelDia({ doc, getDoc, runTransaction }, db, user.uid);
  if (!fraseEntregada) { fraseEntregada = true; proveerFrase(promesa); }
}

onAuthStateChanged(auth, async (user) => {
  entregarFrase(user);
  await ritualListo; // primero la llama y la frase; luego la app
  if (user) {
    state.uid = user.uid; state.correo = user.email;
    $("#auth-shell").classList.add("hidden");
    $("#app").classList.remove("hidden");
    attachHistorialListener();
    attachConfigListener();
  } else {
    state.uid = null;
    unsubAll();
    state.historialCache = [];
    document.body.removeAttribute("data-theme");
    $("#app").classList.add("hidden");
    $("#auth-shell").classList.remove("hidden");
    if (!FIREBASE_LISTO) showAuthError("Firebase aún no está configurado: pega la configuración de tu proyecto en firebase-config.js.");
  }
});

// ============ FECHA ============
function pad2(n) { return String(n).padStart(2, "0"); }
function toDateStr(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function todayStr() { return toDateStr(new Date()); }
function todayDayId(plan) { return plan.weekdayMap[new Date().getDay()]; }

// ============ NAVEGACIÓN CON HISTORY API — botón atrás real ============
let exitArmed = false, exitTimeout = null;

function initNavigation() {
  const plan = activePlan();
  history.replaceState({ view: "day", dayId: todayDayId(plan) }, "");
  window.addEventListener("popstate", (e) => {
    const s = e.state;
    if (s && s.view === "config") { currentView = "config"; render(); return; }
    if (s && s.view === "historial") { currentView = "historial"; render(); return; }
    if (s && s.view === "day") { currentView = s.dayId; render(); return; }
    // Sin estado propio de la app = ya se agotó nuestra pila = intento real de salir.
    if (!exitArmed) {
      exitArmed = true;
      showToast("Presiona atrás de nuevo para salir");
      history.pushState({ view: "day", dayId: currentView }, "");
      clearTimeout(exitTimeout);
      exitTimeout = setTimeout(() => { exitArmed = false; }, 2000);
    }
  });
}
function goToConfig() { if (currentView !== "config") history.pushState({ view: "config" }, ""); currentView = "config"; render(); }
function goToHistorial() { if (currentView !== "historial") history.pushState({ view: "historial" }, ""); currentView = "historial"; render(); }
function goHome() {
  const target = todayDayId(activePlan());
  if (currentView !== target) history.pushState({ view: "day", dayId: target }, "");
  currentView = target; render();
}
function goToDay(dayId) {
  // Cambiar de día no empuja historial nuevo: se queda al mismo nivel que "home".
  history.replaceState({ view: "day", dayId }, "");
  currentView = dayId; render();
}

// ============ FIRESTORE: CONFIG — tiempo real ============
function attachConfigListener() {
  const ref = doc(db, "usuarios", state.uid, "config", "perfil");
  let first = true;
  state.unsubConfig = onSnapshot(ref, (snap) => {
    const data = snap.exists() ? snap.data() : {};
    const planCambio = data.planActivo && data.planActivo !== state.planActivo;
    state.planActivo = data.planActivo || DEFAULT_PLAN_ID;
    state.tema = data.tema === "dashboard-completo" ? "brasa" : (data.tema || "base");
    aplicarTema(state.tema);
    if (first) {
      first = false;
      initNavigation();
      currentView = todayDayId(activePlan());
    } else if (planCambio && currentView !== "historial" && currentView !== "config") {
      currentView = todayDayId(activePlan());
    }
    updateSyncPill("synced");
    render();
  }, () => updateSyncPill("offline"));
}
async function guardarConfig(campo, valor) {
  updateSyncPill("pending");
  try { await setDoc(doc(db, "usuarios", state.uid, "config", "perfil"), { [campo]: valor }, { merge: true }); }
  catch { updateSyncPill("offline"); }
}
function aplicarTema(temaId) {
  if (temaId === "base") document.body.removeAttribute("data-theme");
  else document.body.setAttribute("data-theme", temaId);
  // La barra de estado del teléfono toma el color de fondo del tema.
  const meta = document.querySelector('meta[name="theme-color"]');
  const m = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
  if (meta && m) meta.setAttribute("content", "#" + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, "0")).join(""));
}

// ============ FIRESTORE: PROGRESO — tiempo real por día ============
function watchProgreso(dayKey, onData) {
  if (state.unsubProgresoActual) { state.unsubProgresoActual(); state.unsubProgresoActual = null; }
  const ref = doc(db, "usuarios", state.uid, "progreso", dayKey);
  state.unsubProgresoActual = onSnapshot(ref, (snap) => onData(snap.exists() ? snap.data() : null), () => updateSyncPill("offline"));
}
let saveProgresoTimeout = null;
function saveProgreso(dayKey, data) {
  if (!state.uid) return;
  clearTimeout(saveProgresoTimeout);
  updateSyncPill("pending");
  saveProgresoTimeout = setTimeout(() => {
    setDoc(doc(db, "usuarios", state.uid, "progreso", dayKey), data)
      .then(() => updateSyncPill("synced")).catch(() => updateSyncPill("offline"));
  }, 400);
}
async function clearProgresoRemote(dayKey) {
  if (!state.uid) return;
  try { await deleteDoc(doc(db, "usuarios", state.uid, "progreso", dayKey)); } catch {}
}
function updateSyncPill(status) {
  const pill = $("#sync-pill"); if (!pill) return;
  pill.className = "sync-pill " + status;
  pill.title = status === "synced" ? "Sincronizado" : status === "pending" ? "Guardando…" : "Sin conexión — se guardará al volver";
}

// ============ FIRESTORE: HISTORIAL — tiempo real ============
function attachHistorialListener() {
  const ref = collection(db, "usuarios", state.uid, "entrenamiento");
  state.unsubHistorial = onSnapshot(ref, (snap) => {
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    state.historialCache = list;
    if (currentView === "historial") render();
  }, () => updateSyncPill("offline"));
}

// ============ RENDER DISPATCH ============
function render() {
  renderDaySelector();
  const main = $("#main-content");
  main.innerHTML = "";
  if (currentView === "historial") renderHistorial(main);
  else if (currentView === "config") renderConfig(main);
  else {
    const plan = activePlan();
    const dayDef = plan.days[currentView];
    if (!dayDef) { currentView = todayDayId(plan); return render(); }
    if (dayDef.type === "descanso") renderRestDay(main, plan, dayDef);
    else renderDay(main, plan, currentView);
  }
}

// ============ MENU (⋮) + LOGO ============
$("#btn-menu").onclick = (e) => { e.stopPropagation(); $("#menu-popover").classList.toggle("hidden"); };
document.addEventListener("click", () => { $("#menu-popover").classList.add("hidden"); $("#day-dropdown").classList.add("hidden"); });
$("#btn-go-config").onclick = () => goToConfig();
$("#btn-go-historial").onclick = () => goToHistorial();
$("#brand-home").onclick = () => goHome();

// ============ SELECTOR DE DÍA — sutil, ordenado por semana real ============
function renderDaySelector() {
  const wrap = $("#day-selector-wrap");
  if (currentView === "historial" || currentView === "config") { wrap.classList.add("hidden"); return; }
  wrap.classList.remove("hidden");

  const plan = activePlan();
  const dayDef = plan.days[currentView];
  const color = DAY_TYPE_COLORS[dayDef.type] || "#999";
  const btn = $("#day-selector-btn");
  btn.innerHTML = `<span class="dsb-dot" style="background:${color}"></span> ${dayDef.label} · ${dayDef.subtitle} <svg class="dsb-chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
  btn.onclick = (e) => { e.stopPropagation(); $("#day-dropdown").classList.toggle("hidden"); };

  const dropdown = $("#day-dropdown");
  dropdown.innerHTML = "";
  const todayId = todayDayId(plan);
  const sortedIds = Object.keys(plan.days).sort((a, b) => calendarOrder(plan.days[a].weekday) - calendarOrder(plan.days[b].weekday));
  sortedIds.forEach((id) => {
    const d = plan.days[id];
    const c = DAY_TYPE_COLORS[d.type] || "#999";
    const item = document.createElement("button");
    item.className = "day-dropdown-item" + (currentView === id ? " active" : "");
    item.innerHTML = `<span class="dd-dot" style="background:${c}"></span> ${d.label} · ${d.subtitle} ${todayId === id ? '<span class="dd-today">HOY</span>' : ""}`;
    item.onclick = (e) => { e.stopPropagation(); dropdown.classList.add("hidden"); goToDay(id); };
    dropdown.appendChild(item);
  });
}

// ============ REST DAY VIEW ============
function renderRestDay(container, plan, dayDef) {
  const card = document.createElement("div");
  card.className = "rest-card";
  card.innerHTML = `
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"/></svg>
    <h2>${dayDef.label} · ${dayDef.subtitle}</h2>
    <p style="color:var(--text-faint); font-size:14px;">${dayDef.focus}</p>
    <ul class="rest-tips">${dayDef.tips.map(t => `<li>${t}</li>`).join("")}</ul>
  `;
  container.appendChild(card);

  const wrap = document.createElement("div");
  wrap.className = "finish-section";
  const already = state.historialCache.find(e => e.date === todayStr() && e.isRestDay && e.dayId === dayDef.id);
  wrap.innerHTML = `<button class="btn-complete ${already ? "saved" : ""}" id="btn-rest-complete">${already ? "✓ Descanso ya registrado hoy" : "Guardar registro de descanso"}</button>`;
  container.appendChild(wrap);

  $("#btn-rest-complete").onclick = async () => {
    if (already) return;
    await setDoc(doc(db, "usuarios", state.uid, "entrenamiento", `${todayStr()}_${plan.id}_${dayDef.id}`), {
      planId: plan.id, dayId: dayDef.id, dayLabel: `${dayDef.label} · ${dayDef.subtitle}`, dayType: "descanso",
      date: todayStr(), timestamp: new Date().toISOString(), isRestDay: true, progressPct: 100, summary: [],
    });
    showToast("Día de descanso registrado");
    render();
  };
}

// ============ DAY VIEW (entrenamiento) — tiempo real ============
function renderDay(container, plan, dayId) {
  const day = plan.days[dayId];
  const color = DAY_TYPE_COLORS[day.type] || "#999";
  const dayKey = `${plan.id}:${dayId}`;

  container.innerHTML = `<p style="color:var(--text-faint); font-size:14px; text-align:center; padding:30px 0;">Cargando…</p>`;
  watchProgreso(dayKey, (remote) => {
    if (currentView !== dayId) return;
    const saved = remote || { warmup: [], stretch: [], exercises: {} };
    pintarDay(container, plan, day, dayId, dayKey, saved, color);
  });
}

function pintarDay(container, plan, day, dayId, dayKey, saved, color) {
  container.innerHTML = "";
  const ui = getUIState(dayKey);

  const header = document.createElement("div");
  header.className = "day-header";
  header.innerHTML = `
    <div class="day-header-title">
      <h1>${day.label}</h1>
      <span class="day-type-name" style="color:${color}">${day.subtitle}</span>
    </div>
    <div class="day-focus">${day.focus}</div>
    <div class="progress-track"><div class="progress-fill" id="progress-fill" style="width:0%; background:${color}"></div></div>
    <div class="progress-label" id="progress-label">0/0 series completadas</div>
  `;
  container.appendChild(header);

  container.appendChild(renderCollapsible("🔥", "Calentamiento", day.warmup, saved.warmup || [], (idx, checked) => {
    saved.warmup[idx] = checked; saveProgreso(dayKey, saved);
  }, ui, "warmup"));

  const list = document.createElement("div");
  list.className = "exercise-list";
  day.exercises.forEach((ex, idx) => list.appendChild(renderExerciseCard(dayKey, ex, idx, saved, false, ui)));
  container.appendChild(list);

  if (day.opcionales && day.opcionales.length) {
    const optSection = document.createElement("div");
    optSection.className = "opcionales-section";
    optSection.innerHTML = `<div class="opcionales-label">Ejercicios opcionales</div><div class="opcionales-hint">Si te sobra tiempo hoy — no cuentan para el progreso de la sesión.</div>`;
    const optList = document.createElement("div");
    optList.className = "exercise-list";
    day.opcionales.forEach((ex, idx) => optList.appendChild(renderExerciseCard(dayKey, ex, idx, saved, true, ui)));
    optSection.appendChild(optList);
    container.appendChild(optSection);
  }

  container.appendChild(renderCollapsible("🧘", "Estiramiento", day.stretch, saved.stretch || [], (idx, checked) => {
    saved.stretch[idx] = checked; saveProgreso(dayKey, saved);
  }, ui, "stretch"));

  const finishWrap = document.createElement("div");
  finishWrap.className = "finish-section";
  finishWrap.innerHTML = `<button class="btn-complete" id="btn-complete">Terminar entrenamiento</button>`;
  container.appendChild(finishWrap);

  updateProgress(day, saved);
  updateSaveBarState(saved);
  $("#btn-complete").onclick = () => completeSession(plan, day, dayId, dayKey, saved);
}

function renderCollapsible(icon, title, items, savedArr, onToggle, ui, keyName) {
  const wrap = document.createElement("div");
  wrap.className = "collapsible";
  const allDone = items.length > 0 && items.every((_, i) => savedArr[i]);
  const override = ui.collapsibleOverride[keyName];
  const isOpen = override !== undefined ? override : !allDone;
  if (isOpen) wrap.classList.add("open");

  const summary = document.createElement("div");
  summary.className = "collapsible-summary";
  summary.innerHTML = `<span class="cs-title">${icon ? icon + " " : ""}${title}${allDone ? '<span class="done-tag">✓ Completo</span>' : ""}</span><svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
  summary.onclick = () => {
    const nowOpen = wrap.classList.toggle("open");
    ui.collapsibleOverride[keyName] = nowOpen;
  };
  wrap.appendChild(summary);

  const body = document.createElement("div");
  body.className = "collapsible-body";
  items.forEach((text, idx) => {
    const checked = !!savedArr[idx];
    const line = document.createElement("label");
    line.className = "check-line" + (checked ? " done" : "");
    line.innerHTML = `<input type="checkbox" ${checked ? "checked" : ""}><span>${text}</span>`;
    line.querySelector("input").onchange = (e) => {
      line.classList.toggle("done", e.target.checked);
      savedArr[idx] = e.target.checked;
      onToggle(idx, e.target.checked);
      const nowAllDone = items.every((_, i) => savedArr[i]);
      const titleSpan = summary.querySelector(".cs-title");
      titleSpan.innerHTML = `${icon ? icon + " " : ""}${title}${nowAllDone ? '<span class="done-tag">✓ Completo</span>' : ""}`;
    };
    body.appendChild(line);
  });
  wrap.appendChild(body);
  return wrap;
}

function renderExerciseCard(dayKey, ex, idx, saved, esOpcional, ui) {
  const key = `${esOpcional ? "opt" : "ex"}-${dayKey}-${idx}`;
  let entry = saved.exercises[key];
  if (!entry) {
    entry = ex.unilateral
      ? { side: null, izquierda: Array(ex.sets).fill(false), derecha: Array(ex.sets).fill(false), simul: Array(ex.sets).fill(false) }
      : { checks: Array(ex.sets).fill(false) };
    saved.exercises[key] = entry;
  }

  function isAllDone() {
    if (!ex.unilateral) return entry.checks.filter(Boolean).length === ex.sets;
    if (entry.side === "alternado") return entry.izquierda.filter(Boolean).length === ex.sets && entry.derecha.filter(Boolean).length === ex.sets;
    if (entry.side === "simultaneo") return entry.simul.filter(Boolean).length === ex.sets;
    return false;
  }
  function doneCountLabel() {
    if (!ex.unilateral) return `${entry.checks.filter(Boolean).length}/${ex.sets}`;
    if (entry.side === "alternado") return `${entry.izquierda.filter(Boolean).length}+${entry.derecha.filter(Boolean).length} / ${ex.sets}+${ex.sets}`;
    if (entry.side === "simultaneo") return `${entry.simul.filter(Boolean).length}/${ex.sets}`;
    return `0/${ex.sets}`;
  }

  const startOpen = ui.openExercises.has(key);
  const card = document.createElement("div");
  card.className = "ex-card" + (esOpcional ? " opcional-card" : "") + (isAllDone() ? " done" : "") + (startOpen ? " expanded" : "");

  const head = document.createElement("div");
  head.className = "ex-head";
  function refreshHead() {
    head.querySelector(".ex-badge").textContent = isAllDone() ? "✓" : (idx + 1);
    card.classList.toggle("done", isAllDone());
    head.querySelector(".meta").textContent = `${ex.sets} × ${ex.reps}${ex.techo ? " · techo " + ex.techo : ""} · ${doneCountLabel()} series`;
  }
  head.innerHTML = `
    <div class="ex-head-left">
      <div class="ex-badge">${isAllDone() ? "✓" : idx + 1}</div>
      <div class="ex-title">
        <div class="name">${ex.name}</div>
        <div class="meta">${ex.sets} × ${ex.reps}${ex.techo ? " · techo " + ex.techo : ""} · ${doneCountLabel()} series</div>
      </div>
    </div>
    <svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
  `;

  const body = document.createElement("div");
  body.className = "ex-body";
  body.style.display = startOpen ? "block" : "none";
  const inner = document.createElement("div");
  inner.className = "ex-body-inner";
  inner.innerHTML = `
    <div class="ex-block"><b>Postura:</b> ${ex.postura}</div>
    <div class="ex-block"><b>Ejecución:</b> ${ex.ejecucion}</div>
    ${ex.risk ? `<div class="ex-risk">⚠️ ${ex.risk}</div>` : ""}
    ${ex.extra ? `<div class="ex-extra">${ex.extra}</div>` : ""}
    <div class="ex-controls"></div>
  `;
  body.appendChild(inner);
  const controls = inner.querySelector(".ex-controls");
  if (startOpen) head.querySelector(".chev").style.transform = "rotate(180deg)";

  head.onclick = () => {
    const isOpen = body.style.display !== "none";
    const nowOpen = !isOpen;
    body.style.display = nowOpen ? "block" : "none";
    head.querySelector(".chev").style.transform = nowOpen ? "rotate(180deg)" : "";
    card.classList.toggle("expanded", nowOpen);
    if (nowOpen) ui.openExercises.add(key); else ui.openExercises.delete(key);
  };

  function persist() { saveProgreso(dayKey, saved); }

  // Solo se auto-colapsa cuando TODAS las series (ambos lados si es
  // alternado) quedan marcadas — nunca por marcar una sola serie.
  function checkAutoCollapse() {
    refreshHead();
    updateProgressFromDom();
    updateSaveBarFromDom();
    if (isAllDone()) {
      ui.openExercises.delete(key);
      setTimeout(() => {
        body.style.display = "none";
        head.querySelector(".chev").style.transform = "";
        card.classList.remove("expanded");
      }, 500);
    }
  }

  function renderSetButtons(wrap, arr, timerSuffix) {
    wrap.innerHTML = "";
    const row = document.createElement("div");
    row.className = "set-row";
    for (let i = 0; i < ex.sets; i++) {
      const b = document.createElement("button");
      b.className = "set-btn" + (arr[i] ? " checked" : "");
      b.textContent = i + 1;
      b.onclick = () => { arr[i] = !arr[i]; b.classList.toggle("checked", arr[i]); persist(); checkAutoCollapse(); };
      row.appendChild(b);
    }
    row.appendChild(renderTimerChip(`${key}${timerSuffix || ""}`, ex.rest));
    wrap.appendChild(row);
  }

  if (!ex.unilateral) {
    const wrap = document.createElement("div");
    controls.appendChild(wrap);
    renderSetButtons(wrap, entry.checks, "");
  } else {
    const choiceWrap = document.createElement("div");
    choiceWrap.className = "side-choice";
    const btnAlt = document.createElement("button");
    btnAlt.className = "side-btn" + (entry.side === "alternado" ? " selected" : "");
    btnAlt.textContent = "Alternado";
    const btnSim = document.createElement("button");
    btnSim.className = "side-btn" + (entry.side === "simultaneo" ? " selected" : "");
    btnSim.textContent = "Simultáneo";
    choiceWrap.appendChild(btnAlt); choiceWrap.appendChild(btnSim);
    controls.appendChild(choiceWrap);

    const setsArea = document.createElement("div");
    controls.appendChild(setsArea);

    function renderSetsArea() {
      setsArea.innerHTML = "";
      if (entry.side === "alternado") {
        const [labI, labD] = ex.ladoLabel || ["Izquierda", "Derecha"];
        const wrapI = document.createElement("div");
        wrapI.innerHTML = `<div class="side-group-label">${labI}</div>`;
        setsArea.appendChild(wrapI);
        renderSetButtons(wrapI, entry.izquierda, "-izq");
        const wrapD = document.createElement("div");
        wrapD.innerHTML = `<div class="side-group-label">${labD}</div>`;
        setsArea.appendChild(wrapD);
        renderSetButtons(wrapD, entry.derecha, "-der");
      } else if (entry.side === "simultaneo") {
        const wrapS = document.createElement("div");
        setsArea.appendChild(wrapS);
        renderSetButtons(wrapS, entry.simul, "-sim");
      } else {
        setsArea.innerHTML = `<p style="font-size:13px;color:var(--text-faint);margin:4px 0;">Elige cómo lo vas a hacer para ver las series.</p>`;
      }
    }
    // El progreso de "Alternado" o "Simultáneo" cuenta como UNA sola vía,
    // nunca exige completar ambas para considerarlo terminado.
    btnAlt.onclick = () => { entry.side = "alternado"; btnAlt.classList.add("selected"); btnSim.classList.remove("selected"); persist(); renderSetsArea(); checkAutoCollapse(); };
    btnSim.onclick = () => { entry.side = "simultaneo"; btnSim.classList.add("selected"); btnAlt.classList.remove("selected"); persist(); renderSetsArea(); checkAutoCollapse(); };
    renderSetsArea();
  }

  card.appendChild(head);
  card.appendChild(body);
  return card;
}

// ============ TIMER — azul en cuenta regresiva, alarma roja continua ============
function renderTimerChip(key, seconds) {
  const wrap = document.createElement("div");
  wrap.dataset.timerKey = key; wrap.dataset.seconds = seconds;
  buildTimerIdleUI(wrap, key, seconds);
  return wrap;
}
function buildTimerIdleUI(wrap, key, seconds) {
  wrap.innerHTML = `<button class="timer-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg> Descanso ${seconds}s</button>`;
  wrap.querySelector("button").onclick = () => startTimer(key, seconds);
}
let timerState = { key: null, remaining: 0, total: 0, running: false, finished: false };
function startTimer(key, seconds) {
  stopAlarmLoop();
  activeTimerKey = key;
  timerState = { key, remaining: seconds, total: seconds, running: true, finished: false };
  clearInterval(timerInterval);
  paintTimer();
  timerInterval = setInterval(() => {
    if (!timerState.running) return;
    timerState.remaining--;
    if (timerState.remaining <= 0) {
      timerState.remaining = 0; timerState.running = false; timerState.finished = true;
      clearInterval(timerInterval); startAlarmLoop();
    }
    paintTimer();
  }, 1000);
}
function paintTimer() {
  const wrap = document.querySelector(`[data-timer-key="${CSS.escape(timerState.key)}"]`);
  if (!wrap) return;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const cls = timerState.finished ? "finished" : "running";
  wrap.innerHTML = `
    <div class="timer-active ${cls}">
      <span class="t-num">${timerState.finished ? "¡Listo!" : fmt(timerState.remaining)}</span>
      ${timerState.finished ? "" : `<button data-act="toggle">${timerState.running
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'}</button>`}
      <button data-act="reset" title="Reiniciar / detener alarma"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg></button>
    </div>`;
  if (!timerState.finished) wrap.querySelector('[data-act="toggle"]').onclick = () => { timerState.running = !timerState.running; paintTimer(); };
  wrap.querySelector('[data-act="reset"]').onclick = () => {
    stopAlarmLoop();
    const seconds = Number(wrap.dataset.seconds);
    clearInterval(timerInterval); activeTimerKey = null;
    buildTimerIdleUI(wrap, wrap.dataset.timerKey, seconds);
  };
}
function startAlarmLoop() {
  playLoudBeep();
  if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]);
  alarmInterval = setInterval(() => {
    playLoudBeep();
    if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]);
  }, 1600);
}
function stopAlarmLoop() { clearInterval(alarmInterval); alarmInterval = null; }
function playLoudBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.18, 0.36].forEach((delay) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 1000; osc.type = "square";
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0.9, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.start(t); osc.stop(t + 0.34);
    });
  } catch (e) {}
}

// ============ PROGRESS ============
let currentSavedRef = null, currentDayRef = null;
function updateProgress(day, saved) { currentSavedRef = saved; currentDayRef = day; updateProgressFromDom(); }
function updateProgressFromDom() {
  if (!currentDayRef || !currentSavedRef) return;
  const { done, total, pct } = computeProgress(currentDayRef, currentSavedRef);
  const fill = $("#progress-fill"); const label = $("#progress-label");
  if (fill) fill.style.width = pct + "%";
  if (label) label.textContent = `${done}/${total} series completadas`;
}
function computeProgress(day, saved) {
  const keys = Object.keys(saved.exercises).filter((k) => k.startsWith("ex-"));
  let total = 0, done = 0;
  day.exercises.forEach((ex, idx) => {
    const matchKey = keys.find((k) => k.endsWith(`-${idx}`));
    const entry = matchKey ? saved.exercises[matchKey] : null;
    if (!entry) { total += ex.sets; return; }
    if (!ex.unilateral) { total += ex.sets; done += (entry.checks || []).filter(Boolean).length; }
    else if (entry.side === "alternado") { total += ex.sets * 2; done += (entry.izquierda || []).filter(Boolean).length + (entry.derecha || []).filter(Boolean).length; }
    else { total += ex.sets; done += (entry.simul || []).filter(Boolean).length; }
  });
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}
function updateSaveBarState(saved) { currentSavedRef = saved; updateSaveBarFromDom(); }
function updateSaveBarFromDom() {
  if (!currentSavedRef) return;
  const anyProgress = Object.values(currentSavedRef.exercises || {}).some((e) => {
    if (e.checks) return e.checks.some(Boolean);
    return (e.izquierda || []).some(Boolean) || (e.derecha || []).some(Boolean) || (e.simul || []).some(Boolean);
  }) || (currentSavedRef.warmup || []).some(Boolean);
  const btn = $("#btn-complete");
  if (btn) btn.disabled = !anyProgress;
}

// ============ COMPLETAR SESIÓN ============
async function completeSession(plan, day, dayId, dayKey, saved) {
  const keys = Object.keys(saved.exercises).filter((k) => k.startsWith("ex-"));
  const summary = day.exercises.map((ex, idx) => {
    const matchKey = keys.find((k) => k.endsWith(`-${idx}`));
    const entry = matchKey ? saved.exercises[matchKey] : null;
    let done = 0, total = ex.sets;
    if (!entry) { done = 0; }
    else if (!ex.unilateral) { done = (entry.checks || []).filter(Boolean).length; }
    else if (entry.side === "alternado") { total = ex.sets * 2; done = (entry.izquierda || []).filter(Boolean).length + (entry.derecha || []).filter(Boolean).length; }
    else { done = (entry.simul || []).filter(Boolean).length; }
    return { name: ex.name, done, total };
  });
  const totalSets = summary.reduce((a, s) => a + s.total, 0);
  const doneSets = summary.reduce((a, s) => a + s.done, 0);
  const entryDoc = {
    planId: plan.id, dayId, dayLabel: `${day.label} · ${day.subtitle}`, dayType: day.type,
    date: todayStr(), timestamp: new Date().toISOString(),
    progressPct: totalSets ? Math.round((doneSets / totalSets) * 100) : 0,
    summary, isRestDay: false,
  };
  await setDoc(doc(db, "usuarios", state.uid, "entrenamiento", `${todayStr()}_${dayKey.replace(":", "_")}`), entryDoc);
  await clearProgresoRemote(dayKey);
  delete dayUIState[dayKey];

  const btn = $("#btn-complete");
  btn.classList.add("saved");
  btn.textContent = "✓ Guardado en el historial";
  showToast("Sesión guardada · plantilla reiniciada");
}

// ============ HISTORIAL ============
function backHeader(title) {
  const wrap = document.createElement("div");
  wrap.className = "back-header";
  wrap.innerHTML = `<button aria-label="Volver"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button><h1>${title}</h1>`;
  wrap.querySelector("button").onclick = () => goHome();
  return wrap;
}

function renderHistorial(container) {
  container.appendChild(backHeader("Historial de sesiones"));

  const modeSwitch = document.createElement("div");
  modeSwitch.className = "history-header";
  modeSwitch.innerHTML = `<div class="mode-switch"><button class="mode-btn ${historyMode === "lista" ? "active" : ""}" data-mode="lista">Lista</button><button class="mode-btn ${historyMode === "calendario" ? "active" : ""}" data-mode="calendario">Calendario</button></div>`;
  container.appendChild(modeSwitch);
  modeSwitch.querySelectorAll(".mode-btn").forEach((b) => { b.onclick = () => { historyMode = b.dataset.mode; render(); }; });

  const hist = state.historialCache;
  if (hist.length === 0) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.innerHTML = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
      <p><b>Todavía no hay sesiones guardadas.</b></p><p>Completa un día para verlo aquí.</p>`;
    container.appendChild(empty);
    return;
  }

  container.appendChild(renderActivityGraph(hist));
  if (historyMode === "lista") {
    const list = document.createElement("div");
    list.className = "hist-list";
    hist.forEach((entry) => list.appendChild(historyCard(entry)));
    container.appendChild(list);
  } else {
    renderHistorialCalendario(container, hist);
  }
}

function renderActivityGraph(hist) {
  const wrap = document.createElement("div");
  wrap.className = "activity-graph";
  const days = 14;
  const today = new Date();
  const byDate = {};
  hist.forEach(e => { byDate[e.date] = byDate[e.date] || []; byDate[e.date].push(e); });
  const bars = document.createElement("div");
  bars.className = "activity-bars";
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const dstr = toDateStr(d);
    const entries = byDate[dstr] || [];
    const barWrap = document.createElement("div");
    barWrap.className = "activity-bar-wrap";
    const bar = document.createElement("div");
    if (entries.length === 0) { bar.className = "activity-bar"; bar.style.height = "4px"; }
    else if (entries[0].isRestDay) { bar.className = "activity-bar rest"; bar.style.height = "100%"; }
    else {
      const pct = Math.max(entries[0].progressPct, 8);
      bar.className = "activity-bar"; bar.style.height = pct + "%";
      bar.style.background = DAY_TYPE_COLORS[entries[0].dayType] || "var(--accent)";
    }
    barWrap.appendChild(bar);
    const lbl = document.createElement("div");
    lbl.className = "activity-bar-label"; lbl.textContent = ["D","L","M","M","J","V","S"][d.getDay()];
    barWrap.appendChild(lbl);
    bars.appendChild(barWrap);
  }
  wrap.innerHTML = `<div class="activity-graph-title">Últimos 14 días</div>`;
  wrap.appendChild(bars);
  return wrap;
}

function historyCard(entry) {
  const d = new Date(entry.timestamp || entry.date);
  const fecha = d.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" });
  const color = DAY_TYPE_COLORS[entry.dayType] || "inherit";
  const card = document.createElement("div");
  card.className = "hist-card" + (entry.isRestDay ? " rest-entry" : "");
  if (entry.isRestDay) {
    card.innerHTML = `<div class="hist-card-top"><div><div class="hist-day-name" style="color:${color}">😴 ${entry.dayLabel || "Descanso"}</div><div class="hist-date">${fecha}</div></div><div class="hist-pct rest">Registrado</div></div>`;
    return card;
  }
  card.innerHTML = `
    <div class="hist-card-top">
      <div><div class="hist-day-name" style="color:${color}">${entry.dayLabel}</div><div class="hist-date">${fecha}</div></div>
      <div class="hist-pct ${entry.progressPct === 100 ? "full" : "partial"}">${entry.progressPct}%</div>
    </div>
    <div class="hist-chips">${(entry.summary || []).map(s => `<span class="hist-chip ${s.done < s.total ? "incomplete" : ""}">${s.name.length > 22 ? s.name.slice(0,22)+"…" : s.name} ${s.done}/${s.total}</span>`).join("")}</div>
  `;
  return card;
}

function renderHistorialCalendario(container, hist) {
  const byDate = {};
  hist.forEach((e) => { (byDate[e.date] = byDate[e.date] || []).push(e); });
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = document.createElement("div");
  monthLabel.className = "cal-month-label";
  monthLabel.textContent = now.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  container.appendChild(monthLabel);

  const dow = document.createElement("div");
  dow.className = "cal-grid-header";
  ["D","L","M","M","J","V","S"].forEach(d => { const s = document.createElement("span"); s.textContent = d; dow.appendChild(s); });
  container.appendChild(dow);

  const grid = document.createElement("div");
  grid.className = "cal-grid";
  for (let i = 0; i < startOffset; i++) { const c = document.createElement("div"); c.className = "cal-cell empty"; grid.appendChild(c); }
  const detailBox = document.createElement("div");
  detailBox.className = "cal-day-detail"; detailBox.style.display = "none";

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${pad2(month+1)}-${pad2(day)}`;
    const entries = byDate[dateStr];
    const cell = document.createElement("div");
    cell.className = "cal-cell"; cell.innerHTML = `${day}`;
    if (entries) {
      const dotsWrap = document.createElement("div");
      dotsWrap.style.display = "flex"; dotsWrap.style.gap = "2px";
      entries.slice(0,3).forEach(e => {
        const dot = document.createElement("span");
        dot.className = "dot"; dot.style.background = DAY_TYPE_COLORS[e.dayType] || "#999";
        dotsWrap.appendChild(dot);
      });
      cell.appendChild(dotsWrap);
      cell.style.cursor = "pointer";
      cell.onclick = () => {
        detailBox.style.display = "block";
        detailBox.innerHTML = `<div style="font-size:13.5px;font-weight:700;margin-bottom:8px;">${new Date(dateStr+"T00:00:00").toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"})}</div>`;
        entries.forEach(e => detailBox.appendChild(historyCard(e)));
      };
    }
    grid.appendChild(cell);
  }
  container.appendChild(grid);
  container.appendChild(detailBox);
}

// ============ CONFIGURACIÓN ============
function renderConfig(container) {
  container.appendChild(backHeader("Configuración"));

  const accSec = document.createElement("div");
  accSec.className = "config-section";
  accSec.innerHTML = `<div class="config-account">${state.correo || ""}</div>`;
  const logoutBtn = document.createElement("button");
  logoutBtn.className = "config-item";
  logoutBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Cerrar sesión`;
  logoutBtn.onclick = () => cerrarSesion();
  accSec.appendChild(logoutBtn);
  container.appendChild(accSec);

  const planSec = document.createElement("div");
  planSec.className = "config-section";
  planSec.innerHTML = `<h2>Plan de entrenamiento</h2><p class="config-sub">Cambia entre tus planes guardados. El día de hoy se recalcula solo al cambiar.</p>`;
  Object.values(PLANS).forEach((plan) => {
    const activo = state.planActivo === plan.id;
    const card = document.createElement("div");
    card.className = "plan-card" + (activo ? " activo" : "");
    card.innerHTML = `<div class="plan-card-top"><div class="plan-card-nombre">${plan.nombre}</div>${activo ? '<span class="plan-card-badge">Activo</span>' : ""}</div><div class="plan-card-desc">${plan.descripcion}</div>`;
    card.onclick = () => { if (activo) return; guardarConfig("planActivo", plan.id); showToast(`Cambiado a ${plan.nombre}`); };
    planSec.appendChild(card);
  });
  container.appendChild(planSec);

  const temaSec = document.createElement("div");
  temaSec.className = "config-section";
  temaSec.innerHTML = `<h2>Tema visual</h2><p class="config-sub">Cambia el aspecto de toda la app.</p>`;
  const grid = document.createElement("div");
  grid.className = "tema-grid";
  TEMAS.forEach((t) => {
    const activo = state.tema === t.id;
    const btn = document.createElement("button");
    btn.className = "tema-swatch" + (activo ? " activo" : "");
    btn.innerHTML = `<span class="ts-dot" style="background:${t.color}"></span><span class="ts-nombre">${t.nombre}</span>${activo ? '<svg class="ts-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>' : ""}`;
    btn.onclick = () => guardarConfig("tema", t.id);
    grid.appendChild(btn);
  });
  temaSec.appendChild(grid);
  container.appendChild(temaSec);

  const dataSec = document.createElement("div");
  dataSec.className = "config-section";
  dataSec.innerHTML = `<h2>Tus datos</h2><p class="config-sub">Respaldo manual, además de la sincronización automática.</p>`;
  dataSec.innerHTML += `
    <button class="config-item" id="btn-export-json"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Exportar respaldo (JSON)</button>
    <button class="config-item" id="btn-export-xlsx"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Exportar historial (Excel)</button>
    <label class="config-item" for="file-import" style="border-style:dashed;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Importar respaldo (JSON)</label>
    <input type="file" id="file-import" accept=".json" style="display:none">
    <button class="config-item danger" id="btn-clear-all"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Borrar todo mi historial</button>
  `;
  container.appendChild(dataSec);

  $("#btn-export-json").onclick = () => {
    const data = { historial: state.historialCache, exportedAt: new Date().toISOString() };
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `respaldo-askesis-${todayStr()}.json`);
    showToast("Respaldo JSON descargado");
  };
  $("#btn-export-xlsx").onclick = () => {
    const rows = [];
    state.historialCache.forEach((e) => {
      const d = new Date(e.timestamp || e.date);
      if (e.isRestDay) { rows.push({ Fecha: d.toLocaleDateString("es-CO"), Día: e.dayLabel || "Descanso", "% Sesión": 100, Ejercicio: "—", "Series completadas": "—", "Series totales": "—" }); return; }
      (e.summary || []).forEach((s) => { rows.push({ Fecha: d.toLocaleDateString("es-CO"), Día: e.dayLabel, "% Sesión": e.progressPct, Ejercicio: s.name, "Series completadas": s.done, "Series totales": s.total }); });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial");
    XLSX.writeFile(wb, `historial-askesis-${todayStr()}.xlsx`);
    showToast("Excel descargado");
  };
  $("#file-import").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.historial || !Array.isArray(parsed.historial)) throw new Error("formato inválido");
        for (const entry of parsed.historial) {
          const id = entry.id || `${entry.date}_${entry.dayId || "x"}`;
          await setDoc(doc(db, "usuarios", state.uid, "entrenamiento", id), entry);
        }
        showToast(`Importado: ${parsed.historial.length} sesiones`);
      } catch { showToast("Archivo inválido"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  $("#btn-clear-all").onclick = async () => {
    if (!confirm("¿Borrar todo tu historial guardado en la nube? Esta acción no se puede deshacer. Exporta un respaldo antes si no estás seguro.")) return;
    const snap = await getDocs(collection(db, "usuarios", state.uid, "entrenamiento"));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    showToast("Historial borrado");
  };
}

// ============ TOAST ============
let toastTimeout;
function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.add("hidden"), 2600);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============ SERVICE WORKER ============
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}
