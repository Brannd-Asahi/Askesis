# Askesis — v1.0

*ἄσκησις: ejercicio, entrenamiento, práctica disciplinada.*

PWA personal de entrenamiento (vanilla JS, módulos ES, sin build step).
Firebase Auth (correo/contraseña + Google) y Firestore con caché offline y
sincronización en tiempo real entre el Mi 9T y el Z Flip 6.

Es la continuación directa de Ozren v4: mismo código de rutina, historial,
temas, cronómetro y navegación, con repositorio y base de datos nuevos.
La puesta en marcha está en **FIREBASE_SETUP.md**.

## Lo nuevo en v1.0

### Ritual de entrada
Al abrir la app aparece una llama roja oscura, con trazo de aspecto dibujado
a mano, que arde despacio. Debajo va la **frase del día**. La app no se abre
hasta que pasa el tiempo. Al terminar aparece *“Toca para comenzar”*.

- **Una frase por día, la misma en los dos teléfonos.** Sale de una
  permutación fija de las 313 frases indexada por la fecha. No necesita
  sincronizarse y no repite ninguna hasta completar el ciclo de 313 días
  (desde el 29-oct-2026).
- **Duración según la longitud** (palabras de la frase):

  | Palabras | Tiempo | Frases |
  |---|---|---|
  | ≤ 12 | 25 s | 126 |
  | 13–22 | 30 s | 145 |
  | 23–32 | 45 s | 34 |
  | 33–39 | 50 s | 8 |

  Cálculo: a una lectura lenta y deliberada de unas 100 palabras por minuto,
  12 palabras ocupan unos 7 s. El resto del tiempo es para quedarse con la
  frase. Ninguna supera 39 palabras, así que los 50 s quedan para 8 frases (2,6 %).
- **Solo la primera apertura del día dura el tiempo completo** en cada
  teléfono. Si Android cierra la app a mitad de la sesión y la reabres, ves la
  misma frase durante 6 s (`REPEAT_SECONDS` en `ritual.js`). Así no pierdes
  45 s entre series.
- La llama es provisional hasta que exista el logo. Para reemplazarla, se
  cambia el `<svg class="ritual-flame">` en `index.html`.

### Las 313 frases (`quotes.js`, legibles en `FRASES.md`)
- **210 de prioridad:** disciplina 35, constancia 40, esfuerzo 24,
  sacrificio 18, valor 10, compromiso 11, voluntad 39, entrenamiento 16,
  resiliencia 17.
- **103 de complemento:** autoconocimiento 11, dominio de sí 22, calma 21,
  reflexión 49.
- Fuentes: citas estoicas (Vol. II), sabiduría asiática (599), Pilares de
  Reverend Insanity y Leyenda de Ren Zu, y algunas de Nie Li que se
  sostienen sin conocer la historia.
- Se quitaron los duplicados entre archivos (hay muchas traducciones repetidas
  de la misma cita) y las citas de más de 39 palabras.

### Otros cambios
- Iconos: la llama sustituye a la pesa en el icono de instalación (`icons/`), el favicon (`favicon.svg` + PNG de 32/48 px, versión plana que se lee en tamaño pequeño), el icono de iOS y el login.
- Todo renombrado a Askesis: título, manifest, caché del service worker
  (`askesis-v1`), reglas y archivos exportados (`respaldo-askesis-…json`).
- `firebase-config.js` viene con valores de plantilla. Si faltan, la app lo
  avisa en el login.
- Manifest y barra de estado oscuros, para que el arranque nativo de Android
  pase sin salto a la pantalla de la llama.

## Publicar una actualización
GitHub Desktop → reemplaza archivos → Commit → Push. En cada despliegue sube
`CACHE_NAME` en `service-worker.js` (`askesis-v2`, `askesis-v3`, …). Si sigue
apareciendo la versión vieja, borra los datos del sitio en Chrome.

## Temas (5)
Tema Base, Japonés · Shu, Oro sobre negro, Neumorfismo soft UI, Dashboard
completo. Champán y Dorado Solar se quitaron a propósito.
