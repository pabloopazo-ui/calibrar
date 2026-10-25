/* CALIBRAR · Módulo «Profesional independiente», con capa de salud (24-sep-2026).
   Aprobado por Pablo el 24-sep-2026 para usar el método con un cirujano independiente.
   Fuente de verdad del diseño: PRD §2.6 y adenda de la Matriz v1.7.

   REGLA DE ARQUITECTURA — la misma de preguntas_v2.js: acá viven SOLO textos,
   etiquetas visibles y el armado del sistema. Los ids de pregunta, los VALORES de
   las opciones y el ruteo de motor.js NO se tocan: un profesional se rutea por la
   misma Cadena 01–07 y con el mismo contrato del Anexo F.2. Lo que cambia es cómo
   se pregunta, qué se anota y qué se le puede recomendar.

   Para quién: una sola persona decide, capta por recomendación o derivación, cada
   venta es de alto valor y la agenda vive en su WhatsApp o en una asistente.
   Médicos, dentistas, psicólogos, abogados, arquitectos, contadores independientes.
   La capa de salud se enciende cuando atiende pacientes. */

/* ── Vocabulario: la misma pregunta dicha en el idioma del profesional ── */
const PRO_VOCAB = {
  base:  { persona: 'cliente',  personas: 'clientes',  servicio: 'servicio',    consulta: 'primera reunión',
           cierre: 'terminaron contratándolo', cierre_corto: 'Contrataron', practica: 'su oficina' },
  salud: { persona: 'paciente', personas: 'pacientes', servicio: 'tratamiento', consulta: 'primera consulta',
           cierre: 'terminaron atendiéndose con usted', cierre_corto: 'Se atendieron', practica: 'su consulta' }
};

function esProfesional(e) { const x = e || (typeof E !== 'undefined' ? E : {}); return !!(x.modulo && x.modulo.tipo === 'profesional'); }
function conSalud(e) { const x = e || (typeof E !== 'undefined' ? E : {}); return esProfesional(x) && !!x.modulo.salud; }
function proVocab(e) { return conSalud(e) ? PRO_VOCAB.salud : PRO_VOCAB.base; }
/* Rellena {persona}, {servicio}… con el vocabulario de la reunión activa. */
function proTx(s, e) { const v = proVocab(e); return String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m); }

/* ── Las preguntas, en fácil ─────────────────────────────────────────────
   Tres criterios, en este orden: (1) se entiende a la primera, sin jerga;
   (2) pregunta por algo que pasó, no por una opinión; (3) cada una alimenta
   un eslabón concreto de la Cadena. Mismas claves que V2, así guiaV2() las
   toma sin cambiar el render. */
const PRO_GUIA = {
  /* — TRIAGE: rutea el eslabón (mismos ids y valores) — */
  t1: { texto: 'Sus últimos tres {personas} nuevos, ¿cómo llegaron? ¿Quién les habló de usted?',
        decir: 'El último {persona} que no lo conocía de antes, ¿cómo dio con usted?',
        oro: 'Otro profesional que lo deriva (canal que se puede cultivar) · un {persona} que trae a otros · «antes llegaban más»',
        multi: true },
  t2: { texto: 'Si alguien escribe su nombre en Google ahora mismo, ¿qué encuentra? Busquémoslo juntos.',
        decir: 'Antes de pedir hora, la gente lo busca. ¿Qué cree que encuentra de usted?',
        oro: 'Un colega aparece antes que él · una opinión mala · la sorpresa al mirar (la emoción es dato)' },
  t3: { texto: 'En un mes normal, ¿cuántas personas nuevas le escriben o le piden hora por primera vez?',
        decir: 'El mes pasado, sin contar controles ni {personas} de siempre, ¿cuántos mensajes de gente nueva llegaron? A ojo.',
        oro: '«Me escriben harto pero pocos vienen» (adelanta N5) · «ha bajado» (preguntar desde cuándo)',
        nota_op: 'Se cuentan personas nuevas, no controles. No leer los rangos: preguntar abierto y clasificar.' },
  t4: { texto: '¿Paga hoy por aparecer en alguna parte? Instagram, Google, un directorio, lo que sea.',
        decir: '¿Todo lo que le llega, llega solo, o paga por aparecer?',
        oro: '«Me ofrecieron hacerme publicidad» (hay otro proveedor en la mesa) · «puse plata y no pasó nada»',
        multi: true },
  t5: { texto: 'Cuando alguien le dice «quiero hora» o «quiero saber más», ¿a dónde lo manda?',
        decir: 'Yo soy una persona interesada y le escribo. ¿Qué me contesta? ¿Un link, un número, qué?',
        oro: 'Pedirle que lo muestre en su teléfono vale más que la respuesta · «a mi asistente» (el cuello puede estar ahí)',
        multi: true },
  t6: { texto: 'Un domingo en la noche, ¿alguien puede pedir hora o dejarle sus datos sin hablar con nadie?',
        decir: '¿Su {practica} recibe pedidos de hora mientras usted duerme, o todo pasa por una persona despierta?',
        oro: 'Risa o «¡ojalá!» = dolor reconocido · «mis {personas} prefieren hablar» (creencia: explorarla, no corregirla)' },
  t7: { texto: 'Cuando escribe alguien nuevo, ¿cuánto se demora en recibir la primera respuesta?',
        decir: 'Llega un WhatsApp un martes a las 11 de alguien que no lo conoce. ¿Quién lo ve y cuándo contesta?',
        oro: '«Contesto entre {personas}» · «mi asistente lo ve en la tarde» · «a veces se nos pierden» (marca T9 sin preguntarla)' },
  t8: { texto: '¿Dónde queda anotado quién le escribió y qué le preguntó?',
        decir: 'Si mañana quisiera volver a llamar a los que preguntaron el mes pasado y no vinieron, ¿dónde los busca?',
        oro: '«En el teléfono de la asistente» (riesgo de persona única → T12) · «en el WhatsApp, pero se pierde»' },
  t9: { texto: 'De las personas que consultaron y no decidieron, ¿cuántas quedan sin que nadie las vuelva a contactar?',
        decir: 'Alguien pregunta, se va a pensarlo y no vuelve. ¿Qué pasa con esa persona? ¿Alguien la llama?',
        oro: '«No insisto, no me gusta perseguir» (creencia, material para el informe) · un caso que se perdió por no llamar' },
  t10: { texto: '¿Usted o su equipo usan ChatGPT o algo parecido en el trabajo?',
         decir: '¿Ha probado estas herramientas nuevas de inteligencia artificial, aunque sea para escribir un mensaje?',
         oro: 'Curiosidad = puerta de automatización · desconfianza = cuidar el lenguaje · «mi hija lo usa»' },
  t11: { texto: 'A la semana, ¿cuántas horas se van en responder lo mismo, coordinar horas, mandar presupuestos o papeleo?',
         decir: 'De su semana, ¿cuánto es atender y cuánto es trámite? ¿Medio día? ¿Un día entero?',
         oro: 'LA TAREA que nombra primero («explicar el precio», «mandar los exámenes que pedir») = la primera automatización',
         nota_op: 'Suma las horas del profesional y de su asistente. Medio día ≈ 4 h · un día ≈ 8 h.' },
  t12: { texto: 'Si quien le maneja la agenda y los mensajes faltara un mes, ¿la {practica} sigue funcionando igual?',
         decir: '¿Cuántas cosas funcionan solo si usted o su asistente están?',
         oro: '«Todo pasa por mí» dicho con orgullo (honrarlo, no amenazarlo) · vacaciones que nunca toma',
         nota_op: '«Se detiene» → No · «más o menos» → A medias. Anota QUIÉN opera, por rol.' },
  t13: { texto: '¿Tiene claro qué {persona} le conviene atender y a cuál derivar? ¿Su asistente lo sabe igual que usted?',
         decir: 'Si llega alguien que no calza con lo suyo, ¿cómo saben si darle hora o recomendarle a otro?',
         oro: 'La asistente lo contradice en vivo = el criterio no está compartido · «le doy hora a todos» (agenda llena de lo que no conviene)',
         nota_op: 'Es criterio COMERCIAL: a quién priorizar en la agenda y qué ofrecer primero. La indicación clínica o técnica la decide él y no se discute.' },
  t14: { texto: 'Si mañana le escribieran cien personas, ¿a quién le daría hora primero?',
         decir: 'Tiene una sola hora libre y dos personas la quieren. ¿A quién se la da? ¿Qué mira para decidir?',
         oro: 'La regla que suelta sin darse cuenta ES su criterio no escrito — citársela de vuelta tiene efecto de insight',
         nota_op: 'Regla clara → Explicable · «al primero que escribe» → Intuición · «nunca me ha pasado» → No sabría, y anota: puede ser demanda baja (03).' },

  /* — NÚCLEO: habla del negocio, no del canal. Mismos códigos N1–N7 — */
  N1: { texto: 'Sin dar nombres: descríbame al {persona} que más le gusta atender. ¿Cómo es, qué busca?',
        decir: 'Piense en alguien que atendió y dijo «ojalá todos fueran así». Sin nombre, ¿cómo era?',
        oro: 'Edad, motivo, cómo llegó, qué valoró. NUNCA se anota nombre ni dato clínico: basta el tipo' },
  N2: { texto: '¿Qué tienen en común los que sí {cierre}?',
        decir: 'Los que dicen que sí, ¿en qué se parecen?',
        oro: 'Llegaron recomendados · ya venían decididos · los vio una vez antes: es su criterio implícito' },
  N3: { texto: '¿Qué consultas o {personas} le hacen perder tiempo?',
        decir: '¿Qué tipo de mensaje o de consulta preferiría no recibir?',
        oro: '«Los que solo preguntan el precio» · «los que no son candidatos»: la mitad de un criterio de calificación' },
  N4: { texto: 'Cuando alguien decide atenderse con usted, ¿quién más pesa en la decisión y cómo lo paga?',
        decir: '¿Lo decide la persona sola? ¿Y la plata, cómo la resuelve?',
        oro: 'Familia o pareja · previsión, seguro o bono · crédito o cuotas. El financiamiento suele frenar más que el precio' },
  N5: { texto: 'El mes pasado, ¿cuántas personas nuevas le consultaron y cuántas {cierre}?',
        decir: 'De los que preguntaron el mes pasado, ¿cuántos terminaron viniendo? A ojo.',
        oro: 'La línea base. Sin este número no hay contra qué medir nada de lo que venga después' },
  N6: { texto: '¿Cuántos {personas} nuevos más podría atender al mes sin que se resienta la calidad?',
        decir: 'Si mañana le llegara el doble, ¿le cabe en la agenda?',
        oro: 'Si la agenda ya está llena, más demanda no es la solución: el techo es la capacidad (06 o 07)' },
  N7: { texto: 'De cada diez {personas} nuevos, ¿cuántos llegan recomendados por otro {persona} o por otro profesional?',
        decir: 'Si deja de recomendarlo la gente, ¿cuánto de lo nuevo se corta?',
        oro: 'Nueve de diez = la recomendación sostiene todo y nadie la está cuidando: es el activo y es el riesgo' },

  /* — COMPETENCIA — */
  M1: { texto: 'Cuando un {persona} lo compara, ¿con quién lo compara? Nómbreme dos colegas o centros.',
        decir: '¿A quién más va a ver la gente antes de decidirse por usted?',
        oro: 'Nombres públicos, para mirarlos después · «no tengo competencia» (casi nunca es cierto)' },
  M2: { texto: 'La última vez que alguien eligió a otro, ¿qué le dijeron que pesó?',
        decir: '¿Se acuerda de alguien que se fue con otro? ¿Por qué fue?',
        oro: 'Precio, cercanía, rapidez para dar hora o «me lo recomendaron»: la causa de pérdida en palabras del {persona}' },
  M3: { texto: '¿Qué hace usted que otro colega no pueda copiar en seis meses?',
        decir: '¿Por qué lo eligen a usted y no al de al lado?',
        oro: 'Trayectoria, volumen de casos, un cargo o una publicación: la autoridad que su huella pública no muestra' },
  M4: { texto: 'Su valor, ¿está sobre, igual o bajo el de sus colegas? ¿Cómo lo sabe?',
        decir: 'Si alguien le dice «el otro cobra menos», ¿qué le responde?',
        oro: 'De dónde saca la información: «me lo dicen los {personas}» es la peor fuente posible' },
  M5: { texto: '¿Qué está cambiando en su especialidad que va a mover a todos?',
        decir: '¿Qué cambió en los últimos dos años en la forma en que la gente llega a atenderse?',
        oro: 'Tratamientos nuevos, cambios de cobertura, redes sociales: el gatillo que explica una caída sin culpa de nadie' },

  /* — DECISIÓN Y AVANCE — */
  p01: { texto: '¿Esto lo decide usted, o hay alguien más que tiene que estar de acuerdo?',
         decir: 'Si mañana decide ordenar esto, ¿le tiene que preguntar a alguien?',
         oro: 'Socio, sociedad, centro o clínica donde atiende, su pareja: quien tiene que estar en la próxima reunión' },
  p02: { texto: '¿Trabaja solo o en sociedad? ¿Atiende en un centro o en consulta propia?',
         decir: '¿La consulta es suya o es parte de algo más grande?',
         oro: 'Lo que el centro controla (agenda, sitio, publicidad) no se puede cambiar sin él: define el alcance' },
  p03: { texto: '¿Qué tendría que pasar para que algo así avance?',
         decir: 'Si esto le hace sentido, ¿qué necesitaría ver para decir que sí?',
         oro: 'El criterio de compra con sus palabras: se cita en la propuesta' }
};

/* Bloques profundos (Anexo A2): no se reescriben enteros, se corrige lo que con un
   profesional pediría un dato de un paciente o cliente identificado. Lo demás se dice
   de usted y con su vocabulario, y lo recuerda la nota del bloque. */
const PRO_BLOQUE = {
  Q1: 'Sin dar nombres: descríbame a su mejor {persona} de hoy. Uno concreto, pero sin decir quién es.'
};
const PRO_NOTA_BLOQUE = 'Módulo profesional: estas preguntas se dicen de usted y con su vocabulario ({persona}, {servicio}, agenda). Nunca se pide ni se anota el nombre de un {persona}.';

/* Etiquetas visibles de las opciones. Solo cambia lo que se LEE: el valor que rutea
   sigue siendo el mismo, por eso no se cambia ninguna opción de significado. */
const PRO_OPCIONES = {
  t1: { busqueda: 'Lo buscó en internet', licitacion: 'Derivación de otro profesional o convenio' },
  t2: { sitio_resenas: 'Sitio propio + opiniones' },
  t5: { landing: 'Página propia del {servicio}', home: 'Portada del sitio', perfil: 'Instagram u otra red' },
  t6: { si: 'Sí, agenda en línea o formulario' },
  t8: { crm: 'Sistema o agenda con registro', planilla: 'Planilla o cuaderno', correo_wsp: 'Solo en el WhatsApp o el correo' },
  t11: { '0': 'Ninguna' },
  t13: { si_escrito: 'Sí, y el equipo lo aplica igual', no_escrito: 'Lo sé yo, pero no está escrito' },
  t14: { explicable: 'Con una regla clara', intuicion: 'Por intuición' }
};
function etiquetaOpcion(qid, o, e) {
  if (!esProfesional(e)) return o.l;
  const m = PRO_OPCIONES[qid];
  return m && m[o.v] ? proTx(m[o.v], e) : o.l;
}

/* Nombres de campo del núcleo en el mensaje al motor (Anexo F.2, variante del módulo).
   N7 NO es concentración de cartera: es cuánto de lo nuevo llega por recomendación. */
const PRO_CAMPOS_NUCLEO = {
  N1: 'n1_persona_ideal', N2: 'n2_que_tienen_en_comun', N3: 'n3_lo_que_no_conviene',
  N4: 'n4_quien_decide_y_como_paga', N5: 'n5_linea_base_mes', N6: 'n6_capacidad_mensual',
  N7: 'n7_dependencia_recomendacion'
};
/* Etiquetas de los dos campos numéricos del núcleo. */
function proEtiquetasNum(e) {
  const v = proVocab(e);
  return { n5in: 'Personas nuevas que consultaron', n5out: v.cierre_corto,
           n7pct: `% de ${v.personas} nuevos que llega recomendado` };
}

/* ── Capa de salud: los cuatro límites que mandan sobre cualquier recomendación ──
   Cada uno con su fuente. Son los mismos que el Anexo E le impone al motor. */
const CAPA_SALUD = [
  { id: 'publicidad', t: 'No se recomienda publicidad para captar pacientes.',
    ev: 'Código de Ética del Colegio Médico de Chile, arts. 48 a 52. Si el eslabón roto es 03, la demanda se construye con buscadores, contenido educativo y red de derivación.' },
  { id: 'datos', t: 'No se anotan nombres, casos ni datos clínicos de pacientes. Si los dice, se escucha y no se registra.',
    ev: 'Datos sensibles: Ley 19.628 y Ley 21.719. Tampoco se propone usar la base de pacientes para campañas sin consentimiento expreso.' },
  { id: 'testimonios', t: 'Testimonios, fotos o videos de pacientes, solo con autorización escrita y sin prometer resultados clínicos.',
    ev: 'Ley 20.584, art. 5.' },
  { id: 'asistente', t: 'Un asistente automático se presenta como asistente, no se hace pasar por el profesional y deriva a una persona toda pregunta clínica.',
    ev: 'Código de Ética de CONAR (7ª ed.), art. 34.' }
];

/* Avisos para el panel interno, calculados con lo registrado. */
function alertasSalud(e, ruta) {
  if (!conSalud(e)) return [];
  const r = e.triage || {};
  const a = CAPA_SALUD.map(x => ({ t: x.t, ev: x.ev }));
  if (['meta', 'google', 'ambas', 'otra'].includes(r.t4))
    a.unshift({ t: 'Tiene publicidad activa: no opinar sobre ella en la reunión ni recomendar más.',
                ev: 'Revisar después su contenido contra el Código de Ética del Colegio Médico.' });
  if (ruta && ruta.dominante === 3)
    a.unshift({ t: 'El eslabón roto es 03 Demanda: se trabaja con buscadores, contenido educativo y derivación, no con pauta.',
                ev: 'Capa de salud · límite de publicidad.' });
  return a;
}

/* Puerta antes de mandar lo registrado a la API. Con capa de salud, nada sale sin
   que el operador confirme que no hay datos de pacientes en lo registrado. */
function puertaSalud(e) {
  if (!conSalud(e)) return true;
  return confirm('Capa de salud: esto manda lo registrado (incluido lo pegado en el Puente) a la API de Anthropic.\n\n'
    + '¿Confirmas que NO contiene nombres, casos ni datos clínicos de pacientes?');
}

/* ── El sistema personalizado ────────────────────────────────────────────
   Una pieza por eslabón. Cada pieza dice qué es, de qué se compone y con qué
   número se sabe si funciona. El diagnóstico dice DÓNDE se rompe; esto dice QUÉ
   se construye y EN QUÉ ORDEN. Sin precios: el valor lo cotiza Pablo. */
const SISTEMA_PIEZAS = {
  1: { nombre: 'Perfil del {persona} que conviene',
       que_es: 'Saber a quién darle prioridad en la agenda y qué ofrecer primero, escrito y compartido con quien atiende los mensajes.',
       piezas: ['Una página con el {persona} que conviene y el que se deriva', 'Qué {servicio} se ofrece primero según lo que la persona busca', 'Tres preguntas que ordenan la primera conversación'],
       mide: 'De cada diez primeras consultas, cuántas terminan en {servicio}',
       salud: 'El criterio es comercial; la indicación clínica la decide el profesional.' },
  2: { nombre: 'Autoridad visible',
       que_es: 'Que quien lo busca antes de escribir encuentre lo que sus {personas} ya saben de usted.',
       piezas: ['Perfil de Google y directorios con datos correctos y opiniones reales', 'Contenido que responde las preguntas que ya le hacen', 'Trayectoria y credenciales a la vista'],
       mide: 'Cuántas personas nuevas dicen que lo vieron antes de escribir',
       salud: 'Testimonios e imágenes de pacientes solo con autorización escrita (Ley 20.584) y sin promesas de resultado clínico.' },
  3: { nombre: 'Llegada de personas nuevas',
       que_es: 'Que lleguen personas nuevas por más de una vía, sin depender solo de la recomendación.',
       piezas: ['Aparecer en Google para lo que la gente busca', 'Contenido constante en el canal donde está su público', 'Publicidad pagada, recién con el resto del sistema funcionando'],
       piezas_salud: ['Aparecer en Google para lo que la gente busca', 'Contenido educativo constante en el canal donde está su público', 'Una red de derivación cuidada: colegas y profesionales que lo recomiendan'],
       mide: 'Personas nuevas al mes, separadas por vía de llegada',
       salud: 'Sin publicidad para captar pacientes (Código de Ética del Colegio Médico, arts. 48 a 52).' },
  4: { nombre: 'Puerta de entrada',
       que_es: 'Un lugar donde la persona interesada entiende lo que necesita y pide hora sin esperar a nadie.',
       piezas: ['Una página por {servicio} con lo que se pregunta antes de escribir', 'Un solo camino para pedir hora o dejar datos, que funcione a cualquier hora', 'Medición de cuántos llegan y cuántos escriben'],
       mide: 'De quienes visitan, cuántos piden hora o dejan sus datos',
       salud: '' },
  5: { nombre: 'Registro y primera respuesta',
       que_es: 'Que cada persona que escribe quede anotada y reciba respuesta en minutos, aunque usted esté ocupado.',
       piezas: ['Cada consulta queda registrada con su origen y su estado', 'Primera respuesta en minutos, con un asistente que se presenta como asistente', 'Las preguntas delicadas pasan siempre a una persona'],
       mide: 'Minutos hasta la primera respuesta y consultas sin registrar (meta: cero)',
       salud: 'El asistente no se hace pasar por el profesional y deriva toda pregunta clínica (CONAR, art. 34).' },
  6: { nombre: 'Seguimiento de quienes lo están pensando',
       que_es: 'Que nadie que preguntó se pierda por falta de un segundo contacto.',
       piezas: ['Cada persona que consultó y no decidió tiene fecha de próximo contacto', 'Respuestas listas para las diez preguntas de siempre', 'Recordatorios de hora y de control'],
       mide: 'Porcentaje de consultas con seguimiento en la fecha acordada',
       salud: '' },
  7: { nombre: 'Que funcione sin depender de usted',
       que_es: 'Que la agenda y los mensajes sigan funcionando igual aunque falte una persona.',
       piezas: ['Guion y criterios escritos para quien atiende la agenda', 'Una capacitación corta al equipo', 'Revisión mensual de los números con usted'],
       mide: 'Partes del proceso que puede hacer más de una persona',
       salud: '' }
};

/* Arma el sistema en tres fases a partir del ruteo:
   1 Reparar — el eslabón dominante y, si está roto, el secundario.
   2 Ordenar — los demás eslabones rotos de la operación (04 a 07, y 01 si no entró).
   3 Acelerar — reputación y demanda (02 y 03), recién sobre lo reparado.
   Lo sano no se interviene: se cuida. Lo sin datos se declara, no se supone.
   Devuelve null sin dominante: sin diagnóstico no hay sistema. */
function armarSistema(ruta, e) {
  if (!ruta || !ruta.dominante) return null;
  const est = ruta.estados || {};
  const usado = new Set();
  const pieza = n => {
    const p = SISTEMA_PIEZAS[n]; usado.add(n);
    const salud = conSalud(e);
    return { n, nombre: proTx(p.nombre, e), que_es: proTx(p.que_es, e),
             piezas: (salud && p.piezas_salud ? p.piezas_salud : p.piezas).map(x => proTx(x, e)),
             mide: proTx(p.mide, e), cuidado: salud && p.salud ? p.salud : '' };
  };
  const reparar = [pieza(ruta.dominante)];
  if (ruta.secundaria && est[ruta.secundaria] === 'roto' && !usado.has(ruta.secundaria)) reparar.push(pieza(ruta.secundaria));
  const ordenar = [1, 4, 5, 6, 7].filter(n => !usado.has(n) && est[n] === 'roto').map(pieza);
  const acelerar = [2, 3].filter(n => !usado.has(n) && est[n] !== 'sano').map(pieza);
  const fases = [
    { orden: 1, nombre: 'Reparar', por_que: 'Es donde hoy se corta el crecimiento. Traer más personas antes de arreglarlo solo agranda la pérdida.', componentes: reparar },
    { orden: 2, nombre: 'Ordenar', por_que: 'Lo demás que está roto en la operación, para que lo reparado no dependa de una persona.', componentes: ordenar },
    { orden: 3, nombre: 'Acelerar', por_que: 'Con la entrada ordenada, recién ahí conviene que lleguen más personas.', componentes: acelerar }
  ].filter(f => f.componentes.length);
  const sanos = [1, 2, 3, 4, 5, 6, 7].filter(n => est[n] === 'sano');
  const sinDatos = [1, 2, 3, 4, 5, 6, 7].filter(n => !usado.has(n) && est[n] === 'sin_datos');
  return { fases, sanos, sinDatos,
           revision: 'Cada pieza trae su número. A los 90 días se revisa con usted: si el número no se movió, se cambia el enfoque antes de invertir más.' };
}

/* Hipótesis de trabajo en el idioma del profesional (reemplazan a las de empresa
   en resultados.js cuando el módulo está activo). Mismas reglas: solo con lo declarado. */
const PRO_HIPOTESIS = {
  1: { t: 'Llegan personas, pero no hay un criterio compartido para decidir a quién priorizar: la agenda se llena por orden de llegada y no por lo que conviene.',
       ver: 'Escribir en una página qué {persona} conviene y contrastarlo con las últimas diez primeras consultas.',
       si: 'Más consultas no mejoran el resultado: lo diluyen. Primero se define a quién sí.' },
  2: { t: 'Su trabajo es mejor que su huella pública: quien lo busca antes de escribir no encuentra lo que sus {personas} ya saben de usted.',
       ver: 'Comparar lo que aparece al buscarlo contra lo que aparece al buscar a los colegas que usted mismo nombró.',
       si: 'Parte de la decisión ocurre antes de la primera conversación, y hoy esa etapa no juega a su favor.' },
  3: { t: 'Lo nuevo depende casi solo de la recomendación: si esa vía se enfría, no hay otra que la reemplace.',
       ver: 'Anotar durante un mes cuántas personas nuevas llegan y por qué vía llega cada una.',
       si: 'El riesgo no es de hoy: es que la red actual fije el techo de {practica}.' },
  4: { t: 'Quien llega interesado no puede pedir hora ni dejar sus datos sin esperar a una persona: lo que tiene publicado muestra, pero no recibe.',
       ver: 'Recorrer juntos el camino de una persona interesada, desde que lo encuentra hasta que logra pedir hora.',
       si: 'Parte del interés que ya existe se pierde sin dejar rastro.' },
  5: { t: 'Las personas escriben, pero se les responde tarde y sin registro: la pérdida está entre el primer mensaje y la primera respuesta.',
       ver: 'Revisar el último mes: cuántos escribieron, en cuánto tiempo se les respondió y dónde quedó anotado.',
       si: 'Traer más personas agranda la pérdida. Primero se ordena la entrada y después se atrae más.' },
  6: { t: 'La atención es buena pero no da abasto: cada mes quedan personas que preguntaron y nadie volvió a contactar.',
       ver: 'Contar quiénes consultaron el último mes y cuántos recibieron un segundo contacto con fecha.',
       si: 'El límite son las horas disponibles, no la falta de interesados.' },
  7: { t: 'La agenda y los mensajes dependen de una sola persona: si falta, la entrada se detiene.',
       ver: 'Listar qué partes de la atención de consultas puede hacer hoy más de una persona.',
       si: 'Lo que se construya tiene que quedar escrito y traspasado, no solo funcionando.' }
};

/* Lo que ya funciona, dicho para un profesional (y sin recomendar pauta con capa de salud). */
function proNuanceSano(n, e) {
  const m = {
    1: 'Sabe a quién priorizar: en el sistema solo se deja por escrito, no se reinventa.',
    2: 'Quien lo busca lo encuentra y con buena cara. Se potencia en la fase de acelerar.',
    3: conSalud(e) ? 'Llegan personas nuevas sin pagar publicidad. Se cuida la red de recomendación y derivación que lo sostiene.'
                   : 'Llegan personas nuevas sin gastar. La publicidad pagada, si hace falta, entra sobre el sistema ya reparado.',
    4: 'La puerta de entrada funciona: se mide, no se rehace.',
    5: 'Responde rápido: el sistema lo protege y le agrega el registro que falte.',
    6: 'Da abasto hoy. Se ordena cuando exista el registro que lo alimente.',
    7: 'La atención no depende de una sola persona: se documenta para que siga así.'
  };
  return proTx(m[n] || 'está funcionando.', e);
}
