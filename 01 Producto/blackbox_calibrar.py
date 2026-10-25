#!/usr/bin/env python3
"""
Blackbox dev set de Calibrar — el set que NO se mira.

Por qué existe: los ocho casos dorados son todos "Eyeball" en el sentido de Ng (Machine
Learning Yearning, caps. 17-18): se escribieron mirándolos. Un motor puede pasarlos todos
por haber sido afinado contra ellos, y no generalizar a nada. Sin un set que nadie inspeccione
no hay forma de distinguir "funciona" de "aprendió estos ocho".

El problema de construirlo: si una persona escribe los casos, ya los miró. Por eso las
etiquetas no las pone nadie — las deriva un ORÁCULO desde las reglas escritas en
<ruteo_de_area> del Anexo E. El oráculo es una segunda implementación, independiente, de la
misma especificación que ejecuta el motor.

    Motor y oráculo coinciden   → evidencia de que la regla está bien implementada.
    Motor y oráculo discrepan   → o el motor falla, o la regla está mal escrita.
                                  Las DOS son hallazgos. Ninguna se resuelve mirando el caso.

La disciplina la impone la herramienta, no la buena voluntad: `evaluar` imprime SOLO
agregados. Para ver un caso hay que `quemar`-lo, lo que lo saca del Blackbox para siempre y
queda registrado. Mirar es posible; mirar gratis y sin dejar rastro, no.

    python3 blackbox_calibrar.py verificar          # el oráculo contra los 8 casos dorados
    python3 blackbox_calibrar.py generar --n 240    # crea el set (semilla fija, reproducible)
    python3 blackbox_calibrar.py evaluar preds.jsonl
    python3 blackbox_calibrar.py quemar 5           # saca 5 fallidos al Eyeball, deja registro
    python3 blackbox_calibrar.py estado

Alcance: el oráculo decide RUTEO (eslabón dominante y área) a partir del triage T1-T14, que
es exactamente el insumo que <ruteo_de_area> declara. NO juzga la calidad del contenido del
diagnóstico — eso lo hace el Anexo G y lo juzga una persona.
"""

import json
import random
import sys
import pathlib
from collections import Counter

BASE = pathlib.Path(__file__).parent
CASOS_F = BASE / "blackbox_casos.jsonl"        # entradas — visibles, hay que alimentarlas al motor
ESPERADO_F = BASE / "blackbox_esperado.json"   # etiquetas — NO SE MIRAN
QUEMADOS_F = BASE / "blackbox_quemados.json"   # registro de lo que salió al Eyeball

V, R, A, G, B, F = "\033[92m", "\033[91m", "\033[93m", "\033[90m", "\033[1m", "\033[0m"

SEMILLA = 20260802

AREA = {1: "Estrategia y diagnóstico", 2: "Contenido y RRPP", 3: "Paid Media y SEO",
        4: "Desarrollo web", 5: "Automatización y agentes", 6: "RPA y procesos",
        7: "Capacitación y adopción"}

# Opciones literales del triage (PRD §5.1.1, l. 452-465).
OPC = {
    "t1":  ["recomendación", "búsqueda", "publicidad", "licitación", "no sé"],
    "t2":  ["sitio + reseñas", "solo redes", "casi nada", "no sé"],
    "t3":  ["ninguna", "pocas y esporádicas", "medio", "alto"],   # buckets de volumen
    "t4":  ["Meta", "Google", "ambas", "otra", "no"],
    "t5":  ["landing dedicada", "home", "WhatsApp", "perfil de redes", "no tengo"],
    "t6":  ["sí, formulario o carro", "solo WhatsApp", "no"],
    "t7":  ["menos de 5 min", "menos de 1 h", "mismo día", "más de un día", "no sé"],
    "t8":  ["CRM", "planilla", "correo o WhatsApp", "no queda en ninguna parte"],
    "t9":  ["ninguna", "algunas", "muchas", "no sé"],
    "t10": ["sí, formalmente", "alguien la usa por su cuenta", "no", "no sé qué sería"],
    "t11": ["pocas", "muchas", "no sé"],
    "t12": ["sí", "a medias", "no"],
    "t13": ["sí, por escrito", "lo sabemos pero no está escrito", "no"],
    "t14": ["criterio explicable", "por intuición", "no sabría"],
    "perfil_b2b_ticket_alto_ciclo_largo": [True, False],
    # Señal externa OBSERVABLE (Anexo F.2), no una pregunta del triage. La rutea el
    # modificador de medición de <ruteo_de_area>. Se genera acá porque, sin generarla, la
    # regla es inejecutable: nada la produciría y nada la transmitiría.
    "s2_pixel_gtm": ["fbq detectado", "gtag detectado", "GTM detectado",
                     "detectado con errores", "no detectable"],
}

# Los dos estados que obligan a declarar la medición en el diagnóstico. "detectado con
# errores" es el más grave: quien no mide lo sabe, quien mide mal decide sobre datos falsos.
MEDICION_ROTA = ("no detectable", "detectado con errores")


# ─────────────────────────────────────────────────────────────────────────────
# EL ORÁCULO — traducción literal de <ruteo_de_area> (PRD l. 1720-1768).
# Cada regla lleva la cita de la línea que la sostiene. Si una regla no se puede citar,
# no va: el oráculo no puede tener criterio propio, o deja de ser independiente.
# ─────────────────────────────────────────────────────────────────────────────

def hay_flujo(t):
    """"contando desde donde HOY HAY FLUJO". Flujo = llegan oportunidades."""
    return t["t3"] in ("medio", "alto")


def medicion_rota(t):
    """La medición nunca es eslabón. Solo obliga a declararla."""
    return t.get("s2_pixel_gtm") in MEDICION_ROTA


def rotos(t):
    """
    Estado de cada eslabón según el triage. Solo señales que el triage puede dar.

    Aplica la "REGLA DE EVALUABILIDAD" de <ruteo_de_area>: sin flujo, un eslabón río abajo
    no se declara roto por una señal que depende del volumen. Las señales estructurales
    —que no dependen del volumen— sí se leen siempre.
    """
    flujo = hay_flujo(t)
    estructural_4 = t["t5"] == "no tengo" or t["t6"] == "no"
    estructural_5 = t["t8"] == "no queda en ninguna parte"
    return {
        # "T3 alto + T13 'no' + T14 'no sabría'. Eso es E1, NO E3."
        1: t["t13"] == "no" and t["t14"] == "no sabría",
        2: t["t2"] == "casi nada",
        3: t["t3"] in ("ninguna", "pocas y esporádicas"),
        4: estructural_4,                       # T5/T6 son estructurales: se leen sin flujo
        5: estructural_5 or (flujo and t["t7"] in ("más de un día", "no sé")),
        6: flujo and (t["t9"] == "muchas" or t["t11"] == "muchas"),
        7: t["t12"] == "no",
    }


def e4_subsumido_en_e5(t, rot):
    """
    "SUBSUNCIÓN DE E4 EN E5" de <ruteo_de_area>.

    Esta regla NO existía en el bloque de ruteo hasta el 2-ago-2026: vivía solo en la prosa
    del `reasoning` de los dos casos dorados de E5, que es documentación, no lo que el motor
    ejecuta. La construcción de este oráculo la destapó — sin ella, la precedencia literal
    devuelve E4 en Eco Star y en Clínica Dental, porque E4 va antes que E5 en el conteo.
    Se subió al Anexo E para que el motor tenga la regla que sus propios casos exigen.
    """
    canal_conversacional = t["t5"] in ("WhatsApp", "perfil de redes") or t["t6"] == "solo WhatsApp"
    return rot[4] and rot[5] and canal_conversacional


def oraculo(t):
    """
    Devuelve (eslabon_dominante, area) o (None, None) si ningún eslabón está roto.

    El orden de los `if` NO es una decisión de implementación: es el "ORDEN DE PRECEDENCIA
    CUANDO VARIAS REGLAS RECLAMAN EL MISMO CASO" de <ruteo_de_area>, que se escribió el
    2-ago-2026 precisamente porque una auditoría sobre 200.000 combinaciones mostró que en
    más de la mitad del espacio hay dos o más reglas reclamando, y el bloque no decía cuál
    ganaba. Si cambia el orden allá, tiene que cambiar acá.
    """
    rot = rotos(t)
    flujo = hay_flujo(t)

    # 1. "E1 ES EL PRIMER ESLABÓN Y ANTECEDE A TODOS cuando HAY FLUJO llegando y NO convirtiendo."
    #    "si NO llega nadie, el problema es de demanda (E3)."
    if flujo and rot[1]:
        return 1, AREA[1]

    # 2. "E2 caso especial — gana a la regla de sin-flujo y a cualquier rotura río abajo."
    #    La falta de demanda es consecuencia de la falta de reputación.
    if rot[2] and t["perfil_b2b_ticket_alto_ciclo_largo"] and t["t1"] == "recomendación":
        return 2, AREA[2]

    # 3. "Sin flujo → E3 — gana a cualquier rotura río abajo, incluidas las estructurales."
    if not flujo:
        return 3, AREA[3]

    # 4-5. "Subsunción E4→E5 va antes que el conteo literal", luego el primero que rompe.
    if e4_subsumido_en_e5(t, rot):
        return 5, AREA[5]
    for e in (4, 5, 6):
        if rot[e]:
            return e, AREA[e]

    # 6. "E7 es MODIFICADOR, no destino. Solo es dominante si todo lo demás está sano."
    if rot[7]:
        return 7, AREA[7]

    # "SI NINGÚN ESLABÓN ESTÁ ROTO, DILO. No fabriques un problema para tener algo que vender."
    return None, None


# ─────────────────────────────────────────────────────────────────────────────
# Verificación del oráculo contra los casos dorados escritos a mano.
# Es el único momento en que se miran casos: son los del Eyeball, que ya se miraron.
# ─────────────────────────────────────────────────────────────────────────────

DORADOS = {
    "J.1 · E2": (dict(t1="recomendación", t2="casi nada", t3="pocas y esporádicas", t4="no",
                      t5="home", t6="no", t7="mismo día", t8="planilla", t9="ninguna",
                      t10="no", t11="pocas", t12="sí", t13="sí, por escrito",
                      t14="criterio explicable",
                      perfil_b2b_ticket_alto_ciclo_largo=True), 2),
    "J.2 · E4": (dict(t1="publicidad", t2="sitio + reseñas", t3="alto", t4="Meta",
                      t5="home", t6="no", t7="menos de 1 h", t8="CRM", t9="ninguna",
                      t10="no", t11="pocas", t12="sí", t13="sí, por escrito",
                      t14="criterio explicable",
                      perfil_b2b_ticket_alto_ciclo_largo=False), 4),
    "J.3 · E6": (dict(t1="publicidad", t2="sitio + reseñas", t3="alto", t4="Meta",
                      t5="landing dedicada", t6="sí, formulario o carro", t7="menos de 5 min",
                      t8="CRM", t9="muchas", t10="no sé qué sería", t11="muchas", t12="no",
                      t13="sí, por escrito", t14="criterio explicable",
                      perfil_b2b_ticket_alto_ciclo_largo=False), 6),
    "J.4 · E7": (dict(t1="publicidad", t2="sitio + reseñas", t3="alto", t4="Meta",
                      t5="landing dedicada", t6="sí, formulario o carro", t7="menos de 5 min",
                      t8="CRM", t9="ninguna", t10="alguien la usa por su cuenta", t11="pocas",
                      t12="no", t13="sí, por escrito", t14="criterio explicable",
                      perfil_b2b_ticket_alto_ciclo_largo=False), 7),
    "J.6 · E3": (dict(t1="recomendación", t2="sitio + reseñas", t3="pocas y esporádicas",
                      t4="no", t5="landing dedicada", t6="sí, formulario o carro",
                      t7="menos de 1 h", t8="CRM", t9="ninguna", t10="no", t11="pocas",
                      t12="sí", t13="sí, por escrito", t14="criterio explicable",
                      perfil_b2b_ticket_alto_ciclo_largo=False), 3),
    "I · E1 Bunzl": (dict(t1="publicidad", t2="sitio + reseñas", t3="alto", t4="ambas",
                          t5="landing dedicada", t6="sí, formulario o carro",
                          t7="más de un día", t8="correo o WhatsApp", t9="algunas", t10="no",
                          t11="pocas", t12="no", t13="no", t14="no sabría",
                          perfil_b2b_ticket_alto_ciclo_largo=True), 1),
    "G · E5 Eco Star": (dict(t1="publicidad", t2="sitio + reseñas", t3="alto", t4="Meta",
                             t5="WhatsApp", t6="no", t7="más de un día",
                             t8="correo o WhatsApp", t9="muchas", t10="no", t11="muchas",
                             t12="sí", t13="sí, por escrito", t14="criterio explicable",
                             perfil_b2b_ticket_alto_ciclo_largo=False), 5),
    "H · E5 Clínica": (dict(t1="publicidad", t2="sitio + reseñas", t3="alto", t4="Meta",
                            t5="WhatsApp", t6="no", t7="no sé", t8="correo o WhatsApp",
                            t9="muchas", t10="no", t11="pocas", t12="no",
                            t13="sí, por escrito", t14="criterio explicable",
                            perfil_b2b_ticket_alto_ciclo_largo=False), 5),
}


def verificar():
    print(f"\n{B}ORÁCULO CONTRA LOS CASOS DORADOS{F}\n" + "─" * 62)
    print(f"{G}Si el oráculo no reproduce un caso escrito a mano, el oráculo está mal —\n"
          f"o la regla de <ruteo_de_area> no determina ese caso.{F}\n")
    fallos = 0
    for nombre, (t, esperado) in DORADOS.items():
        obtenido, _ = oraculo(t)
        ok = obtenido == esperado
        fallos += not ok
        marca = f"{V}✓{F}" if ok else f"{R}✗{F}"
        detalle = "" if ok else f"  {R}→ oráculo dice E{obtenido}, el caso dice E{esperado}{F}"
        print(f"  {marca} {nombre:<18} E{esperado}{detalle}")
    print("\n" + "─" * 62)
    if fallos:
        print(f"{R}{B}{fallos} de {len(DORADOS)} no se reproducen{F}")
        print(f"{G}No generes el set hasta resolverlo: etiquetaría cientos de casos con una "
              f"regla que ya falla en los que sí se miraron.{F}")
        return 1
    print(f"{V}{B}{len(DORADOS)}/{len(DORADOS)} reproducidos{F}")
    print(f"{G}El oráculo implementa la misma regla que los casos escritos a mano.{F}")
    return 0


# ─────────────────────────────────────────────────────────────────────────────

def generar(n):
    if verificar():
        return 1
    rng = random.Random(SEMILLA)
    casos, esperado, vistos = [], {}, set()
    # Estratificado: se sigue muestreando hasta que los 7 eslabones tengan representación
    # suficiente. Ng (cap. 18): con ~20 errores por categoría se empieza a distinguir la
    # fuente del error; con ~50, se distingue bien.
    cuenta = Counter()
    intentos = 0
    while len(casos) < n and intentos < n * 400:
        intentos += 1
        t = {k: rng.choice(v) for k, v in OPC.items()}
        firma = json.dumps(t, sort_keys=True)
        if firma in vistos:
            continue
        e, area = oraculo(t)
        if e is None:                      # "ningún eslabón roto" también hay que verificarlo
            e, area = 0, "ninguno"
        if cuenta[e] >= max(6, n // 6):    # techo por categoría, para que no domine una sola
            continue
        vistos.add(firma)
        cuenta[e] += 1
        cid = f"bb{len(casos):04d}"
        casos.append({"id": cid, "triage": t})
        esperado[cid] = {"eslabon_dominante": e, "area_recomendada": area,
                         "declara_medicion": medicion_rota(t)}

    CASOS_F.write_text("\n".join(json.dumps(c, ensure_ascii=False) for c in casos) + "\n",
                       encoding="utf-8")
    ESPERADO_F.write_text(json.dumps(
        {"_LEEME": "NO ABRIR. Son las etiquetas del Blackbox. Leerlas lo convierte en Eyeball "
                   "y se pierde la única medida de generalización que existe. Para inspeccionar "
                   "un caso: python3 blackbox_calibrar.py quemar N",
         "_semilla": SEMILLA, "casos": esperado}, ensure_ascii=False, indent=1), encoding="utf-8")
    if not QUEMADOS_F.exists():
        QUEMADOS_F.write_text(json.dumps({"quemados": []}, ensure_ascii=False, indent=1),
                              encoding="utf-8")

    print(f"\n{V}{B}{len(casos)} casos generados{F} · semilla {SEMILLA} (reproducible)")
    print(f"  {CASOS_F.name}     entradas — aliméntaselas al motor")
    print(f"  {ESPERADO_F.name}  etiquetas — {R}no abrir{F}")
    print(f"\n{G}Distribución por eslabón esperado (0 = ningún eslabón roto):{F}")
    for e in sorted(cuenta):
        print(f"  E{e}: {cuenta[e]}")
    techo = f"{len(casos) * 45:,}".replace(",", ".")
    print(f"\n{G}Costo estimado de una corrida completa: {len(casos)} llamadas de ruteo.{F}")
    print(f"{G}Con Sonnet 5 + caché, el PRD §5.5.1 da ~$45 CLP por informe COMPLETO; el ruteo{F}")
    print(f"{G}solo es más barato, así que ~${techo} CLP es un techo, no la cifra.{F}")
    return 0


def evaluar(ruta):
    if not ESPERADO_F.exists():
        sys.exit(f"{R}No hay set generado. Corre: blackbox_calibrar.py generar{F}")
    esperado = json.loads(ESPERADO_F.read_text(encoding="utf-8"))["casos"]
    quemados = set(json.loads(QUEMADOS_F.read_text(encoding="utf-8"))["quemados"])
    preds = {}
    for linea in pathlib.Path(ruta).read_text(encoding="utf-8").splitlines():
        if linea.strip():
            d = json.loads(linea)
            preds[d["id"]] = d

    activos = [k for k in esperado if k not in quemados]
    evaluados = [k for k in activos if k in preds]
    if not evaluados:
        sys.exit(f"{R}Ninguna predicción corresponde a un caso activo del Blackbox.{F}")

    ok_e = sum(preds[k].get("eslabon_dominante") == esperado[k]["eslabon_dominante"]
               for k in evaluados)
    ok_a = sum(preds[k].get("area_recomendada") == esperado[k]["area_recomendada"]
               for k in evaluados)
    # Matriz de confusión AGREGADA. Es lo que Ng permite mirar del Blackbox: categorías de
    # error, nunca ejemplos. Dice QUÉ se confunde con qué; el POR QUÉ exige quemar casos.
    conf = Counter((esperado[k]["eslabon_dominante"], preds[k].get("eslabon_dominante"))
                   for k in evaluados
                   if preds[k].get("eslabon_dominante") != esperado[k]["eslabon_dominante"])

    # Medición: solo se puntúa sobre los casos que la exigen.
    exigen = [k for k in evaluados if esperado[k].get("declara_medicion")]
    declaran = [k for k in exigen if preds[k].get("medicion")]

    print(f"\n{B}BLACKBOX · {len(evaluados)} casos evaluados{F}\n" + "─" * 62)
    print(f"  Ruteo correcto (eslabón)  {ok_e}/{len(evaluados)}  "
          f"{V if ok_e/len(evaluados) >= .9 else A}{100*ok_e/len(evaluados):.1f}%{F}")
    print(f"  Área correcta             {ok_a}/{len(evaluados)}  "
          f"{V if ok_a/len(evaluados) >= .9 else A}{100*ok_a/len(evaluados):.1f}%{F}")
    if exigen:
        pc = 100 * len(declaran) / len(exigen)
        print(f"  Medición declarada        {len(declaran)}/{len(exigen)}  "
              f"{V if pc >= 90 else R}{pc:.1f}%{F}   {G}(s2 rota){F}")
    if len(evaluados) < len(activos):
        print(f"  {A}Sin predicción: {len(activos)-len(evaluados)} casos{F}")

    if conf:
        print(f"\n{G}Confusiones más frecuentes (esperado → obtenido):{F}")
        for (esp, obt), c in conf.most_common(8):
            print(f"  E{esp} → {'E'+str(obt) if obt is not None else 'nada':<4} {c:>4}")
        print(f"\n{G}Esto dice QUÉ se confunde, no por qué. Para saber por qué hay que{F}")
        print(f"{G}quemar casos — y quemarlos los saca del Blackbox para siempre.{F}")

    errores = len(evaluados) - ok_e
    print(f"\n{G}Ng (ML Yearning cap. 18): con ~20 errores se empieza a distinguir la fuente;{F}")
    print(f"{G}con ~50 se distingue bien. Aquí hay {errores}.{F}")
    if 0 < errores < 20:
        print(f"{A}Pocos errores para hacer análisis por categoría: amplía el set antes de "
              f"sacar conclusiones.{F}")
    print("\n" + "─" * 62)
    print(f"{G}Compara este número con el de los 8 casos dorados (Eyeball). Si el Eyeball{F}")
    print(f"{G}mejora mucho más rápido que esto, estás sobreajustando a los ocho.{F}")
    return 0


def quemar(n, ruta=None):
    esperado = json.loads(ESPERADO_F.read_text(encoding="utf-8"))["casos"]
    reg = json.loads(QUEMADOS_F.read_text(encoding="utf-8"))
    quemados = set(reg["quemados"])
    candidatos = [k for k in esperado if k not in quemados]
    if ruta:  # quemar preferentemente los que fallaron
        preds = {}
        for linea in pathlib.Path(ruta).read_text(encoding="utf-8").splitlines():
            if linea.strip():
                d = json.loads(linea)
                preds[d["id"]] = d
        fallidos = [k for k in candidatos
                    if k in preds
                    and preds[k].get("eslabon_dominante") != esperado[k]["eslabon_dominante"]]
        candidatos = fallidos or candidatos
    nuevos = candidatos[:n]
    reg["quemados"] = sorted(quemados | set(nuevos))
    QUEMADOS_F.write_text(json.dumps(reg, ensure_ascii=False, indent=1), encoding="utf-8")
    casos = {json.loads(l)["id"]: json.loads(l)
             for l in CASOS_F.read_text(encoding="utf-8").splitlines() if l.strip()}
    print(f"\n{A}{B}{len(nuevos)} casos quemados{F} — salen del Blackbox de forma permanente.")
    print(f"{G}Quedan {len(esperado)-len(reg['quemados'])} sin mirar.{F}\n")
    for k in nuevos:
        print(f"{B}{k}{F}  esperado: E{esperado[k]['eslabon_dominante']} · "
              f"{esperado[k]['area_recomendada']}")
        print(f"  {json.dumps(casos[k]['triage'], ensure_ascii=False)}\n")
    return 0


def estado():
    if not ESPERADO_F.exists():
        print(f"{A}No hay set generado.{F}")
        return 0
    esperado = json.loads(ESPERADO_F.read_text(encoding="utf-8"))["casos"]
    quemados = json.loads(QUEMADOS_F.read_text(encoding="utf-8"))["quemados"]
    print(f"\n{B}ESTADO DEL BLACKBOX{F}\n" + "─" * 62)
    print(f"  Eyeball (casos dorados, escritos a mano)  {len(DORADOS)}")
    print(f"  Blackbox generado                         {len(esperado)}")
    print(f"  Quemados (ya mirados)                     {len(quemados)}")
    print(f"  {B}Sin mirar{F}                                 {len(esperado)-len(quemados)}")
    if len(quemados) > len(esperado) * 0.3:
        print(f"\n{A}Más de un tercio del set está quemado. Ng (cap. 17): cuando el set que{F}")
        print(f"{A}miras se agota, hay que descartarlo y generar uno nuevo con otra semilla.{F}")
    return 0


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    cmd = args[0]
    if cmd == "verificar":
        return verificar()
    if cmd == "generar":
        n = int(args[args.index("--n") + 1]) if "--n" in args else 240
        return generar(n)
    if cmd == "evaluar":
        return evaluar(args[1])
    if cmd == "quemar":
        return quemar(int(args[1]), args[2] if len(args) > 2 else None)
    if cmd == "estado":
        return estado()
    sys.exit(__doc__)


if __name__ == "__main__":
    sys.exit(main())
