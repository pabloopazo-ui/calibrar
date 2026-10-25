#!/usr/bin/env python3
"""
Prueba de mutación del QA — verifica que las verificaciones puedan fallar.

Por qué existe: todo el historial de defectos de este proyecto tiene la misma forma — una
verificación que pasa en verde mientras el defecto está adentro. DB-11 y DB-12 no podían
dispararse. "Los 7 eslabones tienen caso dorado" contaba anexos, no eslabones. "Sin rastros
de seis eslabones" era sensible a mayúsculas. El propio qa_calibrar.py trae escrito que
"un guardarraíl que no puede fallar no sirve de nada" — y aun así acumuló varios.

Un QA en verde no dice nada si no se sabe cuántas de sus verificaciones son capaces de
ponerse en rojo. Esto lo mide.

MÉTODO. `construir()` recibe el contenido de los diez artefactos como argumentos, así que
se puede llamar con contenido mutado y ver qué verificaciones cambian de resultado. Los
tres últimos son el build de presentación, que entró al alcance el 6-ago-2026: sus
verificaciones renderizan el front, así que mutar el contenido cambia lo que se emite y la
mutación las alcanza igual que a las demás. Ese fue el motivo de pasarlos por argumento en
vez de leerlos del disco dentro de `construir()`: leerlos del disco los habría dejado
fuera de alcance, y una verificación fuera de alcance no se sabe si sirve.

  1. VACÍO   — se pasan los diez artefactos vacíos. Toda verificación que siga en True
               no depende del contenido de ningún archivo. Puede ser legítima (las que
               comprueban AUSENCIA de algo deben pasar en vacío) o puede ser un
               guardarraíl decorativo. El informe las separa.

  2. BORRADO — por cada artefacto, se le quita el contenido a uno solo y se deja el resto
               intacto. Mide qué verificaciones dependen realmente de cada archivo.

    python3 qa_mutacion.py            # informe
    python3 qa_mutacion.py --breve    # solo lo que no se puede falsificar
    echo $?                           # 0 = toda verificación de presencia es falsificable
"""

import sys
import qa_calibrar as qa

V, R, A, G, B, F = "\033[92m", "\033[91m", "\033[93m", "\033[90m", "\033[1m", "\033[0m"

# Verificaciones que DEBEN pasar con contenido vacío porque comprueban una ausencia:
# "no hay rastros de X", "no se envía el parámetro Y". En vacío no hay nada, luego la
# ausencia se cumple. Que aparezcan en la lista de vacío es correcto, no un defecto.
# Verificaciones que leen archivos FUERA de los siete artefactos que esta prueba sustituye
# (index.html, la plantilla de casos). Sí pueden fallar —tienen su propio guardarraíl— pero
# la mutación no las alcanza. Declararlas es más honesto que llamarlas decorativas: el
# límite es de esta prueba, no de ellas.
FUERA_DE_ALCANCE = {
    "Numeración alineada con el sitio (01 a 07)",
    "Existe la plantilla de captura de casos nuevos",
    "Existe la prueba de mutación del propio QA",
    # El grupo ARCHIVO (8-sep-2026) no lee los diez artefactos: mira el ÁRBOL DE
    # ARCHIVOS de Calibrar/ — qué documentos superados están fuera de
    # `_Archivo obsoleto/`, si los archivados llevan su marca en el nombre, y si el
    # LEEME concilia. Vaciar el PRD no puede ponerlos rojos porque no dependen de su
    # contenido. Su falsificabilidad se comprobó aparte, moviendo un documento
    # archivado a `01 Producto/`: el primero se puso rojo y volvió a verde al sacarlo.
    "Ningún documento superado quedó suelto en carpeta viva",
    "Todo lo archivado lleva su marca [SUPERADO …] en el nombre",
    "El LEEME del archivo existe y concilia lo que la carpeta contiene",
}

AUSENCIA = {
    "Sin rastros de la Cadena de 6 eslabones (E2–E7)",
    "No envía parámetros eliminados del modelo (400)",
    "Ningún pilar_precision compuesto en los casos dorados",
    "El esquema de pilar_precision usa el vocabulario de la Cadena",
    "El triage sigue siendo T1-T14 (no se agregó una pregunta 15)",
    # Entró el 28-ago-2026 con la corrección del Anexo E. Es de ausencia por naturaleza:
    # vigila que NO reaparezcan las dos frases del producto viejo. Sus dos hermanas de esa
    # misma tanda —los cuatro arquetipos, y el bloque <arquetipo>— sí son de presencia y
    # se falsifican solas.
    "El rol no describe al motor como analista de medios pagados",
}


ARTEFACTOS = ("prd", "mtz", "anx", "eva", "bbx", "run", "rea", "phtml", "pjs", "djs")


def correr(**kw):
    """Corre construir() con los artefactos indicados sustituidos."""
    base = dict(zip(ARTEFACTOS, qa.cargar()))
    base.update(kw)
    return {d: ok for _, d, ok in qa.construir(**base)}


def main():
    breve = "--breve" in sys.argv
    real = correr()
    total = len(real)
    if not all(real.values()):
        print(f"{R}El QA no está en verde. Arregla eso antes de mutar.{F}")
        return 1

    vacio = correr(**{k: "" for k in ARTEFACTOS})
    sobreviven = [d for d, ok in vacio.items() if ok]
    decorativas = [d for d in sobreviven
                   if d not in AUSENCIA and d not in FUERA_DE_ALCANCE]
    legitimas = [d for d in sobreviven if d in AUSENCIA]
    fuera = [d for d in sobreviven if d in FUERA_DE_ALCANCE]

    if not breve:
        print(f"\n{B}PRUEBA DE MUTACIÓN DEL QA{F}  ·  {total} verificaciones\n" + "─" * 68)
        print(f"\n{B}1. Con los diez artefactos vacíos{F}")
        print(f"  {V}Se ponen en rojo{F}      {total - len(sobreviven):>3}"
              f"   {G}dependen del contenido: son falsificables{F}")
        print(f"  {G}Siguen en verde{F}       {len(sobreviven):>3}")
        print(f"    {G}· de ausencia{F}       {len(legitimas):>3}"
              f"   {G}correcto: comprueban que algo NO esté{F}")
        print(f"    {G}· fuera de alcance{F}  {len(fuera):>3}"
              f"   {G}leen archivos que esta prueba no sustituye{F}")
        print(f"    {R if decorativas else V}· sin justificar{F}    {len(decorativas):>3}"
              f"   {R + 'guardarraíl decorativo' + F if decorativas else V + 'ninguno' + F}")

        print(f"\n{B}2. Borrando un artefacto a la vez{F}")
        print(f"  {'Artefacto':<28} {'Verificaciones que dependen de él':>34}")
        print("  " + "─" * 64)
        for k, nombre in (("prd", "Calibrar_PRD_v3_jul2026.md"),
                          ("mtz", "Matriz_Exhaustiva_de_Cruces"),
                          ("anx", "AnexoG_Extendido_v3.1.md"),
                          ("eva", "evaluar_salida.py"),
                          ("bbx", "blackbox_calibrar.py"),
                          ("run", "correr_motor.py"),
                          ("rea", "casos_reales.py"),
                          ("phtml", "03 Front/presentacion.html"),
                          ("pjs", "03 Front/…/presentacion.js"),
                          ("djs", "03 Front/assets/data.js")):
            r = correr(**{k: ""})
            n = sum(1 for d, ok in r.items() if not ok)
            barra = "█" * min(n, 34)
            col = V if n else R
            print(f"  {nombre:<28} {col}{n:>3}{F} {G}{barra}{F}")

    print("\n" + "─" * 68)
    if decorativas:
        print(f"{R}{B}{len(decorativas)} verificación(es) no se pueden falsificar{F}")
        for d in decorativas:
            print(f"  {R}✗{F} {d}")
        print(f"\n{G}Una verificación que pasa con los archivos vacíos no está mirando{F}")
        print(f"{G}el contenido. O comprueba una ausencia —y hay que declararla en{F}")
        print(f"{G}AUSENCIA— o es decorativa y hay que reescribirla.{F}")
        return 1

    print(f"{V}{B}Las {total - len(sobreviven)} verificaciones de presencia son falsificables{F}")
    print(f"{G}De las {len(sobreviven)} restantes: {len(legitimas)} comprueban ausencia y "
          f"{len(fuera)} leen archivos fuera del alcance de esta prueba.{F}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
