#!/usr/bin/env python3
"""
QA de Calibrar — verificación de invariantes del PRD, la Matriz y el Anexo G Extendido.

Por qué existe: el QA del 28-jul-2026 encontró 30 defectos en dos pasadas, y cuatro de los
bloqueantes eran reincidencias exactas de defectos que el propio proyecto ya había documentado.
Todos eran del mismo tipo — "se cambió A y no se cambió B" — invisibles leyendo A o B por separado.

Las invariantes son binarias por diseño. Esto las verifica en segundos.

Desde el 6-ago-2026 el alcance incluye Calibrar/03 Front/ — el build de
presentación, que es lo único que se proyecta frente a un prospecto. Ese grupo no
lee el front: lo EJECUTA en un micro-DOM y verifica qué emite, porque la pregunta
("¿puede salir a la pantalla el nombre del cliente?") no se contesta leyendo los
datos. Requiere node en el PATH.

    python3 qa_calibrar.py            # informe completo
    python3 qa_calibrar.py --breve    # solo los fallos
    echo $?                           # 0 = todo pasa · 1 = hay fallos

Correr SIEMPRE después de tocar el prompt del Anexo E, un caso dorado, la Matriz
o cualquier archivo de 03 Front/.
"""

import functools
import html as html_std
import re
import shutil
import subprocess
import sys
import tempfile
import pathlib

BASE = pathlib.Path(__file__).parent
PRD = BASE / "Calibrar_PRD_v3_jul2026.md"
MTZ = BASE / "Calibrar_Matriz_Exhaustiva_de_Cruces_v1.txt"
ANX = BASE / "Calibrar_AnexoG_Extendido_v3.1.md"
# El evaluador es el artefacto que decide si una corrida es apta, y hasta el 1-ago-2026
# estuvo fuera del alcance de este QA. Ahí sobrevivieron nueve defectos del tipo exacto que
# este script existe para cazar: la escala vieja E0-E6, nombres de área desincronizados y
# tres invariantes que no podían fallar nunca.
EVA = BASE / "evaluar_salida.py"
# El Blackbox dev set: el único artefacto que mide si el motor generaliza en vez de haber
# aprendido los ocho casos escritos a mano. Su oráculo es una segunda implementación de
# <ruteo_de_area>, así que tiene que mantenerse sincronizado con el prompt.
BBX = BASE / "blackbox_calibrar.py"
# El runner: el único artefacto que gasta dinero real. Sus parámetros de API tienen que
# seguir al PRD §5.5, y los que fueron eliminados de estos modelos devuelven error 400.
RUN = BASE / "correr_motor.py"
# Las 11 cuentas reales de Casos Exito/. Su clasificación es el único set con
# verdad-de-terreno validada por resultado, y tiene que seguir a la Cadena vigente.
REA = BASE / "casos_reales.py"
# El runner: el único artefacto que gasta dinero real. Sus parámetros de API tienen que
# seguir al PRD §5.5, y los que fueron eliminados de estos modelos devuelven error 400.
RUN = BASE / "correr_motor.py"
# Las 11 cuentas reales de Casos Exito/. Su clasificación es el único set con
# verdad-de-terreno validada por resultado, y tiene que seguir a la Cadena vigente.
REA = BASE / "casos_reales.py"
# Las 11 cuentas reales de Casos Exito/. Su clasificación es el único set con
# verdad-de-terreno validada por resultado, y tiene que seguir a la Cadena vigente.
REA = BASE / "casos_reales.py"
# ── El build de presentación (Calibrar/03 Front/) ────────────────────────────
# Desde el 6-ago-2026 presentacion.html es el ÚNICO archivo autorizado para
# proyectarse frente a un prospecto. Hasta ese día el front estaba enteramente
# fuera del alcance de este QA, y lo que apareció al auditarlo a mano es el
# defecto característico del proyecto: la anonimización del nombre del cliente
# vivía sólo en el helper txt(), mientras ~18 rutas de render llamaban a
# escP() directo. No se filtraba nada por casualidad —por dónde habían caído
# los datos—, no porque el código lo garantizara. La verificación era abrir el
# archivo en un navegador y mirar el DOM: exactamente lo que estas
# verificaciones automatizan.
FRONT = BASE.parent / "03 Front"
PHTML = FRONT / "presentacion.html"
PJS = FRONT / "assets" / "presentacion.js"
DJS = FRONT / "assets" / "data.js"

VERDE, ROJO, GRIS, NEGRITA, FIN = "\033[92m", "\033[91m", "\033[90m", "\033[1m", "\033[0m"


def cargar():
    faltan = [f.name for f in (PRD, MTZ, ANX, EVA, BBX, RUN, REA, PHTML, PJS, DJS)
              if not f.exists()]
    if faltan:
        sys.exit(f"{ROJO}No encuentro: {', '.join(faltan)}{FIN}")
    # El grupo PRESENTACIÓN no lee el front: lo EJECUTA y mira lo que emite. Sin
    # node esas verificaciones pasarían en verde sin haber mirado nada, que es
    # justo el modo de fallar que este QA existe para impedir.
    if not shutil.which("node"):
        sys.exit(f"{ROJO}No encuentro node: el grupo PRESENTACIÓN renderiza el "
                 f"build para verificar qué emite, y sin node no puede correr.{FIN}")
    return (PRD.read_text(encoding="utf-8"),
            MTZ.read_text(encoding="utf-8"),
            ANX.read_text(encoding="utf-8"),
            EVA.read_text(encoding="utf-8"),
            BBX.read_text(encoding="utf-8"),
            RUN.read_text(encoding="utf-8"),
            REA.read_text(encoding="utf-8"),
            PHTML.read_text(encoding="utf-8"),
            PJS.read_text(encoding="utf-8"),
            DJS.read_text(encoding="utf-8"))


def entre(texto, ini, fin):
    a = texto.find(ini)
    b = texto.find(fin, a + 1) if a >= 0 else -1
    return texto[a:b] if a >= 0 and b > a else ""


# ── Archivo de obsoletos de Calibrar ─────────────────────────────────────────
# Los nombres son los que el LEEME declara archivados el 28-jul-2026. Se listan
# a mano a propósito: son una decisión de producto, no un patrón deducible, y
# lo que hay que cazar es justamente que uno reaparezca fuera del archivo.
SUPERADOS = (
    "Calibrar_Instrucciones_Proyecto_v2.2.1.md",
    "Calibrar_PRD_v2_HerramientaInterna_jul2026.md",
    "Calibrar_System_Prompt_Maestro_v1.md",
    "Calibrar_Caso_Prueba_ContaBoost.md",
    "Calibrar_Investigacion_Mercado_Precio.txt",
    "Calibrar_PRD_DRIVE_2026-08-17.md",
)
ARCHIVO = BASE.parent / "_Archivo obsoleto"


def archivados():
    """Nombres de archivo dentro de _Archivo obsoleto/, sin el LEEME."""
    if not ARCHIVO.is_dir():
        return []
    return [p.name for p in ARCHIVO.iterdir()
            if p.is_file() and p.name != "LEEME.md" and not p.name.startswith(".")]


def sueltos_superados():
    """Documentos superados que reaparecieron en una carpeta viva de Calibrar."""
    fuera = []
    for p in BASE.parent.rglob("*"):
        if not p.is_file() or "_Archivo obsoleto" in p.parts:
            continue
        if p.name in SUPERADOS:
            fuera.append(str(p.relative_to(BASE.parent)))
    return fuera


# ══ El build de presentación: qué llega REALMENTE a la pantalla ═══════════════
# Mirar el texto de data.js no sirve para esto y llevaría a la conclusión
# contraria: data.js trae procedencia: 'verbatim', reasoning con E1–E7 y el
# nombre del cliente seis veces. Nada de eso se proyecta, porque presentacion.js
# no renderiza esos campos. Al revés, un campo inocente movido a una ruta que
# renderiza sí se proyecta. La única pregunta que importa es qué sale a la vista,
# y para responderla hay que ejecutar el render.

# Micro-DOM: sólo lo que presentacion.js toca. Captura cada innerHTML asignado.
ARNES_JS = r"""
const vm = require('node:vm');
const fs = require('node:fs');
const nodos = new Map();
function nodo(sel) {
  if (!nodos.has(sel)) nodos.set(sel, {
    _h: '', get innerHTML() { return this._h; }, set innerHTML(v) { this._h = String(v); }
  });
  return nodos.get(sel);
}
let arranque = null;
const caja = {
  document: {
    querySelector: nodo, getElementById: nodo, querySelectorAll: () => [],
    addEventListener: (ev, cb) => { if (ev === 'DOMContentLoaded') arranque = cb; }
  },
  window: {}, console
};
caja.globalThis = caja;
const ctx = vm.createContext(caja);
const [, , fData, fPres] = process.argv;
/* Dos runInContext sobre el mismo contexto = los dos <script> de la página:
   los const de data.js quedan en el scope léxico global y presentacion.js
   los ve, igual que en el navegador. */
vm.runInContext(fs.readFileSync(fData, 'utf8'), ctx, { filename: 'data.js' });
vm.runInContext(fs.readFileSync(fPres, 'utf8'), ctx, { filename: 'presentacion.js' });
if (!arranque) throw new Error('presentacion.js no registro DOMContentLoaded');
arranque();
process.stdout.write([...nodos.values()].map(n => n.innerHTML).join('\n'));
"""


@functools.lru_cache(maxsize=32)
def renderizar(djs, pjs):
    """Corre data.js + presentacion.js en un micro-DOM y devuelve el HTML emitido.

    Devuelve "" si el render falla. Eso es deliberado: la prueba de mutación pasa
    artefactos vacíos, y ahí el render TIENE que quedar vacío para que las
    verificaciones de este grupo se pongan en rojo en vez de pasar por ausencia.
    """
    with tempfile.TemporaryDirectory() as tmp:
        d = pathlib.Path(tmp)
        (d / "arnes.js").write_text(ARNES_JS, encoding="utf-8")
        (d / "data.js").write_text(djs, encoding="utf-8")
        (d / "presentacion.js").write_text(pjs, encoding="utf-8")
        try:
            r = subprocess.run(["node", str(d / "arnes.js"),
                                str(d / "data.js"), str(d / "presentacion.js")],
                               capture_output=True, text=True, timeout=30)
        except (OSError, subprocess.SubprocessError):
            return ""
        return r.stdout if r.returncode == 0 else ""


def a_texto(marcado):
    """Marcado → lo que un prospecto lee en la pantalla proyectada.

    Los tags se sustituyen por un separador (y no se borran) para que dos textos
    de elementos distintos no se peguen en una falsa oración. title y alt se
    conservan aparte: no están en el flujo del documento, pero se ven.
    """
    marcado = re.sub(r"<!--.*?-->", " · ", marcado, flags=re.S)
    marcado = re.sub(r"<(script|style)\b[^>]*>.*?</\1\s*>", " · ", marcado, flags=re.S | re.I)
    atributos = " · ".join(re.findall(r'\b(?:title|alt|placeholder)="([^"]*)"', marcado))
    cuerpo = re.sub(r"<[^>]+>", " · ", marcado)
    return re.sub(r"[ \t]+", " ", html_std.unescape(cuerpo + " · " + atributos))


# El límite duro de la regla MÉTODO/MOTOR es el ATRIBUTO aplicado al diagnóstico,
# no la palabra suelta. Recomendarle al cliente que deje tres preguntas
# frecuentes respondidas automáticamente es una solución legítima y está en el
# entregable de ejemplo; describir el informe como automático es el bluffing que
# Pablo prohibió. Por eso se busca sujeto + atributo en la MISMA oración, y no
# cada palabra por su cuenta: buscar "automátic" a secas marcaría las dos
# apariciones legítimas y empujaría a borrarlas, que es empeorar el entregable
# para callar al QA.
SUJETO_DIAGNOSTICO = re.compile(
    r"diagn[oó]stic\w*|informe|an[aá]lisis|reporte|entregable|m[eé]todo|"
    r"Calibrar|herramienta|documento", re.I)
ATRIBUTO_PROHIBIDO = re.compile(
    r"automat\w*|autom[aá]tic\w*|\bcon IA\b|\bde IA\b|\bIA\b|inteligencia artificial|"
    r"instant[aá]ne\w*|al instante|al toque|en el acto|en segundos|"
    r"\b[lL]o procesa\b|\b[lL]a procesa\b|autogener\w*", re.I)


def promesas_de_automatismo(vista):
    """Oraciones donde el atributo prohibido cae sobre el diagnóstico."""
    return [o.strip() for o in re.split(r"[.;!?·\n]+", vista)
            if SUJETO_DIAGNOSTICO.search(o) and ATRIBUTO_PROHIBIDO.search(o)]


def construir(prd, mtz, anx, eva, bbx, run, rea, phtml, pjs, djs):
    prompt = entre(prd, "# Anexo E", "# Anexo F")
    rol = entre(prompt, "<rol>", "</rol>")
    ctx = entre(prompt, "<contexto_preguntas>", "</contexto_preguntas>")
    ruteo = entre(prompt, "<ruteo_de_area>", "</ruteo_de_area>")
    proceso = entre(prompt, "<proceso_de_razonamiento>", "</proceso_de_razonamiento>")
    matriz_p = entre(prompt, "<matriz_exhaustiva_de_cruces>", "</matriz_exhaustiva_de_cruces>")
    borde = entre(prompt, "<casos_borde>", "</casos_borde>")
    salida = entre(prompt, "<formato_salida>", "</formato_salida>")
    anexoF = prd[prd.find("# Anexo F"):prd.find("# Anexo G")]

    db_prosa = sorted({int(x) for x in re.findall(r"DB-(\d+)", prd)})
    db_prompt = sorted({int(x) for x in re.findall(r"\bDB(\d+)\b", prd)})

    # ── Lo que el evaluador declara, para contrastarlo con el PRD ──────────
    db_eva = sorted({int(x) for x in re.findall(r'"DB-(\d+)', eva)})
    # eslabon_dominante de cada caso dorado del PRD (los JSON de los Anexos G, H, I) y de las
    # tablas "| eslabon_dominante | **n** |" del Anexo J.
    # El backtick es opcional a propósito: el Anexo J escribe la fila como
    # "| `eslabon_dominante` | **2** |", con el nombre del campo entre backticks, y sin
    # contemplarlo el regex devolvía CERO coincidencias — o sea la cobertura de E2, E3,
    # E4, E6 y E7 quedaba invisible y el chequeo fallaba con los cinco casos presentes.
    # Se descubrió el 8-sep-2026 al restituir el Anexo J desde el respaldo del 17-ago.
    dom_prd = sorted({int(x) for x in re.findall(r'"eslabon_dominante":\s*(\d+)', prd)}
                     | {int(x) for x in re.findall(
                         r"eslabon_dominante`?\s*\|\s*\*\*(\d+)\*\*", prd)})
    dom_eva = sorted({int(x) for x in re.findall(
        r'"eslabon_dominante":\s*(\d+)', eva)})
    cadena = re.findall(r'"eslabon":\s*(\d)', salida)
    grupos_mtz = re.findall(r"^GRUPO ([A-M]) —", mtz, re.M)
    grupos_prompt = sorted(set(re.findall(r"GRUPO ([A-M])", matriz_p)))

    # ── Build de presentación: análisis del cuello + lo que emite de verdad ───
    # 1) El cuello. Toda declaración que arme el mapa de escape HTML es una
    #    función de escape a la vista; si alguna no llama a anon(), existe una
    #    ruta por la que un texto sale sin anonimizar. Ese fue el defecto.
    # Sin comentarios: lo que dice un comentario no se ejecuta, y el comentario
    # que explica el defecto lo nombra — analizarlo daría el resultado al revés.
    pjs_codigo = re.sub(r"/\*.*?\*/", "", pjs, flags=re.S)
    pjs_codigo = re.sub(r"(?m)(?<![:/])//.*$", "", pjs_codigo)
    # Cada declaración de nivel superior con su cuerpo completo: se corta en la
    # siguiente. Recortar por línea rompería el check si alguien parte escP en
    # varias líneas, y un guardarraíl que se cae al reformatear termina apagado.
    decls = re.findall(r"^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)\s*[=(](.*?)"
                       r"(?=^(?:const|let|var|function)\s|\Z)", pjs_codigo, re.M | re.S)
    escapes = [(n, cuerpo) for n, cuerpo in decls if "&amp;" in cuerpo]
    anonimizadores = {n for n, cuerpo in escapes if "anon(" in cuerpo}
    # Alias del tipo const txt = escP; — heredan la garantía del original.
    for alias, original in re.findall(
            r"const\s+([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\s*;", pjs_codigo):
        if original in anonimizadores:
            anonimizadores.add(alias)
    # Todo identificador llamado dentro de una interpolación ${…} emite a la
    # pantalla. Los que no son escapes tienen que estar declarados acá: NO
    # transportan texto de la cuenta (dd formatea un número; cadenaPresentacion
    # devuelve HTML ya escapado por escP). Un emisor nuevo sin declarar deja el
    # check en rojo, que es el sentido de la lista.
    no_textuales = {"dd", "cadenaPresentacion"}
    emisores = set(re.findall(r"\$\{\s*([A-Za-z_$][\w$]*)\s*\(", pjs_codigo))
    # El patrón del nombre real se LEE de presentacion.js en vez de copiarse:
    # si alguien lo debilita ahí, este QA se entera.
    m_cliente = re.search(r"const\s+CLIENTE_REAL\s*=\s*/(.+?)/([gimsuy]*)\s*[;,]", pjs_codigo)
    re_cliente = re.compile(m_cliente.group(1), re.I) if m_cliente else None
    banderas_cliente = m_cliente.group(2) if m_cliente else ""

    # 2) Lo que emite. El render corre de verdad; a eso se le suma la prosa
    #    estática de presentacion.html, que también se proyecta.
    render = renderizar(djs, pjs)
    vista = a_texto(phtml) + "\n · \n" + a_texto(render)
    # Ancla anti-verde-vacío: si el render se cae, vista queda con sólo el HTML
    # estático y las verificaciones de ausencia de abajo pasarían sin haber mirado
    # el entregable. Todas exigen render_ok por eso.
    render_ok = all(m in render for m in
                    ("Bloque 0 · Ruteo", "Bloque 1 · Data", "Bloque 2 · Hipótesis",
                     "Bloque 3 · Soluciones", "Bloque 4 · Plan por etapas"))

    return [
        # ── El motor puede ejecutar el modelo ──────────────────────────────
        ("MOTOR", "El rol define crecimiento comercial, no pauta",
         "NO eres un diagnosticador de pauta" in rol),
        # Las dos de abajo se pidieron el 1-ago-2026 y entraron el 28-ago. Existen porque
        # el <rol> abría bien —"NO eres un diagnosticador de pauta"— y se contradecía dos
        # líneas después: la verificación de arriba busca la frase POSITIVA y pasaba en
        # verde con el defecto puesto. Cinco semanas, y el bloque ya corría contra la API.
        ("MOTOR", "El rol no describe al motor como analista de medios pagados",
         "analista de medios pagados" not in prompt
         and "invierte en Meta Ads o Google Ads" not in prompt),
        ("MOTOR", "Le escribe a los CUATRO arquetipos, no a dos",
         "uno de dos arquetipos" not in prompt
         and all(a in entre(prompt, "<a_quien_le_escribes>", "</a_quien_le_escribes>")
                 for a in ("RODRIGO", "CAROLINA", "IGNACIO", "MARCELO"))),
        ("MOTOR", "El arquetipo entra como dato y el motor no lo infiere",
         "<arquetipo>" in prd and "no_determinado" in prd),
        ("MOTOR", "E1 Criterio declarado en el bloque de ruteo",
         "E1 Criterio y foco comercial" in ruteo),
        ("MOTOR", "Regla de precedencia de E1 Criterio presente",
         "E1 ES EL PRIMER ESLABÓN" in ruteo),
        ("MOTOR", "El rango de eslabón es 1 a 7",
         "entero de 1 a 7" in prd),
        ("MOTOR", "El array 'cadena' del esquema parte en 1",
         bool(cadena) and cadena[0] == "1"),
        ("MOTOR", "Los 7 eslabones en el esquema de salida",
         cadena[:7] == list("1234567")),
        ("MOTOR", "El triage declarado como T1-T14",
         "T1-T14" in ruteo),

        # ── Contrato de datos: sin esto el modelo es inejecutable ──────────
        ("CONTRATO", "Anexo F transporta el triage t1..t14",
         "t1_origen_cliente" in anexoF and "t14_criterio_demostrable" in anexoF),
        ("CONTRATO", "Anexo F transporta señales externas s1..s10",
         "s1_pauta_activa" in anexoF and "s10_velocidad_movil" in anexoF),
        ("CONTRATO", "Anexo F transporta el bloque de área",
         "q17_criterio_90_dias" in anexoF),
        ("CONTRATO", "Regla: sin triage no se rutea (no asume E2)",
         "no puede rutear" in anexoF.lower()),
        ("CONTRATO", "El prompt describe los cuatro bloques de insumo",
         all(k in ctx for k in ("<triage>", "<bloque_area>", "<senales_externas>"))),
        ("CONTRATO", "El prompt mapea cada t a su eslabón",
         "t13 criterio escrito (E1)" in ctx),

        # ── Cobertura: cruces para los 7 eslabones ────────────────────────
        ("COBERTURA", "Matriz completa y ordenada A–M",
         grupos_mtz == list("ABCDEFGHIJKLM")),
        ("COBERTURA", "El prompt lleva los 13 grupos de la Matriz",
         set("ABCDEFGHIJKLM") <= set(grupos_prompt)),
        ("COBERTURA", "El proceso incluye el paso de ruteo",
         "PASO 1 — RUTEO" in proceso),
        ("COBERTURA", "El proceso enruta al grupo por eslabón",
         "E1 → GRUPO M" in proceso),
        ("COBERTURA", "El proceso cierra verificando invariantes",
         "DB1 a DB17" in proceso),
        ("COBERTURA", "Los 7 eslabones tienen caso dorado",
         all(f"### J.{i}" in prd for i in (1, 2, 3, 4))
         and "# Anexo I" in prd and "# Anexo H" in prd and "# Anexo G" in prd),
        ("COBERTURA", "Bloque profundo de E1 Criterio (17 preguntas)",
         "Bloque E1" in prd and "**Q17**" in prd),

        # ── Casos borde del modelo de ruteo ───────────────────────────────
        ("BORDE", "Eslabón indeterminable → declarar, no inventar",
         "no se puede determinar el eslabón dominante" in borde),
        ("BORDE", "P1-P28 sin triage → pedir el triage",
         "sin <triage>" in borde),
        ("BORDE", "Sin pauta activa NO es fuera de perfil",
         "NO es fuera de perfil" in borde),
        ("BORDE", "Volumen alto + conversión cero = E1 Criterio",
         "Es E1, no E3" in borde),
        ("BORDE", "Setup correcto → decirlo, no fabricar problemas",
         "No fabriques problemas" in borde),

        # ── Dashboard y plan por etapas ───────────────────────────────────
        # db_prosa == db_prompt comparaba dos listas derivadas sin exigir que existieran:
        # con ambas vacías la igualdad se cumple y el check pasaba en verde. Lo destapó
        # qa_mutacion.py el 2-ago-2026. Exigir contenido lo vuelve falsificable.
        ("SALIDA", "Numeración DB alineada prosa ↔ prompt",
         bool(db_prosa) and db_prosa == db_prompt),
        ("SALIDA", "Las 17 invariantes DB existen",
         db_prosa == list(range(1, 18))),
        ("SALIDA", "Bloque 4 en el esquema del prompt",
         "bloque_4_etapas" in salida),
        ("SALIDA", "Etapas con contenido real en los casos dorados",
         len(re.findall(r'"por_que_primero":\s*"(?!OBLIGATORIO)', prd)) >= 6),
        ("SALIDA", "La etapa 1 nunca la factura Precisión",
         "NUNCA es un servicio facturable" in prd),
        ("SALIDA", "Prohibida la negación seca en el veredicto",
         "PROHIBIDO cerrar con \"no necesitas marketing\"" in prd),
        ("SALIDA", "Checklist §6.2 cubre el bloque 4",
         "Checklist del bloque 4" in prd),

        # ── Coherencia del documento ──────────────────────────────────────
        # Este check buscaba la cadena literal en minúscula. Pasaba en verde mientras el
        # §5.0 declaraba "6 eslabones (E2–E7)" en dígito — la escala vieja, viva en la
        # descripción del modelo. Ahora cubre mayúsculas, dígito y el rango E2–E7.
        ("DOC", "Sin rastros de la Cadena de 6 eslabones (E2–E7)",
         not re.search(r"(seis|6)\s+eslabones\s*\(?\s*E2", prd, re.I)
         and not re.search(r"^\|\s*\*\*Nivel 1.*E2[–-]E7", prd, re.M)),
        # v5.5: el inventario pasó de 103 a 115 al sumarse el núcleo de negocio
        # (N1–N7) y la mitad declarativa de competencia (M1–M5).
        ("DOC", "Inventario de preguntas actualizado (115)",
         "**115**" in prd),

        # ── v5.5 · Núcleo de negocio, competencia y anclas B2B ────────────────
        # Cada uno de estos existe porque la v5.5 agregó especificación nueva, y
        # el defecto reincidente de este proyecto es escribir la regla en la prosa
        # y no en el prompt, que es lo único que se ejecuta.
        ("DOC", "Núcleo de negocio N1–N7 especificado (§5.1.2)",
         "### 5.1.2 Núcleo de negocio" in prd and "**N7**" in prd),
        ("DOC", "N7 concentración de cartera es la única nueva",
         re.search(r"\|\s*\*\*N7\*\*.*\|\s*\*\*nueva\*\*\s*\|", prd) is not None),
        ("PROMPT", "El prompt recibe el núcleo de negocio",
         "<nucleo_negocio>      n1..n7" in prompt),
        ("PROMPT", "El prompt sabe que el núcleo NO rutea",
         "NO RUTEAN: califican el diagnóstico, no lo eligen" in prompt),
        ("PROMPT", "Sin núcleo, el motor declara que el diagnóstico es del canal",
         "diagnóstico del canal y no del negocio" in prompt),
        ("PROMPT", "n6 acota el volumen que se puede prometer",
         "NUNCA propongas una solución que entregue más volumen del que n6" in prompt),

        ("DOC", "Competencia especificada como transversal (§5.1.3)",
         "### 5.1.3 Competencia y mercado" in prd and "**M5**" in prd),
        ("DOC", "Competencia declarada NO-eslabón en el PRD",
         "**La competencia no es un eslabón**" in prd),
        ("PROMPT", "El prompt prohíbe competencia como área recomendada",
         "area_recomendada JAMÁS puede" in prompt and "ser competencia" in prompt),
        ("PROMPT", "m3 en N/D se trata como hallazgo, no como vacío",
         "NO ES UN VACÍO, ES UN HALLAZGO" in prompt),
        ("PROMPT", "sc1 no descalifica: misma regla que t4",
         "no pautar no descalifica a nadie" in prompt),
        ("DOC", "La mitad observable no cuesta tiempo de reunión",
         "SC5" in prd and "no cuestan tiempo de reunión" in prd),

        ("DOC", "Anclas de negocio B2B con su hueco declarado (§5.2.1)",
         "#### 5.2.1 Las anclas de negocio B2B" in prd and "**Sin fuente**" in prd),
        ("DOC", "Las anclas sin fuente NO se rellenaron",
         prd.count("| **Sin fuente** |") == 4),
        ("PROMPT", "El prompt puede reportar sin calificar cuando falta el ancla",
         "Reportar sin calificar es\n  correcto" in prompt
         or "Reportar sin calificar es correcto" in prompt),

        # Corregido el 6-ago-2026: el total era 29 y contaba desde el triage, dejando
        # fuera los 3 minutos de preguntas 0 que la Guía §4.1 declara obligatorios.
        # El presupuesto medía el instrumento, no la reunión. Ahora se exige además
        # que el tramo de apertura esté en la tabla: verificar solo el total dejaría
        # pasar un 32 mal repartido.
        ("DOC", "Presupuesto de reunión repartido y completo (§5.7.10)",
         "### 5.7.10 El presupuesto de 30 minutos" in prd
         and "| **Total** | **32** |" in prd
         and "| Preguntas 0 | **3** |" in prd),
        ("DOC", "Regla de corte cuando la reunión se va larga",
         "se corta el bloque del área dominante" in prd
         and "Nunca se sacrifica el cierre" in prd),
        ("DOC", "Núcleo de 10 del bloque de pauta definido",
         "Núcleo de 10 para la reunión de 30 minutos" in prd),
        # La regla vive en la tabla del §5.7.10, donde el código de pregunta va entre
        # comillas invertidas. Hasta el 7-sep-2026 esta verificación exigía la frase sin
        # ellas, y por eso solo la satisfacía el texto reconstruido del Anexo E: al reponer
        # el Anexo E original se puso roja sin que faltara nada. Un QA que fija la
        # redacción de una reconstrucción deja de auditar el documento y empieza a
        # auditarse a sí mismo.
        ("DOC", "El núcleo de 10 no sacrifica P28",
         "P28 es la pregunta más importante del formulario y no se sacrifica nunca"
         in prd.replace("`", "")),
        ("DOC", "Los tres bloques nuevos están en el contrato del Anexo F.2",
         "<nucleo_negocio>" in prd and "<competencia>" in prd and "<senales_competencia>" in prd),
        ("DOC", "Anexo C coherente (14 triage · 13 grupos · 5 bloques)",
         "**14** (T1–T14)" in prd and "**13 (A–M)**" in prd and "**5 (0 a 4)" in prd),
        ("DOC", "Decisión #9 corregida (ICP no es solo clínicas)",
         "REVISADA en la v5.0" in prd),
        # Mira DENTRO de §2.3, no el documento entero. Hasta el 8-sep-2026 evaluaba
        # `"Ignacio" in prd and "Marcelo" in prd` y por eso pasaba en verde con §2.3
        # listando SOLO a Rodrigo y Carolina: encontraba los dos nombres 1.600 líneas
        # más abajo, en el Anexo E. La reconstrucción del 6-sep repuso una §2.3 de dos
        # arquetipos y este chequeo —que existe para eso— no la vio.
        ("DOC", "Los 4 arquetipos en §2.3",
         all(n in entre(prd, "### 2.3 Arquetipos oficiales", "### 2.4 ")
             for n in ("Rodrigo", "Carolina", "Ignacio", "Marcelo"))),
        # §2.4 es el criterio de descarte, y su modo de falla es volver al de la v3.x.
        # «Sin pauta activa» dejó de descalificar el 28-jul-2026 (§5.0.3): es dato de
        # ruteo. Que reaparezca como exclusión es la regresión que hay que cazar.
        ("DOC", "§2.4 no descarta por falta de pauta ni por captar por licitación",
         "Ya NO son criterio de descarte" in entre(prd, "### 2.4 ", "### 2.5 ")
         and "Empresas sin pauta activa ·" not in prd),
        # El sitio es la fuente de la numeración pública. Si index.html no está,
        # el check FALLA en vez de pasar en vacío: un guardarraíl que no puede
        # fallar no sirve de nada.
        ("DOC", "Numeración alineada con el sitio (01 a 07)",
         (BASE.parent.parent / "index.html").exists()
         and "01 · Criterio" in (BASE.parent.parent / "index.html").read_text(encoding="utf-8", errors="replace")),
        # El PRD usa taquigrafía E1–E7; debe declarar su equivalencia con la
        # escala pública 01–07, o la notación interna se lee como deriva.
        ("DOC", "El PRD declara la equivalencia E1–E7 ≡ 01–07",
         "E1…E7 ≡ 01…07" in prd and "01 · Criterio" in prd),
        ("DOC", "Anexo G Extendido con nota de vigencia",
         "Actualización tras el QA" in anx),

        # ── El archivo de obsoletos, que hasta el 8-sep-2026 no vigilaba nadie ────
        # La restitución del 6-sep repuso en carpetas vivas CINCO documentos
        # archivados el 28-jul —incluido el que CLAUDE.md prohíbe citar por nombre— y
        # nada lo detectó: un respaldo restaura el estado del disco, no las decisiones
        # que se tomaron después. `qa_transelec.py` ya hacía este chequeo para su
        # carpeta; ésta es su gemela para Calibrar.
        ("ARCHIVO", "Ningún documento superado quedó suelto en carpeta viva",
         not sueltos_superados()),
        ("ARCHIVO", "Todo lo archivado lleva su marca [SUPERADO …] en el nombre",
         all(f.startswith("[SUPERAD") for f in archivados())),
        ("ARCHIVO", "El LEEME del archivo existe y concilia lo que la carpeta contiene",
         (BASE.parent / "_Archivo obsoleto" / "LEEME.md").exists()
         and "Qué contiene realmente esta carpeta hoy"
             in (BASE.parent / "_Archivo obsoleto" / "LEEME.md").read_text(
                 encoding="utf-8", errors="replace")),

        # ── El evaluador: el artefacto que decide si una corrida es apta ───
        # Estas verificaciones no existían hasta el 1-ago-2026. Su ausencia es la causa raíz
        # de los defectos que se corrigieron ese día.
        ("EVALUADOR", "Rango de eslabón 1 a 7, no la escala vieja E0–E6",
         "1 <= b0[\"eslabon_dominante\"] <= 7" in eva
         and "0 <= b0[\"eslabon_dominante\"] <= 6" not in eva),
        ("EVALUADOR", "Las 17 invariantes DB implementadas",
         db_eva == list(range(1, 18))),
        ("EVALUADOR", "Nombres de área alineados con la Cadena del PRD",
         all(f'"{a}"' in eva for a in
             ("Estrategia y diagnóstico", "Contenido y RRPP", "Paid Media y SEO",
              "Desarrollo web", "Automatización y agentes", "RPA y procesos",
              "Capacitación y adopción"))),
        ("EVALUADOR", "DB-12 compara contra el nombre canónico del área",
         '!= "Capacitación y adopción"' in eva),
        ("EVALUADOR", "Ningún eslabon_dominante del evaluador fuera de 1–7",
         bool(dom_eva) and all(1 <= n <= 7 for n in dom_eva)),
        ("EVALUADOR", "Los casos del evaluador existen en el PRD",
         bool(dom_eva) and set(dom_eva) <= set(dom_prd)),
        # Esta es la verificación de cobertura REAL. La de arriba ("Los 7 eslabones tienen
        # caso dorado") solo comprueba que existan los anexos, no qué eslabón cubre cada uno:
        # pasa en verde con E3 sin caso dorado. Esta lo detecta.
        ("EVALUADOR", "Los 7 eslabones tienen caso dorado con salida esperada",
         set(dom_eva) == set(range(1, 8))),
        # Taxonomía de pilares — resuelta el 2-ago-2026 a favor de la Cadena. El esquema del
        # Anexo E traía el vocabulario del catálogo de servicios, que ningún caso dorado usaba.
        ("EVALUADOR", "El esquema de pilar_precision usa el vocabulario de la Cadena",
         '"pilar_precision": "Estrategia y diagnóstico' in prd
         and '"pilar_precision": "Consultoría' not in prd),
        ("EVALUADOR", "Ningún pilar_precision compuesto en los casos dorados",
         not re.search(r'"pilar_precision":\s*"[^"|]+\s\+\s', prd)),
        ("EVALUADOR", "Los pilares del evaluador son los 7 de la Cadena + ninguno",
         all(f'"{a}"' in eva for a in ("Estrategia y diagnóstico", "RPA y procesos"))
         and "PILARES = AREAS | {\"ninguno\"}" in eva),

        # ── Blackbox dev set: ¿el motor generaliza o aprendió los ocho? ────
        # El oráculo es una SEGUNDA implementación de <ruteo_de_area>. Si el prompt cambia y
        # el oráculo no, el Blackbox mide contra una regla que ya no rige — y lo haría en
        # silencio, que es la peor forma de fallar para un instrumento de medición.
        ("BLACKBOX", "La regla de subsunción E4→E5 está en el bloque de ruteo",
         "SUBSUNCIÓN DE E4 EN E5" in ruteo),
        ("BLACKBOX", "El oráculo implementa la subsunción E4→E5",
         "def e4_subsumido_en_e5" in bbx),
        ("BLACKBOX", "El oráculo cubre los 8 casos dorados escritos a mano",
         len(re.findall(r'"[GHIJ][.\d ·]*·? ?E\d[^"]*":\s*\(dict', bbx)) >= 8),
        ("BLACKBOX", "Las áreas del oráculo son las 7 de la Cadena",
         all(f'"{a}"' in bbx for a in
             ("Estrategia y diagnóstico", "Contenido y RRPP", "Paid Media y SEO",
              "Desarrollo web", "Automatización y agentes", "RPA y procesos",
              "Capacitación y adopción"))),
        ("BLACKBOX", "El set se genera con semilla fija (reproducible)",
         "SEMILLA = " in bbx),
        ("BLACKBOX", "evaluar() no imprime casos individuales",
         "Esto dice QUÉ se confunde, no por qué" in bbx),

        # ── El runner: lo único que gasta plata ────────────────────────────
        ("RUNNER", "No envía parámetros eliminados del modelo (400)",
         not re.search(r"^\s*(temperature|top_p|top_k)\s*=", run, re.M)),
        ("RUNNER", "Modelo y effort según PRD §5.5",
         'MODELO = "claude-sonnet-5"' in run and 'EFFORT = "low"' in run),
        ("RUNNER", "Caché de prompt con TTL de 1 h sobre el system prompt",
         '"cache_control": {"type": "ephemeral", "ttl": "1h"}' in run),
        ("RUNNER", "No gasta sin --confirmar explícito",
         '"--confirmar" not in args' in run),
        ("RUNNER", "El system prompt sale del Anexo E sin interpolar nada",
         'prd.find("# Anexo E")' in run),

        # ── Cuentas reales: el único set con verdad-de-terreno validada ────
        ("REALES", "Medición declarada como modificador transversal",
         "MEDICIÓN — MODIFICADOR TRANSVERSAL" in ruteo
         and "s2_pixel_gtm" in ruteo),
        # El prompt va con saltos de línea a ~95 columnas, así que las frases se parten.
        # Normalizar antes de buscar; si no, el check falla por formato y no por contenido.
        ("REALES", "La medición nunca puede ser el eslabón dominante",
         "NUNCA lo conviertas en el eslabón dominante" in " ".join(ruteo.split())),
        ("REALES", "El triage sigue siendo T1-T14 (no se agregó una pregunta 15)",
         "**14** (T1–T14)" in prd and "t15" not in prd.lower()),
        ("REALES", "Separación mecánica entrada ↔ verdad en el extractor",
         '"_verdad"' in rea and "servicio contratado va del lado de la VERDAD"
         in rea.replace("`", "")),
        ("REALES", "Las 11 cuentas están clasificadas",
         len(re.findall(r'"cliente-\d+": dict\(', rea)) == 11),
        ("REALES", "Cada clasificación cita el ANTES que la sostiene",
         len(re.findall(r"cita=", rea)) == 11),
        # Defecto #16 — el enum de s2 no tenía valor para "existe pero mide mal", que es el
        # estado más peligroso (el dueño cree que mide) y el de dos casos reales.
        ("REALES", "s2_pixel_gtm admite 'detectado con errores'",
         "detectado con errores" in prd),
        ("REALES", "La regla de medición dispara con los DOS estados",
         '"no detectable" O "detectado con errores"' in " ".join(ruteo.split())),
        ("REALES", "El evaluador puede exigir la declaración de medición",
         "def medicion(" in eva and "MED-2" in eva),
        ("REALES", "El triage rellenado declara procedencia por campo",
         'TRIAGE = {' in rea and rea.count('"t') >= 5),
        ("REALES", "Registro de huecos con candidato y métrica de validación",
         "HUECOS = {" in rea and "metrica=" in rea),
        ("REALES", "Existe la plantilla de captura de casos nuevos",
         (BASE.parent.parent / "Casos Exito" / "PLANTILLA_CASO_DE_EXITO.md").exists()),

        # ── Canal de ejecución de la señal de medición ─────────────────────
        # Defecto #17 (2-ago-2026): la regla de medición leía s2_pixel_gtm, y ni el generador
        # lo producía ni el runner lo transmitía. Regla completa, canal inexistente — el
        # mismo defecto que el PRD documenta como el peor de sus QA anteriores. Estas tres
        # verificaciones existen para que no vuelva a pasar en silencio.
        ("CANAL", "El Blackbox genera la señal s2_pixel_gtm",
         '"s2_pixel_gtm": [' in bbx),
        ("CANAL", "El runner transmite <senales_externas> con s2",
         "senales_externas" in run and "s2_pixel_gtm" in run),
        ("CANAL", "La predicción tiene campo para declarar la medición",
         '"medicion"' in run and '"medicion"' in bbx),
        ("CANAL", "El Blackbox puntúa la medición aparte del ruteo",
         "Medición declarada" in bbx and "declara_medicion" in bbx),
        ("CANAL", "Hay prueba de humo de un comando para la primera señal",
         "--humo" in run and "EVALUACIÓN INMEDIATA" in run),
        # El QA se audita a sí mismo: qa_mutacion.py verifica que estas verificaciones
        # puedan ponerse en rojo. Un QA en verde no dice nada si no se sabe cuántos de sus
        # checks son capaces de fallar — que es el defecto que este proyecto repitió cinco
        # veces. Correr python3 qa_mutacion.py después de agregar cualquier verificación.
        ("CANAL", "Existe la prueba de mutación del propio QA",
         (BASE / "qa_mutacion.py").exists()),

        # ── El build de presentación: lo único que ve un prospecto ─────────
        # Alcance nuevo el 6-ago-2026. Las cinco primeras leen el código (dónde
        # está el filtro); las cinco siguientes ejecutan el render y miran lo
        # que sale. Las dos cosas hacen falta: el código puede estar bien y los
        # datos traer algo nuevo, y los datos pueden estar limpios hoy mientras
        # el código no garantiza que sigan estándolo mañana — que es
        # exactamente el estado en que se encontró el front.
        ("PRESENTACIÓN", "anon() reemplaza el nombre real por un genérico",
         bool(m_cliente) and "CLIENTE_ANON" in pjs
         and "const anon" in pjs and "replace(CLIENTE_REAL, CLIENTE_ANON)" in pjs),
        ("PRESENTACIÓN", "El patrón del cliente es global e insensible a mayúsculas",
         "g" in banderas_cliente and "i" in banderas_cliente),
        ("PRESENTACIÓN", "Toda función de escape a la vista pasa por anon()",
         bool(escapes) and all("anon(" in cuerpo for _, cuerpo in escapes)),
        ("PRESENTACIÓN", "Ningún emisor interpolado se salta el escape anonimizador",
         bool(emisores) and emisores <= (anonimizadores | no_textuales)),
        ("PRESENTACIÓN", "El build de presentación no carga el front interno",
         "assets/presentacion.js" in phtml
         and "app.js" not in phtml and "motor.js" not in phtml),

        ("PRESENTACIÓN", "El render emite el entregable completo (los 5 bloques)",
         render_ok),
        ("PRESENTACIÓN", "Lo proyectado no emite la taquigrafía E1–E7",
         render_ok and not re.search(r"(?<![A-Za-z0-9])E[1-7](?![0-9])", vista)),
        ("PRESENTACIÓN", "Lo proyectado no emite el nombre real del cliente",
         render_ok and re_cliente is not None and not re_cliente.search(vista)),
        ("PRESENTACIÓN", "Lo proyectado no emite vocabulario interno",
         render_ok and not re.search(r"\bPRD\b|prototipo|verbatim|invariante", vista, re.I)),
        # El límite duro de la regla MÉTODO/MOTOR: se promete un diagnóstico
        # hecho por una persona, con fecha. Nunca automático, con IA ni al toque.
        ("PRESENTACIÓN", "El diagnóstico no se promete automático, con IA ni instantáneo",
         render_ok and not promesas_de_automatismo(vista)),
        # Contracara de la anterior: la forma barata de dejarla en verde es
        # borrar las dos "automáticamente" legítimas —las respuestas de Business
        # Suite que se le RECOMIENDAN al cliente—, y eso empeora el entregable
        # para callar al QA. Esta verificación lo impide.
        ("PRESENTACIÓN", "Siguen las 2 automatizaciones recomendadas al cliente",
         len(re.findall(r"autom[aá]tic\w*", a_texto(render), re.I)) == 2),
    ]


def main():
    breve = "--breve" in sys.argv
    prd, mtz, anx, eva, bbx, run, rea, phtml, pjs, djs = cargar()
    res = construir(prd, mtz, anx, eva, bbx, run, rea, phtml, pjs, djs)
    fallos = [r for r in res if not r[2]]

    if not breve:
        print(f"\n{NEGRITA}QA CALIBRAR{FIN}  ·  {len(res)} verificaciones\n" + "─" * 62)
        grupo = None
        for g, desc, ok in res:
            if g != grupo:
                print(f"\n{GRIS}{g}{FIN}")
                grupo = g
            marca = f"{VERDE}✓{FIN}" if ok else f"{ROJO}✗{FIN}"
            print(f"  {marca} {desc}")

    print("\n" + "─" * 62)
    if fallos:
        print(f"{ROJO}{NEGRITA}{len(fallos)} de {len(res)} FALLAN{FIN}")
        for g, desc, _ in fallos:
            print(f"  {ROJO}✗{FIN} [{g}] {desc}")
        print(f"\n{GRIS}Los defectos de este tipo son siempre 'se cambió A y no B'.{FIN}")
        print(f"{GRIS}Revisa el prompt del Anexo E antes que la prosa: es lo que ejecuta.{FIN}")
        return 1

    print(f"{VERDE}{NEGRITA}{len(res)}/{len(res)} pasan{FIN}")
    print(f"{GRIS}PRD {len(prd.splitlines())} líneas · "
          f"Matriz {len(mtz.splitlines())} · Anexo G Ext {len(anx.splitlines())} · "
          f"presentación {len(renderizar(djs, pjs)):,} car. emitidos{FIN}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
