/* CALIBRAR · Instrumento v2 — capa de conducción (19-ago-2026).
   Base de evidencia: ver "01 Producto/Instrumento_v2_Investigacion_2026-08-19.md"
   (SPIN/Rackham, Gong 519k llamadas, Sandler, Voss, Mom Test, HBR, Pew, JTBD...).
   REGLA DE ARQUITECTURA: acá viven SOLO textos de conducción. Los ids, los valores
   de opciones y el ruteo NO se tocan — siguen siendo los del contrato Anexo F.2. */

const V2 = {
  /* — TRIAGE — */
  t1: { texto: 'Acuérdate de los últimos tres clientes nuevos que te llegaron. ¿Por dónde llegó cada uno?',
        decir: 'El último cliente que no te conocía de antes — ¿cómo dio contigo?',
        oro: 'Nombres propios de quién recomienda (canal cultivable) · «antes llegaban más» (estacionalidad)',
        multi: true },
  t2: { texto: 'Hagamos un ejercicio cortito: si googleo el nombre de tu empresa aquí mismo, ¿qué me va a aparecer? (y googlearlo de verdad, juntos)',
        decir: 'Un cliente nuevo que te quiere chequear antes de llamarte, ¿qué encuentra de ti en internet?',
        oro: '«Sale la competencia primero» · una reseña mala · vergüenza o sorpresa al mirar (la emoción es dato)' },
  t3: { texto: 'En un mes normal, ¿cuántas empresas o personas que nunca te habían comprado te piden cotización o te preguntan por lo que haces?',
        decir: 'El mes pasado, sin contar a tus clientes de siempre, ¿cuántos interesados nuevos aparecieron? A ojo no más.',
        oro: 'La distinción espontánea «me preguntan» vs «me compran» (adelanta N5) · «puros curiosos» (adelanta 01 Criterio)',
        nota_op: 'No leer los rangos: preguntar abierto y clasificar. Si duda: ¿una por semana? ¿una al día?' },
  t4: { texto: '¿Estás poniendo plata hoy en publicidad — Facebook/Instagram, Google, radio, lo que sea?',
        decir: '¿Pagas por aparecer en alguna parte, o todo lo que llega, llega solo?',
        oro: '«Le pago a un sobrino» · «puse plata y no pasó nada» (quemado con agencias) · «no creo en eso» (no descalifica: rutea lenguaje)',
        multi: true },
  t5: { texto: 'Cuando alguien te dice «quiero cotizar», ¿a dónde lo mandas? Muéstramelo, como si yo fuera el cliente.',
        decir: 'Yo soy un cliente y te digo «ya, me interesa» — ¿qué me contestas? ¿Me das un link, un número, qué?',
        oro: '«Depende de quién sea» (segmentación implícita → 01) · ver el flujo real en vivo vale más que la respuesta',
        multi: true },
  t6: { texto: 'Si yo te escribiera un domingo a las diez de la noche queriendo cotizar, ¿puedo dejarte mis datos o comprarte algo sin hablar con nadie?',
        decir: '¿Tu negocio vende o capta datos cuando tú estás durmiendo, o todo pasa por ti despierto?',
        oro: 'Risa o «¡ojalá!» = dolor reconocido → bajar por el embudo · «mis clientes no compran así» (creencia a explorar, no corregir)' },
  t7: { texto: 'El último interesado que llegó — ¿cuánto pasó hasta que alguien le contestó?',
        decir: 'Llega un WhatsApp de un cliente nuevo un martes a las 11. ¿Quién lo ve y en cuánto rato le responde?',
        oro: '«Depende de quién esté» · «yo contesto cuando salgo de la faena» (el dueño es el cuello → 07) · «a veces se nos pierden» (marca T9 sin preguntarla)' },
  t8: { texto: 'Ese contacto, ¿dónde quedó anotado? Si mañana quisieras ubicarlo de nuevo, ¿dónde lo buscarías?',
        decir: 'Los datos de la gente que pregunta y no compra al tiro — ¿existen en alguna parte, o viven en el teléfono de alguien?',
        oro: '«Está todo en el celular del Juan» (riesgo de persona única → T12) · cuaderno dicho con culpa o con orgullo (energía de cambio)' },
  t9: { texto: 'De las cotizaciones que mandaste el mes pasado, ¿cuántas quedaron ahí, sin que nadie las volviera a mover — ni un llamado, ni un correo?',
        decir: 'Cuando mandas una cotización y el cliente no contesta, ¿qué pasa? ¿Alguien insiste o se deja morir?',
        oro: '«Una vez perdí una pega grande por no llamar de vuelta» (cita textual al informe) · «insistir es rogar» (creencia, material vendible)' },
  t10: { texto: '¿Alguien en la empresa usa ChatGPT o algo parecido para el trabajo — para cotizaciones, correos, lo que sea?',
        decir: '¿Han probado estas herramientas nuevas de inteligencia artificial, aunque sea de contrabando, alguno de los jóvenes del equipo?',
        oro: 'Curiosidad («¿y eso sirve pa cotizar?») = puerta de automatización · miedo («va a echar gente») = cuidar lenguaje · «mi hijo lo usa» = champion doméstico' },
  t11: { texto: 'Piensa en tu semana pasada. ¿Cuántas horas se te fueron en papeleo y cosas repetidas — pasar datos de un lado a otro, armar cotizaciones a mano, responder siempre lo mismo?',
        decir: 'De tu semana, ¿cuánto es vender o producir, y cuánto es trámite? ¿Medio día a la semana? ¿Un día entero? ¿Más?',
        oro: 'LA TAREA CONCRETA que nombra primero («las boletas», «responder el precio del flete») = la demo de automatización · suspiros («ni me digai») = dolor personal',
        nota_op: 'Anclas: medio día ≈ 4 h · un día ≈ 8 h. No leer rangos.' },
  t12: { texto: '¿Quién ve hoy la parte de marketing, la página, los sistemas — alguien del equipo, alguien de afuera, o tú mismo? → Si es un tercero: ¿y si mañana no está, el resto puede seguir? → Si es él: ¿y si tú te enfermaras dos semanas, esa parte sigue andando o se detiene contigo?',
        decir: '¿Cuántas cosas de la empresa funcionan solo si tú estás? Sé honesto.',
        oro: '«Yo hago todo aquí» con orgullo (el discurso debe honrarlo, no amenazarlo) · vacaciones nunca tomadas (dolor personal)',
        nota_op: '«Se detiene conmigo» → No · «mi señora sabría más o menos» → A medias. Anota QUIÉN opera (dueño/equipo/externo).' },
  t13: { texto: '¿Tienen definido qué tipo de cliente les conviene y cuál no? → ¿Está anotado en alguna parte? → Si le pregunto a tu socio o a tu vendedor, ¿me dice lo mismo que tú?',
        decir: 'Si llega una pega rara, medio fuera de lo tuyo, ¿cómo saben si tomarla o dejarla pasar?',
        oro: 'Desacuerdo en vivo si hay socio presente = el criterio NO está alineado (dato de primera) · «aquí se toma todo lo que llegue» (hambre operativa → N6/07)',
        nota_op: '«Sí, por escrito» exige las DOS repreguntas positivas.' },
  t14: { texto: 'La última vez que tuviste varias cotizaciones al mismo tiempo y no te daba el cuerpo para todas, ¿cómo elegiste cuál atender primero?',
        decir: 'Llegan dos pedidos el mismo día y solo puedes hacer bien uno. ¿Cuál tomas? ¿Qué miras para decidir?',
        oro: 'La regla implícita que suelta sin darse cuenta («siempre atiendo primero a los de la minera») ES su criterio no escrito — citárselo de vuelta tiene efecto de insight',
        nota_op: 'Regla clara (margen/cliente/plazo) → Explicable · «olfato», «el que grita más» → Intuición · «nunca me ha pasado» → No sabría + nota: puede ser señal de demanda baja (03), no de falta de criterio.' },

  /* — NÚCLEO — */
  N1: { texto: 'Cuéntame de tu mejor cliente hoy día. Uno con nombre.',
        decir: 'Si pudieras clonar a un cliente, ¿a cuál?',
        oro: 'Si duda mucho, no tiene claridad de cliente ideal (→ 01). Si nombra dos o tres: ¿cuál va primero?' },
  N2: { texto: '¿Y por qué ese y no otro?',
        decir: '¿Qué tiene ese que te gustaría que tuvieran todos?',
        oro: 'Los atributos que nombra (paga al día / no molesta / pide harto) son las columnas del criterio de cliente ideal. Anotar textual.' },
  N3: { texto: '¿Y al revés — hay clientes que preferirías no tener?',
        decir: '¿Alguno que cuando te llama te dan ganas de no contestar?',
        oro: '«No, todos son buenos» → probable falta de criterio o miedo a perder volumen · descripción con lujo de detalle → hay criterio implícito Y dolor: bajar por el embudo («¿cuánto te cuesta ese cliente en tiempo y rabia?»)' },
  N4: { texto: 'En tus clientes, ¿quién firma la compra al final? → (pausa) → ¿Y quién parte moviendo el tema adentro, antes de que llegue al que firma?',
        decir: 'Cuando [su mejor cliente de N1] te compró, ¿quién puso la firma? ¿Y a quién tuviste que convencer primero?',
        oro: 'Confusión = nunca ha mapeado su cadena de decisión · además calibra Lista A vs Lista B' },
  N5: { texto: 'El último trimestre, ¿cuántos interesados entraron y cuántos terminaron comprando?',
        decir: 'ESCALERA si duda: (1) el puro mes pasado → (2) ¿cotizaciones enviadas vs cerradas? → (3) de las últimas 10 que te acuerdes, ¿cuántas se ganaron? → (4) «casi ningún dueño lo tiene al dedillo — a ojo: ¿de cada diez cierran dos, cinco…?» → (5) registrar N/D COMO HALLAZGO: «que no exista ese número ya me dice algo que te va a servir».',
        oro: 'EL ESCALÓN donde contesta es dato (más abajo = más rota la medición) · la palabra que usa para «interesado» (hablar su idioma en el informe)' },
  N6: { texto: '¿Cuántos clientes nuevos por semana pueden atender bien, sin que se te arranque la calidad? → ¿Y qué pasó la última vez que anduvieron con más pega de la que podían?',
        decir: 'Si el próximo mes te llegara el doble de pedidos, ¿problema lindo o problema feo?',
        oro: '«No me han probado» (capacidad ociosa) · historia de colapso pasado (07 con evidencia) · «tendría que contratar y no encuentro gente» (restricción real)' },
  N7: { texto: 'De tu venta del año pasado, ¿cuánto dependía de tu cliente más grande — la mitad, un cuarto, menos?',
        decir: 'Si mañana tu cliente más grande se va, ¿duele o desangra?',
        oro: 'Risa nerviosa ante «si se va» = la concentración es el dolor #1 aunque el triage rutee otro eslabón · «con ellos tengo contrato» → ¿hasta cuándo?' },

  /* — COMPETENCIA — */
  M1: { texto: 'Cuando un cliente está decidiendo, ¿con quién más cotiza? Nómbrame dos.',
        decir: 'La última pega que se te escapó, ¿quién se la llevó?',
        oro: '«No tengo competencia» → repreguntar «¿y el cliente con quién más cotizó?» · un gigante + un maestro chasquilla = posicionamiento indefinido' },
  M2: { texto: 'La última vez que perdiste un negocio que querías, ¿qué te dijeron que pesó?',
        decir: '¿Fue precio, plazo, o pituto? (las tres categorías destraban; anotar cuál elige Y lo que agrega)',
        oro: '«Nunca me dicen por qué» = no hay práctica de post-mortem · si siempre es «precio», explorar si es verdad o la excusa cómoda' },
  M3: { texto: 'Los clientes que te eligen a ti pudiendo elegir a esos dos, ¿qué te dicen? ¿Qué es lo que la competencia no te puede copiar de aquí a seis meses?',
        decir: '¿Te ha llegado algún cliente arrancando de la competencia? ¿Qué te contó?',
        oro: '«El trato», «llegamos cuando decimos» = diferenciadores reales NO comunicados (02 tiene material) · no saber qué dicen sus clientes = hueco de reputación medible' },
  M4: { texto: 'Tu precio, ¿va por sobre, igual o por debajo de lo que cobra el resto? → ¿Y cómo lo sabes? ¿Te lo han dicho, has visto cotizaciones de ellos?',
        decir: 'Cuando pierdes por precio, ¿por cuánto pierdes? ¿Y cuando ganas cobrando más caro, qué pesó?',
        oro: '«Cobro lo justo» sin evidencia = percepción, no dato (registrar como tal) · acceso a cotizaciones de competidores = inteligencia que ya tiene sin explotar' },
  M5: { texto: 'En los últimos dos años, ¿qué cambió en tu rubro? ¿Qué están haciendo hoy los clientes o la competencia que antes no hacían?',
        decir: 'VERSIÓN CON DATO-ANZUELO si queda en blanco: «Te cuento lo que estamos viendo en empresas como la tuya: [insight del rubro precargado en la ficha]. ¿Lo has notado? ¿Qué más está cambiando?»',
        oro: 'Cambios mencionados con rabia o miedo = urgencia real · «esto ha sido igual toda la vida» = status quo fuerte, la venta será más larga' },

  /* — CIERRE DE REUNIÓN (las ex preguntas 0, reformuladas y movidas al final) — */
  p01: { texto: 'Cuando han contratado algo parecido antes — un servicio externo, un sistema — ¿cómo se tomó esa decisión? ¿Quiénes participaron?',
        decir: 'Si esto te hace sentido, ¿qué pasa después puertas adentro? ¿Lo decides tú no más o lo conversas con alguien?',
        oro: '«Lo converso con mi señora / mi socio / el contador» = el comité real de la PYME · en Lista B: nombres y cargos' },
  p02: { texto: '¿Cómo está armada la empresa — tienes socios, es familiar? → ¿Y las decisiones de plata grande, cómo se resuelven entre ustedes?',
        decir: 'La última inversión grande que hicieron — ¿cómo se decidió esa?',
        oro: 'Tensiones societarias al pasar («mi socio es más conservador») → definen el tono del informe y quién debe estar en la entrega' },
  p03: { texto: 'Ponte que el diagnóstico te haga sentido cuando te lo traiga. ¿Qué tendría que pasar — de plata, de tiempo, de confianza — para que esto avance de verdad? → Y cerrar con fecha: «Te traigo el informe el [día]. ¿Quién más debería estar cuando lo veamos?»',
        decir: '¿Qué ha frenado antes decisiones como esta en la empresa?',
        oro: 'Objeciones anticipadas gratis («si no es muy caro…») · a quién invita a la entrega: si invita al socio hay avance real; «mándamelo por correo» = solo continuación (anotar temperatura)' }
};

/* Preguntas nuevas X — gatillo, implicación y red final */
const GATILLO = [
  { id: 'x1', cod: 'X1', texto: '¿Qué pasó para que nos recibieras justo ahora? ¿Hubo algo que te hizo decir «ya, veamos esto»?',
    porque: 'JTBD: toda reunión aceptada tiene un gatillo. Revela el eslabón que YA duele y la urgencia real — suele rutear mejor que cualquier T.' },
  { id: 'x2', cod: 'X2', texto: '(cuando aparezca el dolor dominante) ¿Y qué han intentado ya para arreglar eso? ¿Qué pasó?',
    porque: 'Sandler/Mom Test: evita proponer lo ya fallado, detecta al quemado con agencias y revela presupuesto histórico sin preguntar por plata.' },
  { id: 'x3', cod: 'X3', texto: '(tras confirmar el dolor) Eso que me cuentas, a ojo, ¿cuánta plata te está costando al mes — entre pegas perdidas, tiempo, lo que sea?',
    porque: 'SPIN implicación — la pregunta que los mejores hacen 4× más. Sin ella el informe diagnostica pero no urge.' }
];
const CIERRE_X = [
  { id: 'x4', cod: 'X4', texto: 'Ponte en un año más. ¿Qué número o qué situación tendría que verse distinta para que digas «esto valió la pena»?',
    porque: 'El cliente verbaliza el beneficio (SPIN need-payoff) y te entrega el criterio de éxito con sus palabras para la propuesta.' },
  { id: 'x5', cod: 'X5', texto: 'Última: ¿qué no te pregunté que debería haberte preguntado?',
    porque: 'La red final del oro espontáneo. 15 segundos; las mejores respuestas llegan al final, con la confianza en su punto más alto.' }
];

/* Protocolo del oro espontáneo — la regla operativa de la fricción (g) */
const PROTOCOLO_ORO = [
  'Cuando el dueño suelta un dolor, cifra o historia fuera de guion, EL GUION SE PAUSA.',
  '1 · Espejo: repite sus últimas 2-3 palabras en tono de pregunta («…¿se pierden?»).',
  '2 · Etiqueta: «suena a que eso te tiene chato».',
  '3 · Embudo: dame un ejemplo → ¿hace cuánto? → ¿qué han intentado? → ¿funcionó? → ¿cuánto te ha costado? → ¿cómo te tiene eso?',
  'La cita textual se anota ENTRE COMILLAS: es material del informe.',
  'Nunca cortar una historia para «volver a la pregunta 8».',
  'Meta Gong: máximo 14–16 preguntas dichas en voz alta; la grilla se llena escuchando. Una narración de proceso («llega la cotización, ¿y después qué pasa?») responde T7+T8+T9 de una vez.'
];
