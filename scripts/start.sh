#!/bin/sh
set -e

shutdown() {
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  nginx -s quit 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}

trap shutdown TERM INT

uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

cd /app/frontend
HOSTNAME=127.0.0.1 PORT=3000 node server.js &
FRONTEND_PID=$!

nginx -g "daemon off;" &
NGINX_PID=$!

wait "$NGINX_PID"
