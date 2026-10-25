#!/usr/bin/env python3
"""Genera `Calibrar_Demo.html` — el demo del Módulo V, autocontenido.

POR QUÉ ESTO ES UN GENERADOR Y NO UN .html EDITADO A MANO
─────────────────────────────────────────────────────────
El archivo original se escribió a mano y eso costó dos veces:

1. **Su mapeo de columnas quedó corrido** y siguió corrido tres semanas
   (`Sitio web` decía col 10 cuando es la 11, `Base de licitud` decía 17
   cuando es la 22). Acá los números salen de `FICHA_EMPRESA` en
   `03 Front/assets/data.js`, que es la misma fuente que verifica
   `qa_comercial.py` contra la cabecera real del maestro. El defecto no
   puede volver sin que el QA lo cace.
2. **Se borró en vez de archivarse el 6-sep-2026** y no quedó de dónde
   rehacerlo. Ahora se rehace con un comando.

QUÉ ES Y QUÉ NO ES ESTE ARCHIVO
───────────────────────────────
`CLAUDE.md` fija cuatro usos ante un prospecto, con un archivo cada uno, y
este NO es ninguno de ellos: proyectar el método va por
`03 Front/presentacion.html`, conducir la reunión por `04 Cabina/reunion.html`,
compartir el resultado por `04 Cabina/resultados.html` y el demo aplicado por
`04 Cabina/<PROSPECTO>_aplicado.html`. **Éste es el material histórico del
pitch evaluado del Módulo V (13-ago-2026)**: muestra en una sola pantalla el
método y el entregable, para explicar el proyecto. No se lleva a una visita.

Uso:  python3 build_demo.py   →  Calibrar_Demo.html
"""
import html
import json
import pathlib
import subprocess
import sys

BASE = pathlib.Path(__file__).parent
DATA = BASE.parent / "03 Front" / "assets" / "data.js"
SALIDA = BASE / "Calibrar_Demo.html"

# El cliente del caso es real y vigente. El demo va pre-anonimizado: la regla
# de Ley 21.719 de esta carpeta es cargo o rol, nunca nombre y apellido, y la
# de `03 Front` es que lo proyectado no emite el nombre del cliente.
ANON = "una distribuidora B2B de la RM"


def leer_datos():
    """Extrae los datos del front ejecutando data.js en node, no parseándolo."""
    if not DATA.exists():
        sys.exit("ABORTA: no existe %s" % DATA)
    js = (
        "const fs=require('fs'),vm=require('vm');const c={};vm.createContext(c);"
        "vm.runInContext(fs.readFileSync(%s,'utf8'),c);"
        "vm.runInContext(\"__o=JSON.stringify({CADENA,ENTREGABLE_ECOSTAR,"
        "FICHA_EMPRESA,TRIAGE})\",c);process.stdout.write(c.__o);"
        % json.dumps(str(DATA))
    )
    try:
        out = subprocess.run(["node", "-e", js], capture_output=True, text=True,
                             check=True).stdout
    except FileNotFoundError:
        sys.exit("ABORTA: falta `node` en el PATH (igual que qa_calibrar.py)")
    except subprocess.CalledProcessError as e:
        sys.exit("ABORTA: data.js no evaluó — %s" % e.stderr[:400])
    return json.loads(out)


def e(x):
    return html.escape(str(x), quote=True)


def anonimizar(t):
    """Ningún nombre de cliente sale al HTML."""
    for real in ("Eco Star", "Ecostar", "EcoStar", "ECO STAR"):
        t = t.replace(real, ANON)
    return t


# Dos vocabularios conviven en data.js y NO son lo mismo: la cadena de la
# Cadena usa sano/roto/sin_datos, y el semáforo por capa de E3 usa
# verde/amarillo/rojo/sin_datos. Se mapean los dos a propósito en vez de
# normalizarlos: son escalas distintas y fundirlas escondería un error.
ESTADOS = {
    "sano": ("sano", "Sano"),
    "roto": ("roto", "Roto"),
    "sin_datos": ("nd", "Sin datos"),
    "dominante": ("dom", "Dominante"),
    "verde": ("sano", "Verde"),
    "amarillo": ("nd", "Amarillo"),
    "rojo": ("roto", "Rojo"),
}


def est(v):
    """Falla ruidosamente ante un estado nuevo: un demo que pinta de gris algo
    que el front marca en rojo miente en la dirección más cara."""
    if v not in ESTADOS:
        sys.exit("ABORTA: estado desconocido en data.js -> %r. Agrégalo a ESTADOS." % v)
    return ESTADOS[v]


def construir(d):
    cadena = d["CADENA"]
    ent = d["ENTREGABLE_ECOSTAR"]
    ficha = d["FICHA_EMPRESA"]
    triage = d["TRIAGE"]
    b0, b1 = ent["bloque_0_ruteo"], ent["bloque_1_data"]
    b2, b3, b4 = ent["bloque_2_hipotesis"], ent["bloque_3_soluciones"], ent["bloque_4_etapas"]
    dom = b0["eslabon_dominante"]
    estado = {c["eslabon"]: c["estado"] for c in b0["cadena"]}

    # ── Cadena, cliqueable ────────────────────────────────────────────────
    esl = []
    for c in cadena:
        st = "dominante" if c["n"] == dom else estado.get(c["n"], "sin_datos")
        cls, lbl = est(st)
        esl.append(
            f'<button class="esl {cls}" data-n="{c["n"]}" data-estado="{st}">'
            f'<span class="num">{c["n"]:02d}</span>'
            f'<span class="nom">{e(c["nombre"])}</span>'
            f'<span class="area">{e(c["area"])}</span>'
            f'<span class="dueno">«{e(c["dueno"])}»</span>'
            f'<span class="badge">{lbl}</span></button>')

    # ── Ficha formal, con el número de columna real del maestro ───────────
    fichah = []
    for g in ficha:
        filas = "".join(
            f'<tr><td>{e(c["l"])}</td><td class="col">col {c["col"]}</td>'
            f'<td class="res">reservado</td></tr>' for c in g["campos"])
        fichah.append(f'<h4>{e(g["g"])}</h4><table class="ficha">'
                      f'<thead><tr><th>Campo</th><th>Maestro</th><th>Valor</th></tr>'
                      f'</thead><tbody>{filas}</tbody></table>')

    # ── Triage, borroso hasta mantener apretado ───────────────────────────
    trh = "".join(
        f'<li><b>{e(t.get("id","").upper())}</b> '
        f'<span class="blur">{e(t.get("texto") or t.get("pregunta") or "")}</span></li>'
        for t in triage)

    # ── Cifras y semáforo ─────────────────────────────────────────────────
    cif = "".join(
        f'<div class="cifra"><div class="v">{e(c["valor"])}</div>'
        f'<div class="et">{e(c["etiqueta"])}</div>'
        f'<p>{e(anonimizar(c["lectura"]))}</p>'
        f'<div class="ev">Evidencia: {e(c["evidencia"])} · Referencia: {e(c["referencia"])}</div>'
        f'</div>' for c in b1["cifras_clave"])
    sem = "".join(
        f'<tr class="{est(s["estado"])[0]}"><td>{s["capa"]}</td><td>{e(s["nombre"])}</td>'
        f'<td><span class="pill">{est(s["estado"])[1]}</span></td>'
        f'<td>{e(anonimizar(s["lectura"]))}</td><td class="proc">{e(s["procedencia"])}</td></tr>'
        for s in b1["semaforo_capas"])

    def lista(items, campos):
        out = []
        for it in items:
            partes = [f'<h4>{e(anonimizar(str(it.get(campos[0], ""))))}</h4>']
            for k in campos[1:]:
                if it.get(k):
                    partes.append(f'<p><b>{e(k.replace("_", " "))}:</b> '
                                  f'{e(anonimizar(str(it[k])))}</p>')
            out.append('<article class="card">' + "".join(partes) + '</article>')
        return "".join(out)

    hip = lista(b2["hipotesis"], list(b2["hipotesis"][0].keys()))
    sol = lista(b3["soluciones"], list(b3["soluciones"][0].keys()))
    eta = lista(b4["etapas"], list(b4["etapas"][0].keys()))

    return PLANTILLA.format(
        anon=e(ANON), rubro=e(ent["meta"]["rubro"]), periodo=e(ent["meta"]["periodo"]),
        eslabones="".join(esl), ficha="".join(fichah), triage=trh,
        porque=e(anonimizar(b0["por_que_este_y_no_otro"])),
        noes=e(anonimizar(b0["que_NO_es_tu_problema"])),
        area=e(b0["area_recomendada"]), area2=e(b0["area_secundaria"]),
        cifras=cif, semaforo=sem, hipotesis=hip, soluciones=sol, etapas=eta,
        fuera=e(anonimizar(b4.get("fuera_de_nuestro_alcance", ""))),
        cierre=e(anonimizar(b4.get("cierre", ""))),
        n_esl=len(cadena), n_tri=len(triage), n_cif=len(b1["cifras_clave"]))


PLANTILLA = """<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Calibrar · Demo del Módulo V</title>
<style>
:root{{--tinta:#0D4F6A;--ambar:#F5A623;--tx:#1b2733;--gris:#6b7a88;--bd:#e3e8ea;--bg:#f7f9fa}}
*{{box-sizing:border-box}}
body{{margin:0;font:15px/1.6 Montserrat,-apple-system,Segoe UI,Arial,sans-serif;color:var(--tx);background:#fff}}
header{{background:var(--tinta);color:#fff;padding:26px 22px;border-bottom:4px solid var(--ambar)}}
header h1{{margin:0 0 4px;font-size:21px}} header p{{margin:0;opacity:.85;font-size:13px}}
.aviso{{background:#FEFAF3;border-left:4px solid var(--ambar);padding:12px 16px;margin:18px 22px;font-size:13.5px}}
main{{max-width:1080px;margin:0 auto;padding:0 22px 60px}}
section{{margin:34px 0}}
h2{{color:var(--tinta);font-size:17px;border-bottom:1px solid var(--bd);padding-bottom:7px}}
h4{{margin:14px 0 5px;font-size:14px;color:var(--tinta)}}
.cadena{{display:grid;gap:8px}}
.esl{{display:grid;grid-template-columns:38px 1.4fr 1fr 1.6fr 92px;gap:10px;align-items:center;
 text-align:left;font:inherit;padding:10px 12px;border:1px solid var(--bd);border-radius:7px;
 background:#fff;cursor:pointer}}
.esl .num{{font-weight:700;color:var(--gris)}} .esl .nom{{font-weight:600}}
.esl .area,.esl .dueno{{font-size:12.5px;color:var(--gris)}}
.badge{{font-size:11px;text-align:center;padding:3px 8px;border-radius:20px;background:#eef2f4;color:var(--gris)}}
.esl.roto{{border-color:#e6b3ad;background:#fdf5f4}} .esl.roto .badge{{background:#C0392B;color:#fff}}
.esl.dom{{border-color:var(--ambar);background:#fefaf3;border-width:2px}}
.esl.dom .badge{{background:var(--ambar);color:#3a2a06}}
.esl.sano .badge{{background:#2E7D5B;color:#fff}}
table{{width:100%;border-collapse:collapse;font-size:13.5px;margin:8px 0}}
th,td{{border-bottom:1px solid var(--bd);padding:7px 9px;text-align:left;vertical-align:top}}
th{{background:var(--bg);font-size:12px;text-transform:uppercase;letter-spacing:.4px;color:var(--gris)}}
.col{{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--gris)}}
.res{{color:#b0bcc6;font-style:italic}}
tr.roto{{background:#fdf5f4}} tr.nd{{background:#fafbfc;color:var(--gris)}}
.pill{{font-size:11px;padding:2px 8px;border-radius:20px;background:#eef2f4}}
tr.roto .pill{{background:#C0392B;color:#fff}} tr.sano .pill{{background:#2E7D5B;color:#fff}}
.proc{{font-size:11.5px;color:var(--gris)}}
.cifras{{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:12px}}
.cifra{{border:1px solid var(--bd);border-radius:8px;padding:13px}}
.cifra .v{{font:700 25px/1.1 ui-monospace,Menlo,monospace;color:var(--tinta)}}
.cifra .et{{font-size:12px;color:var(--gris);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px}}
.cifra p{{margin:6px 0;font-size:13px}} .ev{{font-size:11.5px;color:var(--gris)}}
.card{{border:1px solid var(--bd);border-left:3px solid var(--tinta);border-radius:6px;padding:12px 14px;margin:10px 0}}
.card p{{margin:4px 0;font-size:13.5px}}
.blur{{filter:blur(4.5px);cursor:pointer;user-select:none;transition:filter .12s}}
.blur.ver{{filter:none}}
ol.triage{{columns:2;gap:26px;font-size:13.5px}} ol.triage li{{margin-bottom:5px;break-inside:avoid}}
.notas textarea{{width:100%;min-height:70px;border:1px solid var(--bd);border-radius:6px;padding:9px;font:inherit;font-size:13.5px}}
.barra{{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid var(--bd);
 padding:9px 22px;display:flex;gap:14px;align-items:center;font-size:13px}}
#reloj{{font:700 17px ui-monospace,Menlo,monospace;color:var(--tinta)}} #reloj.corte{{color:#C0392B}}
button.acc{{font:inherit;font-size:13px;padding:6px 12px;border:1px solid var(--tinta);
 background:#fff;color:var(--tinta);border-radius:6px;cursor:pointer}}
.pie{{margin-top:40px;padding-top:16px;border-top:1px solid var(--bd);font-size:12px;color:var(--gris)}}
@media(max-width:760px){{.esl{{grid-template-columns:32px 1fr;row-gap:3px}}ol.triage{{columns:1}}}}
</style></head><body>

<header>
  <h1>Calibrar · demo del pitch Módulo V</h1>
  <p>Método conducido por una persona · caso real anonimizado ({anon}) · {periodo}</p>
</header>

<div class="barra">
  <span id="reloj">00:00</span>
  <button class="acc" id="bIni">Iniciar</button>
  <button class="acc" id="bExp">Exportar notas</button>
  <span class="proc">Corte a los 30 minutos</span>
</div>

<div class="aviso">
  <b>Qué es este archivo.</b> Material histórico del pitch evaluado del 13-ago-2026: muestra el método
  y el entregable en una sola pantalla. <b>No es ninguno de los cuatro archivos que se usan ante un
  prospecto</b> — proyectar va por <code>03 Front/presentacion.html</code>, conducir y compartir por
  <code>04 Cabina/</code>. El diagnóstico que aquí se muestra <b>lo hizo una persona</b>: no es
  automático, no es instantáneo y no lo produjo un motor corriendo solo.
</div>

<main>

<section><h2>El método — la Cadena de Crecimiento Comercial</h2>
  <p>Siete eslabones. El dominante es <b>el primero que se rompe contando desde donde hay flujo</b>,
  no el peor de todos. Los eslabones son cliqueables: cambian de estado para explicar la lectura.</p>
  <div class="cadena">{eslabones}</div>
  <p style="margin-top:12px"><b>Área recomendada:</b> {area} · <b>secundaria:</b> {area2}</p>
</section>

<section><h2>Por qué ése y no otro</h2>
  <div class="card"><p>{porque}</p></div>
  <h4>Lo que NO es su problema</h4>
  <div class="card"><p>{noes}</p></div>
  <p class="proc">Este segundo bloque es el que hace la venta: decirle a alguien qué está bien
  es lo que ninguna agencia le dice.</p>
</section>

<section><h2>El triage — {n_tri} preguntas que rutean</h2>
  <p class="proc">Mantén apretada cada pregunta para verla. Van borrosas a propósito: el
  instrumento es el activo, y esta pantalla se proyecta.</p>
  <ol class="triage">{triage}</ol>
</section>

<section><h2>La ficha formal</h2>
  <p class="proc">Los números de columna salen de <code>FICHA_EMPRESA</code> del front, que es la
  misma fuente que <code>qa_comercial.py</code> verifica contra la cabecera real del maestro.
  Los valores van como <i>reservados</i>: este archivo no lleva datos de nadie.</p>
  {ficha}
</section>

<section><h2>Las cifras del caso — {n_cif}, cada una con su evidencia</h2>
  <div class="cifras">{cifras}</div>
</section>

<section><h2>Semáforo por capa</h2>
  <table><thead><tr><th>#</th><th>Capa</th><th>Estado</th><th>Lectura</th><th>Procedencia</th></tr></thead>
  <tbody>{semaforo}</tbody></table>
</section>

<section><h2>Hipótesis</h2>{hipotesis}</section>
<section><h2>Soluciones</h2>{soluciones}</section>
<section><h2>Plan por etapas</h2>{etapas}
  <h4>Fuera de nuestro alcance</h4><div class="card"><p>{fuera}</p></div>
  <h4>Cierre</h4><div class="card"><p>{cierre}</p></div>
</section>

<section class="notas"><h2>Notas</h2>
  <p class="proc">Se guardan solas en este navegador (<code>localStorage</code>) y salen con
  «Exportar notas». No se envían a ninguna parte.</p>
  <h4>Del método</h4><textarea data-k="metodo"></textarea>
  <h4>Del caso</h4><textarea data-k="caso"></textarea>
  <h4>Preguntas del público</h4><textarea data-k="publico"></textarea>
</section>

<div class="pie">
  Generado por <code>build_demo.py</code> desde <code>03 Front/assets/data.js</code> —
  no editar este <code>.html</code> a mano.<br>
  Precisión Agencia · Proyecto Calibrar · petróleo #0D4F6A + ámbar #F5A623.<br>
  <b>Sin grabadora a propósito:</b> portarla exige la puerta de consentimiento que sigue pendiente
  (decisión 4c), y grabar sin ella es un riesgo bajo Ley 21.719.
</div>
</main>

<script>
/* Eslabones cliqueables: sano → roto → dominante → sin datos */
var CICLO=['sano','roto','dominante','sin_datos'],
    CLS={{sano:'sano',roto:'roto',dominante:'dom',sin_datos:'nd'}},
    TXT={{sano:'Sano',roto:'Roto',dominante:'Dominante',sin_datos:'Sin datos'}};
document.querySelectorAll('.esl').forEach(function(b){{
  b.addEventListener('click',function(){{
    var i=(CICLO.indexOf(b.dataset.estado)+1)%CICLO.length,n=CICLO[i];
    b.dataset.estado=n;
    b.className='esl '+CLS[n];
    b.querySelector('.badge').textContent=TXT[n];
  }});
}});

/* Mantener apretado para ver */
document.querySelectorAll('.blur').forEach(function(s){{
  var ver=function(){{s.classList.add('ver');}}, ocultar=function(){{s.classList.remove('ver');}};
  s.addEventListener('mousedown',ver); s.addEventListener('touchstart',ver,{{passive:true}});
  ['mouseup','mouseleave','touchend','touchcancel'].forEach(function(ev){{
    s.addEventListener(ev,ocultar);
  }});
}});

/* Notas con autoguardado tolerante: si localStorage falla, la página sigue sirviendo */
document.querySelectorAll('.notas textarea').forEach(function(t){{
  var k='calibrar_demo_'+t.dataset.k;
  try{{ var v=localStorage.getItem(k); if(v) t.value=v; }}catch(e){{}}
  t.addEventListener('input',function(){{ try{{localStorage.setItem(k,t.value);}}catch(e){{}} }});
}});

/* Reloj con corte a los 30 */
var seg=0,tic=null,r=document.getElementById('reloj');
function pinta(){{
  var m=Math.floor(seg/60),s=seg%60;
  r.textContent=(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
  if(m>=30) r.classList.add('corte');
}}
document.getElementById('bIni').addEventListener('click',function(){{
  if(tic){{clearInterval(tic);tic=null;this.textContent='Reanudar';return;}}
  tic=setInterval(function(){{seg++;pinta();}},1000); this.textContent='Pausar';
}});

document.getElementById('bExp').addEventListener('click',function(){{
  var l=['Calibrar · notas del demo','Tiempo: '+r.textContent,''];
  document.querySelectorAll('.notas textarea').forEach(function(t){{
    l.push('['+t.dataset.k+'] '+(t.value||'(sin notas)'));
  }});
  var b=new Blob([l.join('\\n')],{{type:'text/plain'}}),a=document.createElement('a');
  a.href=URL.createObjectURL(b); a.download='calibrar_notas.txt'; a.click();
}});
</script>
</body></html>
"""

if __name__ == "__main__":
    datos = leer_datos()
    SALIDA.write_text(construir(datos), encoding="utf-8")
    print("OK  %s  (%d KB)" % (SALIDA.name, SALIDA.stat().st_size // 1024))
    print("    Cadena %d · triage %d · ficha %d grupos"
          % (len(datos["CADENA"]), len(datos["TRIAGE"]), len(datos["FICHA_EMPRESA"])))
