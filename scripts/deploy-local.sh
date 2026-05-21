#!/bin/bash
set -euo pipefail

echo "=== SCTE-35 Controller - Deploy Local ==="

if [ ! -f backend/.env ]; then
  echo "Criando backend/.env a partir do exemplo..."
  cp backend/.env.example backend/.env
  echo "⚠️  Edite backend/.env com suas credenciais AWS antes de usar em produção."
fi

echo "Subindo serviços com Docker Compose..."
docker compose up -d --build

echo ""
echo "✅ Aplicação disponível em:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Login padrão: admin / admin123"
