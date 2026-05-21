#!/bin/bash
set -euo pipefail

echo "=== SCTE-35 Controller - Deploy Local ==="

if [ ! -f backend/.env ]; then
  echo "Criando backend/.env a partir do exemplo..."
  cp backend/.env.example backend/.env
  echo "⚠️  Edite backend/.env com suas credenciais AWS antes de usar em produção."
fi

echo "Subindo container único com Docker Compose..."
docker compose up -d --build

echo ""
echo "✅ Aplicação disponível em:"
echo "   App:      http://localhost"
echo "   API Docs: http://localhost/docs"
echo ""
echo "Login padrão: admin / admin123"
