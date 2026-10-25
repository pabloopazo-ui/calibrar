# Calibrar

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
