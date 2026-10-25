#!/bin/bash
# CALIBRAR · Cabina — el "ejecutable": levanta el servidor local y abre el login.
# Doble clic en Finder y listo. (Google Sign-In necesita localhost, no file://.)
cd "$(dirname "$0")/.."   # → carpeta Calibrar/
PUERTO=8642
if ! lsof -i :$PUERTO -sTCP:LISTEN -t >/dev/null 2>&1; then
  nohup python3 -m http.server $PUERTO >/dev/null 2>&1 &
  sleep 1
fi
open "http://localhost:$PUERTO/04%20Cabina/login.html"
