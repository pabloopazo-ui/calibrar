#!/usr/bin/env python3
"""
Evaluador de salidas de Calibrar — aplica la checklist de §6.2 y las invariantes DB-1..DB-17
a un JSON producido por el motor.

Por qué existe: hasta ahora la checklist de aceptación vivía como prosa en el PRD y nunca se
había aplicado a una salida real. Esto la vuelve ejecutable, de modo que la PRIMERA corrida
del motor se evalúa de forma objetiva en vez de "a ojo".

    python3 evaluar_salida.py salida.json
    python3 evaluar_salida.py salida.json --caso ecostar     # compara contra el caso dorado
    python3 evaluar_salida.py salida.json --medicion "detectado con errores"
    echo $?                                                   # 0 = apto · 1 = reprueba

Un fallo de NIVEL 1 (estructura) o NIVEL 2 (invariantes) reprueba: son defectos, no
diferencias de criterio. El NIVEL 3 (rúbrica de contenido) lo juzga una persona.
"""

import json
import sys
import pathlib

V, R, A, G, B, F = "\033[92m", "\033[91m", "\033[93m", "\033[90m", "\033[1m", "\033[0m"

BLOQUES = ["bloque_0_ruteo", "bloque_1_data", "bloque_2_hipotesis",
           "bloque_3_soluciones", "bloque_4_etapas"]
SECCIONES = [f"seccion_{i}_" for i in range(1, 7)]

# Vocabulario de ÁREAS — mapea 1:1 con los 7 eslabones de la Cadena (PRD §5.0, l. 334-342).
# Resuelto el 2-ago-2026: manda la Cadena, porque es el modelo del producto. El esquema del
# Anexo E declaraba un enum distinto —heredado del catálogo de servicios, anterior a que la
# Cadena existiera— que ningún caso dorado usaba. Se alineó el esquema (PRD l. 927 y l. 2303)
# a esta lista, y se resolvió el valor compuesto de la l. 2863, que rompía el enum ganara
# quien ganara. `pilar_precision` admite UN valor de aquí, nunca una suma.
AREAS = {"Estrategia y diagnóstico", "Contenido y RRPP", "Paid Media y SEO", "Desarrollo web",
         "Automatización y agentes", "RPA y procesos", "Capacitación y adopción"}
PILARES = AREAS | {"ninguno"}

# Salida esperada de los casos dorados — solo lo comparable de forma exacta.
# Valores leídos de los Anexos G (§G.2), H (§H.2), I (§I.2) y J (§J.1-J.4) del PRD v5.4.
# La escala es 1-7 (PRD l. 353 y l. 986). La escala E0-E6 es SIEMPRE un error.
CASOS = {
    "ecostar": {"eslabon_dominante": 5, "area_recomendada": "Automatización y agentes",
                "sanos": [2], "rotos": [3, 4, 5, 6], "sin_datos": [1, 7]},
    "clinica": {"eslabon_dominante": 5, "area_recomendada": "Automatización y agentes",
                "sanos": [2, 3], "rotos": [4, 5, 6, 7], "sin_datos": []},
    "bunzl":   {"eslabon_dominante": 1, "area_recomendada": "Estrategia y diagnóstico",
                "sanos": [2, 3], "rotos": [1, 5, 7], "sin_datos": [4, 6]},
    # Anexo J — arquetipos, no cuentas reales: verifican ruteo y forma, no calibración de
    # contenido. El propio Anexo J lo declara así.
    "j1_e2":   {"eslabon_dominante": 2, "area_recomendada": "Contenido y RRPP",
                "sanos": [1, 5], "rotos": [2, 4], "sin_datos": [3, 6, 7]},
    "j2_e4":   {"eslabon_dominante": 4, "area_recomendada": "Desarrollo web",
                "sanos": [1, 2, 3, 5], "rotos": [4], "sin_datos": [6, 7]},
    "j3_e6":   {"eslabon_dominante": 6, "area_recomendada": "RPA y procesos",
                "sanos": [1, 2, 3, 4, 5], "rotos": [6, 7], "sin_datos": []},
    "j4_e7":   {"eslabon_dominante": 7, "area_recomendada": "Capacitación y adopción",
                "sanos": [1, 2, 3, 4, 5, 6], "rotos": [7], "sin_datos": []},
    # E3 era el único eslabón sin caso dorado — y es el que rutea a Paid Media y SEO.
    # Cerrado el 2-ago-2026 con §J.6 del PRD.
    "j6_e3":   {"eslabon_dominante": 3, "area_recomendada": "Paid Media y SEO",
                "sanos": [1, 2, 4, 5, 7], "rotos": [3], "sin_datos": [6]},
}


def n1(d):
    """Estructural. Binario. Si falla, no se evalúa nada más."""
    r = []
    r.append(("Es un objeto JSON", isinstance(d, dict)))
    if not isinstance(d, dict):
        return r
    r.append(("Trae el bloque meta", "meta" in d))
    for b in BLOQUES:
        r.append((f"Trae {b}", b in d))
    faltan = [s for s in SECCIONES if not any(k.startswith(s) for k in d)]
    r.append(("Las 6 secciones de análisis", not faltan))
    sin_reason = [k for k in d if k.startswith(("seccion_", "bloque_"))
                  and isinstance(d[k], dict) and not d[k].get("reasoning")]
    r.append(("Cada sección/bloque con reasoning", not sin_reason))
    return r


def n2(d):
    """Invariantes DB-1..DB-17. Binario. Un fallo es un defecto."""
    r = []
    b0 = d.get("bloque_0_ruteo", {}) or {}
    b1 = d.get("bloque_1_data", {}) or {}
    b2 = d.get("bloque_2_hipotesis", {}) or {}
    b3 = d.get("bloque_3_soluciones", {}) or {}
    b4 = d.get("bloque_4_etapas", {}) or {}
    hip = b2.get("hipotesis", []) or []
    sol = b3.get("soluciones", []) or []
    eta = b4.get("etapas", []) or []
    cif = b1.get("cifras_clave", []) or []

    vacio = lambda x: not x or str(x).strip().upper() in ("", "N/D", "NONE", "NULL")

    r.append(("DB-1  Ninguna cifra sin lectura",
              all(not vacio(c.get("lectura")) for c in cif)))
    r.append(("DB-2  3 hipótesis y 3 soluciones en biyección",
              len(hip) == 3 and len(sol) == 3
              and sorted(s.get("verifica_hipotesis") for s in sol) == [1, 2, 3]))
    r.append(("DB-3  Toda hipótesis es falsable",
              bool(hip) and all(not vacio(h.get("como_se_verifica")) for h in hip)))
    r.append(("DB-4  Toda solución es predictiva",
              bool(sol) and all(not vacio(s.get("prediccion")) for s in sol)))
    r.append(("DB-5  No todas las soluciones exigen contratar",
              any(s.get("puede_hacerlo_solo") for s in sol)))
    r.append(("DB-6  Nada inferido con confianza alta",
              not any(h.get("procedencia") == "inferido" and h.get("confianza") == "alta"
                      for h in hip)))
    rep = b2.get("reparto_atribucion", {}) or {}
    r.append(("DB-7  Reparto de atribución consistente",
              sum(rep.values()) == 3
              and all(rep.get(k, 0) == sum(1 for h in hip if h.get("atribucion") == k)
                      for k in ("gestion", "estructura", "compartida"))))
    r.append(("DB-8  Capa y alcance en cada hipótesis",
              all("capa" in h and h.get("alcance") in ("cuenta", "canal") for h in hip)))
    # DB-9 · Trazabilidad. La parte semántica —que cada afirmación esté *sostenida* por alguna
    # de las 6 secciones— exige juicio humano y se avisa en NIVEL 3. Lo verificable en código
    # es su precondición: que toda hipótesis y toda cifra declaren de dónde salen. Sin eso, la
    # afirmación no es rastreable a ninguna sección por definición.
    r.append(("DB-9  Toda hipótesis y cifra declara su evidencia",
              bool(hip) and all(not vacio(h.get("evidencia")) for h in hip)
              and all(not vacio(c.get("cifra")) for c in cif)))
    r.append(("DB-10 Un solo eslabón dominante, 1 a 7",
              isinstance(b0.get("eslabon_dominante"), int)
              and 1 <= b0["eslabon_dominante"] <= 7))
    dom = b0.get("eslabon_dominante")
    cad = b0.get("cadena") or []
    # DB-11 · Coherencia ruteo ↔ hipótesis (PRD l. 987). El eslabón dominante tiene que estar
    # declarado 'roto' en la cadena: no se puede diagnosticar como dominante un eslabón que el
    # propio ruteo dio por sano o sin datos.
    est_dom = next((e.get("estado") for e in cad if e.get("eslabon") == dom), None)
    r.append(("DB-11 El eslabón dominante está marcado roto en la cadena",
              dom is not None and est_dom == "roto"))
    # DB-12 · E7 nunca solo (PRD l. 988). El nombre canónico del área es "Capacitación y
    # adopción"; comparar contra "Capacitación" a secas hacía que la invariante no pudiera
    # dispararse nunca. El eslabón que se excluye es el 7, no el 6.
    r.append(("DB-12 Capacitación y adopción sola solo si todo lo demás está sano",
              b0.get("area_recomendada") != "Capacitación y adopción"
              or all(e.get("estado") in ("sano", "sin_datos")
                     for e in cad if e.get("eslabon") != 7)))
    r.append(("DB-13 que_NO_es_tu_problema poblado",
              "que_NO_es_tu_problema" in b0))
    r.append(("DB-14 Entre 2 y 4 etapas, completas",
              2 <= len(eta) <= 4 and all(
                  not vacio(e.get(k)) for e in eta
                  for k in ("por_que_primero", "quien_lo_hace",
                            "pilar_precision", "como_se_sabe_que_resultó"))))
    r.append(("DB-15 La etapa 1 no la factura Precisión",
              bool(eta) and eta[0].get("quien_lo_hace") in ("el cliente", "mixto")))
    r.append(("DB-16 fuera_de_nuestro_alcance declarado",
              "fuera_de_nuestro_alcance" in b4))
    r.append(("DB-17 Sin negación seca en el veredicto",
              "no necesitas marketing" not in json.dumps(d, ensure_ascii=False).lower()))
    r.append(("Pilares válidos en todas las etapas",
              all(e.get("pilar_precision") in PILARES for e in eta)))
    # Modificador de medición (<ruteo_de_area>, 2-ago-2026). Verificable sin conocer la
    # entrada: la medición NUNCA puede ser el área recomendada. Que además se declare
    # cuando corresponde exige conocer s2_pixel_gtm — eso lo verifica `--medicion`.
    txt = json.dumps(d, ensure_ascii=False).lower()
    r.append(("MED-1 La medición nunca es el área recomendada",
              "medici" not in str(b0.get("area_recomendada", "")).lower()))
    return r


def medicion(d, estado):
    """
    Verifica el modificador de medición cuando se conoce la señal externa.
    Nació de tres casos reales (01, 03, 11) en que la ceguera de medición era el problema
    dominante o co-dominante y la Cadena no tenía dónde ponerla.
    """
    txt = json.dumps(d, ensure_ascii=False).lower()
    hay = any(k in txt for k in ("medici", "píxel", "pixel", "ga4", "gtm", "etiqueta",
                                 "analítica", "analitica", "trazab"))
    b4 = d.get("bloque_4_etapas", {}) or {}
    en_plan = any(k in json.dumps(b4, ensure_ascii=False).lower()
                  for k in ("medici", "píxel", "pixel", "ga4", "gtm", "analítica"))
    return [
        (f"MED-2 Con s2='{estado}', el diagnóstico declara la medición", hay),
        ("MED-3 La medición entra al plan por etapas", en_plan),
    ]


def n3(d):
    """Rúbrica de contenido. Señala lo que una persona debe juzgar."""
    b2 = d.get("bloque_2_hipotesis", {}) or {}
    avisos = []
    for h in b2.get("hipotesis", []) or []:
        if not h.get("por_que_no_era_visible"):
            avisos.append(f"Hipótesis {h.get('orden')}: falta por_que_no_era_visible")
        if len(str(h.get("enunciado", "")).split()) > 35:
            avisos.append(f"Hipótesis {h.get('orden')}: enunciado largo — ¿lo repetiría de memoria?")
    for s in d.get("bloque_3_soluciones", {}).get("soluciones", []) or []:
        if s.get("puede_hacerlo_solo") and not s.get("como_hacerlo_solo"):
            avisos.append(f"Solución {s.get('orden')}: dice que puede solo y no explica cómo")
    # DB-9 · la parte semántica no es automatizable: la juzga una persona.
    avisos.append("DB-9: verificar a mano que cada afirmación del dashboard esté sostenida "
                  "por alguna de las 6 secciones de análisis")
    return avisos


def comparar(d, caso):
    esp = CASOS[caso]
    b0 = d.get("bloque_0_ruteo", {}) or {}
    est = {e.get("eslabon"): e.get("estado") for e in (b0.get("cadena") or [])}
    r = [(f"Eslabón dominante = {esp['eslabon_dominante']}",
           b0.get("eslabon_dominante") == esp["eslabon_dominante"]),
         (f"Área = {esp['area_recomendada']}",
           b0.get("area_recomendada") == esp["area_recomendada"])]
    for e in esp["sanos"]:
        r.append((f"E{e} marcado sano", est.get(e) == "sano"))
    for e in esp["rotos"]:
        r.append((f"E{e} marcado roto", est.get(e) == "roto"))
    for e in esp.get("sin_datos", []):
        r.append((f"E{e} marcado sin_datos", est.get(e) == "sin_datos"))
    return r


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit(__doc__)
    ruta = pathlib.Path(args[0])
    if not ruta.exists():
        sys.exit(f"{R}No encuentro {ruta}{F}")
    caso = None
    if "--caso" in sys.argv:
        caso = sys.argv[sys.argv.index("--caso") + 1].lower()
        if caso not in CASOS:
            sys.exit(f"{R}Caso desconocido. Disponibles: {', '.join(CASOS)}{F}")
    try:
        d = json.loads(ruta.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"{R}{B}NIVEL 1 — RECHAZO{F}")
        print(f"  {R}✗{F} El JSON no es válido: {e}")
        print(f"\n{G}El motor debe devolver SOLO JSON, sin markdown alrededor (§Anexo E).{F}")
        return 1

    fallos = 0
    print(f"\n{B}EVALUACIÓN DE SALIDA{F}  ·  {ruta.name}\n" + "─" * 62)

    niveles = [("NIVEL 1 · ESTRUCTURAL", n1(d)), ("NIVEL 2 · INVARIANTES", n2(d))]
    if "--medicion" in sys.argv:
        est = sys.argv[sys.argv.index("--medicion") + 1]
        if est in ("no detectable", "detectado con errores"):
            niveles.append((f"MEDICIÓN · s2 = {est}", medicion(d, est)))
    for etiqueta, pruebas in niveles:
        print(f"\n{G}{etiqueta}{F}")
        for desc, ok in pruebas:
            print(f"  {V+'✓'+F if ok else R+'✗'+F} {desc}")
            fallos += not ok
        if etiqueta.startswith("NIVEL 1") and fallos:
            print(f"\n{R}Estructura inválida — no se evalúan los niveles siguientes.{F}")
            return 1

    if caso:
        print(f"\n{G}CONTRA EL CASO DORADO · {caso}{F}")
        for desc, ok in comparar(d, caso):
            print(f"  {V+'✓'+F if ok else R+'✗'+F} {desc}")
            fallos += not ok

    avisos = n3(d)
    print(f"\n{G}NIVEL 3 · RÚBRICA (la juzga una persona){F}")
    if avisos:
        for a in avisos:
            print(f"  {A}⚠{F} {a}")
    else:
        print(f"  {V}✓{F} Sin avisos automáticos. Falta el juicio humano de calidad de contenido.")

    print("\n" + "─" * 62)
    if fallos:
        print(f"{R}{B}REPRUEBA · {fallos} verificación(es) fallan{F}")
        print(f"{G}Los niveles 1 y 2 son binarios: un fallo es un defecto, no un criterio distinto.{F}")
        return 1
    print(f"{V}{B}APTA en niveles 1 y 2{F}")
    print(f"{G}Falta la rúbrica de contenido (§6.2 nivel 3) y los antipatrones, que los juzga una persona.{F}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
