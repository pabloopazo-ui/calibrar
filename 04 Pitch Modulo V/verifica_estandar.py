#!/usr/bin/env python3
"""Verifica el pitch contra las 6 decisiones del Manual de Marca Precisión v1.0.

No lee el archivo buscando frases: cuenta lo que efectivamente sale a la lámina.
El texto de cabecera fija (marca, tag, pie, número) NO cuenta, igual que las
notas del orador — es la regla de la decisión 6.

    python3 verifica_estandar.py
"""
import re, sys, html, pathlib, collections

DECK = pathlib.Path(__file__).with_name("pitch_calibrar.html")
TOPE_PALABRAS = 20
ACENTO = "#F5A623"
BORDE = "70px"

src = DECK.read_text(encoding="utf-8")
css = "\n".join(re.findall(r"<style>(.*?)</style>", src, re.S))
cuerpo = re.sub(r"<style>.*?</style>|<script>.*?</script>|<!--.*?-->", "", src, flags=re.S)
laminas = re.findall(r'<section[^>]*class="[^"]*slide[^"]*"[^>]*>(.*?)</section>', cuerpo, re.S)

res = []


def ok(grupo, texto, cond):
    res.append((grupo, texto, bool(cond)))


def palabras(fragmento):
    """Palabras visibles del área de contenido, sin cabecera fija."""
    for cls in ("brand", "tag", "foot", "pageno"):
        fragmento = re.sub(
            r'<(\w+)[^>]*class="[^"]*\b' + cls + r'\b[^"]*"[^>]*>.*?</\1>',
            " ", fragmento, flags=re.S)
    txt = html.unescape(re.sub(r"<[^>]+>", " ", fragmento))
    return [w for w in re.split(r"\s+", txt) if re.search(r"[A-Za-zÁÉÍÓÚÑáéíóúñ0-9]", w)]


# ── 1 · dos tipografías ────────────────────────────────────────────────────
familias = set(re.findall(r"font-family:\s*'([^']+)'", css))
ok("TIPOGRAFÍA", f"Una sola familia de marca ({', '.join(sorted(familias)) or '—'})",
   familias == {"Montserrat"})
pesos = {int(p) for p in re.findall(r"font-weight:\s*(\d{3})", css)}
ok("TIPOGRAFÍA", f"Los pesos se reparten en dos roles ({sorted(pesos)})",
   pesos <= {400, 500, 600, 700, 800, 900} and bool(pesos & {800, 900}) and bool(pesos & {400, 500}))

# ── 2 · tres colores, un acento ────────────────────────────────────────────
hexes = {h.upper() for h in re.findall(r"#([0-9a-fA-F]{6})", css)}
permitidos = {"04141B", "07222E", "0D4F6A", "F4F1EA", "F5A623", "8AA4AF",
              "0E5876", "0D3547", "FFFFFF", "5B7078"}
ok("COLOR", f"Sin colores fuera de la paleta ({len(hexes)} en uso)",
   hexes <= permitidos)
acentos = {h for h in hexes if h in {"F5A623", "C77F0A", "C98209"}}
ok("COLOR", f"El acento es uno solo ({', '.join('#' + a for a in acentos)})",
   acentos == {"F5A623"})
ok("COLOR", "#0D4F6A se usa como superficie, no como acento",
   not re.search(r"color:\s*var\(--pet\)", css))

# ── 3 · una grilla ─────────────────────────────────────────────────────────
arranques = collections.Counter(re.findall(r"left:\s*(\d+px)", css))
ok("GRILLA", f"Todo arranca en el mismo borde ({BORDE} × {arranques[BORDE]})",
   arranques and arranques.most_common(1)[0][0] == BORDE)
ok("GRILLA", "El borde derecho respeta la misma medida",
   set(re.findall(r"right:\s*(\d+px)", css)) == {BORDE})
ok("GRILLA", "La caja de contenido usa el padding de marca",
   "padding:104px 70px 62px" in css.replace(" ", " "))

# ── 4 · el logo quieto ─────────────────────────────────────────────────────
marcas = re.findall(r'class="brand"', cuerpo)
ok("LOGO", f"La marca está en todas las láminas ({len(marcas)}/{len(laminas)})",
   len(marcas) == len(laminas))
ok("LOGO", "La marca no se mueve: una sola posición declarada",
   len(set(re.findall(r"\.brand\{[^}]*left:\s*(\d+px);top:\s*(\d+px)", css))) == 1)

# ── 5 · un dato por lámina ─────────────────────────────────────────────────
for n, lam in enumerate(laminas, 1):
    cifras = re.findall(r'class="n"', lam)
    ok("DATO", f"Lámina {n:02d} · no hay dos cifras grandes juntas", len(cifras) <= 1)
con_dato = [n for n, l in enumerate(laminas, 1) if 'class="n"' in l]
sin_fuente = [n for n in con_dato if 'class="src"' not in laminas[n - 1]]
ok("DATO", f"Toda cifra grande declara su fuente (láminas {con_dato})", not sin_fuente)

# ── 6 · máximo 20 palabras ─────────────────────────────────────────────────
cuentas = []
for n, lam in enumerate(laminas, 1):
    c = len(palabras(lam))
    cuentas.append(c)
    ok("PALABRAS", f"Lámina {n:02d} · {c} palabras", c <= TOPE_PALABRAS)

# ── salida ─────────────────────────────────────────────────────────────────
V, R, G, F = "\033[92m", "\033[91m", "\033[90m", "\033[0m"
grupo = None
for g, t, o in res:
    if g != grupo:
        print(f"\n{G}{g}{F}")
        grupo = g
    print(f"  {V}✓{F} {t}" if o else f"  {R}✗{F} {t}")

fallan = sum(1 for _, _, o in res if not o)
print("\n" + "─" * 62)
if fallan:
    print(f"{R}\033[1m{fallan} de {len(res)} FALLAN{F}")
else:
    print(f"{V}\033[1m{len(res)}/{len(res)} pasan{F}")
print(f"{G}{len(laminas)} láminas · palabras por lámina: {cuentas} "
      f"· máximo {max(cuentas)}, tope {TOPE_PALABRAS}{F}")
sys.exit(1 if fallan else 0)
