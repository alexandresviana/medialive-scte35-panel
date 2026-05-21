# AWS MediaLive SCTE-35 Controller

Painel web profissional para controle de breaks SCTE-35 no AWS MediaLive em tempo real.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind, shadcn/ui, Zustand, React Query |
| Backend | FastAPI, boto3, JWT, WebSocket |
| Infra | Docker, docker-compose, nginx, GitHub Actions (GHCR) |

## Funcionalidades

- Dashboard NOC com status de canais MediaLive
- **START BREAK** e **RETURN TO NETWORK** via API AWS
- Countdown em tempo real do break ativo
- Logs e histórico de breaks
- Multi-canal (IDs configuráveis)
- Autenticação JWT
- WebSocket para updates live
- Rate limiting e health checks

## Início Rápido (Docker)

```bash
cp backend/.env.example backend/.env
# Edite backend/.env com credenciais AWS

docker compose up -d --build
```

Acesse:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Swagger:** http://localhost:8000/docs

Login padrão: `admin` / `admin123` (altere em produção)

## Desenvolvimento Local

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Variáveis de Ambiente

### Backend (`backend/.env`)

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
JWT_SECRET=change-me-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CORS_ORIGINS=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## IAM AWS

Policy mínima necessária:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "medialive:BatchUpdateSchedule",
        "medialive:DescribeChannel"
      ],
      "Resource": "*"
    }
  ]
}
```

## Deploy

| Plataforma | Arquivo | Serviço |
|-----------|---------|---------|
| Vercel | `frontend/vercel.json` | Frontend |
| Railway | `railway.json` | Backend |
| Docker/GHCR | `.github/workflows/docker-build.yml` | Ambos |

Imagens Docker publicadas automaticamente no push para `main`:

```
ghcr.io/SEU_USUARIO/dash-scte35-controller/backend:latest
ghcr.io/SEU_USUARIO/dash-scte35-controller/frontend:latest
```

## Arquitetura

```text
SRT INPUT → AWS MediaLive (1080i50→1080p50, SCTE-35) → SRT Output

Frontend (Next.js) → HTTPS → Backend (FastAPI) → boto3 → AWS MediaLive API
                              ↕ WebSocket
```

## Estrutura do Projeto

```text
├── backend/          # API FastAPI
├── frontend/         # Next.js dashboard
├── nginx/            # Reverse proxy
├── scripts/          # Deploy scripts
├── .github/workflows/# CI/CD Docker
├── docker-compose.yml
└── INSTRUCOES_PROJETOS.md  # Template para próximos projetos
```

## Documentação Adicional

- [INSTRUCOES_PROJETOS.md](./INSTRUCOES_PROJETOS.md) — Guia reutilizável para criar projetos similares com Docker e GitHub Actions

## Licença

MIT
