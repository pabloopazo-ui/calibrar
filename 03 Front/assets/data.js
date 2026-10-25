/* CALIBRAR · Front de demostración
   data.js — Contratos de datos. Todo lo de este archivo sale del PRD v5.4
   (Calibrar/01 Producto/Calibrar_PRD_v3_jul2026.md). No inventar valores acá:
   los literales de opción son el contrato del Anexo F.2.                        */

/* ── La Cadena de Crecimiento Comercial (PRD §5.0) ─────────────────────────
   Numeración PÚBLICA 01–07. La taquigrafía interna E1–E7 no se muestra nunca
   en pantalla: es equivalente 1:1 y vive solo en el PRD, la Matriz y el QA.   */
const CADENA = [
  { n: 1, nombre: 'Criterio y foco comercial',   area: 'Estrategia y diagnóstico',   dueno: 'Nos llegan contactos pero no cierran' },
  { n: 2, nombre: 'Reputación y posicionamiento', area: 'Contenido y RRPP',          dueno: 'No me conocen, o me conocen mal' },
  { n: 3, nombre: 'Generación de demanda',        area: 'Paid Media y SEO',          dueno: 'No llega suficiente gente interesada' },
  { n: 4, nombre: 'Activo de conversión',         area: 'Desarrollo web',            dueno: 'Llegan, pero mi sitio no sostiene lo que prometo' },
  { n: 5, nombre: 'Captura y respuesta',          area: 'Automatización y agentes',  dueno: 'Llegan y se pierden antes de que alguien conteste' },
  { n: 6, nombre: 'Escala de la conversación',    area: 'RPA y procesos',            dueno: 'Atiendo bien pero no doy abasto' },
  { n: 7, nombre: 'Capacidad del equipo',         area: 'Capacitación y adopción',   dueno: 'Depende todo de mí o de un externo' }
];

/* ── Triage: las 14 preguntas que rutean el área (PRD §5.1.1) ───────────────
   Se preguntan siempre y primero. Entrada por selección, nunca por redacción
   (§5.7.7 — "operación con una mano": Pablo está conversando, no tecleando). */
const TRIAGE = [
  { id: 't1', cod: 'T1', eslabon: 2, texto: 'Cuando te llega un cliente nuevo, ¿cómo supo de ti?',
    porque: 'Ubica por dónde entra hoy el flujo. Sin eso no se puede aplicar la regla del balde.',
    opciones: [
      { v: 'recomendacion', l: 'Recomendación' }, { v: 'busqueda', l: 'Búsqueda' },
      { v: 'publicidad', l: 'Publicidad' }, { v: 'licitacion', l: 'Licitación' }, { v: 'no_se', l: 'No sé' }] },

  { id: 't2', cod: 'T2', eslabon: 2, texto: 'Si alguien te busca por el nombre de tu empresa, ¿qué encuentra?',
    porque: 'Define si la reputación sostiene la venta o la frena.',
    opciones: [
      { v: 'sitio_resenas', l: 'Sitio + reseñas' }, { v: 'solo_redes', l: 'Solo redes' },
      { v: 'casi_nada', l: 'Casi nada' }, { v: 'no_se', l: 'No sé' }] },

  { id: 't3', cod: 'T3', eslabon: 3, texto: '¿Cuántas oportunidades nuevas de venta te llegan al mes?',
    porque: 'Es la pregunta que dice si hay flujo. Sin flujo, el eslabón roto es demanda; con flujo, hay que mirar río abajo.',
    opciones: [
      { v: '0', l: 'Ninguna', num: 0 }, { v: '1_5', l: '1 a 5', num: 3 }, { v: '6_20', l: '6 a 20', num: 13 },
      { v: '21_50', l: '21 a 50', num: 35 }, { v: 'mas_50', l: 'Más de 50', num: 80 }, { v: 'no_se', l: 'No sé' }] },

  { id: 't13', cod: 'T13', eslabon: 1, texto: '¿Tienen escrito, y de acuerdo con el equipo comercial, qué empresa es un buen cliente para ustedes?',
    porque: 'Con flujo llegando y sin criterio escrito, el eslabón dominante es 01 y todo lo demás es secundario.',
    gatillo: 'flujo',
    opciones: [
      { v: 'si_escrito', l: 'Sí, por escrito' }, { v: 'no_escrito', l: 'Lo sabemos, pero no está escrito' }, { v: 'no', l: 'No' }] },

  { id: 't14', cod: 'T14', eslabon: 1, texto: 'Si mañana te llegaran cien contactos, ¿cómo decidirías cuáles vale la pena trabajar?',
    porque: 'La más reveladora de las catorce: no pregunta si hay criterio, pide demostrarlo en el momento.',
    gatillo: 'flujo',
    opciones: [
      { v: 'explicable', l: 'Criterio explicable' }, { v: 'intuicion', l: 'Por intuición' }, { v: 'no_sabria', l: 'No sabría' }] },

  { id: 't4', cod: 'T4', eslabon: 3, texto: '¿Inviertes hoy en publicidad pagada?',
    porque: 'Dato de ruteo, no de descarte: que no pause no descalifica a nadie.',
    opciones: [
      { v: 'meta', l: 'Meta' }, { v: 'google', l: 'Google' }, { v: 'ambas', l: 'Ambas' },
      { v: 'otra', l: 'Otra' }, { v: 'no', l: 'No' }] },

  { id: 't5', cod: 'T5', eslabon: 4, texto: '¿A dónde mandas a alguien que quiere comprarte?',
    porque: 'Si el destino no sostiene la promesa, optimizar la campaña es llenar un balde con agujeros.',
    opciones: [
      { v: 'landing', l: 'Landing dedicada' }, { v: 'home', l: 'Home' }, { v: 'whatsapp', l: 'WhatsApp' },
      { v: 'perfil', l: 'Perfil de redes' }, { v: 'no_tengo', l: 'No tengo' }] },

  { id: 't6', cod: 'T6', eslabon: 4, texto: '¿Puede alguien dejarte sus datos o comprarte sin hablar contigo antes?',
    porque: 'Determina si el activo captura solo o depende de una persona disponible.',
    opciones: [
      { v: 'si', l: 'Sí, formulario o carro' }, { v: 'solo_wsp', l: 'Solo WhatsApp' }, { v: 'no', l: 'No' }] },

  { id: 't7', cod: 'T7', eslabon: 5, texto: 'Cuando llega un interesado, ¿en cuánto se le responde?',
    porque: 'Con T8, es el detector de automatización. Responder en 5 min califica 21× más que a los 30 (MIT/InsideSales).',
    opciones: [
      { v: 'menos_5min', l: 'Menos de 5 min' }, { v: 'menos_1h', l: 'Menos de 1 hora' }, { v: 'mismo_dia', l: 'Mismo día' },
      { v: 'mas_1dia', l: 'Más de un día' }, { v: 'no_se', l: 'No sé' }] },

  { id: 't8', cod: 'T8', eslabon: 5, texto: '¿Dónde queda registrado ese contacto?',
    porque: 'Con T7, es el detector de automatización. "No queda en ninguna parte" + flujo = 05 dominante.',
    opciones: [
      { v: 'crm', l: 'CRM' }, { v: 'planilla', l: 'Planilla' }, { v: 'correo_wsp', l: 'Correo o WhatsApp' },
      { v: 'no_queda', l: 'No queda en ninguna parte' }] },

  { id: 't9', cod: 'T9', eslabon: 6, texto: '¿Cuántas conversaciones de venta al mes se quedan sin seguimiento?',
    porque: 'Separa "no doy abasto" de "no me llegan": el mismo síntoma con causas opuestas.',
    opciones: [
      { v: 'ninguna', l: 'Ninguna' }, { v: 'algunas', l: 'Algunas' }, { v: 'muchas', l: 'Muchas' }, { v: 'no_se', l: 'No sé' }] },

  { id: 't10', cod: 'T10', eslabon: 6, texto: '¿Usan hoy alguna herramienta de IA en el negocio?',
    porque: 'Mide punto de partida de adopción. No rutea solo.',
    opciones: [
      { v: 'si_formal', l: 'Sí, formalmente' }, { v: 'por_su_cuenta', l: 'Alguien la usa por su cuenta' },
      { v: 'no', l: 'No' }, { v: 'no_se_que_seria', l: 'No sé qué sería' }] },

  { id: 't11', cod: 'T11', eslabon: 6, texto: '¿Cuántas horas a la semana se van en tareas repetitivas que no son vender ni producir?',
    porque: 'La pregunta del dinero: horas × costo hora × 4,3 es la única cifra comparable contra el precio de una automatización.',
    opciones: [
      { v: '0', l: 'Ninguna', num: 0 }, { v: '1_5', l: '1 a 5', num: 3 }, { v: '6_10', l: '6 a 10', num: 8 },
      { v: '11_20', l: '11 a 20', num: 15 }, { v: 'mas_20', l: 'Más de 20', num: 25 }, { v: 'no_se', l: 'No sé' }] },

  { id: 't12', cod: 'T12', eslabon: 7, texto: 'Si mañana se va la persona que hoy maneja el marketing o los sistemas, ¿el resto puede seguir?',
    porque: 'Nunca rutea sola: determina si lo que se recomiende necesita capacitación o soporte encima.',
    opciones: [
      { v: 'si', l: 'Sí' }, { v: 'a_medias', l: 'A medias' }, { v: 'no', l: 'No' }] }
];

/* Orden en que el copiloto propone la siguiente pregunta: la que más reduce
   incertidumbre primero (PRD §5.7.3 — "el orden minimiza el tiempo hasta el no"). */
const ORDEN_SIGUIENTE = ['t3', 't7', 't8', 't13', 't14', 't5', 't6', 't11', 't9', 't4', 't12', 't2', 't1', 't10'];

/* ── Bloques profundos por área (PRD Anexo A2) ─────────────────────────────
   Nunca se aplican todos. El triage fija el eslabón dominante y SOLO se abre el
   bloque de esa área — el contrato del Anexo F.2 dice "NUNCA más de uno".
   Inventario total 103 preguntas; máximo real en una reunión, 42.
   `clave: true` marca las que más rinden en conversación, según el propio anexo. */
const BLOQUES_AREA = {

  1: { prefijo: 'Q', total: 17, nota: 'Es el único bloque que NO se puede aplicar como lista: es una secuencia de conversación y el orden importa, porque cada pregunta hace posible la siguiente. Regla de conducción: nunca preguntar "¿cuál es tu cliente ideal?" — esa pregunta produce una respuesta genérica y ensayada.',
    grupos: [
      { nombre: 'Secuencia 1 · El criterio que ya existe sin saberlo', preguntas: [
        { cod: 'Q1', texto: 'Nómbrame tu mejor cliente hoy. Uno concreto.', revela: 'Obliga a lo específico. La abstracción es donde se esconde la falta de criterio' },
        { cod: 'Q2', texto: '¿Por qué ese y no otro? ¿Qué lo hace bueno?', revela: 'El criterio implícito, en sus palabras. Acá aparece si es margen, volumen, recurrencia o comodidad', clave: true },
        { cod: 'Q3', texto: 'Si tuvieras diez como ese, ¿el negocio estaría resuelto?', revela: 'Valida que el criterio sea el correcto. Un "no" acá significa que su mejor cliente no es su cliente objetivo' },
        { cod: 'Q4', texto: '¿En qué se parecen los que te compran? Rubro, tamaño, zona, quién decide.', revela: 'El patrón. Si no puede responderla, está confirmado el eslabón 01' }] },
      { nombre: 'Secuencia 2 · El criterio negativo', preguntas: [
        { cod: 'Q5', texto: '¿Hay clientes que preferirías no tener? ¿Por qué?', revela: 'Más revelador que el criterio positivo: la gente sabe con precisión qué le molesta y solo aproximadamente qué le sirve', clave: true },
        { cod: 'Q6', texto: '¿Alguna vez tomaste un cliente del que te arrepentiste? ¿Qué señal había antes de firmar?', revela: 'Convierte una anécdota en criterio de descarte, que es la mitad de un criterio de calificación' }] },
      { nombre: 'Secuencia 3 · La puerta de entrada', preguntas: [
        { cod: 'Q7', texto: 'En tu cliente, ¿quién decide la compra? ¿Y quién la inicia?', revela: 'Rara vez son la misma persona. Entrar por quien firma en vez de por quien especifica es un error clásico y caro' },
        { cod: 'Q8', texto: '¿Contra quién compites y por qué te eligen a ti?', revela: 'Marco competitivo real y ventaja declarada' },
        { cod: 'Q9', texto: '¿Alguna vez ganaste por precio? ¿Te gustó ganar así?', revela: 'Detecta si está compitiendo en el terreno equivocado' }] },
      { nombre: 'Secuencia 4 · El activo que nadie leyó', preguntas: [
        { cod: 'Q10', texto: '¿Cuántos clientes tienes hoy, y desde cuándo?', revela: 'Tamaño de la base instalada' },
        { cod: 'Q11', texto: '¿Alguien ha mirado esa lista para buscar empresas parecidas?', revela: 'Casi siempre no. Es la fuente de criterio más barata y más predictiva que existe, y está sin usar. Suele ser el momento en que el prospecto se queda callado', clave: true }] },
      { nombre: 'Secuencia 5 · El intento anterior', preguntas: [
        { cod: 'Q12', texto: '¿Qué pasó la última vez que intentaron conseguir clientes nuevos de forma sistemática?', revela: 'Historial y costo hundido' },
        { cod: 'Q13', texto: '¿Cuántos contactos entraron y cuántos cerraron?', revela: 'La línea base. Sin este número no hay contra qué medir nada', clave: true },
        { cod: 'Q14', texto: '¿Qué crees tú que falló?', revela: 'Su hipótesis. Suele ser correcta en el síntoma y equivocada en la causa' }] },
      { nombre: 'Secuencia 6 · La restricción real', preguntas: [
        { cod: 'Q15', texto: '¿Cuántas personas pueden atender un cliente nuevo por semana?', revela: 'La restricción que define todo el diseño. Si entregas más de lo que puede atender, reproduces el fracaso', clave: true }] },
      { nombre: 'Secuencia 7 · El gatillo y el corte', preguntas: [
        { cod: 'Q16', texto: '¿Hay alguna norma nueva, licitación o cambio del sector que te esté obligando a moverte?', revela: 'El gatillo externo. La que más valor genera y la que menos se hace — conviene investigarla ANTES de la reunión, no preguntarla en frío', clave: true },
        { cod: 'Q17', texto: '¿Qué tendría que pasar en noventa días para que digas que esto valió la pena?', revela: 'El criterio de corte, dicho por él. Protege las dos partes: a él le da un seguro, a Precisión un criterio para no sostener un proyecto que no funciona', clave: true }] }
    ] },

  2: { prefijo: 'R', total: 8, nota: 'El eslabón 02 es dominante solo en dos casos: cuando hay un evento reputacional activo, o en B2B de ticket alto con ciclo largo donde el prospecto simplemente no existe para su mercado. Fuera de eso, la reputación se trabaja en paralelo, no antes.',
    grupos: [{ nombre: 'Reputación y posicionamiento → Contenido y RRPP', preguntas: [
      { cod: 'R1', texto: 'Cuando alguien te recomienda, ¿qué dice de ti?', revela: 'Posicionamiento espontáneo' },
      { cod: 'R2', texto: '¿Tienes reseñas? ¿Las responden?', revela: 'Prueba social activa o abandonada' },
      { cod: 'R3', texto: '¿Ha pasado algo público que te haya afectado?', revela: 'Detecta evento reputacional — uno de los dos casos en que 02 es dominante', clave: true },
      { cod: 'R4', texto: '¿Apareces en medios, gremios o rankings de tu rubro?', revela: 'Autoridad sectorial' },
      { cod: 'R5', texto: '¿Cuánto demora alguien en decidir contratarte?', revela: 'Ciclo largo = la confianza precede a la conversación' },
      { cod: 'R6', texto: '¿Con quién te compara el cliente antes de decidir?', revela: 'Marco competitivo real' },
      { cod: 'R7', texto: '¿Qué te gustaría que dijeran de ti que hoy no dicen?', revela: 'La brecha de posicionamiento, en sus palabras' },
      { cod: 'R8', texto: '¿Tienes casos documentados que puedas mostrar?', revela: 'Insumo de RRPP y del eslabón 04 (W6) a la vez' }] }] },

  3: { prefijo: 'P', total: 28, nota: 'Las 28 preguntas del Anexo A NO son "el formulario": son el bloque profundo del eslabón 03 y de nada más. Todas miran la cuenta publicitaria, así que no pueden rutear el área — con ellas es imposible saber si alguien necesita automatización, porque ninguna pregunta por procesos. Es el bloque más largo: 14 + 28 = 42, el máximo real de una reunión.',
    grupos: [
      { nombre: 'Tu empresa', preguntas: [
        { cod: 'P1', texto: '¿A qué se dedica tu empresa?', revela: 'B2B / B2C / Ecommerce / Ambos' },
        { cod: 'P2', texto: '¿Cuál es el rubro específico?', revela: 'Texto abierto — requiere interpretación cualitativa' },
        { cod: 'P3', texto: '¿Cuánto tiempo lleva operando?', revela: 'Antigüedad' },
        { cod: 'P4', texto: '¿Cuántas personas trabajan?', revela: 'Tamaño de equipo' },
        { n30: true, cod: 'P5', texto: '¿Cuál es el ticket promedio?', revela: 'Ticket — Capa 1, se pregunta primero para descalificar temprano', clave: true },
        { cod: 'P6', texto: '¿Quién cierra las ventas?', revela: 'Estructura de cierre' }] },
      { nombre: 'Tu pauta actual', preguntas: [
        { n30: true, cod: 'P7', texto: '¿En qué plataformas tienes pauta activa?', revela: 'Canales' },
        { cod: 'P8', texto: '¿Cuánto llevas invirtiendo de forma continua?', revela: 'Antigüedad de la inversión' },
        { n30: true, cod: 'P9', texto: '¿Cuánto inviertes mensualmente?', revela: 'Presupuesto — Capa 1', clave: true },
        { n30: true, cod: 'P10', texto: '¿Cuáles son los objetivos configurados?', revela: 'Objetivo de campaña. "Tráfico" o "No sé" es bandera roja' },
        { n30: true, cod: 'P11', texto: '¿A dónde mandan el tráfico tus anuncios?', revela: 'Destino. "Perfil de Instagram" para generar leads es bandera roja' },
        { cod: 'P12', texto: 'URL de la landing o sitio', revela: 'Condicional — es la fuente del fetch de landing_html' },
        { cod: 'P13', texto: '¿A qué zona geográfica?', revela: 'Geografía' },
        { cod: 'P14', texto: '¿Qué ciudad o región específica?', revela: 'Condicional' },
        { cod: 'P15', texto: 'Pega el copy de tu anuncio principal', revela: 'Texto abierto' }] },
      { nombre: 'Configuración técnica', preguntas: [
        { n30: true, cod: 'P16', texto: '¿Tienes Pixel de Meta instalado?', revela: 'Estado del Pixel. Contradice con P19 si no hay eventos' },
        { cod: 'P17', texto: 'ID del Pixel', revela: 'Condicional' },
        { n30: true, cod: 'P18', texto: '¿Tienes API de Conversiones (CAPI)?', revela: 'Medición server-side. Sin CAPI en 2026 el sub-reporte es de 15 a 30%' },
        { n30: true, cod: 'P19', texto: '¿Tienes eventos de conversión configurados?', revela: 'Eventos' },
        { cod: 'P20', texto: '¿Usas UTMs en los links?', revela: 'Atribución' },
        { cod: 'P21', texto: '¿Qué herramienta de analítica tienes instalada?', revela: 'Analítica' }] },
      { nombre: 'Tu cliente ideal', preguntas: [
        { cod: 'P22', texto: '¿A quién le quieres vender exactamente?', revela: 'Perfil declarado' },
        { cod: 'P23', texto: 'Describe a tu cliente ideal en una línea', revela: 'Texto abierto' },
        { cod: 'P24', texto: '¿Rango de edad del cliente ideal?', revela: 'Edad del perfil objetivo' }] },
      { nombre: 'Resultados actuales', preguntas: [
        { n30: true, cod: 'P25', texto: '¿Qué está pasando hoy con tus resultados?', revela: 'Síntoma reportado' },
        { cod: 'P26', texto: '¿Sabes cuánto te cuesta un lead?', revela: '¿Mide CPL? Contradice con P27' },
        { cod: 'P27', texto: '¿Cuánto, en CLP?', revela: 'Condicional' }] },
      { nombre: 'Lo más importante', preguntas: [
        { n30: true, cod: 'P28', texto: '¿Qué has intentado que no funcionó?', revela: 'La pregunta más importante del formulario: intentos previos y frustraciones', clave: true }] }
    ] },

  4: { prefijo: 'W', total: 10, nota: 'Frontera con el eslabón 05: W10 es la pregunta que decide si el problema es del activo o de lo que pasa después de él.',
    grupos: [{ nombre: 'Activo de conversión → Desarrollo web', preguntas: [
      { cod: 'W1', texto: '¿Quién hizo tu sitio y hace cuánto?', revela: 'Antigüedad y dependencia' },
      { cod: 'W2', texto: '¿Quién puede modificarlo hoy sin pedirle permiso a nadie?', revela: 'Autonomía — cruza con el eslabón 07' },
      { cod: 'W3', texto: '¿Cuánto demora en cargar en el teléfono?', revela: 'Más del 60% del tráfico chileno es móvil' },
      { cod: 'W4', texto: 'Cuéntame el paso a paso de alguien que llega y quiere comprarte.', revela: 'El recorrido real, no el que cree que existe', clave: true },
      { cod: 'W5', texto: '¿Hay una página por servicio, o todo llega a la misma?', revela: 'Message match' },
      { cod: 'W6', texto: '¿Qué prueba de que eres confiable está visible?', revela: 'Casos, reseñas, clientes, certificaciones. Cruza con el eslabón 02' },
      { cod: 'W7', texto: '¿Se puede pagar o agendar en línea?', revela: 'Techo de conversión' },
      { cod: 'W8', texto: '¿Los precios están publicados o hay que preguntar?', revela: 'Fricción + insumo de la vía B (señal S6)' },
      { cod: 'W9', texto: '¿Cuándo actualizaron el contenido por última vez?', revela: 'Abandono del activo' },
      { cod: 'W10', texto: '¿El sitio conversa con algún otro sistema?', revela: 'Frontera 04/05 — inventario, ERP, CRM' }] }] },

  5: { prefijo: 'A', total: 12, nota: 'El bloque de mayor valor comercial: es el área a la que rutea la mayoría de los prospectos que antes quedaban fuera de perfil por no invertir en pauta.',
    grupos: [{ nombre: 'Captura y respuesta → Automatización y agentes', preguntas: [
      { cod: 'A1', texto: '¿Cuántas personas atienden las consultas que llegan?', revela: 'Tamaño del cuello de botella' },
      { cod: 'A2', texto: '¿Cómo se reparten entre ellas?', revela: 'Asignación: por turno, el primero que ve, o nadie decide' },
      { cod: 'A3', texto: '¿Qué pasa con una consulta que llega un sábado a las diez de la noche?', revela: 'Cobertura fuera de horario — el hueco más común' },
      { cod: 'A4', texto: '¿Cuántas veces se insiste con alguien que no respondió?', revela: 'Seguimiento: 0 · 1 · 2–3 · hasta que responde' },
      { cod: 'A5', texto: '¿Cómo se arma una cotización?', revela: 'Plantilla, desde cero cada vez, o sistema' },
      { cod: 'A6', texto: '¿Cuántas cotizaciones emiten al mes y cuánto demora cada una?', revela: 'Insumo directo de la cuantificación en pesos', clave: true },
      { cod: 'A7', texto: '¿Qué pasa con los datos de alguien que consultó y no compró?', revela: 'Base muerta = oportunidad más barata que la pauta' },
      { cod: 'A8', texto: '¿En cuántos lugares distintos está la información de un cliente?', revela: 'Fragmentación; costo oculto de reconciliación' },
      { cod: 'A9', texto: '¿Qué tarea repetitiva te gustaría que desapareciera mañana?', revela: 'La pregunta cualitativa clave: nombra el dolor en sus palabras', clave: true },
      { cod: 'A10', texto: 'Desde que un cliente acepta, ¿cuánto tarda en empezar a recibir el servicio?', revela: 'Fricción de onboarding' },
      { cod: 'A11', texto: '¿Hay algo que se haga dos veces porque dos sistemas no se hablan?', revela: 'Integración faltante' },
      { cod: 'A12', texto: 'Si mañana llegara el triple de consultas, ¿qué se rompe primero?', revela: 'Deja que el dueño diagnostique su propio cuello de botella sin ponerse a la defensiva: habla de un futuro hipotético, no de un error presente', clave: true }] }] },

  6: { prefijo: 'I', total: 8, nota: 'I5 es la que más veces cambia el plan: sin base documentada, la recomendación honesta no es un agente, es documentar primero.',
    grupos: [{ nombre: 'Escala de la conversación → RPA y procesos', preguntas: [
      { cod: 'I1', texto: '¿Cuántas conversaciones de venta llevas en paralelo?', revela: 'Carga real' },
      { cod: 'I2', texto: 'De lo que respondes al día, ¿cuánto es lo mismo una y otra vez?', revela: 'Superficie automatizable' },
      { cod: 'I3', texto: '¿Personalizas la propuesta por cliente o mandas la misma?', revela: 'Techo de conversión por falta de personalización' },
      { cod: 'I4', texto: '¿Alguien del equipo usa IA hoy? ¿Para qué?', revela: 'Madurez y uso informal' },
      { cod: 'I5', texto: '¿Está escrito en alguna parte lo que se responde a las preguntas frecuentes?', revela: 'Materia prima de un agente. Si no existe, hay que crearla primero', clave: true },
      { cod: 'I6', texto: '¿Qué preguntan siempre antes de comprar?', revela: 'Guion del agente, dicho por él' },
      { cod: 'I7', texto: '¿Cómo le hablas a tu cliente? ¿Está definido en algún lado?', revela: 'Tono; sin esto un agente suena a otra empresa' },
      { cod: 'I8', texto: '¿Qué te gustaría poder responder a las tres de la mañana?', revela: 'Traduce el valor a una escena concreta' }] }] },

  7: { prefijo: 'C', total: 6, nota: 'Corto a propósito: el eslabón 07 casi nunca es dominante, así que este bloque suele aplicarse como complemento del área principal — nunca en vez de ella.',
    grupos: [{ nombre: 'Capacidad del equipo → Capacitación y adopción', preguntas: [
      { cod: 'C1', texto: '¿Quién maneja hoy las campañas, el sitio y los sistemas?', revela: 'Mapa de dependencia' },
      { cod: 'C2', texto: '¿Es alguien interno o externo?', revela: 'Riesgo de continuidad' },
      { cod: 'C3', texto: 'Si esa persona se va mañana, ¿quién sabe hacerlo?', revela: 'Bus factor' },
      { cod: 'C4', texto: '¿Alguien del equipo puede revisar si esa persona lo está haciendo bien?', revela: 'La pregunta de Carolina. Sin capacidad de auditar, dependes de confiar. Es el argumento honesto de venta de capacitación: no reemplaza al servicio, te da con qué fiscalizarlo', clave: true },
      { cod: 'C5', texto: '¿Han contratado herramientas que después no usaron?', revela: 'Brecha de adopción — comprar otra empeora el problema' },
      { cod: 'C6', texto: '¿Qué le pediste aprender al equipo el último año?', revela: 'Cultura de capacitación' }] }] }
};

/* ═══════════════════════════════════════════════════════════════════════════
   PROPUESTA — no está en el PRD v5.4 todavía. Cierra tres huecos detectados el
   3-ago-2026 al probar el prototipo contra el caso de uso real: reunión B2B de
   30 minutos con un prospecto que no necesariamente invierte en pauta.

   Hueco 1 · El bloque de negocio existe (Q1–Q17) pero SOLO se abre si el
            dominante es 01. Si rutea a captura, nunca se pregunta quién es su
            mejor cliente — que es la pregunta que vuelve esto un diagnóstico
            de negocio y no de canal.
   Hueco 2 · No hay análisis de competencia. Q8, Q9 y R6 son tres preguntas
            declarativas y las señales externas s1–s10 miran solo al propio
            prospecto, nunca a un competidor.
   Hueco 3 · Las anclas de §5.2 son 8 de 11 de pauta, y las 3 fórmulas también.
            Un negocio que no pauta se queda sin contra qué compararse.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Núcleo de negocio — se pregunta SIEMPRE, rutee donde rutee ────────────
   Seis de las siete ya existen en el bloque E1 del Anexo A2: no son preguntas
   nuevas, es que dejan de estar encerradas detrás del ruteo. */
const NUCLEO_NEGOCIO = {
  prefijo: 'N', minutos: 5,
  nota: 'Estas siete no dependen del ruteo. Van siempre, y son las que hacen que el informe hable del negocio y no del canal. Seis vienen del bloque 01 del Anexo A2 — no son preguntas nuevas, es que hoy solo se hacen si el dominante es 01.',
  preguntas: [
    { cod: 'N1', origen: 'Q1', texto: 'Nómbrame tu mejor cliente hoy. Uno concreto.', revela: 'Obliga a lo específico. La abstracción es donde se esconde la falta de criterio', clave: true },
    { cod: 'N2', origen: 'Q2', texto: '¿Por qué ese y no otro? ¿Qué lo hace bueno?', revela: 'El criterio implícito, en sus palabras: margen, volumen, recurrencia o comodidad', clave: true },
    { cod: 'N3', origen: 'Q5', texto: '¿Hay clientes que preferirías no tener? ¿Por qué?', revela: 'Más revelador que el criterio positivo. El criterio de descarte es la mitad de un criterio de calificación, y casi nadie lo tiene escrito', clave: true },
    { cod: 'N4', origen: 'Q7', texto: 'En tu cliente, ¿quién decide la compra? ¿Y quién la inicia?', revela: 'En B2B rara vez son la misma persona. Entrar por quien firma en vez de por quien especifica es un error caro' },
    { cod: 'N5', origen: 'Q13', texto: '¿Cuántos contactos entraron y cuántos cerraron el último trimestre?', revela: 'La línea base. Sin este número no hay contra qué medir nada de lo que venga después', clave: true },
    { cod: 'N6', origen: 'Q15', texto: '¿Cuántos clientes nuevos pueden atender por semana sin que se caiga la calidad?', revela: 'La restricción real. Si se entrega más de lo que puede atender, se reproduce el fracaso' },
    { cod: 'N7', origen: 'nueva', texto: '¿Cuánto de tu venta del año pasado dependió de tu cliente más grande?', revela: 'Concentración de cartera: el riesgo que ningún diagnóstico de marketing mira y que en B2B decide si el negocio es sano o frágil', clave: true }
  ]
};

/* ── Competencia y mercado — transversal, como los eventos ─────────────────
   No es un eslabón: es contexto que califica a los siete. La mitad observable
   se levanta ANTES de la reunión (§5.6), que es lo que permite que quepa en 30
   minutos: en la reunión solo van las cinco que no se pueden observar. */
const BLOQUE_COMPETENCIA = {
  prefijo: 'M', minutos: 4,
  nota: 'El PRD reclama PESTA, Porter y FODA cruzado como el diferenciador de Precisión en el eslabón 01, pero hoy no hay ningún instrumento que recoja los insumos para armarlos. Esto es ese instrumento.',
  preguntas: [
    { cod: 'M1', texto: 'Cuando te comparan, ¿contra quién te comparan? Nómbrame dos.', revela: 'El marco competitivo real, no el que él cree tener. Casi siempre difiere del que nombraría un consultor mirando el rubro' },
    { cod: 'M2', texto: 'La última vez que perdiste un negocio contra otro, ¿qué te dijeron que pesó?', revela: 'La causa de pérdida en palabras del cliente. Es la única fuente honesta de la desventaja competitiva', clave: true },
    { cod: 'M3', texto: '¿Qué haces tú que ellos no puedan copiar en seis meses?', revela: 'Ventaja defendible. Si no puede nombrarla, está compitiendo por precio aunque diga que no', clave: true },
    { cod: 'M4', texto: 'Tu precio, ¿está sobre, igual o bajo el promedio del rubro? ¿Cómo lo sabes?', revela: 'Posición de precio y —más importante— de dónde saca esa información. La respuesta suele ser "me lo dicen los clientes", que es la peor fuente posible' },
    { cod: 'M5', texto: '¿Qué está cambiando en tu rubro que va a obligar a todos a moverse?', revela: 'El gatillo sectorial. Insumo directo de PESTA y el hallazgo de mayor valor cuando existe: define un universo objetivo por obligación, no por estimación', clave: true }
  ],
  senales: [
    { cod: 'SC1', texto: 'Competidores con anuncios activos en la Biblioteca de Anuncios de Meta', revela: 'Quién invierte y desde cuándo. Si el prospecto no pauta y tres competidores sí, es un dato, no un juicio' },
    { cod: 'SC2', texto: 'Precio publicado del competidor', revela: 'Asimetría de información. Cruza con W8: si el competidor publica y él no, la fricción es suya' },
    { cod: 'SC3', texto: 'Huella comparada: sitio, reseñas y volumen de cada uno', revela: 'Posición relativa observable, no declarada' },
    { cod: 'SC4', texto: 'Autoridad sectorial: medios, gremios, rankings del rubro', revela: 'Quién es la referencia del rubro hoy. Insumo de reputación (02)' },
    { cod: 'SC5', texto: 'Presencia en licitaciones públicas o portales del sector', revela: 'Canal de captación del competidor que el prospecto quizá no está usando' }
  ]
};

/* ── Anclas de negocio B2B — contra qué se compara un negocio que no pauta ──
   Regla del PRD: nunca inventar datos de mercado; sin fuente = se declara
   estimación. Por eso las que no tienen fuente van declaradas vacías en vez de
   rellenadas. El hueco se muestra, no se tapa. */
const ANCLAS_B2B = [
  { ancla: 'Speed-to-lead', valor: 'Responder en 5 min = 21× más calificación que a los 30 min',
    fuente: 'MIT/InsideSales; HBR 2011', estado: 'disponible', usa: 'Eslabón 05 · Captura' },
  { ancla: 'LTV:CAC saludable', valor: '≥ 3:1',
    fuente: 'Benchmarkit', estado: 'disponible', usa: 'Transversal · salud del negocio' },
  { ancla: 'Hora administrativa RM', valor: '≈ $6.000 CLP [referencial]',
    fuente: 'Referencial de la agencia — declarado como estimación', estado: 'disponible', usa: 'Eslabones 05 y 06 · costo del trabajo repetitivo' },
  { ancla: 'Ciclo de venta B2B en Chile', valor: null,
    fuente: null, estado: 'sin_fuente', usa: 'Transversal · dimensiona cuánto tarda en verse un resultado' },
  { ancla: 'Tasa de cierre B2B por etapa', valor: null,
    fuente: null, estado: 'sin_fuente', usa: 'Eslabón 01 · da sentido a la línea base de N5' },
  { ancla: 'Concentración de cartera — umbral de riesgo', valor: null,
    fuente: null, estado: 'sin_fuente', usa: 'Transversal · es lo que mide N7' },
  { ancla: 'Recurrencia / renovación B2B', valor: null,
    fuente: null, estado: 'sin_fuente', usa: 'Transversal · separa venta de relación' }
];

/* Caso precargado: Eco Star. Entrada literal del Anexo G.1 del PRD. */
const CASO_ECOSTAR_TRIAGE = {
  t1: 'publicidad', t2: 'sitio_resenas', t3: 'mas_50', t4: 'meta', t5: 'whatsapp', t6: 'no',
  t7: 'mas_1dia', t8: 'no_queda', t9: 'muchas', t10: 'no', t11: null, t12: 'a_medias',
  t13: null, t14: null
};

/* ─────────────────────────────────────────────────────────────────────────────
   ENTREGABLE DE DEMOSTRACIÓN — caso dorado Eco Star (PRD Anexo G)

   Procedencia de cada bloque, declarada en pantalla:
     · bloque_0 y bloque_4 → VERBATIM del Anexo G.2 y G.4. Salida esperada del
       motor, reproducción de un diagnóstico humano ya validado (informe
       semestral entregado el 5-jul-2026).
     · bloque_1 y bloque_3 → RECONSTRUIDOS para esta demo. Las cifras son las
       reales citadas en el Anexo G; las lecturas y las soluciones las escribió
       la demo porque el anexo no las especifica.
     · bloque_2 → hipótesis 1 verbatim (G.3); enunciado, evidencia, atribución y
       confianza de las hipótesis 2 y 3 son de la tabla G.3, el resto reconstruido.
   ───────────────────────────────────────────────────────────────────────────── */
const ENTREGABLE_ECOSTAR = {
  meta: {
    cliente: 'Eco Star', rubro: 'Insumos y desechables para negocios de alimentación · B2B',
    via: 'con_cliente', confianza_global: 'alta',
    periodo: 'Semestre ene–jun 2026 · 6 meses de datos verificados'
  },

  bloque_0_ruteo: {
    procedencia: 'verbatim',
    reasoning: 'Hay flujo abundante y verificado: 19.945 clics y ~900 conversaciones en cinco meses (t3, t4). E3 funciona en volumen aunque su objetivo esté mal elegido. El flujo se rompe en E5: índice de respuesta 24,3% y ~12 h de espera promedio (t7, t9) — tres de cada cuatro conversaciones no se contestan. E4 también está roto (t5, t6: sin transacción, todo a WhatsApp), pero es consecuencia de la misma decisión de canal y además no es lo que se rompe primero contando desde donde hay flujo: la conversación llega y muere antes de necesitar un carrito. E1 queda sin datos: no se preguntaron t13 ni t14.',
    cadena: [
      { eslabon: 1, estado: 'sin_datos' }, { eslabon: 2, estado: 'sano' }, { eslabon: 3, estado: 'roto' },
      { eslabon: 4, estado: 'roto' }, { eslabon: 5, estado: 'roto' }, { eslabon: 6, estado: 'roto' },
      { eslabon: 7, estado: 'sin_datos' }
    ],
    eslabon_dominante: 5,
    area_recomendada: 'Automatización y agentes',
    area_secundaria: 'Desarrollo web',
    por_que_este_y_no_otro: 'Tu publicidad está trayendo más conversación de la que alcanzas a contestar: de cada cuatro personas que escriben, respondes a una, y en promedio doce horas después. Subir el presupuesto hoy no te trae más ventas — te trae más gente esperando.',
    que_NO_es_tu_problema: 'Tu contenido y tu comunidad. Tienes 7.790 seguidores, por sobre el promedio de tu categoría, y sumaste el 43% de esa base en seis meses. El contenido funciona. Lo que no funciona es lo que pasa después de que alguien escribe.'
  },

  bloque_1_data: {
    procedencia: 'reconstruido',
    reasoning: 'Todas las cifras son de panel propio del cliente —Business Suite y Administrador de Anuncios— o del informe semestral. Ninguna es estimada. Donde no hay dato, se declara N/D en vez de inferirlo: no existe atribución a venta, y por lo tanto no existe retorno calculable.',
    semaforo_capas: [
      { capa: 1, nombre: 'Viabilidad económica', estado: 'sin_datos',
        lectura: 'No se levantó ticket promedio ni margen, así que no se puede afirmar si la inversión soporta el costo por venta.', procedencia: 'declarado' },
      { capa: 2, nombre: 'Medición', estado: 'rojo',
        lectura: 'No hay forma de conectar una conversación ni un clic con una compra. Todo lo que se decida sobre el presupuesto hoy se decide a ciegas.', procedencia: 'observado' },
      { capa: 3, nombre: 'Arquitectura de conversión', estado: 'rojo',
        lectura: 'La campaña pide conversación y el destino es WhatsApp, sin carrito ni checkout. El circuito termina en una persona disponible, no en una venta registrada.', procedencia: 'observado' },
      { capa: 4, nombre: 'Audiencia y canal', estado: 'sin_datos',
        lectura: 'Hay perfil de audiencia observado —83,5% mujeres, dominante 35–44— pero no hay con qué contrastarlo contra quién efectivamente compra.', procedencia: 'observado' },
      { capa: 5, nombre: 'Proceso de ventas', estado: 'rojo',
        lectura: 'Tres de cada cuatro personas que escriben no reciben respuesta. El proceso existe; no alcanza a ejecutarse.', procedencia: 'declarado' }
    ],
    cifras_clave: [
      { etiqueta: 'Índice de respuesta', valor: '24,3%',
        lectura: 'De cada cuatro personas que escriben, se le responde a una. Es el único número del semestre que bajó.',
        referencia: 'N/D', evidencia: 't9 · Business Suite' },
      { etiqueta: 'Tiempo promedio de respuesta', valor: '≈ 12 horas (picos sobre 22)',
        lectura: 'Quien pregunta un martes en la mañana recibe respuesta el miércoles. Para una compra de insumos, ese plazo ya se resolvió en otra parte.',
        referencia: 'Responder en 5 min = 21× más calificación que a los 30 min [MIT/InsideSales]', evidencia: 't7 · Business Suite' },
      { etiqueta: 'Conversaciones recibidas', valor: '908 en 5 meses (436 Messenger + 472 Instagram)',
        lectura: 'El volumen de interés existe y es alto. El problema no está antes de la conversación.',
        referencia: 'N/D', evidencia: 't3 · Business Suite' },
      { etiqueta: 'Inversión publicitaria del semestre', valor: '$1.656.805 CLP',
        lectura: 'Es lo que costó traer esa conversación. Mientras el 75,7% no se contesta, esa parte del gasto compra cola de espera.',
        referencia: 'N/D', evidencia: 't4 · Administrador de Anuncios' },
      { etiqueta: 'Clics del semestre', valor: '19.945',
        lectura: 'La pauta entrega volumen. Lo que no entrega es venta registrada, porque nadie le pidió venta: el objetivo configurado es Interacción.',
        referencia: 'N/D', evidencia: 't4 · Administrador de Anuncios' },
      { etiqueta: 'Comunidad en Instagram', valor: '7.790 seguidores (+43% en 6 meses)',
        lectura: 'Esto está funcionando y no hay que tocarlo. Es la parte del trabajo que sí rindió.',
        referencia: 'N/D', evidencia: 't2 · Instagram' },
      { etiqueta: 'Ventas atribuidas a la pauta', valor: 'N/D',
        lectura: 'No existe el dato, y no se va a estimar. Cualquier cifra de retorno que alguien te muestre hoy sobre esta cuenta está inventada.',
        referencia: 'N/D', evidencia: 'ausencia de evento de compra' }
    ]
  },

  bloque_2_hipotesis: {
    procedencia: 'mixto',
    reasoning: 'Las tres explican el mismo hecho —hay interés y no hay venta registrada— en tres puntos distintos del circuito: quién contesta, qué se le pidió a la plataforma, y dónde queda lo que pasa. Se ordenaron por cuál se puede verificar más rápido con datos que el cliente ya tiene a la vista.',
    hipotesis: [
      { orden: 1, procedencia_item: 'verbatim',
        enunciado: 'Tres de cada cuatro personas que te escriben no reciben respuesta.',
        evidencia: 't7 (≈12 h promedio, picos sobre 22) × t9 (índice de respuesta 24,3%) — Matriz H.1',
        como_se_verifica: 'En Business Suite, la métrica de índice de respuesta y tiempo promedio de respuesta de los últimos 28 días. Está a la vista y no requiere nada nuevo.',
        si_es_cierta: 'Cada peso adicional de pauta genera más conversación sin contestar. La inversión no está comprando ventas: está comprando cola de espera.',
        por_que_no_era_visible: 'Porque todos los números que sí se miran subieron: alcance, seguidores, interacciones, contactos por mensaje. El único que bajó es el índice de respuesta, y es el que no aparece en ningún reporte de campaña — vive en otra pantalla.',
        atribucion: 'estructura', alcance: 'cuenta', capa: null, confianza: 'alta', procedencia: 'declarado' },

      { orden: 2, procedencia_item: 'reconstruido',
        enunciado: 'Le pediste a Meta conversación, y conversación es lo que te está entregando — no ventas.',
        evidencia: 't4 (objetivo Interacción) × ausencia de evento de compra',
        como_se_verifica: 'En el Administrador de Anuncios, la columna Objetivo de cada campaña activa del semestre. Si dice Interacción o Mensajes, la plataforma cumplió exactamente lo que se le pidió.',
        si_es_cierta: 'El costo por conversación es bajo y el costo por venta es desconocido. La optimización está trabajando a favor de un resultado que no es el que se necesita.',
        por_que_no_era_visible: 'Porque el objetivo se elige una vez, al crear la campaña, y después no vuelve a aparecer en ninguna pantalla de resultados. Lo que se mira todos los meses es el rendimiento contra ese objetivo, no si el objetivo era el correcto.',
        atribucion: 'gestion', alcance: 'cuenta', capa: null, confianza: 'alta', procedencia: 'declarado' },

      { orden: 3, procedencia_item: 'reconstruido',
        enunciado: 'No puedes saber cuánto de tu venta viene de la pauta, porque no hay dónde registrarla.',
        evidencia: 't5 × t6 (Matriz J) — todos los botones de compra del sitio redirigen a WhatsApp; sin carrito, sin checkout, sin pago en línea',
        como_se_verifica: 'Intentar comprar en el sitio como lo haría un cliente. Si el recorrido termina en una conversación y no en una orden, no hay nada que registrar.',
        si_es_cierta: 'Ninguna decisión de presupuesto del semestre se tomó con datos de venta, ni podía tomarse. La discusión de cuánto invertir queda suspendida hasta que exista el registro.',
        por_que_no_era_visible: 'Porque el catálogo sí está publicado, con fichas y precios en dos niveles. El sitio se ve completo. Lo que falta no es contenido: es la transacción.',
        atribucion: 'compartida', alcance: 'cuenta', capa: null, confianza: 'alta', procedencia: 'observado' }
    ],
    reparto_atribucion: { gestion: 1, estructura: 1, compartida: 1 }
  },

  bloque_3_soluciones: {
    procedencia: 'reconstruido',
    reasoning: 'El orden no es el de severidad, es el de velocidad de verificación. La primera se comprueba en 28 días con datos que ya existen; la tercera exige construir el registro antes de poder mirarlo.',
    soluciones: [
      { orden: 1, verifica_hipotesis: 1,
        accion: 'Esta semana: contar cuántos de los mensajes que llegan son la misma pregunta —precio, stock, despacho— y dejar esas tres respondidas automáticamente al primer contacto, aunque sea para decir que alguien contesta en el día.',
        prediccion: 'Si la hipótesis es correcta, el índice de respuesta de los próximos 28 días sube por sobre 24,3% sin que nadie trabaje más horas, porque la mayor parte del volumen era repetido.',
        puede_hacerlo_solo: true,
        como_hacerlo_solo: 'Las respuestas automáticas y las preguntas frecuentes de Business Suite son gratuitas y se configuran en una tarde desde la bandeja de entrada. No hace falta contratar a nadie para probar si esto funciona.',
        esfuerzo: 'horas', requiere_decision_de: 'quien opera la cuenta' },

      { orden: 2, verifica_hipotesis: 2,
        accion: 'Revisar el objetivo de cada campaña activa y dejar registrado cuál está en Interacción. No cambiarlo todavía: primero hay que poder medir la venta, o el cambio se evalúa contra nada.',
        prediccion: 'Si la hipótesis es correcta, todas o casi todas las campañas del semestre están en Interacción o Mensajes, y ninguna en un objetivo de venta o de contacto registrado.',
        puede_hacerlo_solo: true,
        como_hacerlo_solo: 'Administrador de Anuncios → columna Objetivo, en la vista de campañas. Son dos minutos y el dato es una lista.',
        esfuerzo: 'minutos', requiere_decision_de: 'quien opera la cuenta' },

      { orden: 3, verifica_hipotesis: 3,
        accion: 'Habilitar un punto de registro de la venta —una orden, un formulario de pedido o un checkout— aunque parta con una sola categoría del catálogo.',
        prediccion: 'Si la hipótesis es correcta, en cuanto exista el registro aparecerán ventas que hoy ocurren y no se ven, y por primera vez se podrá decir qué parte de la inversión las produjo.',
        puede_hacerlo_solo: false,
        como_hacerlo_solo: null,
        esfuerzo: 'días', requiere_decision_de: 'dueño' }
    ],
    cierre: 'Las dos primeras se pueden empezar sin nosotros y sin gastar nada. Cuando estén, vale la pena mirar la cuenta juntos: con el índice de respuesta corregido, los números del semestre pasado dejan de servir como referencia.'
  },

  bloque_4_etapas: {
    procedencia: 'verbatim',
    reasoning: 'El orden lo fija la regla del balde. Cerrar la brecha de respuesta es lo más rápido de implementar y actúa sobre un problema ya comprobado con datos. Medir la venta viene después porque es el proyecto de mayor alcance. Reasignar presupuesto de pauta va último: sin tracking de venta, cualquier decisión sobre el presupuesto se toma a ciegas.',
    etapas: [
      { orden: 1, nombre: 'Contestar a todos, aunque sea para decir que vas a demorar',
        por_que_primero: 'Es el único problema comprobado con datos propios y el más rápido de intervenir. Mientras tres de cada cuatro no reciban respuesta, todo lo demás que construyamos recibe menos de lo que podría.',
        quien_lo_hace: 'mixto', pilar_precision: 'Automatización y agentes', esfuerzo: 'semanas',
        como_se_sabe_que_resulto: 'El índice de respuesta en Business Suite sube por sobre 24,3% y el tiempo promedio baja de las doce horas. Ambos números están a la vista y no requieren instrumentación nueva.' },
      { orden: 2, nombre: 'Poder saber qué venta vino de dónde',
        por_que_primero: 'Hoy no hay forma de conectar ninguna conversación ni ningún clic con una compra. Es el proyecto de mayor alcance de los tres y el que habilita decidir sobre el presupuesto con datos.',
        quien_lo_hace: 'Precisión', pilar_precision: 'Desarrollo web', esfuerzo: 'semanas',
        como_se_sabe_que_resulto: 'Existe al menos una venta registrada y atribuible a un origen. Antes de eso, cualquier cifra de retorno es una estimación.' },
      { orden: 3, nombre: 'Recién ahí, mover el presupuesto',
        por_que_primero: 'Va último a propósito. Cambiar el objetivo de campaña o subir el presupuesto sin saber qué convierte es repetir la decisión que produjo este semestre.',
        quien_lo_hace: 'Precisión', pilar_precision: 'Paid Media y SEO', esfuerzo: 'días',
        como_se_sabe_que_resulto: 'La decisión de presupuesto se toma contra ventas atribuidas y no contra alcance.' }
    ],
    fuera_de_nuestro_alcance: 'La capacidad de la tienda física para atender el volumen que se genere, y la continuidad del pago de la tarjeta de la cuenta publicitaria — hubo dos interrupciones de entrega en el semestre por ese motivo. Podemos ordenar la respuesta y medir la venta; que haya quien atienda y que la cuenta no se corte es operación de Eco Star.',
    cierre: 'La etapa uno se puede empezar esta semana midiendo cuántos de los mensajes que llegan son la misma pregunta. Ese dato lo tienen ustedes y define cuánto de esto se puede resolver sin contratar a nadie.'
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   LA REUNIÓN COMPLETA — modos, preguntas 0, cierre y reparto del tiempo

   Hasta el 6-ago-2026 el panel empezaba en T1, o sea a mitad de la reunión.
   Faltaban los tres minutos de calificación de adelante y los tres del cierre,
   que son los que deciden si la reunión sirvió para algo.

   Fuentes, y no se inventa nada acá:
     · Modos de visita y duraciones → Guía de Venta en Terreno v2.2 §2
     · Guiones de apertura           → Guía v2.2 §3
     · Preguntas 0                   → Guía v2.2 §4.1
     · Preguntas de cierre C1–C3     → Guía v2.2 §4.4
     · Reparto de minutos PYME       → PRD §5.7.10

   El reparto del PRD §5.7.10 quedó corregido el 6-ago-2026: sumaba 29 minutos
   contando desde el triage y dejaba fuera los 3 minutos de preguntas 0 que la
   Guía §4.1 declara obligatorios. Hoy PRD y cronómetro dicen lo mismo: 32.
   ───────────────────────────────────────────────────────────────────────────── */

const MODOS_VISITA = {
  pyme: {
    nombre: 'PYME', decide: 'Dueño, gerente, encargado',
    busca: 'La reunión, o hacerla ahí mismo', dura: '20 a 45 minutos si entras',
    cierra_con: 'Una reunión agendada',
    apertura: 'Buenos días. Somos una consultora de acá de la zona. No vengo a venderle nada hoy: hacemos una revisión técnica sin costo de cómo está funcionando su parte comercial — de dónde le llegan los clientes, qué pasa cuando llegan, dónde se le pierden. Antes de irnos le decimos dónde vemos el problema, no en una semana. Toma media hora. ¿Le sirve que volvamos el jueves, o tiene un rato ahora?',
    ojo: 'Dice "le decimos dónde vemos el problema", NO "le entregamos el diagnóstico". El informe con hipótesis y plan lo arma Pablo después.',
    tramos: [
      { id: 'p0',   nombre: 'Apertura y preguntas 0', min: 3, fuente: 'Guía §4.1' },
      { id: 'tri',  nombre: 'Las 14 del triage',      min: 9, fuente: 'PRD §5.7.10' },
      { id: 'nuc',  nombre: 'Núcleo de negocio',      min: 5, fuente: 'PRD §5.7.10' },
      { id: 'area', nombre: 'Bloque del eslabón roto', min: 8, fuente: 'PRD §5.7.10' },
      { id: 'comp', nombre: 'Competencia',            min: 4, fuente: 'PRD §5.7.10' },
      { id: 'cie',  nombre: 'Las tres del cierre',    min: 3, fuente: 'Guía §4.4' }
    ]
  },
  grande: {
    nombre: 'Empresa grande', decide: 'Recepción, secretaría, quien esté',
    busca: 'El dato: nombre, cargo, correo directo', dura: '5 a 10 minutos',
    cierra_con: 'Un contacto que no estaba en la base',
    apertura: 'Buenos días. Trabajamos con empresas del rubro en eficiencia comercial y de procesos. No vengo a reunión hoy — ¿me podría decir quién ve el área comercial, o de operaciones, para hacerle llegar algo puntual?',
    ojo: 'No vas a conseguir la reunión en la puerta, y no es fracaso. Pedir un dato es una petición mucho más chica que pedir una reunión.',
    tramos: [
      { id: 'p0',  nombre: 'Apertura',            min: 2, fuente: 'Guía §3' },
      { id: 'dat', nombre: 'Pedir el dato',       min: 4, fuente: 'Guía §2' },
      { id: 'cie', nombre: 'Anotar y agradecer',  min: 2, fuente: 'Guía §2' }
    ]
  },
  referido: {
    nombre: 'Referido', decide: 'Conoce al decisor pero no decide',
    busca: 'La presentación al que decide', dura: '15 a 20 minutos, y no más',
    cierra_con: 'Una frase acordada y una fecha',
    apertura: 'Antes de meterme en cualquier cosa, cuéntame cómo funciona el negocio de tu papá, porque no quiero llegar a ofrecerle algo que no necesita. Prefiero entender primero y después ver si tenemos algo que le sirva. Si no lo tenemos, te lo digo altiro.',
    ojo: 'Es el modo más fácil de arruinar, porque la confianza da permiso para hablar de más. Objetivo único: salir con una presentación al decisor y una razón para que quiera escucharla.',
    tramos: [
      { id: 'p0',   nombre: 'Encuadre y preguntas 0', min: 3, fuente: 'Guía §3 y §4.1' },
      { id: 'tri',  nombre: 'Cómo funciona el negocio', min: 8, fuente: 'Guía §5' },
      { id: 'cie',  nombre: 'La petición y la frase',  min: 5, fuente: 'Guía §5' }
    ]
  }
};

/* Van en los primeros tres minutos, SIEMPRE, aunque la reunión sea con alguien
   conocido. Preguntarlas al final es descubrir en el minuto veinte que le
   presentaste a quien no compra. (Guía §4.1) */
const PREGUNTAS_0 = [
  { id: 'p01', cod: '0.1', texto: '¿Usted es quien decide esto, o hay alguien más que tiene que estar de acuerdo?',
    porque: 'Define si esta es la reunión, o la reunión antes de la reunión. Y define el modo: si te responde que él no decide, estás en modo referido aunque hayas llegado creyendo otra cosa.',
    opciones: [
      { v: 'decide_solo',  l: 'Decide él solo',            modo: 'pyme' },
      { v: 'decide_con',   l: 'Decide con socios / comité', modo: 'pyme' },
      { v: 'no_decide',    l: 'No decide él',               modo: 'referido' },
      { v: 'no_claro',     l: 'No quedó claro',             modo: null }
    ] },
  { id: 'p02', cod: '0.2', texto: '¿La empresa tiene socios? ¿Cómo se toma una decisión así acá?',
    porque: 'Un 50/50 o un directorio cambia por completo cómo se redacta la propuesta.',
    opciones: [
      { v: 'dueno_unico', l: 'Dueño único' },
      { v: 'socios',      l: 'Socios' },
      { v: 'directorio',  l: 'Directorio o comité' },
      { v: 'no_se',       l: 'No lo dijo' }
    ] },
  { id: 'p03', cod: '0.3', texto: '¿Qué tendría que pasar para que algo así avance?',
    porque: 'Te dice el criterio de compra antes de que exista una propuesta. Se anota con sus palabras.',
    opciones: [] }          // abierta: solo nota
];

/* Lo único que importa del final. C3 no pregunta si le interesa: pregunta
   cuándo. (Guía §4.4) */
const PREGUNTAS_CIERRE = [
  { id: 'c1', cod: 'C1', texto: 'De todo lo que conversamos, ¿qué es lo que más le complica hoy?',
    porque: 'Que él nombre la prioridad. La propuesta se ordena por su respuesta, no por la nuestra.' },
  { id: 'c2', cod: 'C2', texto: 'Si eso se arreglara, ¿qué cambia para usted?',
    porque: 'Es el valor de la solución dicho con sus palabras. Es lo que se cita en la propuesta.' },
  { id: 'c3', cod: 'C3', texto: 'El jueves le traigo lo que encontramos. ¿A las 10 o después de almuerzo?',
    porque: 'Próximo paso con fecha. No preguntes si le interesa: pregunta cuándo.' }
];

/* Lo que hay que decir antes de salir — es lo que se prometió al abrir la
   puerta, y es lo único que sostiene la promesa sin bluffear. (Guía §4.4) */
const PROMESA_DE_SALIDA = 'Antes de salir: cuál eslabón se ve roto y por qué, usando solo lo que él mismo te contó.';

/* ─────────────────────────────────────────────────────────────────────────────
   PUENTE TRANSCRIPCIÓN → TRIAGE

   Qué es: un buscador de frases. Cruza lo que se dijo en la reunión contra los
   literales del triage y PROPONE una respuesta con la cita que la sostiene.
   Pablo acepta o descarta. Nunca rellena solo.

   Qué NO es, y hay que decirlo cada vez que alguien pregunte: no es IA, no es
   el motor y no entiende nada. Son expresiones regulares corriendo en el
   navegador, sin conexión. Si se describiera como "la herramienta interpreta la
   reunión" sería exactamente el bluffing que la regla del 6-ago prohíbe.

   Por qué es agnóstico del proveedor: se pega CUALQUIER texto. Teams y Meet
   exportan su propia transcripción, y eso funciona hoy. Atarlo a una app de
   grabación en particular habría sido atarlo a algo que ni siquiera corre en
   el equipo de Pablo (ver LEEME.md).

   El orden importa: gana la primera pista que calce, así que van de la más
   específica a la más general.
   ───────────────────────────────────────────────────────────────────────────── */

const PISTAS_TRANSCRIPCION = {
  t1: [
    { v: 'recomendacion', re: /\b(boca a boca|recomendaci[oó]n|me recomend|por un conocido|por referid|de boca en boca|cartera)\b/i },
    { v: 'licitacion',    re: /\b(licitaci[oó]n|mercado p[uú]blico|propuesta p[uú]blica|nos invitan a cotizar)\b/i },
    { v: 'publicidad',    re: /\b(por la publicidad|vieron el anuncio|por instagram|por facebook|por la pauta)\b/i },
    { v: 'busqueda',      re: /\b(nos buscan en google|por google|nos googlean|buscando en internet)\b/i }
  ],
  t2: [
    { v: 'casi_nada',   re: /\b(no encuentran nada|no sale nada|no aparecemos|casi nada|ni sitio tenemos)\b/i },
    { v: 'solo_redes',  re: /\b(solo (el )?instagram|puras redes|solo redes|nada m[aá]s que el instagram)\b/i },
    { v: 'sitio_resenas', re: /\b(tenemos sitio|nuestra p[aá]gina|con rese[nñ]as|nos eval[uú]an bien)\b/i }
  ],
  t3: [
    { v: '0',      re: /\b(no me llega nadie|no llega nadie|no nos llega nada|cero consultas|ninguna consulta)\b/i },
    { v: 'mas_50', re: /\b(m[aá]s de (cincuenta|50)|como (cien|100)|un mont[oó]n de consultas)\b/i },
    { v: '21_50',  re: /\b((treinta|cuarenta|cincuenta|30|40|50) (consultas|clientes|oportunidades|al mes))\b/i },
    { v: '6_20',   re: /\b((diez|quince|veinte|10|15|20) (consultas|clientes|oportunidades|al mes))\b/i },
    { v: '1_5',    re: /\b((dos|tres|cuatro|cinco|2|3|4|5) (consultas|clientes|oportunidades) al mes|muy pocas consultas)\b/i }
  ],
  t4: [
    { v: 'no',     re: /\b(no invierto|no hacemos publicidad|nunca hemos pauteado|no pauto|no gastamos en publicidad)\b/i },
    { v: 'ambas',  re: /\b(meta y google|facebook y google|los dos|ambas)\b/i },
    { v: 'meta',   re: /\b(pauteo en (meta|instagram|facebook)|invierto en instagram|campa[nñ]as en meta)\b/i },
    { v: 'google', re: /\b(google ads|adwords|pauteo en google)\b/i }
  ],
  t5: [
    { v: 'whatsapp', re: /\b(se van al whatsapp|todo por whatsapp|los mando al whatsapp|escriben al whatsapp)\b/i },
    { v: 'no_tengo', re: /\b(no tengo (sitio|p[aá]gina)|no tenemos web)\b/i },
    { v: 'perfil',   re: /\b(al perfil de instagram|a nuestro instagram)\b/i },
    { v: 'landing',  re: /\b(una landing|p[aá]gina de la campa[nñ]a)\b/i },
    { v: 'home',     re: /\b(a la p[aá]gina de inicio|al home|a la portada)\b/i }
  ],
  t6: [
    { v: 'no',       re: /\b(tienen que llamar|s[ií] o s[ií] hablar|no se puede comprar (ah[ií]|en la p[aá]gina)|es un folleto)\b/i },
    { v: 'solo_wsp', re: /\b(solo por whatsapp|[uú]nicamente por whatsapp)\b/i },
    { v: 'si',       re: /\b(pueden comprar en (el sitio|la p[aá]gina)|tenemos carrito|dejan sus datos en la web)\b/i }
  ],
  t7: [
    { v: 'mas_1dia',  re: /\b(al otro d[ií]a|al d[ií]a siguiente|a los dos d[ií]as|el lunes|se nos queda|a veces se pasa)\b/i },
    { v: 'mismo_dia', re: /\b(el mismo d[ií]a|en el d[ií]a|antes de cerrar)\b/i },
    { v: 'menos_1h',  re: /\b(dentro de la hora|en una hora|al rato)\b/i },
    { v: 'menos_5min', re: /\b(al tiro|al toque|de inmediato|en cinco minutos|apenas escriben)\b/i }
  ],
  t8: [
    { v: 'no_queda',  re: /\b(no queda en ninguna parte|no lo anotamos|se pierde|no queda registro|en la cabeza)\b/i },
    { v: 'correo_wsp', re: /\b(queda en el whatsapp|en el correo nom[aá]s|en el chat)\b/i },
    { v: 'planilla',  re: /\b(una planilla|un excel|en sheets)\b/i },
    { v: 'crm',       re: /\b(un crm|hubspot|pipedrive|salesforce|zoho)\b/i }
  ],
  t9: [
    { v: 'muchas',  re: /\b(muchas se quedan|se nos cae harto|se pierden hartas|un mont[oó]n sin responder)\b/i },
    { v: 'algunas', re: /\b(algunas se quedan|de repente se nos pasa|alguna que otra)\b/i },
    { v: 'ninguna', re: /\b(todas se contestan|no se nos queda ninguna|contestamos todas)\b/i }
  ],
  t10: [
    { v: 'no',            re: /\b(no usamos (nada de )?(ia|inteligencia artificial)|no hemos usado)\b/i },
    { v: 'por_su_cuenta', re: /\b(alguno usa chat ?gpt|por su cuenta|un chico lo usa|lo usan por fuera)\b/i },
    { v: 'si_formal',     re: /\b(tenemos (implementado|contratado)|lo usamos formalmente)\b/i }
  ],
  t12: [
    { v: 'no',       re: /\b(solo yo|depende de m[ií]|si yo no estoy|nadie m[aá]s sabe|si me enfermo)\b/i },
    { v: 'a_medias', re: /\b(m[aá]s o menos|a medias|algo sabe|le he mostrado)\b/i },
    { v: 'si',       re: /\b(cualquiera del equipo|hay dos personas que|est[aá] documentado)\b/i }
  ],
  t13: [
    { v: 'no',         re: /\b(le vendemos a cualquiera|a todo el mundo|no tenemos definido)\b/i },
    { v: 'no_escrito', re: /\b(lo tengo en la cabeza|no est[aá] escrito|m[aá]s o menos s[eé] qui[eé]n)\b/i },
    { v: 'si_escrito', re: /\b(lo tenemos escrito|est[aá] definido en|tenemos un perfil de cliente)\b/i }
  ],
  t14: [
    { v: 'no_sabria',  re: /\b(no sabr[ií]a decirte|no tengo idea por qu[eé]|buena pregunta)\b/i },
    { v: 'intuicion',  re: /\b(por el precio nom[aá]s|supongo que|yo creo que es por|imagino que)\b/i },
    { v: 'explicable', re: /\b(nos eligen porque|la diferencia con|somos los [uú]nicos que)\b/i }
  ]
};

/* Preguntas sin pistas escritas — se declara para no dar a entender que el
   puente cubre las 14. T11 pide un número de horas: nadie lo dice en voz alta
   de una forma que una expresión regular pueda leer sin equivocarse. */
const SIN_PISTAS = ['t11'];

/* ─────────────────────────────────────────────────────────────────────────────
   FICHA DE LA EMPRESA — los datos de contacto que la visita tiene que dejar

   Las columnas siguen el orden EXACTO del maestro `Base_Prospectos_Calibrar_RM.xlsx`
   (hoja "Base de Prospectos", 20 columnas), para que lo que se levanta en terreno
   entre a la base sin volver a teclearlo. Los campos que no están en el maestro van
   marcados `extra: true` — el correo es uno de ellos, y es un hueco real del maestro:
   hoy hay teléfono, sitio y redes, pero no hay columna de correo.

   Sirve igual en terreno y en videollamada: `via` lo distingue.
   ───────────────────────────────────────────────────────────────────────────── */

const FICHA_EMPRESA = [
  { g: 'Identificación', campos: [
    { id: 'razon_social', l: 'Nombre de la empresa (razón social)', col: 2 },
    { id: 'fantasia',     l: 'Nombre de fantasía',                  col: 3 },
    { id: 'rut',          l: 'RUT',                                 col: 4 },
    { id: 'rubro',        l: 'Rubro',                               col: 5 },
    { id: 'sector',       l: 'Sector',                              col: 6 }
  ]},
  { g: 'Dónde está', campos: [
    { id: 'comuna',    l: 'Comuna',    col: 7 },
    { id: 'direccion', l: 'Dirección', col: 8 }
  ]},
  { g: 'Cómo se le contacta', campos: [
    { id: 'telefono', l: 'Teléfono',        col: 9 },
    { id: 'correo',   l: 'Correo',          col: 10,
      nota: 'Columna 10 del maestro desde el 6-ago-2026. Prefiere el genérico de la empresa: uno nominativo es dato personal (Ley 21.719).' },
    { id: 'web',      l: 'Sitio web',       col: 11 },
    { id: 'redes',    l: 'Redes sociales',  col: 12 }
  ]},
  { g: 'Quién decide', campos: [
    { id: 'decisor',        l: 'Decisor (cargo/nombre)',   col: 13 },
    { id: 'decisor_wsp',    l: 'WhatsApp del decisor',     col: 14,
      nota: 'DATO PERSONAL bajo la Ley 21.719: solo lo que el titular entregue en la visita, y con base de licitud declarada.' },
    { id: 'quien_mas',      l: 'Quién más decide',         col: 15,
      nota: 'Sale de la pregunta 0.2. Un socio o un directorio cambia cómo se redacta la propuesta. También es dato personal.' }
  ]},
  { g: 'La visita', campos: [
    { id: 'senal',        l: 'Señal / Gancho de visita', col: 16 },
    { id: 'proximo_paso', l: 'Próximo paso',             col: 18,
      nota: 'Con fecha y responsable. Sale de C3.' },
    { id: 'fecha_paso',   l: 'Fecha del próximo paso',   col: 19, tipo: 'date' }
  ]},
  { g: 'Ley 21.719', campos: [
    { id: 'base_licitud', l: 'Base de licitud', col: 22, tipo: 'select',
      opciones: ['Interés legítimo · prospección B2B', 'Consentimiento del titular', 'Relación contractual'],
      nota: 'Obligatorio desde el 1-dic-2026. Se declara al capturar, no después.' }
  ]}
];

/* Orden de las 20 columnas del maestro, para poder emitir una fila pegable. */
const COLUMNAS_MAESTRO = ['N°', 'Nombre de la empresa (razón social)', 'Nombre de fantasía', 'RUT',
  'Rubro', 'Sector', 'Comuna', 'Dirección', 'Teléfono', 'Correo', 'Sitio web', 'Redes sociales',
  'Decisor (cargo/nombre)', 'WhatsApp del decisor', 'Quién más decide',
  'Señal / Gancho de visita', 'Prioridad', 'Próximo paso', 'Fecha del próximo paso',
  'Fuente / Origen del dato', 'Fecha de captura', 'Base de licitud',
  'Fecha de última actualización', 'Solicitud del titular', 'Estado del registro'];

/* ─────────────────────────────────────────────────────────────────────────────
   DOLORES — la puerta de entrada que no está hecha de marketing

   El problema que esto resuelve, medido: el triage reparte bien sus 14 preguntas
   entre los siete eslabones (2·2·2·2·2·3·1), pero la PROFUNDIDAD no. De las 89
   preguntas de los bloques profundos, 28 son de pauta —el 31%, para un solo
   eslabón— y los tres operativos (05, 06, 07) juntan 26. El material operativo
   existe y es bueno (A5 cotizaciones, A9 tarea repetitiva, A11 dos sistemas que no
   se hablan), pero está detrás de una puerta con vocabulario de marketing. Un
   Ignacio que no pauta y cuyo dolor es de operación puede no llegar nunca ahí.

   Esto es una entrada transversal en el idioma del dueño. Reglas:
     · Es MULTISELECCIÓN. Un negocio tiene varios dolores a la vez y elegir uno
       solo pierde información.
     · NO RUTEA. Igual que el núcleo de negocio (§5.1.2): califica el diagnóstico,
       no lo elige. Quien rutea sigue siendo el triage.
     · Algunos dolores tienen `esl: []` a propósito: son reales, duelen, y NO los
       resolvemos nosotros. Se declaran como fuera de alcance. Fingir que una
       agencia arregla una máquina parada es exactamente lo que no hacemos.
   ───────────────────────────────────────────────────────────────────────────── */

const DOLORES = [
  { g: 'Comercial y venta', items: [
    { v: 'no_cierra',      l: 'Llegan interesados pero no cierran',            esl: [1] },
    { v: 'no_conocen',     l: 'No nos conocen, o nos conocen mal',             esl: [2] },
    { v: 'pocos_leads',    l: 'No llega suficiente gente nueva',               esl: [3] },
    { v: 'depende_cartera', l: 'Todo depende de la cartera de siempre',        esl: [3, 1] },
    { v: 'precio',         l: 'Competimos solo por precio',                    esl: [1, 2] },
    { v: 'licitaciones',   l: 'Vivimos de licitaciones y es impredecible',     esl: [1, 3] }
  ]},
  { g: 'Operación y producción', items: [
    { v: 'cotiza_lento',   l: 'Cotizar nos toma demasiado',                    esl: [6, 5] },
    { v: 'cotiza_manual',  l: 'Cada cotización se arma a mano, una por una',   esl: [6] },
    { v: 'retrabajo',      l: 'Se hace dos veces porque dos sistemas no se hablan', esl: [6] },
    { v: 'sin_capacidad',  l: 'La producción no da abasto',                    esl: [] },
    { v: 'calidad',        l: 'Se nos van errores de calidad',                 esl: [] }
  ]},
  { g: 'Logística y despacho', items: [
    { v: 'despachos',      l: 'Los despachos se atrasan',                      esl: [] },
    { v: 'stock',          l: 'No sabemos bien qué stock tenemos',             esl: [] },
    { v: 'seguimiento_ped', l: 'El cliente llama a preguntar dónde va su pedido', esl: [5, 6] },
    { v: 'coordinacion',   l: 'Coordinar con transportistas nos consume el día', esl: [6] }
  ]},
  { g: 'Administración y finanzas', items: [
    { v: 'papeleo',        l: 'El papeleo se come el tiempo de vender',        esl: [6] },
    { v: 'cobranza',       l: 'Cobrar nos cuesta más que vender',              esl: [6] },
    { v: 'sin_numeros',    l: 'No sé cuánto me deja realmente cada trabajo',   esl: [1] },
    { v: 'facturacion',    l: 'La facturación se hace a mano',                 esl: [6] }
  ]},
  { g: 'Personas y equipo', items: [
    { v: 'depende_de_mi',  l: 'Si yo no estoy, se para todo',                  esl: [7] },
    { v: 'no_adoptan',     l: 'Compramos herramientas que nadie terminó de usar', esl: [7] },
    { v: 'rotacion',       l: 'Se nos va la gente y hay que enseñar de nuevo', esl: [7] },
    { v: 'no_hay_quien',   l: 'No encontramos a quién contratar',              esl: [] }
  ]},
  { g: 'Atención al cliente', items: [
    { v: 'no_alcanzamos',  l: 'Llegan consultas y no alcanzamos a contestarlas', esl: [5] },
    { v: 'fuera_horario',  l: 'Lo que entra fuera de horario se pierde',       esl: [5] },
    { v: 'mismas_preg',    l: 'Contestamos la misma pregunta todo el día',     esl: [6] },
    { v: 'se_pierde',      l: 'No queda registro de con quién hablamos',       esl: [5] }
  ]}
];
