# Calibrar tras el incidente del 6-sep — qué se recuperó y qué queda

**Estado al 7-sep-2026, 00:15.** `qa_calibrar.py` **113/113** · `qa_cabina.py` **114/114** ·
`qa_mutacion.py` confirma que las 106 verificaciones de presencia siguen siendo falsificables.

    cd ~/Documents/Claude/Projects/PRECISION
    python3 "Calibrar/01 Producto/qa_calibrar.py"
    python3 "Calibrar/04 Cabina/qa_cabina.py"

## Lo importante: buena parte ya NO es reconstrucción

La caché HTTP del navegador conservaba los archivos tal como estaban **antes** del borrado, porque
la cabina se sirve por `http://localhost:8642`. Están rescatados en
`Calibrar/_rescate_cache_navegador_2026-09-07/`, y desde ahí se repuso el texto original.

| Qué | Cómo estaba | Cómo quedó |
|---|---|---|
| **Anexo E del PRD** | reconstruido anoche; 71,8% de líneas iguales al original, 199 líneas perdidas | **original repuesto** — la copia en caché declara «Anexo E del PRD v5.7, extraído VERBATIM el 2026-08-28», la misma versión que el PRD |
| `03 Front/assets/data.js` | le faltaban **nueve estructuras** | **original repuesto** |
| `APENDICE_VIVO` · `_PREPARACION` · `_DIGITAL` | no existían | **originales repuestos**, en archivo propio |
| `04 Cabina/assets/auth.js` | `destinoPostLogin()` sustituido por `'reunion.html'` en 3 lugares | **original repuesto** |
| `04 Cabina/assets/dictado.js` | le faltaban ~1.000 caracteres | **original repuesto** |
| `logo-precision-tinta.png` | no existía en ninguna parte del disco | **rescatado de la caché** |
| `logo-precision-blanco.png` | no existía en `03 Front/` | copiado de `TRANSELEC/assets/` (idéntico byte a byte al de `PARTICULAS/`) |
| Los 7 `.html` de front y cabina | — | **verificados idénticos** al original: ahí no hubo daño |

El diff completo del Anexo E, sección por sección, quedó en
`_rescate_cache_navegador_2026-09-07/` para quien quiera ver qué había escrito de más la
reconstrucción.

## Lo que sí sigue siendo texto reconstruido, y hay que leer con ojo crítico

Todo lo demás del PRD fuera del Anexo E: la reconstrucción del 6-sep armó el documento desde el
último respaldo del 27-jul, las ediciones registradas y los fragmentos literales de lecturas
posteriores. **El QA verifica invariantes, no autoría.** Concretamente:

- Invariantes **DB-9 a DB-17** (§5.8.4) y el **Anexo C** completo se escribieron el 6-sep.
- Caso mínimo **J.5 · E3** del Anexo J y el bloque 4 del caso dorado **H.4**: escritos, no recuperados.
- **Duplicación pendiente:** el bloque «Núcleo de 10 para la reunión de 30 minutos» aparece **dos
  veces** en el PRD (§5.7.10, líneas ~1449 y ~1460). Es residuo de la reconstrucción, no una
  decisión. Sin efecto funcional, pero conviene dejar una sola copia.

## Tres defectos que estaban en el QA, no en el documento

Vale recordarlos porque volverán a aparecer en otros archivos reconstruidos:

- `qa_cabina.py` había perdido los `//` de diez comentarios dentro de sus pruebas en JS. Eso mataba
  cuatro pruebas con un error de sintaxis que parecía de los `assets/`, y no lo era.
- Apuntaba a `Reuniones/AMBROT_Reunion_completa.json`, que no existe. El archivo con esa reunión es
  `AMBROT_DEMO_resultados.json`, y cumple exactamente lo que la prueba afirma (05 dominante, 04 y 07
  rotos, confianza alta).
- `qa_calibrar.py` exigía la frase de P28 **sin comillas invertidas**, y en el PRD va con ellas. Solo
  la satisfacía el texto reconstruido: al reponer el Anexo E original se puso roja sin que faltara
  nada. Un QA que fija la redacción de una reconstrucción deja de auditar el documento.

## Lo que se agregó para que esto no se repita

- **`04 Cabina/assets/apendices_motor.js`.** Los tres apéndices vivían dentro de
  `prompt_maestro.js`, que es un archivo **generado**: cada corrida de
  `regenerar_prompt_maestro.py` los borraba, y el hash del QA no lo notaba porque solo compara
  `PROMPT_MAESTRO` contra el Anexo E. En reunión eso era un `ReferenceError` al apretar «Consulta
  en vivo». Ahora viven aparte y el generador **se niega a escribir** si encuentra constantes
  ajenas en su destino.
- **Grupo GLOBALES en `qa_cabina.py`.** Carga los scripts de cada página en el orden real del HTML y
  exige que toda constante que el código nombra esté declarada. Es el detector que faltaba: con él,
  las nueve estructuras ausentes de `data.js` se habrían visto el mismo día. Verificado por mutación
  (escondiendo `PREGUNTAS_0` se pone rojo).
- **Una sola versión de rompe-caché** en las cuatro páginas (`?v=11`). Estaban mezcladas en v=4, v=9
  y sin versión, lo que significa conducir una reunión con el código viejo servido desde la caché.

## Y una lección del incidente

**La caché del navegador es una fuente de recuperación real** para todo lo que se sirva por
localhost, y nadie la miró en dos días de reconstrucción. Se consulta desde la propia página con
`fetch(url, {cache: 'force-cache'})`. Sobrevive mientras no se limpie: conviene no vaciarla y
conservar la carpeta `_rescate_cache_navegador_2026-09-07/` hasta que Pablo revise el PRD.
