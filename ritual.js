// ============================================================
// Askesis — ritual.js
// Pantalla de entrada: llama roja oscura + la frase del día.
//
// · La llama aparece al instante. La frase la entrega app.js con
//   proveerFrase() en cuanto sabe cuál es (destino.js la sortea y la
//   comparte entre dispositivos). Si tarda más de ESPERA_FRASE_MS, se
//   usa la copia local para no dejar la pantalla vacía.
// · Primera apertura del día en este dispositivo: duración completa
//   según la longitud (25 / 30 / 45 / 50 s). Reaperturas del mismo día:
//   REPEAT_SECONDS. El tiempo corre desde que aparece la frase.
// · Al terminar el tiempo aparece "Toca para comenzar".
// ============================================================

import { fraseLocal, citaPorId, fechaLocal } from "./destino.js";

const REPEAT_SECONDS = 6;       // reaperturas del mismo día
const ESPERA_FRASE_MS = 8000;   // máx. de espera por la frase compartida
const SEEN_KEY = "askesis.ritual.fullSeen"; // fecha de la última duración completa

// Duración por número de palabras (umbrales justificados en README).
export function durationFor(text) {
  const w = text.trim().split(/\s+/).length;
  if (w <= 12) return 25;
  if (w <= 22) return 30;
  if (w <= 32) return 45;
  return 50;
}

function sizeClass(text) {
  const w = text.trim().split(/\s+/).length;
  if (w <= 10) return "q-short";
  if (w <= 24) return "q-medium";
  return "q-long";
}
function readSeen() { try { return localStorage.getItem(SEEN_KEY); } catch { return null; } }
function writeSeen(v) { try { localStorage.setItem(SEEN_KEY, v); } catch {} }

// app.js entrega aquí (una vez) la promesa con el id de la frase de hoy.
let entregarFrase;
const fraseEntregada = new Promise((resolve) => { entregarFrase = resolve; });
export function proveerFrase(promesaDeId) {
  Promise.resolve(promesaDeId).then(entregarFrase, () => entregarFrase(null));
}

// Se resuelve cuando la persona toca "Toca para comenzar".
export const ritualTerminado = new Promise((resolve) => {
  const root = document.getElementById("ritual");
  if (!root) { resolve(); return; }

  const textEl = root.querySelector(".ritual-quote-text");
  const authorEl = root.querySelector(".ritual-quote-author");
  const fill = root.querySelector(".ritual-progress-fill");
  const hint = root.querySelector(".ritual-hint");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", "#0E0A09");

  const espera = new Promise((r) => setTimeout(r, ESPERA_FRASE_MS));
  Promise.race([fraseEntregada, espera]).then((id) => {
    const q = citaPorId(id) || citaPorId(fraseLocal());
    mostrar(q);
  });

  function mostrar(q) {
    const hoy = fechaLocal();
    const primeraDelDia = readSeen() !== hoy;
    const seconds = primeraDelDia ? durationFor(q.t) : REPEAT_SECONDS;

    textEl.textContent = q.t;
    textEl.parentElement.classList.add(sizeClass(q.t));
    authorEl.textContent = q.a;
    root.dataset.tema = q.tema;

    // Barra de tiempo: transición lineal única por la duración exacta.
    fill.style.transitionDuration = `${seconds}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("running")));

    const inicio = performance.now();
    const tick = () => {
      if (performance.now() - inicio < seconds * 1000) { setTimeout(tick, 250); return; }
      if (primeraDelDia) writeSeen(hoy);
      root.classList.add("ready");
      hint.textContent = "Toca para comenzar";
      root.addEventListener("click", entrar);
      root.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") entrar(); });
      root.focus({ preventScroll: true });
    };
    tick();
  }

  let saliendo = false;
  function entrar() {
    if (saliendo) return;
    saliendo = true;
    root.classList.add("leaving");
    setTimeout(() => { root.remove(); resolve(); }, 650);
  }
});
