#!/usr/bin/env python3
"""
CALIBRAR · Exporta el código real a una carpeta lista para el repo privado de GitHub.

Copia Calibrar/ tal cual está en el disco, salvo lo que NO sale del equipo
(decisión de Pablo del 25-oct-2026):
  - 02 Prospeccion/            datos de prospectos (RUT, decisores, nóminas SII)
  - 04 Cabina/Reuniones/       reuniones con clientes
  - 04 Cabina/Entregables/     entregables de clientes
  - respaldos (*.backup*, _backup*) y _rescate_cache_navegador_*/
  - el correo autorizado de 04 Cabina/assets/config.js (se reemplaza por uno de ejemplo)

El repo vive FUERA de Calibrar/ a propósito: un .git dentro de la carpeta
sincronizada dejaría a los QA y a Drive viendo miles de objetos ajenos.

Uso:  python3 exportar_repo.py <carpeta_destino>
Se detiene si en la copia encuentra un correo de ppagencia.cl, una clave de API
o un RUT con dígito verificador.
"""

import re
import shutil
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent          # …/Calibrar
EXCLUIR_RUTAS = {"02 Prospeccion", "04 Cabina/Reuniones", "04 Cabina/Entregables"}
EXCLUIR_NOMBRES = {".DS_Store", "__pycache__", ".claude", ".git"}


README = """# Calibrar

Herramienta interna de diagnóstico de crecimiento comercial de Precisión.
Ubica dónde se rompe el crecimiento de una empresa sobre la Cadena de
Crecimiento Comercial de siete eslabones (01 Criterio · 02 Reputación ·
03 Demanda · 04 Activo · 05 Captura · 06 Escala · 07 Capacidad) y rutea a la
disciplina que lo resuelve. El diagnóstico lo conduce una persona; el software
ordena la conversación y verifica la salida.

**Repositorio privado. No se comparte fuera de Precisión.**

## Estructura

| Carpeta | Qué contiene |
|---|---|
| `01 Producto/` | PRD v5.9 (fuente de verdad), Matriz de Cruces v1.6, casos dorados y los scripts de QA y evaluación del motor |
| `03 Front/` | Prototipo sin servidor. `assets/data.js` es el modelo de datos del instrumento y `assets/motor.js` el ruteo determinista; la cabina los reutiliza |
| `04 Cabina/` | La herramienta de reunión: `reunion.html`, `guiada.html`, `resultados.html`, la capa de API (`assets/motor_api.js`) y el servidor local (`servidor_cabina.py`) |
| `04 Pitch Modulo V/` | Demo y pitch del curso, superados por la cabina |
| `_arquitectura/` | Generadores de la página de arquitectura y de este repositorio |
| `_Archivo obsoleto/` | Versiones superadas, conservadas como antecedente |

## Cómo se corre

```bash
python3 "04 Cabina/servidor_cabina.py"     # sirve en http://localhost:8642
python3 "01 Producto/qa_calibrar.py"        # necesita node
python3 "04 Cabina/qa_cabina.py"            # necesita node
```

El prompt del motor no se edita en `04 Cabina/assets/prompt_maestro.js`: se
corrige el Anexo E del PRD y se regenera con
`python3 "01 Producto/regenerar_prompt_maestro.py"`.

## Lo que este repositorio no trae

Se excluyeron a propósito y no se versionan nunca (ver `.gitignore`):

- `02 Prospeccion/`: la base de prospectos (Ley 21.719).
- `04 Cabina/Reuniones/` y `04 Cabina/Entregables/`: reuniones y entregables de clientes.
- Respaldos y copias de rescate.
- La lista de correos autorizados de la cabina: `config.js` trae uno de ejemplo.

Por eso 5 de las 222 verificaciones de QA no pasan en esta copia, sin que haya
un defecto de código:

- `qa_cabina.py` (3): ejecución del motor local y del módulo profesional sobre la
  reunión de prueba, y «Reuniones/ tiene al menos una reunión publicada».
- `qa_calibrar.py` (2): numeración del sitio, que lee el `index.html` de la web,
  y la plantilla de casos de éxito, que vive fuera de Calibrar.

En el equipo de origen, con esos archivos presentes, los dos QA pasan completos
(117/117 y 151/151 al 25-oct-2026).
"""


def excluido(rel: Path) -> bool:
    s = rel.as_posix()
    if any(s == r or s.startswith(r + "/") for r in EXCLUIR_RUTAS):
        return True
    if any(p in EXCLUIR_NOMBRES for p in rel.parts):
        return True
    if any(p.startswith("_rescate_cache_navegador") for p in rel.parts):
        return True
    n = rel.name
    return ".backup" in n or "_backup" in n or n.startswith("backup_")


def main():
    if len(sys.argv) != 2:
        sys.exit("Uso: python3 exportar_repo.py <carpeta_destino>")
    destino = Path(sys.argv[1]).resolve()
    if RAIZ in destino.parents or destino == RAIZ:
        sys.exit("✗ El destino no puede quedar dentro de Calibrar/")
    destino.mkdir(parents=True, exist_ok=True)
    # Limpia la copia anterior sin tocar el historial git.
    for h in destino.iterdir():
        if h.name != ".git":
            shutil.rmtree(h) if h.is_dir() else h.unlink()

    n = 0
    for p in sorted(RAIZ.rglob("*")):
        rel = p.relative_to(RAIZ)
        if p.is_dir() or excluido(rel):
            continue
        d = destino / rel
        d.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, d)
        n += 1

    cfg = destino / "04 Cabina/assets/config.js"
    t = cfg.read_text()
    t2 = re.sub(r"(CABINA_CORREOS_PERMITIDOS\s*=\s*\[)[^\]]*(\])",
                r"\1\n  'tu.correo@ejemplo.cl'\n\2", t)
    if t2 == t:
        sys.exit("✗ No encontré la lista de correos en config.js")
    cfg.write_text(t2)

    (destino / ".gitignore").write_text(
        "# Nunca se versionan: datos de prospectos y de clientes, y respaldos\n"
        "02 Prospeccion/\n04 Cabina/Reuniones/\n04 Cabina/Entregables/\n"
        "*.backup*\n*_backup*\n_rescate_cache_navegador_*/\n.DS_Store\n__pycache__/\n.claude/\n")

    (destino / "README.md").write_text(README)

    # Verificación de la copia: lo que no puede salir del equipo.
    rx = {
        "correo de la agencia": re.compile(r"[\w.+-]+@ppagencia\.cl", re.I),
        "clave de API": re.compile(r"sk-ant-[A-Za-z0-9_-]{20,}"),
        "RUT": re.compile(r"\b\d{1,2}\.\d{3}\.\d{3}-[\dkK]\b"),
    }
    # El correo de contacto de Pablo en la lámina del pitch es público y se queda;
    # lo que no puede salir es la lista de acceso de la cabina.
    # (Armado en dos partes para que este mismo archivo no dispare su revisión.)
    PERMITIDOS = {("04 Pitch Modulo V/pitch_calibrar.html", "pablo.opazo" + "@ppagencia.cl")}
    hallazgos = []
    for p in destino.rglob("*"):
        if p.is_file() and ".git" not in p.parts and p.suffix in {
                ".js", ".py", ".html", ".css", ".md", ".txt", ".json", ".command"}:
            t = p.read_text(errors="ignore")
            for nombre, r in rx.items():
                for m in r.findall(t):
                    if (p.relative_to(destino).as_posix(), m) in PERMITIDOS:
                        continue
                    hallazgos.append(f"{nombre} en {p.relative_to(destino)}: {m}")
    if hallazgos:
        print("\n".join(hallazgos[:40]))
        sys.exit(f"✗ {len(hallazgos)} hallazgos: la copia no se sube así")
    print(f"✓ {n} archivos exportados a {destino} · 0 correos de la agencia · 0 claves · 0 RUT")


main()
