// ============================================================
// Askesis — destino.js
// El sorteo de la frase del día.
//
// · Una sola frase por día (de 00:00 a 23:59, hora local), igual en todos
//   los dispositivos de la cuenta: la primera apertura del día la sortea y
//   la guarda en Firestore (usuarios/{uid}/config/frases); las demás la leen.
// · El sorteo usa crypto.getRandomValues: el generador criptográfico del
//   sistema, con muestreo por rechazo para que no haya sesgo. Es la mejor
//   aleatoriedad disponible en un navegador; repetir el sorteo no la mejora.
// · No se repiten las últimas NO_REPETIR frases (el sorteo ocurre entre el
//   resto, con probabilidad idéntica para cada una).
// · Si no hay conexión, se sortea localmente y esa elección se registra
//   en cuanto vuelve la red (si nadie la había fijado antes).
// Este módulo no depende de Firebase: recibe sus funciones como argumento.
// ============================================================

import { QUOTES } from "./quotes.js";

export const NO_REPETIR = 18;
const LOCAL_KEY = "askesis.destino.local"; // { d: "YYYY-MM-DD", id, recientes: [id, ...] }

export function fechaLocal(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function citaPorId(id) { return QUOTES.find((q) => q.id === id) || null; }

// Entero uniforme en [0, n) sin sesgo de módulo.
function enteroAleatorio(n) {
  const c = globalThis.crypto;
  if (!c || !c.getRandomValues) return Math.floor(Math.random() * n);
  const buf = new Uint32Array(1);
  const limite = Math.floor(0x100000000 / n) * n;
  do { c.getRandomValues(buf); } while (buf[0] >= limite);
  return buf[0] % n;
}

// Elige el id de una frase que no esté entre las últimas NO_REPETIR.
export function sortearId(recientes = []) {
  const vetados = new Set(recientes.slice(-NO_REPETIR));
  const pool = QUOTES.filter((q) => !vetados.has(q.id));
  const base = pool.length ? pool : QUOTES;
  return base[enteroAleatorio(base.length)].id;
}

// ---- Copia local (respaldo sin conexión y dispositivo sin sesión) ----
function leerLocal() {
  try {
    const v = JSON.parse(localStorage.getItem(LOCAL_KEY));
    return v && typeof v === "object" ? v : null;
  } catch { return null; }
}
function guardarLocal(d, id, recientes) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify({ d, id, recientes: (recientes || []).slice(-NO_REPETIR) })); } catch {}
}

// Frase de hoy sin red: la que ya había hoy en este dispositivo, o un sorteo nuevo.
export function fraseLocal() {
  const hoy = fechaLocal();
  const l = leerLocal();
  if (l && l.d === hoy && citaPorId(l.id)) return l.id;
  const recientes = Array.isArray(l?.recientes) ? l.recientes : [];
  const id = sortearId(recientes);
  guardarLocal(hoy, id, [...recientes.filter((r) => r !== id), id]);
  return id;
}

// Frase de hoy compartida entre dispositivos. `fs` = { doc, getDoc, runTransaction }
// del SDK de Firestore. Nunca rechaza: ante cualquier fallo devuelve la local.
export async function fraseDelDia(fs, db, uid) {
  const hoy = fechaLocal();
  const ref = fs.doc(db, "usuarios", uid, "config", "frases");
  try {
    const snap = await fs.getDoc(ref);
    const dato = snap.exists() ? snap.data() : null;
    if (dato?.hoy?.d === hoy && citaPorId(dato.hoy.id)) {
      guardarLocal(hoy, dato.hoy.id, dato.recientes);
      return dato.hoy.id;
    }
    // Nadie la ha sorteado hoy: se sortea dentro de una transacción para que
    // dos dispositivos que abren a la vez no puedan fijar frases distintas.
    const id = await fs.runTransaction(db, async (tx) => {
      const s = await tx.get(ref);
      const d = s.exists() ? s.data() : {};
      if (d.hoy?.d === hoy && citaPorId(d.hoy.id)) return d.hoy.id; // otro dispositivo se adelantó
      const recientes = Array.isArray(d.recientes) ? d.recientes : [];
      const l = leerLocal();
      const elegido = l && l.d === hoy && citaPorId(l.id) ? l.id : sortearId(recientes);
      tx.set(ref, { hoy: { d: hoy, id: elegido }, recientes: [...recientes.filter((r) => r !== elegido), elegido].slice(-NO_REPETIR) });
      return elegido;
    });
    guardarLocal(hoy, id, [id]);
    return id;
  } catch {
    return fraseLocal();
  }
}
