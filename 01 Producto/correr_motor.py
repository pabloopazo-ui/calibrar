#!/usr/bin/env python3
"""
Runner del motor de Calibrar — el que faltaba para que el Blackbox pueda medir algo.

Por qué existe: `blackbox_calibrar.py` genera casos y evalúa predicciones, pero nadie las
producía. El motor estaba especificado de punta a punta en el PRD y no tenía código que lo
ejecutara. Esto lo ejecuta: arma el system prompt desde el Anexo E, manda cada triage del
Blackbox y escribe un JSONL de predicciones que el evaluador consume.

    python3 correr_motor.py --dry-run                    # costo y payload, sin llamar a la API
    python3 correr_motor.py --humo                       # 8 casos + evaluación, un comando
    python3 correr_motor.py --confirmar --limite 10      # 10 casos de verdad
    python3 correr_motor.py --confirmar                  # los 240
    python3 blackbox_calibrar.py evaluar predicciones.jsonl

NUNCA corre solo: sin `--confirmar` hace dry-run y sale. Es plata real y Calibrar está en
pausa, así que gastar tiene que ser un acto deliberado.

Reanudable: si `predicciones.jsonl` ya tiene casos, los saltea. Un corte no obliga a repetir
lo pagado.

Parámetros de API (PRD §5.5, y CLAUDE.md):
  · claude-sonnet-5 para el turno de ruteo en vivo, effort `low`.
  · `cache_control` con TTL de 1 h sobre el system prompt. Es la decisión de mayor impacto
    económico del proyecto: ~18.000 tokens idénticos en cada llamada, a una décima parte.
  · NUNCA temperature / top_p / top_k — eliminados en estos modelos, devuelven error 400.
  · El system prompt tiene que ser BYTE-IDÉNTICO entre llamadas o la caché se invalida y el
    costo vuelve a la columna cara. Por eso se arma una sola vez y no se interpola nada.
"""

import json
import os
import sys
import pathlib
import re

BASE = pathlib.Path(__file__).parent
PRD = BASE / "Calibrar_PRD_v3_jul2026.md"
CASOS = BASE / "blackbox_casos.jsonl"
SALIDA = BASE / "predicciones.jsonl"

V, R, A, G, B, F = "\033[92m", "\033[91m", "\033[93m", "\033[90m", "\033[1m", "\033[0m"

MODELO = "claude-sonnet-5"
EFFORT = "low"
USD_CLP = 970  # referencial; solo para el estimado del dry-run

# Mapa del triage del Blackbox a los nombres de campo del Anexo F.2 del PRD.
CAMPOS = {
    "t1": "t1_origen_cliente", "t2": "t2_huella_publica", "t3": "t3_oportunidades_mes",
    "t4": "t4_pauta_activa", "t5": "t5_destino_compra", "t6": "t6_captura_datos",
    "t7": "t7_tiempo_respuesta", "t8": "t8_registro_contacto", "t9": "t9_seguimiento_perdido",
    "t10": "t10_uso_ia", "t11": "t11_horas_repetitivas", "t12": "t12_dependencia",
    "t13": "t13_criterio_escrito", "t14": "t14_criterio_demostrable",
}

# Los buckets del generador se traducen a lo que el formulario realmente captura.
# t3 es un número en el contrato; el Blackbox razona en rangos.
T3 = {"ninguna": "0", "pocas y esporádicas": "3", "medio": "20", "alto": "70"}
T11 = {"pocas": "2", "muchas": "15", "no sé": "no sé"}

ESQUEMA = {
    "type": "object",
    "properties": {
        "eslabon_dominante": {"type": "integer", "enum": [0, 1, 2, 3, 4, 5, 6, 7]},
        "area_recomendada": {"type": "string"},
        "por_que_este_y_no_otro": {"type": "string"},
        # Campo del modificador de medición. Vacío si s2 está sana; con contenido si el
        # diagnóstico tiene que declararla. El Blackbox puntúa este campo aparte del ruteo.
        "medicion": {"type": "string"},
    },
    "required": ["eslabon_dominante", "area_recomendada", "por_que_este_y_no_otro",
                 "medicion"],
    "additionalProperties": False,
}


def system_prompt():
    """
    El Anexo E completo, verbatim del PRD. Se arma una sola vez y no se interpola NADA:
    cualquier fecha, ID o nombre metido acá invalida la caché en cada llamada y devuelve el
    costo a la columna sin caché (PRD §5.5.1, tercera consecuencia).
    """
    prd = PRD.read_text(encoding="utf-8")
    a, b = prd.find("# Anexo E"), prd.find("# Anexo F")
    if a < 0 or b <= a:
        sys.exit(f"{R}No encuentro el Anexo E en el PRD.{F}")
    return prd[a:b].strip()


def mensaje(triage):
    lineas = []
    for k, campo in CAMPOS.items():
        v = triage[k]
        if k == "t3":
            v = T3.get(v, v)
        elif k == "t11":
            v = T11.get(v, v)
        lineas.append(f"{campo}: {v}")
    perfil = ("B2B de ticket alto con ciclo de venta largo"
              if triage.get("perfil_b2b_ticket_alto_ciclo_largo") else "no declarado")
    # <senales_externas> es OBLIGATORIO acá, no decorativo: el modificador de medición de
    # <ruteo_de_area> lee s2_pixel_gtm. Sin este bloque la regla es inejecutable — se
    # escribió el 2-ago-2026 y durante unas horas ninguna corrida podría haberla disparado,
    # porque nada la producía ni la transmitía. Es el mismo defecto que el PRD documenta
    # como el peor de sus QA anteriores: especificación completa sin canal de ejecución.
    s2 = triage.get("s2_pixel_gtm", "")
    senales = f"<senales_externas>\ns2_pixel_gtm: {s2}\n</senales_externas>\n\n" if s2 else ""
    return ("<triage>\n" + "\n".join(lineas) + "\n</triage>\n\n"
            + senales
            + f"<perfil>{perfil}</perfil>\n\n"
            "Rutea: entrega SOLO el bloque 0 (eslabón dominante y área recomendada). "
            "Si la medición está rota, decláralo en el campo `medicion` — nunca como área.")


def cargar_casos(limite):
    if not CASOS.exists():
        sys.exit(f"{R}No hay casos. Corre: python3 blackbox_calibrar.py generar{F}")
    casos = [json.loads(l) for l in CASOS.read_text(encoding="utf-8").splitlines() if l.strip()]
    hechos = set()
    if SALIDA.exists():
        for l in SALIDA.read_text(encoding="utf-8").splitlines():
            if l.strip():
                hechos.add(json.loads(l)["id"])
    pendientes = [c for c in casos if c["id"] not in hechos]
    if hechos:
        print(f"{G}Reanudando: {len(hechos)} ya hechos, {len(pendientes)} pendientes.{F}")
    return pendientes[:limite] if limite else pendientes


def dry_run(sistema, casos):
    print(f"\n{B}DRY RUN{F} — no se llama a la API\n" + "─" * 62)
    print(f"  Modelo            {MODELO} · effort {EFFORT}")
    print(f"  System prompt     {len(sistema):,} caracteres".replace(",", "."))
    print(f"  Casos pendientes  {len(casos)}")
    print(f"\n{G}Parámetros que NO se envían (devuelven 400 en este modelo):{F}")
    print(f"  temperature · top_p · top_k")
    print(f"\n{G}Caché: ephemeral, TTL 1 h, sobre el system prompt.{F}")
    print(f"{G}La primera llamada la escribe (~1,25×); las demás la leen (~0,1×).{F}")
    if casos:
        print(f"\n{G}Mensaje de usuario del primer caso ({casos[0]['id']}):{F}")
        for l in mensaje(casos[0]["triage"]).splitlines():
            print(f"  {l}")
    tok = len(sistema) // 3.5
    print(f"\n{G}System prompt ≈ {tok:,.0f} tokens (estimado por caracteres).{F}".replace(",", "."))
    print(f"{G}Para la cifra real corre con --contar-tokens (1 llamada, gratis).{F}")
    print(f"\n{A}Nada se gastó. Para correr de verdad: --confirmar{F}")
    return 0


def contar_tokens(cliente, sistema, casos):
    r = cliente.messages.count_tokens(
        model=MODELO,
        system=[{"type": "text", "text": sistema}],
        messages=[{"role": "user", "content": mensaje(casos[0]["triage"])}],
    )
    n = r.input_tokens
    # Sonnet 5: $3/MTok entrada ($2 introductorio hasta 31-ago-2026), $15/MTok salida.
    # Con caché, la lectura cuesta ~0,1× la entrada.
    ent_intro, sal = 2.0, 10.0
    salida_est = 250
    primera = n * ent_intro * 1.25 / 1e6 + salida_est * sal / 1e6
    resto = n * ent_intro * 0.1 / 1e6 + salida_est * sal / 1e6
    total = (primera + resto * (len(casos) - 1)) * USD_CLP
    sin_cache = (n * ent_intro / 1e6 + salida_est * sal / 1e6) * len(casos) * USD_CLP
    print(f"\n{B}CONTEO REAL DE TOKENS{F}\n" + "─" * 62)
    print(f"  System prompt + 1 mensaje   {n:,} tokens".replace(",", "."))
    print(f"  Casos                       {len(casos)}")
    print(f"\n  {B}Con caché      ≈ ${total:,.0f} CLP{F}".replace(",", "."))
    print(f"  {G}Sin caché      ≈ ${sin_cache:,.0f} CLP  ({sin_cache/max(total,1):.1f}× más){F}"
          .replace(",", "."))
    print(f"\n{G}Precio introductorio de Sonnet 5 vigente hasta el 31-ago-2026. Después sube{F}")
    print(f"{G}a $3/$15 por millón y este estimado hay que rehacerlo.{F}")
    return 0


def correr(cliente, sistema, casos):
    import anthropic
    ok = err = 0
    lecturas_cache = 0
    with SALIDA.open("a", encoding="utf-8") as fh:
        for i, caso in enumerate(casos, 1):
            try:
                r = cliente.messages.create(
                    model=MODELO,
                    max_tokens=2000,
                    # El bloque cacheado va primero y es idéntico en todas las llamadas.
                    system=[{"type": "text", "text": sistema,
                             "cache_control": {"type": "ephemeral", "ttl": "1h"}}],
                    output_config={"effort": EFFORT,
                                   "format": {"type": "json_schema", "schema": ESQUEMA}},
                    messages=[{"role": "user", "content": mensaje(caso["triage"])}],
                )
                txt = next(b.text for b in r.content if b.type == "text")
                d = json.loads(txt)
                fh.write(json.dumps({"id": caso["id"],
                                     "eslabon_dominante": d["eslabon_dominante"],
                                     "area_recomendada": d["area_recomendada"],
                                     "por_que": d.get("por_que_este_y_no_otro", ""),
                                     "medicion": d.get("medicion", "")},
                                    ensure_ascii=False) + "\n")
                fh.flush()
                ok += 1
                lecturas_cache += r.usage.cache_read_input_tokens or 0
            except anthropic.APIStatusError as e:
                err += 1
                print(f"\n{R}[{caso['id']}] {e.status_code}: {e.message}{F}")
                if e.status_code == 400:
                    print(f"{A}Un 400 acá suele ser un parámetro eliminado del modelo.{F}")
                    print(f"{A}Verifica que no se esté enviando temperature/top_p/top_k.{F}")
                    break
            except (anthropic.APIConnectionError, json.JSONDecodeError) as e:
                err += 1
                print(f"\n{R}[{caso['id']}] {type(e).__name__}: {e}{F}")
            if i % 10 == 0 or i == len(casos):
                print(f"\r  {i}/{len(casos)}  ok {ok}  errores {err}", end="", flush=True)

    print(f"\n\n{V if not err else A}{B}{ok} predicciones escritas{F} en {SALIDA.name}")
    if err:
        print(f"{R}{err} fallaron.{F} Vuelve a correr: se saltean las que ya están.")
    if lecturas_cache:
        print(f"{G}Tokens leídos de caché: {lecturas_cache:,}{F}".replace(",", "."))
    else:
        print(f"{A}Cero lecturas de caché. Si corriste más de una vez, algo está{F}")
        print(f"{A}invalidando el prefijo — el system prompt tiene que ser byte-idéntico.{F}")
    print(f"\n{G}Evalúa con:{F}")
    print(f"  python3 blackbox_calibrar.py evaluar {SALIDA.name}")
    return 1 if err else 0


def main():
    args = sys.argv[1:]
    limite = int(args[args.index("--limite") + 1]) if "--limite" in args else None
    if "--humo" in args:            # prueba de humo: 8 casos y evaluación inmediata
        limite, args = 8, args + ["--confirmar"]
    sistema = system_prompt()
    casos = cargar_casos(limite)
    if not casos:
        print(f"{V}No hay casos pendientes.{F}")
        return 0

    if "--confirmar" not in args and "--contar-tokens" not in args:
        return dry_run(sistema, casos)

    try:
        import anthropic
    except ImportError:
        sys.exit(f"{R}Falta el SDK: pip install anthropic{F}")
    if not (os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN")):
        print(f"{R}No hay credencial.{F} Exporta ANTHROPIC_API_KEY, o corre `ant auth login`")
        print(f"{G}(el SDK toma el perfil de `ant auth login` sin variable de entorno).{F}")
        return 1
    cliente = anthropic.Anthropic()

    if "--contar-tokens" in args:
        return contar_tokens(cliente, sistema, casos)

    print(f"\n{A}{B}Corriendo {len(casos)} casos contra {MODELO}. Esto gasta.{F}\n")
    rc = correr(cliente, sistema, casos)
    # --humo: primera señal en un solo comando. Corre pocos casos y evalúa de inmediato,
    # en vez de obligar a encadenar tres comandos para saber si el motor sirve de algo.
    if "--humo" in args and rc == 0:
        print(f"\n{B}{'─'*62}\nEVALUACIÓN INMEDIATA{F}\n")
        import subprocess
        subprocess.run([sys.executable, "blackbox_calibrar.py", "evaluar", SALIDA.name],
                       cwd=str(BASE))
    return rc


if __name__ == "__main__":
    sys.exit(main())
