#!/usr/bin/env python3
"""
QA de la prospección semanal — verifica que la rutina del lunes se haya quedado en su carril.

Por qué existe: la tarea `calibrar-50-prospectos-semanal` tiene prohibido modificar
`Base_Prospectos_Calibrar_RM.xlsx` porque integrar al maestro es decisión humana, y lo
incumplió tres lunes seguidos (3-ago 427→477, 10-ago 477→527, 17-ago 527→577). Pedirle que
no lo repita ya falló dos veces: una regla que nadie puede comprobar no es una regla. Acá se
comprueba — contra `RATIFICACIONES_MAESTRO.md`, que solo escribe una persona.

Cubre además el otro patrón repetido: la corrida que escribe los archivos y muere antes de
dejar la captura Vibe y el correo (3-ago 00:26 y 17-ago 00:14, misma forma las dos veces).

    python3 _tools/qa_prospeccion_semanal.py             # informe completo
    python3 _tools/qa_prospeccion_semanal.py --breve     # solo los fallos
    python3 _tools/qa_prospeccion_semanal.py --semana 2026-08-17   # auditar otra semana
    echo $?                                              # 0 = en carril · 1 = hay rojo

Correr al cerrar la rutina del lunes, al ratificar una integración, y desde
`calibrar-mantenimiento-semanal`. Sus gemelos son `qa_comercial.py` (discurso de venta) y
`Calibrar/01 Producto/qa_calibrar.py` (motor de diagnóstico).
"""

import datetime
import os
import pathlib
import re
import sys

BASE = pathlib.Path(__file__).parent.parent
PROSP = BASE / "Calibrar" / "02 Prospeccion"
MAESTRO = PROSP / "Base_Prospectos_Calibrar_RM.xlsx"
SEGMENTADA = PROSP / "Base_Prospectos_Segmentada.xlsx"
LEDGER = PROSP / "RATIFICACIONES_MAESTRO.md"
SEMANALES = PROSP / "Semanales"
HOJA = "Base de Prospectos"

# Misma cabecera que CABECERA_MAESTRO en qa_comercial.py. Se duplica a propósito: si alguien
# amplía el maestro y toca solo un verificador, el otro lo delata en vez de heredar el cambio.
CABECERA = [
    "N°", "Nombre de la empresa (razón social)", "Nombre de fantasía", "RUT", "Rubro",
    "Sector", "Comuna", "Dirección", "Teléfono", "Correo", "Sitio web", "Redes sociales",
    "Decisor (cargo/nombre)", "WhatsApp del decisor", "Quién más decide",
    "Señal / Gancho de visita", "Prioridad", "Próximo paso", "Fecha del próximo paso",
    "Fuente / Origen del dato", "Fecha de captura", "Base de licitud",
    "Fecha de última actualización", "Solicitud del titular", "Estado del registro",
]

# Columnas que la rutina NO llena nunca: se completan en la visita, con lo que entrega el
# titular. Dos son datos personales bajo la Ley 21.719 y las otras dos son resultado de la
# visita. El 17-ago la rutina dejó «Visita técnica en terreno» en 50 filas de `Próximo paso`:
# una constante no es un dato, simula uno y rompe la homogeneidad con las otras 527 filas.
SOLO_EN_VISITA = ["WhatsApp del decisor", "Quién más decide", "Próximo paso",
                  "Fecha del próximo paso"]

# Prefijos de correo genérico de empresa. Uno nominativo (nombre.apellido@) es dato personal
# y exige base de licitud declarada fila por fila, así que la rutina no puede cosecharlo.
GENERICOS = ("contacto", "info", "ventas", "comercial", "hola", "clientes", "empresa",
             "administracion", "gerencia", "recepcion", "consultas", "cotizaciones",
             "servicioalcliente", "atencionclientes", "mail", "correo", "office")

V, R, A, G, B, F = "\033[92m", "\033[91m", "\033[93m", "\033[90m", "\033[1m", "\033[0m"


def openpyxl_o_morir():
    try:
        import openpyxl
        return openpyxl
    except ImportError:
        sys.exit(f"{R}Falta openpyxl: pip install openpyxl{F}")


def leer_hoja(ruta, hoja=HOJA):
    """Devuelve (cabecera, filas) de una hoja. Siempre read_only: este verificador no
    escribe en ningún xlsx, y que sea imposible por construcción es parte del punto."""
    px = openpyxl_o_morir()
    wb = px.load_workbook(ruta, read_only=True, data_only=True)
    if hoja not in wb.sheetnames:
        wb.close()
        return None, []
    todas = list(wb[hoja].iter_rows(values_only=True))
    wb.close()
    if not todas:
        return None, []
    cab = [str(c) if c is not None else "" for c in todas[0]]
    filas = [r for r in todas[1:] if any(c not in (None, "") for c in r)]
    return cab, filas


def col(cab, nombre):
    """Índice de una columna por nombre de cabecera. Nunca por posición: insertar una
    columna corre todo lo que viene después, y es exactamente lo que se rompió el 6-ago."""
    return cab.index(nombre) if cab and nombre in cab else None


def fecha_mtime(ruta):
    return datetime.date.fromtimestamp(os.path.getmtime(ruta))


def ratificaciones():
    """Última fila de la tabla de RATIFICACIONES_MAESTRO.md = estado autorizado del maestro."""
    if not LEDGER.exists():
        return None, []
    filas = []
    for linea in LEDGER.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|"
                     r"\s*([^|]+?)\s*\|", linea)
        if m:
            filas.append({
                "fecha": datetime.date.fromisoformat(m.group(1)),
                "antes": int(m.group(2)), "despues": int(m.group(3)),
                "nmax": int(m.group(4)), "quien": m.group(5).strip(),
            })
    return (filas[-1] if filas else None), filas


def lunes_de(fecha):
    return fecha - datetime.timedelta(days=fecha.weekday())


# ─────────────────────────────────────────────────────────────────────────────
# Grupo 1 · MAESTRO — que no haya crecido sin firma
# ─────────────────────────────────────────────────────────────────────────────
def grupo_maestro(ultima, todas):
    out = []
    g = "MAESTRO"
    if not LEDGER.exists():
        return [(g, f"Existe {LEDGER.name} (el registro de quién autorizó cada crecimiento)",
                 False)]
    out.append((g, f"Existe {LEDGER.name}", True))
    out.append((g, f"La tabla de ratificaciones se puede leer ({len(todas)} entradas)",
                ultima is not None))
    if ultima is None:
        return out

    cab, filas = leer_hoja(MAESTRO)
    if cab is None:
        return out + [(g, f"El maestro se puede leer (hoja «{HOJA}»)", False)]
    real = len(filas)
    out.append((g, f"El maestro se puede leer (hoja «{HOJA}», {real} filas)", True))
    out.append((g, "La cabecera del maestro son las 25 columnas del contrato",
                cab[:len(CABECERA)] == CABECERA and len(cab) == len(CABECERA)))

    # El corazón del guardarraíl.
    if real > ultima["despues"]:
        desc = (f"⚠ EL MAESTRO CRECIÓ SIN RATIFICACIÓN: tiene {real} filas y la última "
                f"ratificada ({ultima['fecha']}, por {ultima['quien']}) dejó "
                f"{ultima['despues']}. Son {real - ultima['despues']} filas que nadie "
                f"autorizó — integrar al maestro es decisión humana")
    elif real < ultima["despues"]:
        desc = (f"⚠ EL MAESTRO PERDIÓ FILAS: tiene {real} y la última ratificación "
                f"({ultima['fecha']}) dejó {ultima['despues']}")
    else:
        desc = (f"El maestro está en su estado ratificado ({real} filas, ratificadas el "
                f"{ultima['fecha']} por {ultima['quien']})")
    out.append((g, desc, real == ultima["despues"]))

    ns = [f[0] for f in filas if isinstance(f[0], (int, float))]
    nmax = int(max(ns)) if ns else 0
    out.append((g, f"El N° máximo del maestro ({nmax}) es el ratificado ({ultima['nmax']})",
                nmax == ultima["nmax"]))
    out.append((g, f"El correlativo no tiene huecos ni repetidos ({len(set(ns))} únicos "
                   f"para {real} filas, máximo {nmax})",
                len(set(ns)) == real == nmax))

    # Las cuatro columnas de visita, también en el maestro. El 17-ago la constante
    # «Visita técnica en terreno» entró al maestro en 50 filas y se normalizó a mano
    # nueve horas después: un dato simulado que sobrevive a la ratificación queda
    # indistinguible de uno capturado, y a esa altura ya nadie recuerda cuál era cuál.
    for nombre in SOLO_EN_VISITA:
        i = col(cab, nombre)
        if i is None:
            continue
        raros = {}
        for f in filas:
            v = str(f[i]).strip() if i < len(f) and f[i] is not None else ""
            if v and v.upper() != "N/D":
                raros[v] = raros.get(v, 0) + 1
        # Un valor repetido en muchas filas es una constante inyectada, no una captura.
        constantes = {v: n for v, n in raros.items() if n >= 5}
        out.append((g, f"`{nombre}` en el maestro no tiene constantes inyectadas "
                       f"({len(filas) - sum(raros.values())} en N/D, "
                       f"{sum(raros.values())} con valor)"
                       + (f" — constante en {list(constantes.values())[0]} filas: "
                          f"{repr(list(constantes)[0])}" if constantes else ""),
                    not constantes))
    return out


# ─────────────────────────────────────────────────────────────────────────────
# Grupo 2 · CARRIL — la huella de una corrida que se salió
# ─────────────────────────────────────────────────────────────────────────────
def grupo_carril(ultima, todas, lunes):
    out = []
    g = "CARRIL DE LA RUTINA"
    fechas_ok = {r["fecha"] for r in todas}

    # Si el maestro fue tocado el mismo día que se generó un semanal y ese día no tiene
    # ratificación anotada, fue la rutina. Es la comprobación que pide el incidente.
    semanal = SEMANALES / f"Prospectos_Semana_{lunes}.xlsx"
    if MAESTRO.exists() and semanal.exists():
        fm, fs = fecha_mtime(MAESTRO), fecha_mtime(semanal)
        limpio = fm != fs or fm in fechas_ok
        out.append((g, f"El maestro no fue escrito el día de la corrida semanal sin "
                       f"ratificación (maestro {fm}, semanal {fs}"
                       f"{', ratificado ese día' if fm in fechas_ok and fm == fs else ''})",
                    limpio))

    # Huella forense: la rutina se respaldaba a sí misma antes de escribir el maestro
    # (`_backup_pre_semana_*`). No fue un descuido de openpyxl: creía que integrar era su
    # tarea. Cualquier respaldo con ese patrón en una fecha sin ratificación es un incidente.
    huerfanos = []
    for p in PROSP.glob("Base_Prospectos_Calibrar_RM_backup_pre_semana_*.xlsx"):
        m = re.search(r"(\d{4}-\d{2}-\d{2})", p.name)
        if m and datetime.date.fromisoformat(m.group(1)) not in fechas_ok:
            huerfanos.append(p.name)
    out.append((g, "No hay respaldos `_backup_pre_semana_` en fechas sin ratificación"
                   + (f" — hay {len(huerfanos)}: {', '.join(sorted(huerfanos))}"
                      if huerfanos else ""),
                not huerfanos))

    # La segmentada es derivada: si el maestro ya está ratificado, ella tiene que venir
    # después. Al revés significa que la capa de terreno está mirando una base vieja.
    if SEGMENTADA.exists() and ultima:
        fseg = fecha_mtime(SEGMENTADA)
        out.append((g, f"La segmentada es posterior a la última ratificación "
                       f"(segmentada {fseg}, ratificación {ultima['fecha']})",
                    fseg >= ultima["fecha"]))
    return out


# ─────────────────────────────────────────────────────────────────────────────
# Grupo 3 · CIERRE — que la corrida no haya muerto a mitad de camino
# ─────────────────────────────────────────────────────────────────────────────
def grupo_cierre(lunes):
    out = []
    g = "CIERRE DE LA CORRIDA"
    semanal = SEMANALES / f"Prospectos_Semana_{lunes}.xlsx"
    captura = SEMANALES / f"{lunes}_Vibe_Prospecting_Captura.md"

    out.append((g, f"Existe el semanal de la semana en curso ({semanal.name})",
                semanal.exists()))
    if not semanal.exists():
        # Sin semanal no hay corrida que auditar: la cadencia se detuvo, y eso ya lo
        # reporta `calibrar-mantenimiento-semanal` como CRÍTICO.
        return out

    # La firma exacta del 3-ago y del 17-ago: el xlsx existe, la captura no. La corrida
    # murió después del paso largo (verificar ~50 sitios) y antes de los entregables de cierre.
    out.append((g, f"Existe la captura Vibe de la semana ({captura.name}) — si falta y el "
                   f"semanal está, la corrida murió antes de cerrar", captura.exists()))
    if captura.exists():
        txt = captura.read_text(encoding="utf-8")
        out.append((g, "La captura declara 0 créditos consumidos (regla de costo cero)",
                    bool(re.search(r"\b0\b[^\n]{0,40}créditos|créditos[^\n]{0,40}\b0\b",
                                   txt, re.I))))
        out.append((g, "La captura declara si el correo-resumen se envió",
                    bool(re.search(r"correo|resumen|webhook|Make|borrador", txt, re.I))))
    return out


# ─────────────────────────────────────────────────────────────────────────────
# Grupo 4 · SEMANAL — el entregable, y lo que la rutina no debe llenar
# ─────────────────────────────────────────────────────────────────────────────
def grupo_semanal(ultima, lunes):
    out = []
    g = "SEMANAL"
    semanal = SEMANALES / f"Prospectos_Semana_{lunes}.xlsx"
    if not semanal.exists():
        return out
    cab, filas = leer_hoja(semanal)
    if cab is None:
        return [(g, f"El semanal tiene la hoja «{HOJA}»", False)]
    out.append((g, f"El semanal tiene la hoja «{HOJA}» con {len(filas)} filas", True))
    out.append((g, "El semanal replica las 25 columnas del maestro, en orden",
                cab[:len(CABECERA)] == CABECERA and len(cab) == len(CABECERA)))

    # El correlativo. La comprobación NO puede ser «arranca sobre el último ratificado»:
    # un semanal ya integrado vive legítimamente dentro del maestro. Lo que importa en los
    # dos estados —pendiente e integrado— es que ningún N° pise a OTRA empresa, que es el
    # incidente del 27-jul (los números 378–395 asignados a ciegas).
    ns = [int(f[0]) for f in filas if isinstance(f[0], (int, float))]
    if ns:
        out.append((g, f"El correlativo del semanal ({min(ns)}–{max(ns)}) es continuo y sin "
                       f"repetidos ({len(set(ns))} únicos en {len(filas)} filas)",
                    len(set(ns)) == len(filas) == max(ns) - min(ns) + 1))
        cabm, filasm = leer_hoja(MAESTRO)
        if cabm:
            def norm(x):
                return re.sub(r"[^a-z0-9]", "", str(x or "").lower())

            por_n = {int(f[0]): norm(f[1]) for f in filasm
                     if isinstance(f[0], (int, float)) and len(f) > 1}
            choques = [(int(f[0]), str(f[1])) for f in filas
                       if isinstance(f[0], (int, float)) and len(f) > 1
                       and int(f[0]) in por_n and por_n[int(f[0])] != norm(f[1])]
            integrados = [n for n in ns if n in por_n]
            estado = ("ya integrado al maestro" if len(integrados) == len(ns)
                      else "pendiente de integrar" if not integrados
                      else f"a medio integrar: {len(integrados)} de {len(ns)}")
            out.append((g, f"Ningún N° del semanal pisa a otra empresa del maestro "
                           f"({estado})"
                           + (f" — choques: {choques}" if choques else ""),
                        not choques and estado != f"a medio integrar: {len(integrados)} "
                                                 f"de {len(ns)}"))
    pendientes = [f[0] for f in filas if str(f[0]).strip().upper() == "PENDIENTE"]
    if pendientes:
        out.append((g, f"{len(pendientes)} filas con N° PENDIENTE: el maestro no se pudo "
                       f"leer y hay que reconciliar a mano antes de integrar", False))

    # Las cuatro de la visita: la rutina las deja en N/D, siempre. Una constante repetida en
    # las 50 filas es el defecto del 17-ago y no se detecta mirando una fila.
    for nombre in SOLO_EN_VISITA:
        i = col(cab, nombre)
        if i is None:
            continue
        vals = [str(f[i]).strip() if i < len(f) and f[i] is not None else "" for f in filas]
        distintos = {v for v in vals if v and v.upper() != "N/D"}
        out.append((g, f"`{nombre}` va en N/D — la llena quien visita, no la rutina"
                       + (f" (hay {len(vals) - vals.count('N/D')} filas con valor"
                          f"{': ' + repr(sorted(distintos)[0]) if len(distintos) == 1 else ''})"
                          if distintos else ""),
                    not distintos))

    # `Correo`: solo genéricos de empresa. Nominativo = dato personal, Ley 21.719.
    i = col(cab, "Correo")
    if i is not None:
        correos = [str(f[i]).strip() for f in filas
                   if i < len(f) and f[i] and str(f[i]).strip().upper() != "N/D"]
        nominativos = [c for c in correos if "@" in c
                       and c.split("@")[0].split("+")[0].lower() not in GENERICOS
                       and ("." in c.split("@")[0] or "_" in c.split("@")[0])]
        out.append((g, f"Los correos cosechados son genéricos de empresa, no nominativos "
                       f"({len(correos)} con correo real, {len(filas) - len(correos)} en N/D)"
                       + (f" — nominativos: {', '.join(nominativos)}" if nominativos else ""),
                    not nominativos))

    # `Base de licitud` obligatoria fila por fila desde la Ley 21.719 (dueño: Álvaro).
    i = col(cab, "Base de licitud")
    if i is not None:
        sin = [f for f in filas
               if i >= len(f) or not f[i] or str(f[i]).strip().upper() in ("", "N/D")]
        out.append((g, f"Todas las filas declaran `Base de licitud` (Ley 21.719)"
                       + (f" — {len(sin)} sin declarar" if sin else ""), not sin))
    return out


def main():
    breve = "--breve" in sys.argv
    hoy = datetime.date.today()
    if "--semana" in sys.argv:
        try:
            hoy = datetime.date.fromisoformat(sys.argv[sys.argv.index("--semana") + 1])
        except (IndexError, ValueError):
            sys.exit(f"{R}--semana espera una fecha AAAA-MM-DD{F}")
    lunes = lunes_de(hoy)

    if not MAESTRO.exists():
        sys.exit(f"{R}No encuentro el maestro: {MAESTRO}{F}")

    ultima, todas = ratificaciones()
    res = grupo_maestro(ultima, todas)
    res += grupo_carril(ultima, todas, lunes)
    res += grupo_cierre(lunes)
    res += grupo_semanal(ultima, lunes)
    fallos = [x for x in res if not x[2]]

    if not breve:
        print(f"\n{B}QA PROSPECCIÓN SEMANAL{F}  ·  semana del {lunes}  ·  "
              f"{len(res)} verificaciones\n" + "─" * 66)
        grupo = None
        for gr, desc, ok in res:
            if gr != grupo:
                print(f"\n{G}{gr}{F}")
                grupo = gr
            print(f"  {V + '✓' + F if ok else R + '✗' + F} {desc}")

    print("\n" + "─" * 66)
    if fallos:
        print(f"{R}{B}{len(fallos)} de {len(res)} FALLAN{F}")
        for gr, desc, _ in fallos:
            print(f"  {R}✗{F} [{gr}] {desc}")
        print(f"\n{G}Si el rojo es del grupo MAESTRO: la rutina integró sola. No lo{F}")
        print(f"{G}deshagas ni lo ratifiques por inercia — la ratificación es de Pablo,{F}")
        print(f"{G}y se anota en {LEDGER.name}.{F}")
        return 1
    print(f"{V}{B}{len(res)}/{len(res)} — la rutina del lunes se quedó en su carril{F}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
