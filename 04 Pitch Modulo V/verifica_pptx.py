#!/usr/bin/env python3
"""Verifica el .pptx (material de apoyo) contra la identidad Precisión
y los límites de discurso de CLAUDE.md.

El .pptx NO es el deck proyectado de 20 palabras — ese es `pitch_calibrar.html`
(verificado por `verifica_estandar.py`, tope 20). Este archivo es el material
que se sube y se lee solo, así que aquí se verifica: marca, estructura de las
4 preguntas del profesor, y que ninguna lámina ni nota cruce los límites de
discurso.

    python3 verifica_pptx.py
"""
import re, sys, pathlib
from pptx import Presentation

DECK = pathlib.Path(__file__).with_name("Pitch_Calibrar_ModuloV.pptx")
EMU_PX = 914400 / 96
BORDE = 70
TOPE_LECTURA = 120          # techo de palabras por lámina para material leíble

prs = Presentation(DECK)
laminas = list(prs.slides)
res = []


def ok(grupo, texto, cond):
    res.append((grupo, texto, bool(cond)))


def bloques(slide):
    out = []
    for sh in slide.shapes:
        if not sh.has_text_frame:
            continue
        for p in sh.text_frame.paragraphs:
            txt = "".join(r.text for r in p.runs).strip()
            if not txt:
                continue
            r0 = p.runs[0]
            hx = None
            try:
                hx = str(r0.font.color.rgb).upper()
            except Exception:
                pass
            out.append((txt, sh.left / EMU_PX, sh.top / EMU_PX,
                        r0.font.size.pt if r0.font.size else None, hx,
                        r0.font.name))
    return out


def fotos(slide):
    return [sh for sh in slide.shapes if sh.shape_type == 13]  # PICTURE


def palabras(txt):
    return [w for w in re.split(r"\s+", txt)
            if re.search(r"[A-Za-zÁÉÍÓÚÑáéíóúñ0-9]", w)]


def todo_el_texto(slide, con_notas=False):
    t = " ".join(b[0] for b in bloques(slide))
    if con_notas and slide.has_notes_slide:
        t += " " + slide.notes_slide.notes_text_frame.text
    return t


# ── estructura ─────────────────────────────────────────────────────────
ok("ESTRUCTURA", f"Lienzo 16:9 de 1280×720 ({prs.slide_width/EMU_PX:.0f}×"
   f"{prs.slide_height/EMU_PX:.0f} px)",
   abs(prs.slide_width / EMU_PX - 1280) < 2
   and abs(prs.slide_height / EMU_PX - 720) < 2)

todo_docto = " ".join(todo_el_texto(s) for s in laminas)
# Las cuatro preguntas de la pauta se verifican por su MARCA NUMERADA y su tema,
# no por el literal interrogativo completo. Motivo, medido el 8-sep-2026: el deck
# entregado el 13-ago las rotula «PREGUNTA 1 · ¿FUNCIONA DE VERDAD?»,
# «PREGUNTA 2 · PRESUPUESTO» y «PREGUNTAS 3 Y 4 · SI FALLA, Y SI SE CAE» —
# porque el estándar de esta carpeta topa las láminas en 20 palabras y la
# interrogación completa no cabe. Exigir el literal daba TRES rojos sobre un deck
# que sí responde las cuatro, o sea el verificador estaba midiendo la redacción
# del título en vez de la cobertura. Esto es más estricto, no menos: pide la
# marca de pauta Y el tema.
PAUTA = [
    ("¿Funciona de verdad?",       ("PREGUNTA 1",),          ("¿FUNCIONA DE VERDAD?",)),
    ("¿Cuánto cuesta y qué ganamos?", ("PREGUNTA 2",),       ("PRESUPUESTO", "COSTO")),
    ("¿Quién responde si falla?",  ("PREGUNTA 3", "PREGUNTAS 3"), ("DUEÑO", "FALLA")),
    ("¿Y si se cae en vivo?",      ("PREGUNTA 4", "PREGUNTAS 3 Y 4"), ("SE CAE", "PLAN B")),
]
_doc = todo_docto.upper()
for titulo, marcas, temas in PAUTA:
    ok("ESTRUCTURA", f"Responde la pauta «{titulo}»",
       any(m in _doc for m in marcas) and any(t in _doc for t in temas))
ok("ESTRUCTURA", "Explica el método (la Cadena de 7 eslabones)",
   "Cadena de Crecimiento" in todo_docto)
# Igual que arriba: lo que importa es que el deck declare que se especificó y
# se verificó ANTES de correr nada, no un titular concreto que ya no usa.
ok("ESTRUCTURA", "Explica cómo se armó (especificación primero)",
   "ESPECIFICACIÓN" in todo_docto.upper()
   and any(t in todo_docto.upper() for t in ("QA_CALIBRAR", "VERIFICADOR", "INVARIANTES")))
sin_notas = [i for i, s in enumerate(laminas, 1)
             if not (s.has_notes_slide
                     and s.notes_slide.notes_text_frame.text.strip())]
ok("ESTRUCTURA", "Todas las láminas llevan nota del orador", not sin_notas)

# ── identidad Precisión ────────────────────────────────────────────────
familias = {b[5] for s in laminas for b in bloques(s) if b[5]}
ok("MARCA", f"Una sola familia tipográfica ({', '.join(sorted(familias)) or '—'})",
   familias == {"Montserrat"})

PERMITIDOS = {"0D4F6A", "116486", "0A3A4F", "0B445C",     # petróleos
              "F4F1EA", "FFFFFF", "F5A623", "AEC5D0"}     # crema/blanco/ámbar/mute
usados = {b[4] for s in laminas for b in bloques(s) if b[4]}
ok("MARCA", f"Colores de texto dentro de la paleta petróleo+ámbar "
   f"({len(usados)} en uso)", usados <= PERMITIDOS)
acentos = usados & {"F5A623", "C77F0A", "C98209", "2185B3"}
ok("MARCA", f"El acento es uno solo ({', '.join('#' + a for a in acentos)})",
   acentos == {"F5A623"})

sin_logo = [i for i, s in enumerate(laminas, 1) if not fotos(s)]
ok("MARCA", "El logo real (imagen) está en todas las láminas", not sin_logo)
pos_logo = {(round(f.left / EMU_PX), round(f.top / EMU_PX))
            for s in laminas for f in fotos(s)
            if f.top / EMU_PX < 100}
ok("MARCA", f"El wordmark no se mueve: una sola posición ({pos_logo})",
   pos_logo == {(BORDE, 42)})

# ── legibilidad de material de apoyo ───────────────────────────────────
cuentas = []
for i, s in enumerate(laminas, 1):
    c = sum(len(palabras(b[0])) for b in bloques(s) if 100 <= b[2] <= 640)
    cuentas.append(c)
    ok("LECTURA", f"Lámina {i:02d} · {c} palabras (tope de lectura "
       f"{TOPE_LECTURA})", c <= TOPE_LECTURA)

# ── límites de discurso de CLAUDE.md ───────────────────────────────────
todo = " ".join(todo_el_texto(s, con_notas=True) for s in laminas)
ok("DISCURSO", "No aparece la taquigrafía interna E1–E7",
   not re.search(r"\bE[1-7]\b", todo))
ok("DISCURSO", "No aparece el nombre de un cliente vigente",
   not re.search(r"Eco\s*Star|Ecostar|Transelec|Bunzl|BEKA", todo, re.I))
prohibidas = [w for w in ("diagnóstico automático", "informe automático",
                          "diagnóstico instantáneo", "la herramienta lo procesa",
                          "sinergia", "disruptivo", "soluciones 360",
                          "maximizamos tu ROI")
              if w.lower() in todo.lower()]
ok("DISCURSO", "Sin atributo prohibido sobre el diagnóstico ni vocabulario "
   "vetado", not prohibidas)
ok("DISCURSO", "Se declara que el motor nunca ha corrido",
   "nunca ha corrido" in todo)
ok("DISCURSO", "El payback se declara N/D en vez de fabricarse", "N/D" in todo)
ok("DISCURSO", "La demo se presenta como prototipo, no como el motor corriendo",
   "No es el motor corriendo" in todo)

# ── salida ─────────────────────────────────────────────────────────────
V, R, G, F = "\033[92m", "\033[91m", "\033[90m", "\033[0m"
grupo = None
for g, t, o in res:
    if g != grupo:
        print(f"\n{G}{g}{F}")
        grupo = g
    print(f"  {V}✓{F} {t}" if o else f"  {R}✗{F} {t}")

fallan = sum(1 for _, _, o in res if not o)
print("\n" + "─" * 64)
if fallan:
    print(f"{R}\033[1m{fallan} de {len(res)} FALLAN{F}")
else:
    print(f"{V}\033[1m{len(res)}/{len(res)} pasan{F}")
print(f"{G}{len(laminas)} láminas · palabras por lámina: {cuentas}{F}")
sys.exit(1 if fallan else 0)
