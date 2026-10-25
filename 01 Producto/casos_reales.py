#!/usr/bin/env python3
"""
Casos reales de Precisión — las 11 cuentas de `Casos Exito/` como set de validación.

Por qué existe: hasta el 2-ago-2026 el set dorado eran 3 cuentas reales y 5 arquetipos. La
carpeta `Casos Exito/` tenía 11 cuentas con estado inicial, intervención y RESULTADO, y nadie
la había mirado. Un diagnóstico que Precisión hizo con dinero en juego y que después funcionó
es verdad-de-terreno de un modo que un arquetipo nunca va a ser.

EL RIESGO QUE ESTO EVITA — leer esto antes de tocar nada:
Si el triage se rellena leyendo el documento completo, se está ajustando la entrada a una
respuesta ya conocida. Eso es fuga de información: da 100% de acierto falso y destruye el
valor del set. Por eso la separación es MECÁNICA y está en el código:

    ENTRADA  = empresa · industria · tamaño · bloque ANTES
    VERDAD   = servicio contratado · qué hicimos · resultado · testimonio

`servicio contratado` va del lado de la VERDAD aunque esté en el encabezado: es la respuesta,
no el enunciado.

CONSECUENCIA IMPORTANTE: estos casos son EYEBALL, no Blackbox. Alguien los leyó para
clasificarlos. Mezclarlos con el Blackbox generado lo contaminaría. Son el set dorado bueno;
el Blackbox sigue siendo el generado por oráculo.

    python3 casos_reales.py entradas     # escribe el extracto sin resultado, auditable
    python3 casos_reales.py cobertura    # qué eslabones cubren y cuáles no
    python3 casos_reales.py fichas       # ficha por caso con la cita que sostiene el juicio
    python3 casos_reales.py triaje       # cuánto del triage T1-T14 responden de verdad
    python3 casos_reales.py huecos       # qué caso falta producir y qué lo valida
    python3 casos_reales.py revision     # hoja para que Pablo corrija la clasificación
"""

import re
import sys
import json
import pathlib

BASE = pathlib.Path(__file__).parent
CASOS_DIR = BASE.parent.parent / "Casos Exito"
ENTRADAS = BASE / "casos_reales_entradas.json"

V, R, A, G, B, F = "\033[92m", "\033[91m", "\033[93m", "\033[90m", "\033[1m", "\033[0m"

AREA = {1: "Estrategia y diagnóstico", 2: "Contenido y RRPP", 3: "Paid Media y SEO",
        4: "Desarrollo web", 5: "Automatización y agentes", 6: "RPA y procesos",
        7: "Capacitación y adopción"}

# ─────────────────────────────────────────────────────────────────────────────
# Clasificación. Una fila por caso, con la CITA del bloque ANTES que la sostiene.
# `confianza` gradúa cuánto vale como verdad-de-terreno, no cuánto me gusta el caso:
#   alta      la intervención mapea a UN eslabón y el resultado mueve la métrica de ESE
#             eslabón. Es verdad-de-terreno de verdad.
#   media     la intervención abarca varios eslabones; el dominante es inferible pero no
#             limpio. Sirve para verificar ruteo, no para calibrar contenido.
#   baja      el enunciado es ambiguo, o el resultado no valida el diagnóstico.
#   descartado el resultado son métricas de vanidad (alcance, impresiones, seguidores) que
#             no prueban que el diagnóstico fuera correcto. Un caso real mal validado
#             engaña más que un arquetipo honesto.
# ─────────────────────────────────────────────────────────────────────────────
CLASIFICACION = {
    "cliente-01": dict(
        perfil="E-commerce de alimentos importados · PYME", eslabon=3, confianza="media",
        cita="ni campañas de performance activas … ecosistema publicitario inexistente",
        medicion=True,
        nota="Sin pauta y sin medición. El resultado (1.324 conversiones) valida que el "
             "cuello era demanda. La ceguera es co-dominante y la Cadena no la expresa."),
    "cliente-02": dict(
        perfil="Distribuidora B2B limpieza y desechables · PYME", eslabon=3, confianza="media",
        cita="limitaba su capacidad de generar un flujo predecible de tráfico",
        medicion=False,
        nota="Resultado: 69.700 clics y 350 conversaciones directas. Valida demanda. "
             "Toca E2 en paralelo (reactivación orgánica), por eso no es 'alta'."),
    "cliente-03": dict(
        perfil="E-commerce de productos europeos para el hogar · PYME", eslabon=4,
        confianza="alta",
        cita="lograr atraer tráfico mediante anuncios, la marca sufría de un embudo de "
             "conversión completamente bloqueado: cero adiciones al carrito y cero ventas",
        medicion=True,
        nota="⭐ El caso más limpio de los 11. Hay flujo verificado (tráfico pagado) y se "
             "rompe exactamente en el activo: checkout caído en Safari, LCP 5,5 s. Es el "
             "caso dorado REAL de E4 que el Anexo J solo tenía como arquetipo."),
    "cliente-04": dict(
        perfil="Importadora de maquinaria láser industrial · PYME B2B ticket alto", eslabon=2,
        confianza="baja",
        cita="necesitaba introducir al mercado chileno una nueva línea … educar a un nicho "
             "altamente especializado",
        medicion=False,
        nota="Lanzamiento: no hay flujo previo que medir, así que la regla de precedencia no "
             "tiene desde dónde contar. E2 vs E3 es genuinamente ambiguo. Útil como caso "
             "borde de 'prospecto sin historia', no para verificar ruteo."),
    "cliente-05": dict(
        perfil="Importadora de seguridad electrónica · Mediana", eslabon=4, confianza="alta",
        cita="calificación de rendimiento 'F' (26%), tardando hasta 23.6 segundos en ser "
             "completamente interactivo … el 92.4% de sus visitantes ingresaba desde móviles",
        medicion=False,
        nota="⭐ Segundo E4 limpio. 97.800 usuarios activos: flujo abundante y verificado, "
             "roto en el activo. Complementa a cliente-03 con otro tamaño y otro rubro."),
    "cliente-06": dict(
        perfil="Consultora de RRHH y coaching B2B · PYME", eslabon=3, confianza="media",
        cita="requería escalar la captación de prospectos corporativos de alto valor",
        medicion=False,
        nota="Resultado: 36 leads con CPL de $4.048. Valida demanda. Mezcla LinkedIn "
             "orgánico (E2), por eso no es 'alta'."),
    "cliente-07": dict(
        perfil="Comercializadora B2B/B2C · PYME", eslabon=7, confianza="baja",
        cita="eliminando la improvisación en sus canales de venta … necesidad de establecer "
             "un flujo de trabajo ordenado",
        medicion=False,
        nota="El enunciado es de capacidad, no de crecimiento. Pero E7 solo es dominante si "
             "todo lo demás está sano (§5.0.2) y el ANTES no da evidencia de eso. "
             "Clasificado E7 con reserva explícita."),
    "cliente-08": dict(
        perfil="Servicios industriales en altura · PYME 11-50", eslabon=3, confianza="alta",
        cita="Necesitaban un canal de adquisición directo para captar la intención de "
             "búsqueda de empresas que requerían certificaciones",
        medicion=False,
        nota="⭐ El caso dorado REAL de E3, que solo tenía el arquetipo §J.6. Resultado: "
             "1.027 conversiones a $920 c/u. Y el perfil es Ignacio literal: industrial "
             "B2B, técnico, capta por licitación y cartera."),
    "cliente-09": dict(
        perfil="Consultora y broker inmobiliario · PYME", eslabon=2, confianza="baja",
        cita="carecía de presencia digital, autoridad y tracción. Su alcance orgánico era "
             "prácticamente nulo",
        medicion=False,
        nota="El enunciado es E2 limpio, pero el resultado son alcance e interacciones: no "
             "prueba que la reputación fuera el cuello. Sirve el enunciado, no la validación."),
    "cliente-10": dict(
        perfil="Cafetería y gelatería de especialidad · comercio local", eslabon=None,
        confianza="descartado",
        cita="0 presencia digital, 0 alcance local … presupuesto publicitario diario muy "
             "acotado (aprox. $3.500 CLP)",
        medicion=False,
        nota="Descartado como verdad-de-terreno: el resultado son impresiones y visitas al "
             "perfil. Además $3.500/día está bajo el mínimo referencial de Meta Chile, lo "
             "que lo vuelve un caso de VIABILIDAD (Capa 1), no de eslabón."),
    "cliente-11": dict(
        perfil="Proveedor de eficiencia energética y automatización · Mediana B2B", eslabon=3,
        confianza="media",
        cita="necesitaban generar un flujo constante de prospectos B2B calificados … "
             "operaban con 'datos sucios'",
        medicion=True,
        nota="Resultado: 138 leads B2B. Valida demanda. La medición rota es co-dominante y "
             "declarada por el propio cliente."),
}


# ─────────────────────────────────────────────────────────────────────────────
# TRIAGE — rellenado SOLO desde el bloque ANTES, con la frase que lo justifica.
#
# Regla de disciplina: un campo se rellena únicamente si el texto lo AFIRMA o lo implica sin
# ambigüedad. Todo lo demás queda fuera. Rellenar hasta que "parezca completo" sería fabricar,
# y un caso real fabricado engaña más que un arquetipo honesto.
#
# El resultado —una tasa de cobertura muy baja— NO es un fracaso del ejercicio: es la
# medición de algo que no se sabía. Ver `python3 casos_reales.py triaje`.
# ─────────────────────────────────────────────────────────────────────────────
TRIAGE = {
    "cliente-01": {
        "t4": ("no", "ni campañas de performance activas"),
        "s2": ("no detectable", "sin píxeles, sin GA4, sin GTM"),
    },
    "cliente-02": {},  # nada afirmable: la frecuencia de publicación no es ninguna de las 14
    "cliente-03": {
        "t6": ("sí, formulario o carro",
               "cero adiciones al carrito — no puede haber cero adiciones sin carrito"),
        "s2": ("detectado con errores",
               "ceguera de datos al no tener integrado el módulo de e-commerce en GA4"),
    },
    "cliente-04": {},  # perfil B2B ticket alto sí, pero ninguna de las 14
    "cliente-05": {
        "t6": ("sí, formulario o carro", "El e-commerce corporativo — hay transacción en sitio"),
    },
    "cliente-06": {},
    "cliente-07": {},
    "cliente-08": {},
    "cliente-09": {
        "t2": ("casi nada",
               "carecía de presencia digital, autoridad y tracción … alcance orgánico "
               "prácticamente nulo"),
    },
    "cliente-10": {
        "t2": ("casi nada", "0 presencia digital, 0 alcance local en redes"),
    },
    "cliente-11": {
        "s2": ("detectado con errores",
               "mala configuración en las etiquetas de Google Tag y GA4 estaba duplicando "
               "las conversiones"),
    },
}

# Perfil B2B de ticket alto y ciclo largo — dato de encabezado, no del triage. Alimenta el
# caso especial de E2 de <ruteo_de_area>.
PERFIL_B2B = {"cliente-02", "cliente-04", "cliente-06", "cliente-08", "cliente-11"}


def leer(cid):
    """Separación MECÁNICA. La entrada nunca ve el servicio contratado ni el resultado."""
    try:
        import docx
    except ImportError:
        sys.exit(f"{R}Falta python-docx: pip install python-docx{F}")
    f = CASOS_DIR / cid / "CASO DE ÉXITO.docx"
    if not f.exists():
        return None
    t = "\n".join(p.text for p in docx.Document(f).paragraphs if p.text.strip())
    g = lambda p: (re.search(p, t, re.S).group(1).strip() if re.search(p, t, re.S) else "")
    return {
        "id": cid,
        "entrada": {
            "empresa": " ".join(g(r"EMPRESA:(.*?)(?:INDUSTRIA|\n)").split()),
            "industria": " ".join(g(r"INDUSTRIA:(.*?)(?:TAMAÑO|\n)").split()),
            "tamano": " ".join(g(r"TAMAÑO:(.*?)(?:SERVICIO|\n)").split()),
            "antes": " ".join(g(r"--- ANTES ---(.*?)--- QUÉ HICIMOS").split()),
        },
        # No se escribe a disco en `entradas`: es la respuesta.
        "_verdad": {
            "servicio": " ".join(g(r"SERVICIO QUE CONTRATARON:(.*?)(?:PERÍODO|\n)").split()),
            "resultado": " ".join(g(r"--- RESULTADO ---(.*?)--- TESTIMONIO").split()),
        },
    }


def entradas():
    """Escribe SOLO las entradas. Es el archivo que se puede leer sin contaminarse."""
    out = []
    for cid in sorted(CLASIFICACION):
        d = leer(cid)
        if d:
            out.append({"id": d["id"], **d["entrada"]})
    ENTRADAS.write_text(json.dumps(
        {"_LEEME": "Extracto SIN el servicio contratado ni el resultado. Separación mecánica "
                   "hecha por casos_reales.py. Se puede leer para rellenar un triage sin "
                   "contaminarse con la respuesta.",
         "casos": out}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n{V}{len(out)} entradas escritas{F} en {ENTRADAS.name}")
    print(f"{G}No contienen el servicio contratado ni el resultado.{F}")
    return 0


def cobertura():
    print(f"\n{B}COBERTURA DE LA CADENA — 11 cuentas reales{F}\n" + "─" * 66)
    por_eslabon = {e: [] for e in range(1, 8)}
    desc = []
    for cid, c in sorted(CLASIFICACION.items()):
        (por_eslabon[c["eslabon"]] if c["eslabon"] else desc).append((cid, c["confianza"]))

    print(f"\n  {'Eslabón':<28} {'Casos':>5}  {'Alta':>5}  Estado")
    print("  " + "─" * 62)
    huecos, altos = [], []
    for e in range(1, 8):
        casos = por_eslabon[e]
        alta = [c for c in casos if c[1] == "alta"]
        if alta:
            altos.append(e)
        estado = (f"{V}real de alta confianza{F}" if alta
                  else f"{A}solo confianza media/baja{F}" if casos
                  else f"{R}SIN NINGÚN CASO REAL{F}")
        if not casos:
            huecos.append(e)
        print(f"  E{e} {AREA[e]:<25} {len(casos):>5}  {len(alta):>5}  {estado}")
    print(f"\n  {G}Descartados: {len(desc)} ({', '.join(c for c, _ in desc)}){F}")

    print(f"\n{B}Lectura{F}\n" + "─" * 66)
    print(f"  {V}Ascendibles a caso dorado real:{F} "
          + ", ".join(f"E{e}" for e in altos))
    print(f"  {R}Sin respaldo de caso de éxito:{F} "
          + ", ".join(f"E{e} → {AREA[e]}" for e in huecos))
    print(f"\n{A}  Los eslabones sin caso son justamente los que rutean a las líneas{F}")
    print(f"{A}  nuevas de Precisión. Es un hallazgo comercial, no solo del modelo.{F}")

    med = [c for c, v in CLASIFICACION.items() if v["medicion"]]
    print(f"\n{B}Medición{F}\n" + "─" * 66)
    print(f"  {len(med)} de 11 casos tienen ceguera de medición en el diagnóstico dominante")
    print(f"  o co-dominante: {', '.join(med)}.")
    print(f"  {G}La Cadena no tiene eslabón para eso. Resuelto el 2-ago-2026 como{F}")
    print(f"  {G}modificador transversal leído de s2_pixel_gtm (§ruteo_de_area).{F}")
    return 0


def fichas():
    for cid, c in sorted(CLASIFICACION.items()):
        col = {"alta": V, "media": A, "baja": G, "descartado": R}[c["confianza"]]
        e = f"E{c['eslabon']} · {AREA[c['eslabon']]}" if c["eslabon"] else "— sin eslabón"
        print(f"\n{B}{cid}{F}  {c['perfil']}")
        print(f"  Eslabón     {e}")
        print(f"  Confianza   {col}{c['confianza']}{F}"
              + ("   ⚠ medición co-dominante" if c["medicion"] else ""))
        print(f"  {G}Cita ANTES  «{c['cita']}»{F}")
        print(f"  {c['nota']}")
    return 0


# Registro de huecos. Un caso de éxito no se puede inventar: o hay una cuenta con resultado
# medido, o no la hay. Esto nombra el candidato real de cada eslabón sin caso y dice qué falta
# exactamente para poder escribirlo — y con qué métrica se validaría.
HUECOS = {
    1: dict(candidato="Vicsa Safety Chile / Bunzl LATAM",
            estado="Prospecto activo. Diagnóstico entregado el 28-jul-2026; propuesta el 31-jul.",
            existe="Diagnóstico completo con datos reales: 90 oportunidades → 2 citas → 0 "
                   "negocios. Es el Anexo I del PRD, el caso dorado primario de E1.",
            falta="Que cierre y que se mida el resultado.",
            metrica="Conversión de contacto a cita sobre la línea base de 2,2%, en la "
                    "compuerta de 90 días que el propio plan ya define."),
    5: dict(candidato="Eco Star — ⚠ en riesgo",
            estado="Cliente activo, pero el plan vigente NO es de captura.",
            existe="Informe semestral 2026: índice de respuesta 24,3%, espera promedio ~12 h, "
                   "~900 conversaciones. Es el Anexo G del PRD, el caso dorado de E5.",
            falta="⚠ La propuesta vigente (`Ecostar_Informe_y_Propuesta_Ecommerce_v2`) es un "
                  "proyecto de e-commerce: catálogo, SKUs, margen, mix B2B. Es E4, no E5. "
                  "Puede ser la decisión correcta —el propio Anexo G dice que E4 está roto "
                  "porque todo va a WhatsApp sin transacción, así que dar vía de compra "
                  "ataca la misma causa— pero significa que Eco Star NO va a producir el "
                  "caso de E5. Si se quiere ese caso, la automatización de captura tiene "
                  "que entrar al plan explícitamente.",
            metrica="Si entra: índice de respuesta y tiempo de espera contra la línea base "
                    "del semestre, que ya está tomada y es comparable."),
    6: dict(candidato="— ninguno",
            estado="No hay ninguna cuenta de RPA y procesos en el repositorio.",
            existe="Nada.",
            falta="Una cuenta, antes que un caso.",
            metrica="—"),
}


def huecos():
    print(f"\n{B}HUECOS DE CASO DE ÉXITO — qué falta producir{F}\n" + "─" * 66)
    print(f"{G}Un caso de éxito no se inventa: o hay una cuenta con resultado medido, o no.{F}\n")
    for e, h in sorted(HUECOS.items()):
        print(f"{B}E{e} · {AREA[e]}{F}")
        print(f"  Candidato   {h['candidato']}")
        print(f"  Estado      {h['estado']}")
        print(f"  {G}Ya existe   {h['existe']}{F}")
        print(f"  {A}Falta       {h['falta']}{F}")
        if h["metrica"] != "—":
            print(f"  Se valida   {h['metrica']}")
        print()
    print("─" * 66)
    print(f"""{B}Lectura{F}
  E1 y E5 están {V}a un resultado de distancia{F}: la cuenta existe, el diagnóstico
  está hecho con datos reales y la línea base ya está medida. Cuando cada una
  produzca su resultado, el caso se escribe con la plantilla de
  `Casos Exito/PLANTILLA_CASO_DE_EXITO.md` y entra a este set automáticamente.

  E6 es distinto: {R}no falta el caso, falta la cuenta.{F} Ninguna herramienta
  arregla eso.

{A}  Ojo con la tentación de escribir el caso antes del resultado. Un caso de
  éxito sin métrica final es material de venta, no verdad-de-terreno — y
  mezclarlo con este set lo contamina entero.{F}""")
    return 0


def revision():
    """
    Hoja de revisión de una pasada. La clasificación y el triage los puso una persona
    (Claude, 2-ago-2026) leyendo el bloque ANTES. Esto la vuelve corregible en minutos en
    vez de exigir releer once documentos: cada fila trae el juicio y la cita que lo sostiene,
    y Pablo solo tiene que marcar acuerdo o escribir el eslabón correcto.
    """
    f = BASE / "casos_reales_REVISION.md"
    L = ["# Revisión de la clasificación — 11 cuentas reales", "",
         "**Para:** Pablo · **Puso el juicio:** Claude, 2-ago-2026 · **Fuente:** bloque "
         "`--- ANTES ---` de cada `CASO DE ÉXITO.docx`", "",
         "Marca `OK` si estás de acuerdo, o escribe el eslabón correcto en la última columna. "
         "Cualquier cambio va a `casos_reales.py → CLASIFICACION`; el QA sigue pasando.", "",
         "**La escala:** 1 Criterio · 2 Reputación · 3 Demanda · 4 Activo · 5 Captura · "
         "6 Escala · 7 Capacidad.", "",
         "| # | Perfil | Mi juicio | Conf. | La frase en que me basé | ¿De acuerdo? |",
         "|---|---|---|---|---|---|"]
    for cid, c in sorted(CLASIFICACION.items()):
        e = f"**E{c['eslabon']}** {AREA[c['eslabon']]}" if c["eslabon"] else "**descartado**"
        n = cid.split("-")[1]
        L.append(f"| {n} | {c['perfil']} | {e} | {c['confianza']} | "
                 f"«{c['cita'][:95]}…» |  |")
    L += ["", "## Las tres decisiones que más conviene mirar", "",
          "Son las que cambiarían el set si están mal:", "",
          "1. **cliente-07 → E7.** El enunciado es de capacidad (*\"eliminar la "
          "improvisación\"*), pero **E7 solo es dominante si todo lo demás está sano** "
          "(§5.0.2) y el `ANTES` no da evidencia de eso. Si discrepas, probablemente sea E3.",
          "2. **cliente-04 → E2.** Es un lanzamiento: no hay flujo previo, así que la regla "
          "de precedencia no tiene desde dónde contar. E2 vs E3 es genuinamente ambiguo.",
          "3. **cliente-10 → descartado.** Lo saqué porque el resultado son impresiones y "
          "visitas al perfil, que no validan ningún diagnóstico. Si prefieres conservarlo, "
          "entra como confianza baja — pero entonces no cuenta como verdad-de-terreno.", "",
          "## Lo que NO hace falta que revises", "",
          "El **triage** (`casos_reales.py → TRIAGE`) tiene 5 campos rellenados de 154 "
          "posibles. Cada uno cita la frase que lo justifica y son todos literales, no "
          "inferencias. El número bajo **es el hallazgo**, no un pendiente: los documentos de "
          "caso de éxito están escritos desde una auditoría técnica y el triage pregunta por "
          "una conversación. Subirlo rellenando por inferencia sería fabricar.", ""]
    f.write_text("\n".join(L), encoding="utf-8")
    print(f"\n{V}Hoja de revisión escrita{F} en {f.name}")
    print(f"{G}11 filas, una pasada. Las tres decisiones dudosas están señaladas aparte.{F}")
    return 0


def triaje():
    """
    Mide cuánto del triage T1-T14 responden realmente los documentos de caso de éxito.
    Es la verificación que convierte una intuición en un número.
    """
    T = [f"t{i}" for i in range(1, 15)]
    print(f"\n{B}COBERTURA DEL TRIAGE EN LAS 11 CUENTAS REALES{F}\n" + "─" * 66)
    print(f"\n  {'Caso':<12} {'T1-T14':>7}  {'s2':>4}  Campos con respuesta")
    print("  " + "─" * 62)
    tot = 0
    for cid in sorted(TRIAGE):
        d = TRIAGE[cid]
        t = [k for k in d if k in T]
        tot += len(t)
        s2 = "sí" if "s2" in d else "—"
        campos = ", ".join(f"{k}={d[k][0]}" for k in d) or f"{R}ninguno{F}"
        print(f"  {cid:<12} {len(t):>3}/14  {s2:>4}  {campos}")

    pct = 100 * tot / (11 * 14)
    print(f"\n  {B}Total: {tot} de 154 campos posibles = {pct:.1f}%{F}")

    print(f"\n{B}Qué significa este número{F}\n" + "─" * 66)
    print(f"""  El triage y los casos de éxito son instrumentos DISTINTOS:

    · Las 14 preguntas están calibradas para una CONVERSACIÓN con el dueño —
      cómo te llegan clientes, en cuánto contestas, dónde queda el contacto.
    · El bloque ANTES está escrito desde una AUDITORÍA TÉCNICA — LCP, Core Web
      Vitals, tasa de conversión, estado del píxel, indexación.

  Casi no se solapan. Por eso estas 11 cuentas {B}no validan la precisión del
  ruteo{F}: los documentos no contienen datos que el triage sepa leer.

{B}Para qué SÍ sirven, que es donde está su valor:{F}

  1. {V}Verifican el camino de insuficiencia.{F} Con 1 o 2 campos de 14, el motor
     tiene que decir "no puedo rutear, declara qué falta" (<casos_borde>). Los
     ocho arquetipos {A}nunca{F} lo prueban: están completos por construcción.

  2. {V}Verifican que el MODELO tenga un eslabón para lo que de verdad pasó.{F}
     De ahí salió el defecto #14: 3 de 11 casos tienen la medición rota como
     problema dominante y la Cadena no podía expresarlo.

  3. {V}Verifican el enum de las señales externas.{F} De ahí salió el #16: el
     estado real de cliente-11 —medición existente pero mal configurada— no
     tenía valor posible, y era el estado más peligroso de todos.

{A}  Lo que NO hay que hacer: rellenar los campos que faltan por inferencia
  para subir este número. Sería fabricar, y el número dejaría de medir nada.{F}""")
    return 0


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    return {"entradas": entradas, "cobertura": cobertura, "fichas": fichas,
            "triaje": triaje, "huecos": huecos,
            "revision": revision}.get(cmd, lambda: sys.exit(__doc__))()


if __name__ == "__main__":
    sys.exit(main())
