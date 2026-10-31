// ============================================================
// Askesis — ritual.js
// Pantalla de entrada: llama roja oscura + la frase del día.
//
// · La frase del día sale de una permutación fija de QUOTES indexada
//   por la fecha local: los dos teléfonos muestran la MISMA frase el
//   mismo día, y no se repite ninguna hasta recorrer las 313.
// · Primera apertura del día en este dispositivo: duración completa
//   según la longitud de la frase (25 / 30 / 45 / 50 s).
// · Aperturas siguientes del mismo día: misma frase, REPEAT_SECONDS.
// · Al terminar el tiempo aparece "Toca para comenzar".
// Expone window.__askesisRitual (Promise) para que app.js espere.
// ============================================================

import { QUOTES } from "./quotes.js";

const REPEAT_SECONDS = 6;           // reaperturas del mismo día
const EPOCH = Date.UTC(2026, 9, 29); // 29-oct-2026: día 0 del ciclo
const SEED = 0xA5CE5157;            // semilla fija de la permutación
const SEEN_KEY = "askesis.ritual.fullSeen";

// Duración por número de palabras (umbrales justificados en README).
export function durationFor(text) {
  const w = text.trim().split(/\s+/).length;
  if (w <= 12) return 25;
  if (w <= 22) return 30;
  if (w <= 32) return 45;
  return 50;
}

// PRNG determinista (mulberry32) + Fisher–Yates: misma permutación en
// cualquier dispositivo, siempre.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function permutation(n, seed) {
  const rnd = mulberry32(seed);
  const p = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}
const ORDER = permutation(QUOTES.length, SEED);

function localDateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dayIndex(d = new Date()) {
  const utcMidnight = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((utcMidnight - EPOCH) / 86400000);
  const n = QUOTES.length;
  return ((days % n) + n) % n;
}
export function quoteOfTheDay(d = new Date()) { return QUOTES[ORDER[dayIndex(d)]]; }

function readSeen() { try { return localStorage.getItem(SEEN_KEY); } catch { return null; } }
function writeSeen(v) { try { localStorage.setItem(SEEN_KEY, v); } catch {} }

function sizeClass(text) {
  const w = text.trim().split(/\s+/).length;
  if (w <= 10) return "q-short";
  if (w <= 24) return "q-medium";
  return "q-long";
}

function runRitual() {
  return new Promise((resolve) => {
    const root = document.getElementById("ritual");
    if (!root) { resolve(); return; }

    const q = quoteOfTheDay();
    const today = localDateKey();
    const firstToday = readSeen() !== today;
    const seconds = firstToday ? durationFor(q.t) : REPEAT_SECONDS;

    const textEl = root.querySelector(".ritual-quote-text");
    const authorEl = root.querySelector(".ritual-quote-author");
    const fill = root.querySelector(".ritual-progress-fill");
    const hint = root.querySelector(".ritual-hint");
    textEl.textContent = q.t;
    textEl.parentElement.classList.add(sizeClass(q.t));
    authorEl.textContent = q.a;
    root.dataset.tema = q.tema;

    // Barra de tiempo: transición lineal única por la duración exacta.
    fill.style.transitionDuration = `${seconds}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("running")));

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#0E0A09");

    const start = performance.now();
    let done = false;
    const tick = () => {
      if (done) return;
      if (performance.now() - start >= seconds * 1000) {
        done = true;
        if (firstToday) writeSeen(today);
        root.classList.add("ready");
        hint.textContent = "Toca para comenzar";
        root.addEventListener("click", enter, { once: true });
        root.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") enter(); }, { once: true });
        root.focus({ preventScroll: true });
        return;
      }
      setTimeout(tick, 250);
    };
    tick();

    function enter() {
      root.classList.add("leaving");
      if (meta) meta.setAttribute("content", "#EDE7D9");
      setTimeout(() => { root.remove(); resolve(); }, 650);
    }
  });
}

window.__askesisRitual = runRitual();
