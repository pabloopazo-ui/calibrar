#!/usr/bin/env python3
"""
CALIBRAR · Generador de «Arquitectura de Calibrar» (artifact interno).

Arma Calibrar/Arquitectura_Calibrar.html desde _arquitectura/plantilla.html y le
agrega dos piezas que se leen del disco en cada corrida, no se transcriben:

  1. El árbol completo de carpetas de Calibrar/, con líneas por archivo.
  2. Un visor del código fuente.

Regla de publicación, y es la razón de que esto sea un generador y no un .html
editado a mano: NO SALE NINGÚN DATO DE PROSPECTOS NI DE CLIENTES.
  - 02 Prospeccion/, Reuniones/ y Entregables/ se muestran como carpeta con su
    conteo, sin contenido ni nombres de archivo.
  - Los nombres de clientes y de sus personas se reemplazan por CLIENTE_A, B…
    también en los nombres de archivo del árbol.
  - Los dos bloques de data.js que traen el caso de un cliente se vacían.
  - Los documentos (PRD, Matriz, anexos) se listan pero no se abren: llevan
    casos dorados con datos de clientes.
  - Al final se vuelve a barrer la salida completa y el script se DETIENE si
    encuentra un nombre de cliente o un correo. Un filtro que no se verifica no
    es un filtro.

Uso:  python3 "Calibrar/_arquitectura/build_arquitectura.py"
Después: publicar Calibrar/Arquitectura_Calibrar.html sobre el mismo artifact.
"""

import html
import json
import re
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent                                   # …/Calibrar
PLANTILLA = AQUI / "plantilla.html"
SALIDA = RAIZ / "Arquitectura_Calibrar.html"

# ── Qué se oculta ────────────────────────────────────────────────────────────
# Carpetas que se muestran solo como «N archivos», sin nombres adentro.
CARPETAS_CERRADAS = {
    "02 Prospeccion": "datos de prospectos",
    "04 Cabina/Reuniones": "reuniones con clientes",
    "04 Cabina/Entregables": "entregables de clientes",
    "_rescate_cache_navegador_2026-09-07": "copias de rescate del 7-sep-2026",
}
NOMBRE_CERRADO = {"_Archivo obsoleto": "versiones superadas"}
OMITIR = {".DS_Store", "__pycache__", "_arquitectura", "Arquitectura_Calibrar.html"}

# Archivos que se listan pero no se abren en el visor, con su motivo.
NO_VISIBLES = {
    "01 Producto/casos_reales.py": "casos de clientes reales",
    "01 Producto/Fixture_Ecostar_Evaluador.json": "salida de un cliente real",
    "04 Cabina/ATILA_aplicado.html": "demo aplicado a un prospecto",
}
CODIGO = {".js", ".py", ".html", ".css", ".command"}
LENGUAJE = {".js": "javascript", ".py": "python", ".html": "xml", ".css": "css",
            ".command": "bash", ".md": "markdown"}

# Nombres de clientes, prospectos y sus personas → token estable por cliente.
CLIENTES = [
    (r"eco\s?star", "CLIENTE_A"),
    (r"bunzl|vicsa", "CLIENTE_B"),
    (r"aforo", "CLIENTE_C"),
    (r"ambrot", "CLIENTE_D"),
    (r"atila", "CLIENTE_E"),
    (r"part[ií]culas", "CLIENTE_F"),
    (r"transelec", "CLIENTE_G"),
    (r"beka", "CLIENTE_H"),
    (r"contaboost", "CLIENTE_I"),
    (r"nueva\s+sonrisa", "CLIENTE_J"),
    (r"ecert|uandes|u\.\s?andes|getdata|mundo\s?pro|davanzo|gea\s+store|ecofuga|"
     r"nordek|atricontac|aba\s+consulting|gp\s+motos", "CLIENTE_X"),
    (r"h[eé]ctor|juan\s+carlos|d[ií]az-robles|alyn|gerardo|luis", "PERSONA"),
]
# Borde = cualquier cosa que no sea letra. Con \b, «Fixture_Ecostar» y
# «CASO_ECOSTAR_TRIAGE» pasaban: el guion bajo cuenta como letra para \b.
# Los nombres largos y únicos se buscan además como subcadena, para cazar el
# camelCase («cargarEcostar»); los cortos no, porque «beka» o «luis» caben
# dentro de palabras ajenas.
LETRA = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ"
LARGOS = {"CLIENTE_A", "CLIENTE_B", "CLIENTE_D", "CLIENTE_F", "CLIENTE_G", "CLIENTE_I"}
def _rx(p, token):
    if token in LARGOS:
        return re.compile(p, re.I)
    return re.compile(rf"(?<![{LETRA}])(?:{p})(?![{LETRA}])", re.I)
CLIENTES_RX = [(_rx(p, t), t) for p, t in CLIENTES]
# Dominio sin guion bajo y con TLD de letras: así un decorador de Python
# (`fn@functools.lru_cache`) no se confunde con un correo.
CORREO_RX = re.compile(r"[\w.+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}\b")
def fugas_de(texto):
    return {m.group(0) for rx, _ in CLIENTES_RX for m in rx.finditer(texto)}

# data.js: bloques con el caso de un cliente, se vacían enteros.
BLOQUES_CLIENTE = re.compile(
    r"^const (CASO_ECOSTAR_TRIAGE|ENTREGABLE_ECOSTAR) = \{.*?^\};", re.S | re.M)


def anonimizar(texto):
    texto = CORREO_RX.sub("correo@oculto", texto)
    for rx, token in CLIENTES_RX:
        texto = rx.sub(token, texto)
    return texto


def limpiar_fuente(rel, texto):
    if rel == "03 Front/assets/data.js":
        texto = BLOQUES_CLIENTE.sub(
            lambda m: f"const {m.group(1)} = {{ /* datos del caso de un cliente: no se publican */ }};",
            texto)
    if rel == "04 Cabina/assets/config.js":
        texto = re.sub(r"(CABINA_GOOGLE_CLIENT_ID\s*=\s*)(['\"]).*?\2", r"\1''", texto)
    return anonimizar(texto)


def es_respaldo(nombre):
    return ".backup" in nombre or "_backup" in nombre or nombre.startswith("backup_")


def contar(p):
    return sum(1 for x in p.rglob("*") if x.is_file() and x.name not in OMITIR)


def lineas(p):
    try:
        return p.read_bytes().count(b"\n") + 1
    except OSError:
        return 0


# ── Árbol ────────────────────────────────────────────────────────────────────
fuentes = {}          # ruta pública → {texto, lenguaje, lineas}
filas = []            # html del árbol
totales = {"archivos": 0, "visibles": 0, "lineas_visibles": 0}


def fila(prefijo, contenido):
    filas.append(f'<div class="tr"><span class="pre">{html.escape(prefijo)}</span>{contenido}</div>')


def recorrer(carpeta, prefijo):
    hijos = sorted((h for h in carpeta.iterdir() if h.name not in OMITIR and not h.name.startswith(".")),
                   key=lambda h: (h.is_file(), h.name.lower()))
    respaldos = [h for h in hijos if h.is_file() and es_respaldo(h.name)]
    hijos = [h for h in hijos if h not in respaldos]
    items = hijos + (["__respaldos__"] if respaldos else [])
    for i, h in enumerate(items):
        ultimo = i == len(items) - 1
        rama = "└── " if ultimo else "├── "
        sigue = "    " if ultimo else "│   "
        if h == "__respaldos__":
            totales["archivos"] += len(respaldos)
            fila(prefijo + rama, f'<span class="x">{len(respaldos)} respaldos <code>.backup_*</code></span>'
                                 f'<span class="tag t-mute">no se publican</span>')
            continue
        rel = h.relative_to(RAIZ).as_posix()
        nombre = html.escape(anonimizar(h.name))
        if h.is_dir():
            motivo = CARPETAS_CERRADAS.get(rel) or NOMBRE_CERRADO.get(h.name)
            if motivo:
                n = contar(h)
                totales["archivos"] += n
                fila(prefijo + rama, f'<span class="d">{nombre}/</span><span class="n">{n} archivos</span>'
                                     f'<span class="tag t-mute">no se publica · {motivo}</span>')
                continue
            fila(prefijo + rama, f'<span class="d">{nombre}/</span>')
            recorrer(h, prefijo + sigue)
            continue
        totales["archivos"] += 1
        n = lineas(h) if h.suffix in CODIGO | {".md", ".txt", ".json"} else None
        cifra = f'<span class="n">{n:,}</span>'.replace(",", ".") if n else ""
        visible = (h.suffix in CODIGO or h.name == "LEEME.md") and rel not in NO_VISIBLES
        if visible:
            publica = anonimizar(rel)
            fuentes[publica] = {"t": limpiar_fuente(rel, h.read_text(errors="replace")),
                                "l": LENGUAJE.get(h.suffix, "plaintext"), "n": n}
            totales["visibles"] += 1
            totales["lineas_visibles"] += n or 0
            fila(prefijo + rama, f'<button class="f" type="button" data-p="{html.escape(publica)}">{nombre}</button>{cifra}')
        else:
            motivo = NO_VISIBLES.get(rel) or ("documento con casos de clientes" if h.suffix in {".md", ".txt"}
                                             else "dato o binario")
            fila(prefijo + rama, f'<span class="x">{nombre}</span>{cifra}<span class="tag t-mute">{motivo}</span>')


fila("", '<span class="d">Calibrar/</span>')
recorrer(RAIZ, "")

# ── Sección nueva ────────────────────────────────────────────────────────────
miles = lambda x: f"{x:,}".replace(",", ".")
opciones = "\n".join(f'<option value="{html.escape(p)}">{html.escape(p)}</option>' for p in fuentes)
SECCION = f"""
<section id="arbol">
  <div class="eyebrow">Árbol del proyecto</div>
  <h2>{miles(totales['archivos'])} archivos en Calibrar, y {totales['visibles']} se pueden abrir aquí</h2>
  <p>El árbol se lee del disco cada vez que se genera esta página. Los archivos en azul abren su código en el visor de abajo. Las carpetas y archivos en gris se listan para mostrar la estructura, pero su contenido no se publica.</p>
  <div class="tree-tools">
    <label for="filtro" class="eyebrow">Filtrar</label>
    <input id="filtro" type="search" placeholder="motor, cabina, qa…" autocomplete="off">
  </div>
  <div class="tree" id="tree">
{chr(10).join(filas)}
  </div>
  <p class="read">Lectura: el código que importa vive en cuatro lugares. <code>03 Front/assets/</code> tiene el modelo de datos y el motor de ruteo. <code>04 Cabina/assets/</code> tiene la cabina, la capa de API y las capas de conducción. Los <code>.py</code> de <code>01 Producto/</code> y <code>04 Cabina/</code> son los QA y el servidor local. Todo lo demás es documentación, datos o respaldo.</p>
</section>

<section id="codigo">
  <div class="eyebrow">Visor del código fuente</div>
  <h2>{miles(totales['lineas_visibles'])} líneas de código que se pueden leer sin abrir el disco</h2>
  <div class="viewer">
    <div class="vbar">
      <label for="sel-archivo" class="eyebrow">Archivo</label>
      <select id="sel-archivo">
{opciones}
      </select>
      <span class="vmeta" id="vmeta"></span>
    </div>
    <div class="vcode"><pre><code id="vsrc" class="hljs"></code></pre></div>
  </div>
  <p class="read">Lectura: los nombres de clientes y de sus personas aparecen como <code>CLIENTE_A</code>, <code>CLIENTE_B</code> y siguientes, los correos como <code>correo@oculto</code>, y los dos bloques de <code>data.js</code> con el caso de un cliente están vaciados. Fuera de eso, el código es el mismo que corre en la cabina.</p>
</section>
"""

CSS = """
:root{--kw:#7a3e9d;--str:#2e7d5b;--com:#7d8b92;--num:#b0560b;--fn:#0D4F6A;--tag:#9b2c5a;--attr:#8a5a00}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--kw:#c79be6;--str:#7fd1a6;--com:#7e939c;--num:#f2a66a;--fn:#7cc7e6;--tag:#ef8fb6;--attr:#f2c46d}}
:root[data-theme="dark"]{--kw:#c79be6;--str:#7fd1a6;--com:#7e939c;--num:#f2a66a;--fn:#7cc7e6;--tag:#ef8fb6;--attr:#f2c46d}
.tree-tools{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.tree-tools input{font:inherit;font-size:15px;padding:6px 10px;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--ink);min-width:0;width:min(320px,100%)}
.tree{overflow:auto;max-height:70vh;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:12px 14px;font-family:var(--f-mono);font-size:13px;line-height:1.75}
.tr{white-space:nowrap;display:flex;align-items:baseline;gap:6px}
.tr.oculta{display:none}
.tr .pre{white-space:pre;color:var(--line)}
.tr .d{font-weight:600;color:var(--ink)}
.tr .x{color:var(--dim)}
.tr .n{color:var(--dim);font-size:11.5px;font-variant-numeric:tabular-nums}
.tr .tag{font-size:10px;padding:0 6px}
.t-mute{color:var(--dim)}
.tr button.f{font:inherit;background:none;border:0;padding:0;color:var(--brand-ink);cursor:pointer;text-decoration:underline;text-decoration-color:transparent;text-underline-offset:3px}
.tr button.f:hover,.tr button.f[aria-current="true"]{text-decoration-color:currentColor}
.tr button.f[aria-current="true"]{font-weight:600}
.viewer{border:1px solid var(--line);border-radius:8px;background:var(--surface);display:flex;flex-direction:column;min-width:0;scroll-margin-top:64px}
.vbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;border-bottom:1px solid var(--line);background:var(--surface-2);border-radius:8px 8px 0 0}
.vbar select{font-family:var(--f-mono);font-size:13px;padding:5px 8px;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--ink);min-width:0;max-width:100%}
.vmeta{font-family:var(--f-mono);font-size:12px;color:var(--dim)}
.vcode{overflow:auto;max-height:78vh}
.vcode pre{margin:0;padding:12px 0;font-family:var(--f-mono);font-size:12.5px;line-height:1.6;counter-reset:ln}
.vcode code{display:block;background:none;padding:0;color:var(--ink);font-size:inherit}
.vcode .ln{display:block;padding-right:16px;white-space:pre}
.vcode .ln::before{counter-increment:ln;content:counter(ln);display:inline-block;width:4.2em;padding-right:1em;margin-right:.8em;text-align:right;color:var(--dim);border-right:1px solid var(--line);user-select:none;font-variant-numeric:tabular-nums}
.hljs-keyword,.hljs-literal,.hljs-built_in,.hljs-selector-tag{color:var(--kw)}
.hljs-string,.hljs-regexp,.hljs-template-string{color:var(--str)}
.hljs-comment,.hljs-quote{color:var(--com);font-style:italic}
.hljs-number,.hljs-symbol{color:var(--num)}
.hljs-title,.hljs-function .hljs-title,.hljs-title.function_,.hljs-section{color:var(--fn)}
.hljs-tag,.hljs-name,.hljs-selector-class,.hljs-selector-id{color:var(--tag)}
.hljs-attr,.hljs-attribute,.hljs-property,.hljs-variable,.hljs-params,.hljs-meta{color:var(--attr)}
"""

SCRIPT = """
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script type="application/json" id="fuentes">%s</script>
<script>
(function(){
  var F = JSON.parse(document.getElementById('fuentes').textContent);
  var sel = document.getElementById('sel-archivo'), src = document.getElementById('vsrc'),
      meta = document.getElementById('vmeta');
  function esc(s){return s.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
  function abrir(p, mover){
    var f = F[p]; if(!f) return;
    sel.value = p;
    var cuerpo;
    try { cuerpo = (window.hljs && f.t.length < 400000) ? hljs.highlight(f.t, {language: f.l, ignoreIllegals: true}).value : esc(f.t); }
    catch(e){ cuerpo = esc(f.t); }
    /* una línea por <span class="ln">, cerrando y reabriendo los spans que cruzan el salto */
    var abiertos = [], out = [];
    cuerpo.split('\\n').forEach(function(linea){
      var pre = abiertos.join('');
      var rx = /<span[^>]*>|<\\/span>/g, m;
      while((m = rx.exec(linea))){ if(m[0] === '</span>') abiertos.pop(); else abiertos.push(m[0]); }
      out.push('<span class="ln">' + pre + linea + abiertos.map(function(){return '</span>';}).join('') + '</span>');
    });
    src.innerHTML = out.join('');
    meta.textContent = (f.n || 0).toLocaleString('es-CL') + ' líneas · ' + f.l;
    document.querySelectorAll('.tr button.f').forEach(function(b){ b.setAttribute('aria-current', b.dataset.p === p ? 'true' : 'false'); });
    if (mover) document.getElementById('codigo').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  }
  sel.addEventListener('change', function(){ abrir(sel.value, false); });
  document.getElementById('tree').addEventListener('click', function(e){
    var b = e.target.closest('button.f'); if (b) abrir(b.dataset.p, true);
  });
  document.getElementById('filtro').addEventListener('input', function(){
    var q = this.value.trim().toLowerCase();
    document.querySelectorAll('#tree .tr').forEach(function(r){
      r.classList.toggle('oculta', q !== '' && r.textContent.toLowerCase().indexOf(q) === -1 && !r.querySelector('.d'));
    });
  });
  abrir(%s, false);
})();
</script>
"""

# ── Armado ───────────────────────────────────────────────────────────────────
# La prosa de la plantilla también nombraba reuniones de clientes: pasa por el mismo filtro.
plantilla = anonimizar(PLANTILLA.read_text())
for marca in ("<!--@ARBOL_Y_VISOR@-->", "/*@CSS_VISOR@*/", "<!--@SCRIPT_VISOR@-->"):
    if plantilla.count(marca) != 1:
        sys.exit(f"✗ La plantilla no trae exactamente una marca {marca}")

inicial = "03 Front/assets/motor.js"
if inicial not in fuentes:
    sys.exit(f"✗ No encontré {inicial} entre las fuentes visibles")
datos = json.dumps(fuentes, ensure_ascii=False).replace("</", "<\\/")
salida = (plantilla
          .replace("<!--@ARBOL_Y_VISOR@-->", SECCION)
          .replace("/*@CSS_VISOR@*/", CSS)
          .replace("<!--@SCRIPT_VISOR@-->", SCRIPT % (datos, json.dumps(inicial))))

# ── Verificación: nada de clientes ni correos en lo que se publica ───────────
fugas = sorted(fugas_de(salida) |
               {m.group(0) for m in CORREO_RX.finditer(salida)} - {"correo@oculto"})
if fugas:
    sys.exit("✗ La salida trae datos que no se publican: " + ", ".join(fugas))
# El nombre del maestro sí puede aparecer (el código lo cita); lo que no puede
# aparecer es el CONTENIDO de 02 Prospeccion/, ni siquiera su listado.
adentro = [h.name for h in (RAIZ / "02 Prospeccion").rglob("*")
           if h.is_file() and not h.name.startswith("Base_Prospectos") and len(h.stem) > 6]
coladas = sorted({n for n in adentro if n in salida})
if coladas:
    sys.exit("✗ Se coló el listado de 02 Prospeccion/: " + ", ".join(coladas[:5]))

SALIDA.write_text(salida)
print(f"✓ {SALIDA.relative_to(RAIZ.parent)} · {totales['archivos']} archivos en el árbol · "
      f"{totales['visibles']} visibles · {totales['lineas_visibles']} líneas · "
      f"{len(salida)/1024:.0f} KB · 0 nombres de clientes · 0 correos")
