#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f backend/.env ]; then
  echo "Erro: backend/.env não encontrado."
  echo "Copie: cp backend/.env.example backend/.env"
  exit 1
fi

echo "=== Deploy produção — medialive-scte35-panel ==="
echo "Pull da imagem latest do GHCR..."
docker compose -f docker-compose.prod.yml pull

echo "Reiniciando container..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo "Aguardando healthcheck..."
sleep 5
curl -sf http://127.0.0.1/api/health && echo "" || echo "⚠️  Healthcheck ainda não respondeu — verifique: docker compose -f docker-compose.prod.yml logs -f"

echo ""
echo "✅ Deploy concluído: http://localhost"
