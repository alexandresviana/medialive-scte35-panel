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

Um único container roda **nginx + backend + frontend** na porta 80.

```bash
cp backend/.env.example backend/.env
# Edite backend/.env com credenciais AWS

docker compose up -d --build
```

Acesse:
- **App:** http://localhost
- **API Docs:** http://localhost/docs

Login padrão: `admin` / `admin123` (altere em produção)

Pull da imagem publicada:

```bash
docker pull ghcr.io/alexandresviana/medialive-scte35-panel:latest
docker run -p 80:80 --env-file backend/.env ghcr.io/alexandresviana/medialive-scte35-panel:latest
```

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
ghcr.io/alexandresviana/medialive-scte35-panel:latest
```

Container único com nginx (porta 80), FastAPI (8000 interno) e Next.js (3000 interno).

## Arquitetura

```text
SRT INPUT → AWS MediaLive (1080i50→1080p50, SCTE-35) → SRT Output

Frontend (Next.js) → HTTPS → Backend (FastAPI) → boto3 → AWS MediaLive API
                              ↕ WebSocket
```

## Estrutura do Projeto

```text
├── Dockerfile          # Container único (nginx + backend + frontend)
├── backend/            # API FastAPI
├── frontend/           # Next.js dashboard
├── nginx/              # Configs nginx (docker e legado)
├── scripts/            # start.sh, deploy-local.sh
├── .github/workflows/  # CI/CD Docker
├── docker-compose.yml
└── INSTRUCOES_PROJETOS.md
```

## Documentação Adicional

- [INSTRUCOES_PROJETOS.md](./INSTRUCOES_PROJETOS.md) — Guia reutilizável para criar projetos similares com Docker e GitHub Actions

## Licença

MIT
