#!/usr/bin/env python3
"""Regenera `04 Cabina/assets/prompt_maestro.js` DESDE el Anexo E del PRD.

Existe porque `qa_cabina.py` verifica por hash que el prompt de la cabina sea VERBATIM el
Anexo E, y hasta ahora la copia se hacía a mano. Eso convirtió una buena verificación en un
fijador de defectos: el 21-ago el reporte semanal encontró que la cabina mandaba a la API el
Anexo E sin corregir, y corregir solo el `.js` habría puesto el hash en rojo.

El orden correcto, y el único que funciona, es: corregir el Anexo E en el PRD → correr esto →
correr `qa_cabina.py`.

    python3 "Calibrar/01 Producto/regenerar_prompt_maestro.py"
    python3 "Calibrar/01 Producto/regenerar_prompt_maestro.py" --check   # no escribe
"""
import datetime
import hashlib
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parents[2]
PRD = RAIZ / "Calibrar/01 Producto/Calibrar_PRD_v3_jul2026.md"
DESTINO = RAIZ / "Calibrar/04 Cabina/assets/prompt_maestro.js"


def extraer_anexo_e(texto):
    """Mismo recorte que hace qa_cabina.py — si esto y aquello discrepan, el hash falla."""
    lineas = texto.split("\n")
    for i, l in enumerate(lineas):
        if l.startswith("# Anexo E"):
            j = i
            while lineas[j].strip() != "```":
                j += 1
            ini = j + 1
            k = ini
            while lineas[k].strip() != "```":
                k += 1
            return "\n".join(lineas[ini:k])
    raise SystemExit("No se encontró el bloque del Anexo E en el PRD")


def version_prd(texto):
    m = re.search(r"^\*\*Versión\s+([\d.]+)", texto, re.M)
    return m.group(1) if m else "?"


def main():
    solo_check = "--check" in sys.argv
    prd = PRD.read_text(encoding="utf-8")
    anexo = extraer_anexo_e(prd)

    for prohibido in ("`", "${"):
        if prohibido in anexo:
            raise SystemExit(
                f"El Anexo E contiene {prohibido!r}, que rompe el template literal de JS. "
                f"Corrígelo en el PRD antes de regenerar.")

    # El destino se reescribe ENTERO, así que cualquier constante que alguien haya
    # dejado ahí desaparece sin dejar rastro. Pasó: APENDICE_VIVO, APENDICE_PREPARACION
    # y APENDICE_DIGITAL vivían en este archivo, los borró una regeneración, y el hash
    # siguió en verde porque solo compara PROMPT_MAESTRO. La cabina murió en reunión con
    # un ReferenceError. Ahora se detiene antes de escribir; su lugar es
    # `04 Cabina/assets/apendices_motor.js`, donde este generador no llega.
    if DESTINO.exists():
        otras = [n for n in re.findall(r"^const\s+([A-Z_][A-Z0-9_]*)\s*=", DESTINO.read_text(encoding="utf-8"), re.M)
                 if n != "PROMPT_MAESTRO"]
        if otras:
            raise SystemExit(
                f"{DESTINO.name} declara además {', '.join(otras)}, y regenerar lo borraría.\n"
                f"Mueve esas constantes a 04 Cabina/assets/apendices_motor.js antes de regenerar.")

    ver = version_prd(prd)
    hoy = datetime.date.today().isoformat()
    js = (f"/* CALIBRAR · System Prompt Maestro — Anexo E del PRD v{ver}, extraído VERBATIM "
          f"el {hoy}.\n"
          f"   NO editar a mano: si cambia el PRD, regenerar con\n"
          f"   python3 \"Calibrar/01 Producto/regenerar_prompt_maestro.py\" */\n"
          f"const PROMPT_MAESTRO = `{anexo}`;\n")

    h_prd = hashlib.sha256(anexo.encode()).hexdigest()
    actual = DESTINO.read_text(encoding="utf-8") if DESTINO.exists() else ""
    igual = actual == js

    print(f"PRD v{ver} · Anexo E: {len(anexo):,} caracteres · sha256 {h_prd[:12]}")
    if igual:
        print("prompt_maestro.js ya está al día — no se escribe nada")
        return 0
    if solo_check:
        print("DESACTUALIZADO: prompt_maestro.js no coincide con el Anexo E del PRD")
        return 1
    DESTINO.write_text(js, encoding="utf-8")
    print(f"escrito {DESTINO.relative_to(RAIZ)} ({len(js):,} caracteres)")
    print("Ahora corre: python3 \"Calibrar/04 Cabina/qa_cabina.py\"")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
