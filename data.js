// ============================================================
// Datos de la app — arquitectura multi-plan.
// Cada día (incluidos los de descanso) es una entrada normal en
// plan.days, con weekday real (0=domingo...6=sábado) — el orden en
// listas y selectores se calcula siempre a partir de weekday, nunca
// de la posición en el objeto.
// ============================================================

export const DAY_TYPE_COLORS = {
  empuje: "#7B2D3E",
  traccion: "#A57F1F",
  pierna: "#3B6E8F",
  superior: "#7B2D3E",
  inferior: "#3B6E8F",
  opcional: "#8C7D5E",
  descanso: "#6B6552",
};

// ============================================================
// PLAN 1 — Empuje / Tracción / Pierna (6 días) — HISTÓRICO
// ============================================================
const plan1Days = {
  d1: {
    id: "d1", label: "Lunes", subtitle: "Empuje A", type: "empuje", weekday: 1,
    focus: "Pecho · Hombro · Tríceps",
    warmup: [
      "Trote suave en el sitio o saltos ligeros — 2 min",
      "Círculos de brazos, 10 hacia adelante y 10 hacia atrás",
      "Rotaciones externas de hombro (codo pegado al cuerpo, gira el antebrazo hacia afuera y adentro) — 10-12 repeticiones",
      "Retracciones escapulares sin peso: brazos rectos al frente, junta y separa los omóplatos — 10-15 veces",
      "Estiramiento de pectoral en marco de puerta — 20-30 segundos por lado",
      "Plancha corta — 20-30 segundos",
      "Serie de aproximación: 8-10 repeticiones con peso ligero en press banca, sintiendo el recorrido completo",
    ],
    exercises: [
      { name: "Press banca plano con barra", postura: "Acostado, pies firmes en el piso, agarre un poco más ancho que los hombros, omóplatos apretados contra el banco (ligera retracción, hacia abajo y atrás).", ejecucion: "Aprieta el abdomen como si fueras a recibir un golpe y aprieta también antebrazos/puños desde la primera repetición (irradiación de tensión — esto estabiliza el hombro). Baja controlada hasta rozar el pecho, codos a 45° del torso, no pegados ni en cruz total. Empuja hacia arriba sin rebotar, exhalando en el esfuerzo.", extra: "Antes de empezar: ajusta los ganchos de seguridad del rack a la altura del pecho.", risk: "Tironcito en el hombro derecho que no desaparece al apretar antebrazos/puños · dolor (no fatiga) que persiste más allá de la 2ª serie · necesitas rebotar la barra en el pecho. Si aparece cualquiera, baja el peso esa sesión.", sets: 4, reps: "8-10", techo: 12, rest: 150 },
      { name: "Press inclinado con mancuernas", postura: "Banco a 30-45° (posición fija siempre igual). Mancuernas a la altura del pecho superior, omóplatos igual de estables que en el press plano.", ejecucion: "Baja hasta sentir estiramiento del pecho, sin llegar al fondo total — detente antes de que el hombro se hunda o rote hacia adelante. Empuja arriba y ligeramente hacia adentro sin chocar las mancuernas. Abdomen apretado durante todo el recorrido.", sets: 3, reps: "8-10", techo: 12, rest: 120 },
      { name: "Press militar de pie", postura: "Barra o mancuernas a la altura de los hombros, pies fijos al ancho de cadera.", ejecucion: "Exhala fuerte y aprieta el abdomen antes de empujar — mantén esa tensión durante toda la repetición, no solo al inicio. Empuja recto hacia arriba; es normal que la cabeza se mueva ligeramente hacia adelante cuando la barra pasa la cara.", risk: "La espalda baja se arquea al subir el peso (aunque estés apretando abdomen) · sientes la zona lumbar \"tirando\" más que los hombros trabajando. Si aparece, baja el peso esa sesión.", sets: 3, reps: "8-10", techo: 12, rest: 150 },
      { name: "Elevaciones laterales", postura: "De pie, torso vertical y quieto, hombros abajo (lejos de las orejas), abdomen ligeramente activo.", ejecucion: "Codo lidera por encima de la muñeca durante todo el recorrido, sube hasta la altura del hombro, sin impulso de cadera. Baja controlado.", sets: 3, reps: "12-15", techo: 18, rest: 60 },
      { name: "Fondos en banco", postura: "Manos en el borde del banco, piernas al frente con rodillas ligeramente flexionadas (no completamente extendidas).", ejecucion: "Baja doblando codos hasta 90°, sube sin bloquear del todo.", extra: "Un \"clic\" leve en el hombro derecho sin dolor es normal. Detente solo si empieza a doler o se siente inestable.", sets: 3, reps: "10-12", techo: 15, rest: 90 },
      { name: "Extensión de tríceps sobre la cabeza", postura: "Mancuerna sostenida con ambas manos detrás de la nuca, codos apuntando al techo y fijos.", ejecucion: "Abdomen apretado desde antes de iniciar, durante todo el set. Baja y sube solo con el antebrazo, sin que la espalda se desplace hacia adelante.", sets: 3, reps: "10-12", techo: 15, rest: 70 },
    ],
    stretch: ["Pectoral en marco de puerta — 20-30 segundos por lado", "Tríceps, brazo detrás de la cabeza — 20-30 segundos por lado", "Hombro cruzado al pecho — 20-30 segundos por lado"],
  },
  d2: {
    id: "d2", label: "Martes", subtitle: "Tracción A", type: "traccion", weekday: 2,
    focus: "Espalda · Bíceps · Antebrazo",
    warmup: ["Trote suave en el sitio — 2 min", "Dead hang ligero de la barra (colgarte sin hacer fuerza) — 2 series de 15-20 segundos", "Retracciones escapulares sin peso — 10-15 veces", "Rotaciones externas de hombro — 10-12 repeticiones", "Plancha corta — 20-30 segundos"],
    exercises: [
      { name: "Dominadas", postura: "Agarre pronado (palmas hacia adelante), manos un poco más separadas que el ancho de tus hombros. Activa los omóplatos hacia abajo y atrás antes de iniciar.", ejecucion: "Cuerpo lo más recto posible, evita el balanceo de piernas. Sube hasta que la barbilla pase la barra, exhalando en el esfuerzo. Baja controlado hasta extensión completa de brazos.", extra: "Negativas: después de las 4 series normales, agrega 2-3 negativas — sube con impulso de salto o apoyo de banco, y desciende contando 4-5 segundos, resistiendo todo el camino.", risk: "Balanceo notorio de piernas para tomar impulso (kipping) · dolor punzante en el hombro (distinto a fatiga muscular) al llegar arriba. Si aparece dolor articular, detén el ejercicio esa sesión.", sets: 4, reps: "al fallo + negativas", techo: null, rest: 150 },
      { name: "Remo con barra inclinado", postura: "Pies al ancho de cadera, rodillas con flexión suave, cadera hacia atrás. Torso inclinado casi paralelo al piso, espalda recta.", ejecucion: "Jala la barra hacia la parte baja del abdomen/ombligo, no hacia el pecho. Al final del recorrido, aprieta los omóplatos con fuerza extra un instante. Baja controlado sin dejar caer el peso de golpe.", sets: 4, reps: "8-10", techo: 12, rest: 120 },
      { name: "Remo a una mano", postura: "Rodilla y mano del mismo lado apoyadas en el banco, espalda paralela al piso, sin rotar hacia ningún lado.", ejecucion: "El codo va pegado al cuerpo, jalando hacia atrás y ligeramente hacia la cadera. Al llegar arriba, aprieta el omóplato. Baja completo, sintiendo el estiramiento del dorsal.", sets: 3, reps: "10/lado", techo: 13, rest: 90, unilateral: true, ladoLabel: ["Izquierda", "Derecha"] },
      { name: "Pájaros (deltoide posterior)", postura: "De pie, inclinado hacia adelante desde la cadera hasta casi paralelo al piso, rodillas con ligera flexión. Mancuernas livianas, palmas mirándose entre sí.", ejecucion: "Sube los brazos hacia los lados en arco, con ligera flexión de codo fija. Aprieta omóplatos arriba, baja controlado.", sets: 3, reps: "12-15", techo: 18, rest: 60 },
      { name: "Curl bíceps con barra", postura: "De pie, agarre supino al ancho de hombros, codos pegados al torso desde el inicio y ahí se quedan.", ejecucion: "Sube la barra solo con la flexión del codo, sin usar impulso de cadera. Aprieta arriba, baja controlado contando 2-3 segundos.", sets: 3, reps: "10", techo: 13, rest: 65 },
      { name: "Curl martillo", postura: "Igual mecánica que el curl con barra, con mancuernas y palmas mirándose entre sí (agarre neutro) durante todo el recorrido.", ejecucion: "Sube con flexión de codo, sin balancear el hombro. Baja controlado.", sets: 3, reps: "10-12", techo: 15, rest: 60 },
      { name: "Curl de muñeca", postura: "Sentado, antebrazos apoyados sobre los muslos, muñecas en el borde, palmas hacia arriba.", ejecucion: "Solo la muñeca se mueve — el antebrazo permanece inmóvil. Flexiona hacia arriba, aprieta, baja hasta sentir estiramiento.", sets: 2, reps: "15-20", techo: 22, rest: 45 },
      { name: "Farmer's carry", postura: "Mancuernas pesadas a los lados del cuerpo, hombros hacia atrás y abajo, pecho al frente, abdomen apretado.", ejecucion: "Camina en línea recta con pasos controlados, sin inclinar el torso ni encorvar la espalda por el peso.", sets: 3, reps: "30-40 seg", techo: null, rest: 75 },
      { name: "🆕 Curl predicador (módulo K6)", postura: "Brazo completamente apoyado en la almohadilla del predicador, agarre supino, empezando casi extendido.", ejecucion: "Sube flexionando solo el codo, sin despegar el brazo de la almohadilla. Aprieta arriba, baja contando 3 segundos sintiendo el estiramiento.", extra: "Accesorio extra — aísla el bíceps desde un ángulo distinto al curl de pie.", sets: 2, reps: "10/brazo", techo: 13, rest: 60, unilateral: true, ladoLabel: ["Izquierdo", "Derecho"] },
    ],
    stretch: ["Dorsal en barra (colgado relajado) — 20-30 segundos", "Bíceps contra pared — 20-30 segundos por lado", "Hombro cruzado al pecho — 20-30 segundos por lado"],
  },
  d3: {
    id: "d3", label: "Miércoles", subtitle: "Pierna A", type: "pierna", weekday: 3,
    focus: "Cuádriceps · Isquiotibial · Pantorrilla · Core",
    warmup: ["Trote suave en el sitio o step-ups sin peso — 2-3 min", "Sentadilla profunda sin peso, sostenida 20-30 segundos", "Círculos de cadera — 10 por lado", "Zancadas caminando sin peso — 8-10 pasos por pierna", "Puente de glúteo sin peso — 15 repeticiones", "Plancha corta — 20-30 segundos", "Serie de aproximación: 8-10 repeticiones con poco peso en sentadilla"],
    exercises: [
      { name: "Sentadilla con barra", postura: "Barra sobre los trapecios (no en el cuello), pies al ancho de hombros, puntas ligeramente hacia afuera (10-15°). Agarre firme, codos hacia abajo y atrás.", ejecucion: "Aprieta el abdomen antes de bajar. Empuja la cadera hacia atrás como si te sentaras en una silla detrás de ti. Las rodillas siguen la dirección de los dedos de los pies. Baja hasta que el muslo quede paralelo al piso o un poco más. Sube empujando con los talones, pecho erguido, exhalando.", risk: "La espalda baja se redondea antes de llegar a tu profundidad objetivo · las rodillas colapsan hacia adentro al subir · el talón se despega del piso. Cualquiera de estas es tu límite real de hoy.", sets: 4, reps: "8-10", techo: 12, rest: 150 },
      { name: "Zancada búlgara", postura: "Pie trasero apoyado en el banco (empeine, no la punta), pie delantero a distancia suficiente para que la rodilla no se pase de la punta del pie al bajar.", ejecucion: "Torso ligeramente inclinado hacia adelante, abdomen apretado. Baja controlado hasta que la rodilla trasera casi toque el piso, peso principalmente en el talón de la pierna delantera. Empuja con ese talón para subir.", sets: 3, reps: "10/pierna", techo: 13, rest: 90, unilateral: true, ladoLabel: ["Izquierda", "Derecha"] },
      { name: "Step-ups", postura: "De pie frente al banco, altura de rodilla o un poco más baja.", ejecucion: "Sube completamente con una pierna hasta quedar de pie sobre el banco, extendiendo la cadera por completo arriba, sin empujarte con la pierna que queda abajo. Baja controlado, sin dejarte caer de golpe.", sets: 3, reps: "12/pierna", techo: 15, rest: 90, unilateral: true, ladoLabel: ["Izquierda", "Derecha"] },
      { name: "🆕 Extensión de pierna (módulo K6)", postura: "Espalda y cadera completamente apoyadas contra el respaldo. Rodillo justo encima de los tobillos.", ejecucion: "Extiende exhalando, sin impulso de cadera. Aprieta el cuádriceps 1-2 segundos en el punto más alto, baja controlado (2-3 seg) hasta 90°.", extra: "Rango completo con poco peso siempre por encima de medio rango con mucho peso — si no completas la extensión, baja el peso.", sets: 3, reps: "12-15", techo: 18, rest: 75 },
      { name: "🆕 Curl femoral (módulo K6)", postura: "Boca abajo, rodillas en el borde del banco, rodillo bajo los tobillos.", ejecucion: "Flexiona llevando el talón al glúteo. La cadera se mantiene pegada al banco — si se despega, el peso está muy alto. Baja controlado.", sets: 3, reps: "12-15", techo: 18, rest: 75 },
      { name: "Elevación de talones de pie", postura: "De pie, con o sin mancuernas, punta de los pies en el borde de un escalón si tienes uno disponible.", ejecucion: "Sube lo más alto posible en la punta de los pies, aprieta pantorrilla arriba y pausa 1 segundo completo, baja controlado hasta sentir el estiramiento completo.", sets: 4, reps: "15-20", techo: 22, rest: 55 },
      { name: "Plancha y plancha lateral", postura: "Frontal: antebrazos apoyados, codos justo debajo de los hombros, cuerpo en línea recta desde la cabeza hasta los talones.", ejecucion: "Aprieta glúteo y abdomen con fuerza — no dejes caer la cadera. Lateral: apoyado en un antebrazo, cadera elevada sin caer hacia el piso.", sets: 3, reps: "30-45 seg (frontal y lateral)", techo: null, rest: 40 },
    ],
    stretch: ["Cuádriceps de pie (sostener el tobillo detrás) — 20-30 segundos por lado", "Isquiotibial sentado (pierna extendida, alcanzar el pie) — 20-30 segundos por lado", "Pantorrilla contra la pared — 20-30 segundos por lado"],
  },
  descanso: {
    id: "descanso", label: "Jueves", subtitle: "Descanso", type: "descanso", weekday: 4,
    focus: "Recuperación activa",
    tips: ["Movimiento ligero: caminar, estirar — nada de carga.", "Prioriza proteína suficiente e hidratación.", "Buen sueño: aquí se repara y crece el músculo, no en el gimnasio."],
  },
  d5: {
    id: "d5", label: "Viernes", subtitle: "Empuje B", type: "empuje", weekday: 5,
    focus: "Pecho superior · Hombro (3 ángulos) · Tríceps",
    warmup: ["Trote suave o saltos ligeros — 2 min", "Círculos de brazos, 10 adelante y 10 atrás", "Rotaciones externas de hombro — 10-12 repeticiones", "Estiramiento de pectoral en marco de puerta — 20-30 segundos por lado", "Plancha corta — 20-30 segundos", "Serie de aproximación: 8-10 repeticiones ligeras en press inclinado"],
    exercises: [
      { name: "Press inclinado con barra", postura: "Banco a 30-45° (misma posición fija de siempre). Pies firmes, agarre un poco más ancho que hombros, omóplatos apretados contra el banco.", ejecucion: "Baja la barra hasta la clavícula/pecho superior, codos a 45°. Empuja sin rebotar, exhalando. Presión abdominal activa todo el recorrido.", sets: 4, reps: "8", techo: 10, rest: 150 },
      { name: "Press Arnold", postura: "Sentado o de pie, mancuernas a la altura de hombros, palmas mirándote (como un curl).", ejecucion: "Mientras empujas hacia arriba, gira las muñecas progresivamente hasta que las palmas queden mirando al frente arriba — un solo movimiento fluido, no dos pasos. Invierte la rotación al bajar. Abdomen apretado.", risk: "Pausa notoria entre \"girar\" y \"empujar\" (deben ser un solo movimiento) · espalda baja arqueándose · necesitas impulso de piernas. Si aparece, baja el peso.", sets: 3, reps: "10", techo: 13, rest: 90 },
      { name: "Aperturas con mancuerna", postura: "Acostado, mancuernas arriba del pecho, palmas mirándose, ligera flexión de codo fija.", ejecucion: "Baja en arco hasta sentir el estiramiento del pecho, nunca hasta que el hombro ceda. Sube juntando las mancuernas sin golpearlas, como abrazando un barril. Peso ligero, prioriza sensación.", sets: 3, reps: "12-15", techo: 18, rest: 70 },
      { name: "Elevación lateral + frontal (superserie)", postura: "De pie, mancuernas a los lados, codos con ligera flexión fija.", ejecucion: "Parte 1 (lateral): codo lidera, sube a la altura del hombro. Sin descansar, parte 2 (frontal): con las mismas mancuernas, sube al frente hasta altura de hombro. Torso vertical y quieto — si se inclina hacia atrás, el peso es demasiado alto.", sets: 3, reps: "12 cada parte", techo: 15, rest: 90 },
      { name: "Press francés", postura: "Acostado, agarre cerrado, brazos extendidos hacia el techo formando línea vertical desde el hombro.", ejecucion: "Brazo superior fijo y vertical — solo el antebrazo se mueve. Baja hacia la frente, sube extendiendo sin mover el brazo superior.", sets: 3, reps: "10", techo: 13, rest: 75 },
    ],
    stretch: ["Pectoral en marco de puerta — 20-30 segundos por lado", "Tríceps, brazo detrás de la cabeza — 20-30 segundos por lado", "Hombro cruzado al pecho — 20-30 segundos por lado"],
  },
  d6: {
    id: "d6", label: "Sábado", subtitle: "Tracción B", type: "traccion", weekday: 6,
    focus: "Espalda (ángulo distinto) · Bíceps (aislamiento) · Antebrazo",
    warmup: ["Trote suave — 2 min", "Dead hang ligero — 2 series de 15-20 segundos", "Retracciones escapulares sin peso — 10-15 veces", "Rotaciones externas de hombro — 10-12 repeticiones"],
    exercises: [
      { name: "Dominadas", postura: "Agarre pronado, manos un poco más separadas que el ancho de hombros.", ejecucion: "Rango completo, sin balanceo. Sube hasta que la barbilla pase la barra, baja hasta extensión completa.", risk: "Mismo criterio que el otro día de tracción — kipping notorio o dolor punzante (no fatiga) en el hombro → detén el ejercicio esa sesión.", sets: 3, reps: "al fallo", techo: null, rest: 150 },
      { name: "Remo, agarre supino (palmas hacia ti)", postura: "Torso casi paralelo al piso, rodillas con ligera flexión, espalda neutra — abdomen apretado desde antes de iniciar, sosteniendo esa presión toda la serie.", ejecucion: "Con agarre supino, jala la barra hacia el abdomen bajo, aprieta omóplatos al final, baja controlado.", sets: 4, reps: "8-10", techo: 12, rest: 120 },
      { name: "Curl inclinado con mancuernas", postura: "Sentado en banco inclinado hacia atrás (45-60°), espalda apoyada, brazos colgando libremente detrás de la línea del torso — mayor estiramiento del bíceps en el punto bajo.", ejecucion: "Sube con flexión de codo, sin despegar el brazo superior ni balancear el hombro. Aprieta arriba, baja controlado sintiendo el estiramiento completo.", sets: 3, reps: "10", techo: 13, rest: 75 },
      { name: "Curl concentrado", postura: "Sentado, codo apoyado en la cara interna del muslo del mismo lado, brazo colgando hacia el piso.", ejecucion: "Sube flexionando solo el codo, sin mover el hombro ni el torso — el apoyo en el muslo elimina el impulso, mayor aislamiento del bíceps de toda tu rutina.", sets: 2, reps: "12/brazo", techo: 15, rest: 60, unilateral: true, ladoLabel: ["Izquierdo", "Derecho"] },
      { name: "Dead hang", postura: "Cuélgate de la barra con agarre pronado, brazos completamente extendidos, hombros relajados.", ejecucion: "No hagas ningún esfuerzo activo — es descompresión de columna y fuerza de agarre pasiva. Sostén tu peso colgado, respirando con normalidad.", sets: 3, reps: "máx. tiempo posible", techo: null, rest: 75 },
    ],
    stretch: ["Dorsal en barra (colgado relajado) — 20-30 segundos", "Bíceps contra pared — 20-30 segundos por lado", "Hombro cruzado al pecho — 20-30 segundos por lado"],
  },
  d7: {
    id: "d7", label: "Domingo", subtitle: "Pierna B", type: "pierna", weekday: 0,
    focus: "Cadera · Glúteo · Pantorrilla · Core",
    warmup: ["Trote suave en el sitio — 2 min", "Puente de glúteo sin peso — 15 repeticiones", "Círculos de cadera — 10 por lado", "Peso muerto rumano sin peso, sostenido — 5-6 repeticiones lentas", "Zancada caminando sin peso — 8 pasos por pierna", "Plancha corta — 20-30 segundos"],
    exercises: [
      { name: "Peso muerto rumano", postura: "Barra pegada a las piernas, pies al ancho de cadera, rodillas con ligera flexión (nunca bloqueadas).", ejecucion: "Baja empujando la cadera hacia atrás (no doblando rodillas como sentadilla), espalda recta todo el tiempo, barra pegada al cuerpo. La fuerza para subir nace de la cadera — empuja la cadera hacia adelante y aprieta el glúteo, exhalando en el esfuerzo.", risk: "La espalda se redondea antes de sentir el estiramiento en isquiotibiales · sientes que \"tiras\" con la espalda baja en vez de empujar con la cadera. Esa es tu límite de rango real hoy — no bajes más.", sets: 4, reps: "8-10", techo: 12, rest: 150 },
      { name: "Hip thrust", postura: "Espalda alta apoyada en el banco, barra o mancuerna sobre la cadera, pies firmes en el piso al ancho de cadera.", ejecucion: "Empuja la cadera hacia arriba hasta que el torso quede recto (línea desde rodilla a hombro), aprieta el glúteo con fuerza arriba 1 segundo, baja controlado. Exhala en el esfuerzo de subida.", sets: 3, reps: "12-15", techo: 18, rest: 90 },
      { name: "Zancada lateral (curtsy lunge)", postura: "De pie, posición inicial normal.", ejecucion: "Da un paso cruzando una pierna por detrás de la otra en diagonal, baja flexionando ambas rodillas hasta sentir el trabajo en glúteo medio, vuelve al centro empujando con la pierna delantera.", sets: 3, reps: "10/lado", techo: 13, rest: 90, unilateral: true, ladoLabel: ["Izquierda", "Derecha"] },
      { name: "🆕 Extensión de pierna (módulo K6)", postura: "Espalda y cadera pegadas al respaldo, rodillo sobre los tobillos.", ejecucion: "Extiende exhalando, aprieta el cuádriceps 1-2 seg arriba, baja controlado. Rango completo siempre por encima de más peso.", sets: 2, reps: "12-15", techo: 18, rest: 75 },
      { name: "🆕 Curl femoral (módulo K6)", postura: "Boca abajo, rodillas en el borde del banco, rodillo bajo los tobillos.", ejecucion: "Cadera pegada al banco todo el movimiento, flexiona llevando el talón al glúteo, baja controlado.", sets: 2, reps: "12-15", techo: 18, rest: 75 },
      { name: "Pantorrilla", postura: "De pie, con o sin mancuernas.", ejecucion: "Sube lo más alto posible en la punta de los pies, pausa 1 segundo arriba, baja controlado hasta estiramiento completo.", sets: 4, reps: "15-20", techo: 22, rest: 55 },
      { name: "Abdominales (elevación de piernas + giros rusos)", postura: "Elevación de piernas: colgado de la barra o acostado. Giros rusos: sentado, torso ligeramente reclinado.", ejecucion: "Elevación: sube las piernas controlado sin balancear el cuerpo, baja lento. Giros: gira el torso de lado a lado de forma controlada, sin tirones bruscos.", sets: 3, reps: "15", techo: null, rest: 45 },
    ],
    stretch: ["Isquiotibial sentado — 20-30 segundos por lado", "Glúteo cruzado (rodilla al pecho, cruzada) — 20-30 segundos por lado", "Pantorrilla contra la pared — 20-30 segundos por lado"],
  },
};

export const PLAN_1 = {
  id: "plan1",
  nombre: "Plan 1 · Empuje / Tracción / Pierna (6 días)",
  descripcion: "El plan original con el que empezaste — Lunes a Domingo, solo Jueves de descanso. Conservado como archivo histórico.",
  days: plan1Days,
  weekdayMap: { 1: "d1", 2: "d2", 3: "d3", 4: "descanso", 5: "d5", 6: "d6", 0: "d7" },
};

// ============================================================
// PLAN 2 — Superior / Inferior (4 días fijos + 1 opcional) — ACTIVO
// Lunes y Martes son dos días de descanso SEPARADOS (misma pantalla,
// mismo contenido), no uno compartido — así cada uno queda registrado
// de forma independiente en el historial.
// ============================================================
const plan2Days = {
  descanso_lunes: {
    id: "descanso_lunes", label: "Lunes", subtitle: "Descanso fijo", type: "descanso", weekday: 1,
    focus: "Protegido intencionalmente — trabajo + clase hasta las 9:30pm",
    tips: ["Este día se deja sin entrenar a propósito, para proteger el sueño en tu semana más exigente.", "Un entrenamiento aquí no mejora el resultado semanal — la evidencia dice que el volumen total importa más que repartirlo en más días.", "Aprovecha para dormir bien, comer suficiente proteína, y llegar descansado al miércoles."],
  },
  descanso_martes: {
    id: "descanso_martes", label: "Martes", subtitle: "Descanso fijo", type: "descanso", weekday: 2,
    focus: "Protegido intencionalmente — trabajo + clase hasta las 9:30pm",
    tips: ["Este día se deja sin entrenar a propósito, para proteger el sueño en tu semana más exigente.", "Un entrenamiento aquí no mejora el resultado semanal — la evidencia dice que el volumen total importa más que repartirlo en más días.", "Aprovecha para dormir bien, comer suficiente proteína, y llegar descansado al miércoles."],
  },
  sup_a: {
    id: "sup_a", label: "Miércoles", subtitle: "Superior A", type: "superior", weekday: 3,
    focus: "Pecho · Espalda · Hombro · Bíceps",
    warmup: ["Trote suave en el sitio o saltos ligeros — 2 min", "Círculos de brazos, 10 adelante y 10 atrás", "Rotaciones externas de hombro — 10-12 repeticiones", "Retracciones escapulares sin peso — 10-15 veces", "Dead hang ligero — 2 series de 15-20 segundos", "Plancha corta — 20-30 segundos"],
    exercises: [
      { name: "Press banca plano", postura: "Acostado, pies firmes, agarre un poco más ancho que los hombros, omóplatos apretados contra el banco.", ejecucion: "Aprieta abdomen y antebrazos/puños antes de bajar (irradiación de tensión). Baja hasta rozar el pecho, codos a 45°. Empuja sin rebotar, exhalando.", extra: "Ajusta los ganchos de seguridad del rack a la altura del pecho antes de empezar.", risk: "Tironcito en el hombro derecho que no desaparece al apretar antebrazos/puños · dolor que persiste más allá de la 2ª serie. Si aparece, baja el peso esa sesión.", sets: 4, reps: "8-10", techo: 12, rest: 150 },
      { name: "Remo con barra inclinado", postura: "Pies al ancho de cadera, cadera hacia atrás, torso casi paralelo al piso, espalda recta.", ejecucion: "Jala la barra hacia la parte baja del abdomen. Aprieta omóplatos al final. Baja controlado.", sets: 4, reps: "8-10", techo: 12, rest: 120 },
      { name: "Press militar de pie", postura: "Barra o mancuernas a la altura de los hombros, pies fijos al ancho de cadera.", ejecucion: "Exhala fuerte y aprieta el abdomen antes de empujar — mantén esa tensión durante toda la repetición. Empuja recto hacia arriba.", risk: "La espalda baja se arquea al subir el peso. Si aparece, baja el peso esa sesión.", sets: 3, reps: "8-10", techo: 12, rest: 150 },
      { name: "Dominadas", postura: "Agarre pronado, manos un poco más separadas que el ancho de hombros. Activa los omóplatos antes de iniciar.", ejecucion: "Cuerpo recto, sin balanceo. Sube hasta que la barbilla pase la barra. Baja controlado hasta extensión completa.", extra: "Después de las series normales, agrega 2-3 negativas (bajada de 4-5 segundos).", risk: "Kipping notorio o dolor punzante en el hombro → detén el ejercicio esa sesión.", sets: 4, reps: "al fallo + negativas", techo: null, rest: 150 },
      { name: "Elevación lateral", postura: "De pie, torso vertical y quieto, hombros abajo.", ejecucion: "Codo lidera por encima de la muñeca, sube hasta la altura del hombro, sin impulso de cadera. Baja controlado.", sets: 3, reps: "12-15", techo: 18, rest: 60 },
      { name: "Curl bíceps con barra", postura: "De pie, agarre supino, codos pegados al torso desde el inicio.", ejecucion: "Sube solo con flexión de codo, sin impulso de cadera. Baja contando 2-3 segundos.", sets: 3, reps: "10", techo: 13, rest: 65 },
    ],
    opcionales: [
      { name: "Curl de muñeca", postura: "Sentado, antebrazos apoyados sobre los muslos, palmas hacia arriba.", ejecucion: "Solo la muñeca se mueve. Flexiona hacia arriba, aprieta, baja hasta sentir estiramiento.", sets: 2, reps: "15-20", techo: 22, rest: 45 },
      { name: "Encogimientos con mancuerna (shrugs)", postura: "De pie, mancuernas a los lados, brazos completamente rectos.", ejecucion: "Eleva los hombros hacia las orejas en línea recta (sin rodar), aprieta arriba 1 segundo, baja controlado.", sets: 3, reps: "12-15", techo: 18, rest: 60 },
    ],
    stretch: ["Pectoral en marco de puerta — 20-30 segundos por lado", "Dorsal en barra (colgado relajado) — 20-30 segundos", "Hombro cruzado al pecho — 20-30 segundos por lado"],
  },
  opcional_jueves: {
    id: "opcional_jueves", label: "Jueves", subtitle: "Opcional", type: "opcional", weekday: 4,
    focus: "Bíceps · Hombro lateral · Core — solo si hoy tienes el margen real",
    warmup: ["Círculos de brazos — 10 adelante y 10 atrás", "Rotaciones externas de hombro — 8-10 repeticiones"],
    exercises: [
      { name: "Curl martillo", postura: "De pie, mancuernas con agarre neutro (palmas mirándose), codos pegados al torso.", ejecucion: "Sube con flexión de codo, sin balancear el hombro. Baja controlado.", sets: 3, reps: "10-12", techo: 15, rest: 60 },
      { name: "Elevación lateral", postura: "De pie, torso vertical y quieto, hombros abajo.", ejecucion: "Codo lidera por encima de la muñeca, sube hasta la altura del hombro, sin impulso de cadera. Baja controlado.", sets: 3, reps: "12-15", techo: 18, rest: 60 },
      { name: "Plancha", postura: "Antebrazos apoyados, codos bajo los hombros, línea recta cabeza-talones.", ejecucion: "Aprieta glúteo y abdomen con fuerza — no dejes caer la cadera.", sets: 3, reps: "30-45 seg", techo: null, rest: 40 },
    ],
    stretch: ["Bíceps contra pared — 20-30 segundos por lado", "Hombro cruzado al pecho — 20-30 segundos por lado"],
  },
  inf_a: {
    id: "inf_a", label: "Viernes", subtitle: "Inferior A", type: "inferior", weekday: 5,
    focus: "Cuádriceps · Isquiotibial · Pantorrilla · Core",
    warmup: ["Trote suave o step-ups sin peso — 2-3 min", "Sentadilla profunda sin peso, sostenida 20-30 segundos", "Círculos de cadera — 10 por lado", "Zancadas caminando sin peso — 8-10 pasos por pierna", "Puente de glúteo sin peso — 15 repeticiones", "Serie de aproximación: 8-10 reps con poco peso en sentadilla"],
    exercises: [
      { name: "Sentadilla con barra", postura: "Barra sobre los trapecios, pies al ancho de hombros, puntas ligeramente hacia afuera.", ejecucion: "Aprieta el abdomen antes de bajar. Empuja la cadera hacia atrás. Rodillas siguiendo la dirección de los pies. Baja hasta paralelo o un poco más. Sube empujando con los talones.", risk: "Espalda baja redondeándose · rodillas colapsando hacia adentro · talón despegándose. Cualquiera de estas es tu límite real de hoy.", sets: 4, reps: "8-10", techo: 12, rest: 150 },
      { name: "Peso muerto rumano", postura: "Barra pegada a las piernas, rodillas con ligera flexión (nunca bloqueadas).", ejecucion: "Baja empujando la cadera hacia atrás, espalda recta, barra pegada al cuerpo. La fuerza para subir nace de la cadera — empuja la cadera adelante y aprieta el glúteo.", risk: "La espalda se redondea antes de sentir el estiramiento en isquiotibiales. Esa es tu límite de rango real hoy.", sets: 4, reps: "8-10", techo: 12, rest: 150 },
      { name: "Zancada búlgara", postura: "Pie trasero (empeine) sobre el banco, pie delantero a distancia suficiente.", ejecucion: "Torso ligeramente inclinado, abdomen apretado. Baja hasta que la rodilla trasera casi toque el piso. Empuja con el talón delantero.", sets: 3, reps: "10/pierna", techo: 13, rest: 90, unilateral: true, ladoLabel: ["Izquierda", "Derecha"] },
      { name: "🆕 Extensión de pierna (módulo K6)", postura: "Espalda y cadera pegadas al respaldo, rodillo sobre los tobillos.", ejecucion: "Extiende exhalando, sin impulso de cadera. Aprieta el cuádriceps 1-2 seg arriba, baja controlado.", extra: "Rango completo con poco peso siempre por encima de medio rango con mucho peso.", sets: 3, reps: "12-15", techo: 18, rest: 75 },
      { name: "🆕 Curl femoral (módulo K6)", postura: "Boca abajo, rodillas en el borde del banco, rodillo bajo los tobillos.", ejecucion: "Flexiona llevando el talón al glúteo, cadera pegada al banco. Baja controlado.", sets: 3, reps: "12-15", techo: 18, rest: 75 },
      { name: "Elevación de talones", postura: "De pie, con o sin mancuernas.", ejecucion: "Sube lo más alto posible en la punta de los pies, pausa 1 segundo arriba, baja controlado hasta el estiramiento completo.", sets: 4, reps: "15-20", techo: 22, rest: 55 },
      { name: "Plancha y plancha lateral", postura: "Frontal: antebrazos apoyados, codos bajo hombros, línea recta cabeza-talones.", ejecucion: "Aprieta glúteo y abdomen. Lateral: apoyado en un antebrazo, cadera elevada sin caer.", sets: 3, reps: "30-45 seg (frontal y lateral)", techo: null, rest: 40 },
    ],
    stretch: ["Cuádriceps de pie — 20-30 segundos por lado", "Isquiotibial sentado — 20-30 segundos por lado", "Pantorrilla contra la pared — 20-30 segundos por lado"],
  },
  sup_b: {
    id: "sup_b", label: "Sábado", subtitle: "Superior B", type: "superior", weekday: 6,
    focus: "Pecho (ángulo distinto) · Espalda · Hombro (3 ángulos) · Bíceps",
    warmup: ["Trote suave — 2 min", "Círculos de brazos — 10 adelante y 10 atrás", "Rotaciones externas de hombro — 10-12 repeticiones", "Dead hang ligero — 2 series de 15-20 segundos"],
    exercises: [
      { name: "Press inclinado con mancuernas", postura: "Banco a 30-45°, mancuernas a la altura del pecho superior.", ejecucion: "Baja hasta sentir estiramiento del pecho, sin llegar al fondo total. Empuja arriba y ligeramente hacia adentro sin chocar las mancuernas.", sets: 3, reps: "8-10", techo: 12, rest: 120 },
      { name: "Remo, agarre supino (palmas hacia ti)", postura: "Torso casi paralelo al piso, espalda neutra — abdomen apretado desde antes de iniciar.", ejecucion: "Agarre supino (distinto al de Superior A), jala hacia el abdomen bajo, aprieta omóplatos al final.", sets: 4, reps: "8-10", techo: 12, rest: 120 },
      { name: "Press Arnold", postura: "Sentado o de pie, mancuernas a la altura de hombros, palmas mirándote.", ejecucion: "Mientras empujas, gira las muñecas hasta que las palmas queden al frente arriba — un solo movimiento fluido. Invierte al bajar.", risk: "Pausa entre \"girar\" y \"empujar\" · espalda baja arqueándose. Si aparece, baja el peso.", sets: 3, reps: "10", techo: 13, rest: 90 },
      { name: "Fondos en banco", postura: "Manos en el borde del banco, rodillas ligeramente flexionadas.", ejecucion: "Baja doblando codos hasta 90°, sube sin bloquear del todo.", extra: "Un \"clic\" leve sin dolor en el hombro es normal.", sets: 3, reps: "10-12", techo: 15, rest: 90 },
      { name: "Pájaros (deltoide posterior)", postura: "De pie, inclinado desde la cadera, mancuernas livianas.", ejecucion: "Sube en arco, ligera flexión de codo fija. Aprieta omóplatos arriba, baja controlado.", sets: 3, reps: "12-15", techo: 18, rest: 60 },
      { name: "Curl martillo", postura: "De pie, mancuernas con agarre neutro (palmas mirándose).", ejecucion: "Sube con flexión de codo, sin balancear el hombro. Baja controlado.", sets: 3, reps: "10-12", techo: 15, rest: 60 },
    ],
    opcionales: [
      { name: "Curl de muñeca", postura: "Sentado, antebrazos apoyados sobre los muslos, palmas hacia arriba.", ejecucion: "Solo la muñeca se mueve. Flexiona hacia arriba, aprieta, baja hasta sentir estiramiento.", sets: 2, reps: "15-20", techo: 22, rest: 45 },
      { name: "Encogimientos con mancuerna (shrugs)", postura: "De pie, mancuernas a los lados, brazos completamente rectos.", ejecucion: "Eleva los hombros hacia las orejas en línea recta, aprieta arriba 1 segundo, baja controlado.", sets: 3, reps: "12-15", techo: 18, rest: 60 },
    ],
    stretch: ["Pectoral en marco de puerta — 20-30 segundos por lado", "Dorsal en barra (colgado relajado) — 20-30 segundos", "Hombro cruzado al pecho — 20-30 segundos por lado"],
  },
  inf_b: {
    id: "inf_b", label: "Domingo", subtitle: "Inferior B", type: "inferior", weekday: 0,
    focus: "Cadera · Glúteo · Pantorrilla · Core",
    warmup: ["Trote suave — 2 min", "Puente de glúteo sin peso — 15 repeticiones", "Círculos de cadera — 10 por lado", "Zancada caminando sin peso — 8 pasos por pierna", "Plancha corta — 20-30 segundos"],
    exercises: [
      { name: "Hip thrust", postura: "Espalda alta apoyada en el banco, barra o mancuerna sobre la cadera.", ejecucion: "Empuja la cadera arriba hasta línea recta rodilla-hombro, aprieta el glúteo 1 seg arriba, baja controlado.", sets: 3, reps: "12-15", techo: 18, rest: 90 },
      { name: "Step-ups", postura: "De pie frente al banco, altura de rodilla o un poco más baja.", ejecucion: "Sube completo con una pierna hasta extender la cadera arriba, sin empujarte con la pierna de abajo. Baja controlado.", sets: 3, reps: "12/pierna", techo: 15, rest: 90, unilateral: true, ladoLabel: ["Izquierda", "Derecha"] },
      { name: "Zancada lateral (curtsy lunge)", postura: "De pie, posición inicial normal.", ejecucion: "Paso cruzando una pierna detrás de la otra en diagonal, baja flexionando ambas rodillas, vuelve al centro.", sets: 3, reps: "10/lado", techo: 13, rest: 90, unilateral: true, ladoLabel: ["Izquierda", "Derecha"] },
      { name: "🆕 Extensión de pierna (módulo K6)", postura: "Espalda y cadera pegadas al respaldo, rodillo sobre los tobillos.", ejecucion: "Extiende exhalando, aprieta el cuádriceps 1-2 seg arriba, baja controlado.", sets: 2, reps: "12-15", techo: 18, rest: 75 },
      { name: "🆕 Curl femoral (módulo K6)", postura: "Boca abajo, rodillas en el borde del banco, rodillo bajo los tobillos.", ejecucion: "Cadera pegada al banco todo el movimiento, flexiona llevando el talón al glúteo, baja controlado.", sets: 2, reps: "12-15", techo: 18, rest: 75 },
      { name: "Abdominales (elevación de piernas + giros rusos)", postura: "Elevación: colgado o acostado. Giros: sentado, torso ligeramente reclinado.", ejecucion: "Elevación: sube las piernas controlado sin balancear, baja lento. Giros: gira de lado a lado sin tirones bruscos.", sets: 3, reps: "15", techo: null, rest: 45 },
    ],
    stretch: ["Isquiotibial sentado — 20-30 segundos por lado", "Glúteo cruzado (rodilla al pecho, cruzada) — 20-30 segundos por lado", "Pantorrilla contra la pared — 20-30 segundos por lado"],
  },
};

export const PLAN_2 = {
  id: "plan2",
  nombre: "Plan 2 · Superior / Inferior (4 días)",
  descripcion: "El plan actual — anclado a Miércoles, Viernes, Sábado y Domingo, con Jueves opcional y Lunes/Martes de descanso fijo. Diseñado para tu horario real de trabajo + estudio.",
  days: plan2Days,
  weekdayMap: { 1: "descanso_lunes", 2: "descanso_martes", 3: "sup_a", 4: "opcional_jueves", 5: "inf_a", 6: "sup_b", 0: "inf_b" },
};

export const PLANS = { plan1: PLAN_1, plan2: PLAN_2 };
export const DEFAULT_PLAN_ID = "plan2";

// ============================================================
// TEMAS VISUALES — recreados a partir de la paleta real de Sattva.
// Champán y Dorado Solar se eliminaron por ser redundantes entre sí.
// ============================================================
export const TEMAS = [
  { id: "base", nombre: "Tema Base", color: "#D97757" },
  { id: "japones-shu", nombre: "Japonés · Shu", color: "#B33B2C" },
  { id: "oro-negro", nombre: "Oro sobre negro", color: "#C9A24B" },
  { id: "neumorfismo", nombre: "Neumorfismo soft UI", color: "#C08A63" },
  { id: "dashboard-completo", nombre: "Dashboard completo", color: "#E2623C" },
];
