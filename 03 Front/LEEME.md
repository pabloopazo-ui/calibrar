# Calibrar · Front de demostración

**Qué es.** Un prototipo de interfaz para Calibrar, construido sobre el PRD v5.5
(`Calibrar/01 Producto/Calibrar_PRD_v3_jul2026.md`). Sirve para *ver* el producto:
no está conectado a la API, no envía datos a ninguna parte y no cambia el estado
del proyecto — **el motor de Calibrar sigue EN PAUSA de desarrollo y nunca ha
corrido.** El aviso negro de la cabecera lo declara en pantalla.

**Qué sí se puede hacer con esto (regla actualizada por Pablo el 6-ago-2026, ver
CLAUDE.md).** El **método** se usa en captación: `presentacion.html` está hecho
para proyectarse frente a un prospecto. Lo que no cambia es el límite duro —
**el diagnóstico nunca se
describe como "automático", "con IA" ni "al instante"** — se presenta como un método
**conducido a mano por Pablo**. Verificado sobre el DOM renderizado el 6-ago-2026:
0 apariciones de IA / instantáneo / PRD / verbatim / invariantes / `E1`–`E7` y 0 del
nombre del cliente. Las dos apariciones de "automáticamente" que sí hay son legítimas:
describen una automatización que se le **recomienda al cliente** (respuestas frecuentes
de Business Suite), no un atributo del diagnóstico.

**Cómo se abre.** Doble clic en `index.html`. Corre entero en el navegador, sin
servidor ni conexión. Montserrat ya está instalada en el equipo, así que se ve con
la tipografía de marca.

**Dos archivos de entrada, y no son intercambiables.**

| Archivo | Para quién | Qué se abre |
|---|---|---|
| `index.html` | **Uso interno** | Las cuatro vistas, incluidas las dos que el PRD §5.7.6 marca «solo lo ve Pablo» |
| `presentacion.html` | **Para proyectar frente a un prospecto** | Un solo documento claro: la Cadena, cómo es la conversación y un diagnóstico completo de ejemplo |

**Nunca proyectar `index.html` frente a un cliente.** Su cabecera declara el estado
interno del proyecto, su menú expone el panel del operador y el bloque profundo, y
el entregable trae el `reasoning` del motor con la taquigrafía `E1–E7`, las
etiquetas de procedencia (*verbatim* / *reconstruido para la demo*), el QA de
invariantes y el caso Eco Star **con nombre y cifras**. Eso es instrumental
interno; ver más abajo qué filtra el build de presentación.

---

## Las vistas

| Vista | Quién la ve | Qué muestra |
|---|---|---|
| **Inicio** | — | La Cadena de Crecimiento, la regla de precedencia y el flujo de entrada |
| **1 · Triage** | Solo Pablo | Modo en vivo: las 14, ruteo, siguiente pregunta, seguro de decir / no decir aún |
| **2 · Bloque profundo** | Solo Pablo | El bloque del eslabón dominante, con la regla de corte |
| **3 · Entregable** | El prospecto | Vista compartida: bloques 0 a 4, sin veredicto de calificación ni contradicciones |

La separación entre lo que ve Pablo y lo que ve el prospecto es la de §5.7.6 del
PRD y no es cosmética: el veredicto de calificación es una decisión comercial
interna y nunca se comparte.

## El input, que es lo que ordena las tres pantallas

La tabla de precedencia del Anexo F.2 es la razón de que sean tres pasos y no uno:

| Lo que llega al motor | Lo que emite |
|---|---|
| Solo `<triage>` | Bloque 0 (ruteo) + `siguiente_pregunta`. **No emite hipótesis todavía** |
| `<triage>` + `<bloque_area>` | Diagnóstico completo: bloques 0 a 4, con las 3 hipótesis y 3 soluciones |
| Solo `<senales_externas>` | Vía B, con techo de confianza `media` |
| `<triage>` + `<bloque_area>` sin `<nucleo_negocio>` | Diagnóstico completo, pero el motor **declara que es del canal y no del negocio** |
| `<respuestas_formulario>` sin triage | **No puede rutear.** Lo declara y pide el triage. No asume que el problema es de pauta |

La última fila evita el error más caro del modelo anterior: recibir 28 respuestas
de pauta y diagnosticar pauta sin haber preguntado si el problema era de pauta.

### 1 · Triage
- Las **14 preguntas de triage** con sus literales de opción del Anexo F.2.
- **Entrada por selección, nunca por redacción** (§5.7.7): Pablo está conversando,
  no transcribiendo.
- **T13 y T14 aparecen recién cuando T3 revela que sí llega flujo.** Sin flujo que
  filtrar, el criterio no se puede evaluar.
- El ruteo se recalcula en cada respuesta. Cada afirmación en pantalla muestra su
  evidencia `Txx` al lado (§5.7.5 regla 1).
- Botón **Cargar caso Eco Star**: precarga el triage del Anexo G.1.

### 2 · Bloque profundo
- Se abre **uno solo**: el del eslabón dominante. El contrato del Anexo F.2 dice
  «NUNCA más de uno», y la pantalla lo hace cumplir — sin dominante, el bloque
  está cerrado y manda de vuelta al triage.
- Los siete bloques del Anexo A2 están cargados: `Q1–Q17` criterio · `R1–R8`
  reputación · `P1–P28` pauta · `W1–W10` web · `A1–A12` captura · `I1–I8` escala ·
  `C1–C6` capacidad. Inventario total 115; nunca se preguntan todas.
- El de **01 Criterio** se muestra como las **siete secuencias de conversación**
  que es, no como lista: el orden importa porque cada pregunta hace posible la
  siguiente.
- Cada pregunta se marca *Respondida · Sin dato · No preguntada*, con nota corta
  opcional. Las de alto rendimiento van marcadas en ámbar (A9, A12, Q11, Q16,
  Q17, I5, C4, W4, P28…).
- **Regla de corte en vivo:** se pregunta hasta que el diagnóstico converja, no
  hasta agotar la lista. El paso al entregable se habilita con **4 del núcleo de
  negocio y 3 del área**; antes de eso está deshabilitado a propósito, porque sin
  criterio de cliente el diagnóstico es del canal y no del negocio.
- Botón **Simular avance**: marca estados de conversación para poder mostrar la
  regla de corte. **No inventa respuestas del cliente** — solo simula por dónde va
  la reunión.

---

## Los tres huecos que cerró la v5.5 — ya están en el PRD

Al probar el prototipo contra el caso de uso real —reunión B2B de 30 minutos con
un prospecto que puede no invertir en pauta— aparecieron tres huecos. **Se
escribieron en el PRD el 3-ago-2026 (v5.5)** y el QA quedó en **98/98**: se
sumaron 19 verificaciones nuevas que los guardan, y la prueba de mutación
confirma que las 92 de presencia son falsificables.

**Lo que sí está bien y no hay que tocar.** El triage no es de pauta: de las 14,
solo T4 pregunta por publicidad, y el PRD dice explícitamente que no pautar «deja
de ser criterio de descarte y pasa a ser un dato de ruteo». El inventario tampoco:
28 de las 103 que había eran de pauta —27%— y solo se preguntan si el dominante es 03.

**Hueco 1 · El bloque de negocio existe pero está encerrado.** `Q1–Q17` es un
diagnóstico de negocio en regla, y **solo se abre si el dominante es 01**. Si
rutea a captura, nunca se pregunta quién es su mejor cliente.
→ **Núcleo de negocio `N1–N7`, se pregunta siempre.** Seis vienen de `Q` —no son
preguntas nuevas, es que dejan de depender del ruteo— y `N7` (concentración de
cartera) es nueva. Cuesta ~5 minutos.

**Hueco 2 · No hay análisis de competencia.** Existen `Q8`, `Q9` y `R6`: tres
preguntas declarativas. Las señales externas `s1–s10` de la vía B miran solo la
huella del propio prospecto, nunca la de un competidor. El PRD reclama PESTA,
Porter y FODA cruzado como el diferenciador de Precisión, y no hay instrumento
que recoja los insumos.
→ **Bloque `M1–M5` en la reunión (~4 min) + señales `SC1–SC5` que se levantan
antes.** Partirlo así es lo que permite que quepa en 30 minutos: en la reunión
van solo las cinco que no se pueden observar desde fuera. Es transversal, como
los eventos corporativos: califica a los siete eslabones y **nunca aparece como
`area_recomendada`**.

**Hueco 3 · Las anclas son de pauta.** De las 11 de §5.2, **8 son de pauta**, y
las tres fórmulas nucleares también. Un negocio que no pauta llega a un
diagnóstico sin nada contra qué compararse: se le describe el problema, no se le
dimensiona.
→ Tabla de anclas B2B con **tres disponibles** (speed-to-lead, LTV:CAC, hora
administrativa RM) y **cuatro declaradas vacías** —ciclo de venta, tasa de cierre,
concentración de cartera, recurrencia—. Se muestran vacías a propósito: la regla
del PRD es no inventar datos de mercado, y una estimación no sirve como ancla.

**El reloj de 30 minutos.** El paso 2 muestra el presupuesto de la reunión:
3' preguntas 0 + 9' triage + 5' núcleo + ~8' área + 4' competencia + 3' cierre = **32 minutos**, y
cierra en seis de los siete eslabones. El único que no cierra es pauta: `14 + 28`
da **43 minutos**. Por eso 10 de las 28 están marcadas **Núcleo 30 min** —
cubren las capas 1, 2, 3 y 5; la capa 4, cliente ideal, ya la cubre el núcleo de
negocio. El botón alterna entre las 10 y las 28 y el reloj se recalcula.

### 3 · Entregable
- Los cinco bloques: **0 Ruteo · 1 Data · 2 Hipótesis · 3 Soluciones · 4 Plan por etapas.**
- Botón **Ver capa interna**: muestra el `reasoning` del motor y el QA de
  invariantes. Apagado por defecto, porque esos textos usan la taquigrafía `E1–E7`
  y **`E<n>` no puede aparecer en un entregable al cliente**.
- Botón **Imprimir / PDF**: el PDF sale del mismo HTML, como exige §5.7.8 — una
  sola plantilla, no dos.
- Abajo, los **invariantes del dashboard (§5.8.4)** verificados en vivo sobre el
  JSON que se acaba de renderizar: 15 de los 17. Hoy dan 15/15.

---

## Qué es real y qué no — importa

**El ruteo de esta demo no es el motor.** `assets/motor.js` es una traducción
determinista de las reglas de precedencia de §5.0.1–5.0.3 a JavaScript, escrita
para que la demo rutee sola sin llamar a la API. El motor real es Claude con el
System Prompt Maestro del Anexo E (`claude-sonnet-5` en vivo, `claude-opus-5` al
cerrar, profundidad por `output_config.effort`, **sin `temperature`, `top_p` ni
`top_k`** — devuelven 400).

Consecuencia visible: el panel rutea **solo con las 14 preguntas**, mientras el
entregable del caso Eco Star incorpora además datos de panel del cliente. Por eso
en el entregable el eslabón 03 aparece roto (objetivo de campaña mal elegido) y en
el panel no. No es un error: es la diferencia entre triage y diagnóstico.

**Verificación que sí vale.** Con el triage del Anexo G.1 cargado, el ruteo local
llega a **05 · Captura y respuesta → Automatización y agentes**, con **04 ·
Desarrollo web** como área secundaria. Es exactamente la salida esperada del caso
dorado — un cliente que paga pauta y cuyo problema no es la pauta.

**Procedencia del entregable**, declarada también en pantalla:

| Bloque | Origen |
|---|---|
| 0 · Ruteo | **Verbatim** del Anexo G.2 |
| 1 · Data | **Reconstruido para la demo.** Las cifras son las reales del Anexo G; las lecturas se escribieron acá |
| 2 · Hipótesis | Hipótesis 1 verbatim (G.3). De las hipótesis 2 y 3: enunciado, evidencia, atribución y confianza son de la tabla G.3; el resto reconstruido |
| 3 · Soluciones | **Reconstruido para la demo** |
| 4 · Plan por etapas | **Verbatim** del Anexo G.4 |

Ninguna cifra del entregable fue estimada. Donde no hay dato dice `N/D` — y `N/D`
no se rellena.

---

## `presentacion.html` — el build que sí se muestra

Se alimenta del **mismo `data.js`**, así que no hay una segunda versión de la
verdad que mantener: si cambia la Cadena o el caso de ejemplo, cambian los dos.
Lo que hace `assets/presentacion.js` es filtrar, y los tres filtros son de fondo:

1. **Se elimina el `reasoning` de los cinco bloques.** Es la capa interna y usa
   la taquigrafía `E1–E7`, que **no puede aparecer en nada que vea un cliente**.
2. **Se elimina la procedencia por bloque y el QA de invariantes.** Son control
   de calidad interno, no argumento de venta. También sale la columna de
   evidencia (`t7`, `t9`…): los códigos del triage no significan nada afuera.
3. **El caso de ejemplo va anonimizado.** Las cifras son las reales y no se
   tocan; el nombre no se muestra, ni en el cuerpo del texto. Mostrarle a un
   prospecto la cuenta de otro cliente con nombre y todo es exactamente lo que
   no queremos que piense que haremos con la suya — y la anonimización se dice
   en pantalla, como parte del argumento.

**Verificación de fuga, corrida sobre el DOM renderizado:** 0 apariciones de
`Eco Star`, 0 de `E1`–`E7`, 0 de *PRD / prototipo / verbatim / reconstruido /
invariante / veredicto de calificación*, 0 códigos de triage.

Las secciones son cinco: portada · por qué existe (la regla del balde) · la
Cadena en frío (galones neutros + la tabla de *cómo suena cuando es este*, que
es lo que hace que el prospecto se reconozca) · cómo es la conversación (los
tres momentos, el reloj de 30 minutos y las cuatro reglas de la casa) · el
diagnóstico completo de ejemplo · cierre. Imprime a PDF desde el mismo HTML.

**Lo que este build NO afirma, a propósito:** que haya un motor corriendo. No
dice «automático», «IA» ni «al instante» en ninguna parte — habla de una
conversación guiada y de un documento, que es lo que hoy existe de verdad. Ver
la instrucción del Plan Comercial: *no prometer informe automático en ninguna
visita*.

---

## Archivos

```
03 Front/
├── index.html              Uso interno · las cuatro vistas
├── presentacion.html       Para proyectar · documento único, sin capa interna
├── assets/
│   ├── styles.css          Identidad: #0D4F6A · #F5A623 · #D5E8F0 · Montserrat
│   ├── data.js             Cadena, las 14 de triage, caso Eco Star. Contratos del PRD
│   ├── motor.js            Ruteo local + verificación de invariantes
│   ├── app.js              Render de las cuatro vistas internas
│   ├── presentacion.js     Render del build de presentación (filtra y anonimiza)
│   └── logo-precision-*.png
└── LEEME.md
```

> Ojo con los logos del repositorio: en `Diseños y Fotos/LOGOS PRECISION/` los
> nombres están invertidos. Acá se copiaron ya renombrados —
> `logo-precision-blanco.png` es el blanco, para fondo oscuro.

---

## Qué falta para que esto deje de ser una demo

1. **Conectar el motor.** Hoy no hay llamada a la API. Es el paso que convierte el
   panel en copiloto real, y arrastra el requisito duro de **latencia < 10 s por
   turno** (§5.7.7) — los 8 pasos de razonamiento sobre 6.000 tokens de salida no
   caben ahí sin cambios de arquitectura (pendiente 9 del PRD).
2. **Que el entregable se arme con lo respondido.** Hoy el bloque profundo captura
   estado de conversación y el entregable que se muestra sigue siendo el caso
   dorado fijo. Unirlos es exactamente lo que hace el motor.
3. **El link vivo y su expiración.** §5.7.8 pide PDF *y* link. El link es una URL
   con datos de un tercero: no indexable, no adivinable y con criterio de
   expiración — **Ley 21.719, vigente el 1-dic-2026** (pendiente 17).
4. **Vía B — diagnóstico sin el cliente.** El contrato `<senales_externas>` existe
   en el Anexo F.2 y esta interfaz todavía no lo recoge.

---

## Dos registros visuales, y no es decoración

- **Pasos 1 y 2 → consola oscura.** Es un instrumento que se lee mientras se
  conversa: superficie oscura, retícula apenas insinuada, ámbar como color de
  señal —no de adorno—, monoespaciada y cifras tabulares para los códigos y los
  números, nodo del eslabón dominante latiendo en el riel. La marca contempla la
  versión oscura (#000000), así que no se sale de identidad.
- **Paso 3 → documento claro.** Lo ve el prospecto y se imprime en PDF. Oscuro
  sería un error de marca y un error de impresión. La cadena se dibuja en galones
  encadenados, que es lo que es: una tubería con un punto de corte.

Los dos comparten los mismos componentes; lo único que cambia son los tokens de
superficie, que se redefinen dentro de `.console`. Un solo CSS, dos pieles.

---

*Precisión Agencia · uso interno · prototipo, agosto 2026 · PRD v5.5*
