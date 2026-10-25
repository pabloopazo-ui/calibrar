# Archivo obsoleto — Calibrar

Documentos superados por el PRD v5.4. **No los uses como referencia**: contradicen el modelo vigente.
Se conservan por trazabilidad, no por vigencia. Si estorban, se pueden borrar sin pérdida.

> ## ⚠️ 7-sep-2026 — estos documentos ya se escaparon una vez. Lee esto antes de restaurar un respaldo.
>
> **Qué pasó.** El incidente de pérdida del 6-sep se resolvió restaurando desde un respaldo del 6-ago,
> o sea de **antes** de que esta carpeta existiera. La restitución devolvió los cinco documentos de
> abajo a sus carpetas vivas —`Calibrar_Instrucciones_Proyecto_v2.2.1.md` quedó suelto en la raíz de
> `Calibrar/`, los otros cuatro en `01 Producto/`— y este `LEEME.md` pasó a describir una carpeta que
> ya no existía: decía siete archivados y quedaba uno. Se detectó en la auditoría del 7-sep y se
> devolvieron ese mismo día por instrucción de Pablo.
>
> **La lección, que es lo que hay que retener:** *un respaldo restaura el estado del disco, no las
> decisiones que se tomaron después.* Archivar no es una operación que sobreviva sola a una
> restitución. **Cada vez que se restaure un respaldo anterior al 28-jul-2026, hay que revisar esta
> carpeta contra la tabla de abajo.**
>
> **Qué cambió a raíz de eso.** Los cinco volvieron **con la marca `[SUPERADO — …]` en el propio nombre
> del archivo**, que es lo que la regla de versiones de `CLAUDE.md` pide y que en julio no se había
> aplicado. No es cosmético: si en septiembre hubieran tenido esa marca, la restitución habría dejado
> en `01 Producto/` un archivo cuyo **nombre** avisaba que estaba superado, y se habría visto de
> inmediato en vez de pasar un día entero inadvertido. La columna «Documento» de la tabla conserva el
> nombre original, que es por el que se los busca.

| Documento | Por qué salió | Dónde está lo vigente |
|---|---|---|
| `Calibrar_Caso_Prueba_ContaBoost.md` | Cliente ficticio con ticket de $29.990 que la propia Matriz descalifica. No representaba a ningún prospecto real de Precisión | Anexo G del PRD — **Eco Star**, cliente real con seis meses de datos |
| `Calibrar_PRD_v2_HerramientaInterna_jul2026.md` | Versión anterior del PRD, previa a la Cadena de Crecimiento Comercial, al ruteo por área y al dashboard | `Calibrar_PRD_v3_jul2026.md` (v5.4) |
| `Calibrar_System_Prompt_Maestro_v1.md` | Prompt v1.1: 8 pasos de razonamiento solo de pauta, sin ruteo, sin E0, con `temperature: 0.4` (parámetro **eliminado de la API**, hoy devuelve error 400) | Anexo E del PRD |
| `Calibrar_Investigacion_Mercado_Precio.txt` | Investigación de precio para vender el diagnóstico a $39.990. La decisión #5 lo convirtió en herramienta interna que **no se vende ni se cobra** | Sin reemplazo — quedó fuera de alcance |
| `Base_Prospectos_Segmentada_v1_jul2026.xlsx` | Capa de trabajo derivada del maestro, con **377** registros (63 A + 44 B + 270 por verificar). Quedó desfasada al integrarse las 50 nuevas al maestro. **El reemplazo dejó de llevar `_v1` en el nombre** para no repetir el patrón de "canónico que no es el más nuevo" | `02 Prospeccion/Base_Prospectos_Segmentada.xlsx` (**423 visitables**, regenerada 28-jul-2026) |
| `Calibrar_Estudio_Maestro_Prospeccion_jun2026_v1.md` | Estudio de prospección de jun-2026. Calificaba con la **doble condición** (depende de leads *e* invierte en pauta), trataba al industrial que no pauta como **"no-ICP: retirarse"** — justo el arquetipo Ignacio, el mayoritario de la base real — y su guion de visita **vendía el diagnóstico Calibrar a $39.990**, hoy prohibido (producto en pausa, no se vende ni se menciona). Sus **auditorías digitales de jun-2026 siguen siendo válidas** y están reproducidas en la v2 | `02 Prospeccion/Calibrar_Estudio_Maestro_Prospeccion.md` (**v2.0**, 28-jul-2026 — conserva el nombre canónico) |
| `Calibrar_Instrucciones_Proyecto_v2.2.1.md` | Era la antigua "fuente de verdad" del proyecto. Describía el producto viejo de **diagnóstico de pauta** con funnel de venta externa a $59.990 (Mercado Pago, anti-abandono, gate de calidad), dos arquetipos, y un stack cuyos parámetros de API **hoy fallan** (`temperature: 0.4` devuelve error 400). Llevaba banner de superado desde el 28-jul y se movió aquí ese mismo día | `Calibrar_PRD_v3_jul2026.md` (v5.4) — declarado fuente de verdad en `CLAUDE.md` |

| `qa_prospeccion_semanal.py` | Guardaba la regla **«integrar al maestro es decisión humana»** y la tarea `calibrar-50-prospectos-semanal`, las dos superadas el 17-ago-2026 por el modelo de documento único (las tareas escriben directo, con respaldo y Bitácora). Seguía en `_tools/` aunque `CLAUDE.md` lo daba por inexistente, y **corría en rojo con 6 fallos falsos**: leía las 275 filas legítimas del 6 y 7-sep como «filas que nadie autorizó» y confundía los respaldos `_backup_pre_semana_` de `maestro_io.py` —que es sólo su motivo por defecto— con los de la rutina eliminada | `_tools/qa_prospeccion.py` (31 verificaciones) + `_tools/qa_prospeccion_mutacion.py` |

*Archivados el 28-jul-2026 tras el QA.*

*7-sep-2026: se archivó además `qa_prospeccion_semanal.py`, único `.py` de esta carpeta.*

---

## Qué contiene realmente esta carpeta hoy — conciliado el 7-sep-2026

La tabla de arriba lista **siete** documentos. En disco hay **cinco de esos siete**, más
`qa_prospeccion_semanal.py`. La diferencia no es un error de la tabla: es el rastro del incidente.

| Documento de la tabla | Estado real al 7-sep-2026 |
|---|---|
| `Calibrar_Instrucciones_Proyecto_v2.2.1.md` | ✅ En la carpeta, con marca `[SUPERADO — …]` |
| `Calibrar_PRD_v2_HerramientaInterna_jul2026.md` | ✅ En la carpeta, con marca |
| `Calibrar_System_Prompt_Maestro_v1.md` | ✅ En la carpeta, con marca |
| `Calibrar_Caso_Prueba_ContaBoost.md` | ✅ En la carpeta, con marca |
| `Calibrar_Investigacion_Mercado_Precio.txt` | ✅ En la carpeta, con marca |
| `Base_Prospectos_Segmentada_v1_jul2026.xlsx` | ❌ **No existe en ninguna parte del proyecto.** Se perdió en el incidente del 6-sep y **no volvió con la restitución** |
| `Calibrar_Estudio_Maestro_Prospeccion_jun2026_v1.md` | ❌ **No existe en ninguna parte del proyecto.** Misma causa |

**Los dos que faltan se dan por perdidos, no por borrados.** Se conserva su fila en la tabla a
propósito: la regla de `CLAUDE.md` es que nada se borra, y **borrar la fila borraría también el
registro de que existieron y de por qué quedaron superados** — que es justo lo que un archivo de
obsoletos tiene que preservar. Su contenido sustantivo no se perdió: las auditorías digitales de
jun-2026 del Estudio Maestro están reproducidas en la v2 vigente, y la segmentada se regenera desde
el maestro con `_tools/regen_segmentada.py`.

**Pendiente que esto deja abierto:** ningún script verifica que esta carpeta y esta tabla coincidan.
`qa_transelec.py` sí hace ese chequeo para `TRANSELEC/` —que no quede nada `[SUPERADA]` suelto fuera
del archivo y que el `LEEME` cubra lo archivado—, y es el verificador que a Calibrar le falta.
