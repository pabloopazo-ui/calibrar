#!/usr/bin/env python3
"""
CALIBRAR · Servidor de la Cabina.

Reemplaza a `python3 -m http.server`: sirve exactamente lo mismo (la carpeta
Calibrar/ completa, para que las rutas relativas a «03 Front» sigan andando) y
agrega dos endpoints locales que cierran el circuito de la transcripción:

    GET /api/notas?dias=N   índice de las grabaciones de Notas de Voz que YA
                            traen transcripción hecha por macOS. No devuelve el
                            texto: solo id, título, fecha, minutos y tamaño.
    GET /api/nota?id=UUID   la transcripción completa de una de ellas.

POR QUÉ ASÍ Y NO GRABANDO AUDIO. macOS ya transcribe las Notas de Voz solo, en
el equipo, gratis y con buena calidad. Mandar el audio de la reunión de un
cliente a un servicio externo agrega costo y un problema de Ley 21.719 que hoy
no existe. Esto solo LEE texto que el sistema ya produjo.

El parser vive en la rutina `notas-de-voz-a-memoria` y se importa: acá no se
duplica ni una línea de la lógica de extracción.

⚠ Acceso Total al Disco. La carpeta de Notas de Voz está protegida por TCC, y el
permiso se concede POR BINARIO. El intérprete que lanza este servidor (el que
usa Terminal o Finder) puede no tenerlo aunque otras apps sí. Cuando falta, el
endpoint responde 200 con {"bloqueo": "sin_acceso_disco_completo"} y la Cabina
muestra qué hacer — nunca se cae.

Uso:  python3 servidor_cabina.py [puerto]      (por defecto 8642)
"""

import http.server
import importlib.util
import json
import os
import socketserver
import sys
import time
import urllib.parse

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)                      # …/Calibrar
LECTOR = os.path.expanduser(
    "~/.claude/scheduled-tasks/notas-de-voz-a-memoria/leer_notas_de_voz.py")

_cache = {"clave": None, "ts": 0, "notas": []}
CACHE_SEG = 45


def _lector():
    """Importa el parser de la rutina. None si no está instalada."""
    if not os.path.exists(LECTOR):
        return None
    spec = importlib.util.spec_from_file_location("leer_notas_de_voz", LECTOR)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _indice(dias):
    """Índice de notas con transcripción. Cachea unos segundos: al abrir el
    selector se piden dos veces seguidas y volver a parsear no aporta nada."""
    clave = int(dias)
    if _cache["clave"] == clave and time.time() - _cache["ts"] < CACHE_SEG:
        return {"ok": True, "notas": _cache["notas"], "cache": True}

    mod = _lector()
    if mod is None:
        return {"ok": False, "bloqueo": "sin_rutina",
                "detalle": "No se encontró leer_notas_de_voz.py en ~/.claude/scheduled-tasks/."}

    desde = time.time() - int(dias) * 86400
    try:
        datos, bloqueo, _ = mod.leer(desde, [])
    except PermissionError:
        return {"ok": False, "bloqueo": "sin_acceso_disco_completo"}
    except Exception as e:                                    # noqa: BLE001
        return {"ok": False, "bloqueo": "error", "detalle": str(e)[:300]}

    if bloqueo:
        return {"ok": False, "bloqueo": bloqueo}

    notas = []
    for n in (datos or {}).get("notas", []):
        t = n.get("transcripcion") or ""
        notas.append({
            "id": n.get("id"),
            "titulo": n.get("titulo") or "(sin título)",
            "fecha": n.get("fecha"),
            "minutos": n.get("duracion_min") or n.get("duracion") or None,
            "caracteres": len(t),
            "ruta": n.get("ruta_audio"),
        })
    notas.sort(key=lambda r: r["fecha"] or "", reverse=True)
    _cache.update(clave=clave, ts=time.time(), notas=notas)
    return {"ok": True, "notas": notas}


def _texto(nid):
    idx = _indice(30)
    if not idx.get("ok"):
        return idx
    nota = next((n for n in idx["notas"] if n["id"] == nid), None)
    if nota is None:
        return {"ok": False, "bloqueo": "no_encontrada"}
    mod = _lector()
    try:
        texto, extra = mod.transcripcion_de_audio(nota["ruta"])
    except PermissionError:
        return {"ok": False, "bloqueo": "sin_acceso_disco_completo"}
    if not texto:
        return {"ok": False, "bloqueo": "sin_transcripcion", "detalle": str(extra)}
    return {"ok": True, "id": nid, "titulo": nota["titulo"],
            "fecha": nota["fecha"], "idioma": extra, "texto": texto}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=RAIZ, **kw)

    def _json(self, payload, code=200):
        cuerpo = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(cuerpo)

    def do_GET(self):                                          # noqa: N802
        partes = urllib.parse.urlsplit(self.path)
        if partes.path == "/api/notas":
            q = urllib.parse.parse_qs(partes.query)
            dias = q.get("dias", ["3"])[0]
            try:
                dias = max(1, min(60, int(dias)))
            except ValueError:
                dias = 3
            return self._json(_indice(dias))
        if partes.path == "/api/nota":
            q = urllib.parse.parse_qs(partes.query)
            nid = (q.get("id") or [""])[0]
            if not nid:
                return self._json({"ok": False, "bloqueo": "falta_id"}, 400)
            return self._json(_texto(nid))
        return super().do_GET()

    def log_message(self, *a):
        pass          # el servidor de la Cabina no ensucia la consola


class Servidor(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8642
    with Servidor(("127.0.0.1", puerto), Handler) as s:
        print(f"Cabina sirviendo {RAIZ} en http://localhost:{puerto}")
        print("  /api/notas?dias=N  ·  /api/nota?id=UUID")
        try:
            s.serve_forever()
        except KeyboardInterrupt:
            pass
