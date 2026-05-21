# Instruções para Projetos Full-Stack com Docker e GitHub

Este documento registra o fluxo usado para criar o **dash-scte35-controller** e serve como template para projetos futuros.

---

## 1. Estrutura do Projeto

```
projeto/
├── backend/           # API (FastAPI, Express, etc.)
│   ├── app/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/          # UI (Next.js, React, etc.)
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── nginx/             # Reverse proxy (opcional)
├── scripts/           # Scripts de deploy
├── .github/workflows/ # CI/CD
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 2. Passos para Criar um Projeto Completo

### 2.1 Definir a especificação (README)

- Descrever stack, funcionalidades e arquitetura no README
- Incluir exemplos de API, variáveis de ambiente e fluxo de deploy
- Usar o README como prompt/spec para gerar o código

### 2.2 Backend

1. Criar estrutura modular (`app/`, routers, services, models)
2. Configurar via `.env` com `pydantic-settings` ou equivalente
3. Implementar autenticação (JWT), rate limit e health check
4. Criar `requirements.txt` com versões fixas
5. Criar `Dockerfile` com healthcheck
6. Criar `.env.example` (nunca commitar `.env` real)

### 2.3 Frontend

1. Inicializar com Next.js + TypeScript + Tailwind
2. Usar Zustand para estado global e React Query para dados da API
3. Tema dark/profissional conforme o domínio (NOC, dashboard, etc.)
4. WebSocket para updates em tempo real
5. `output: "standalone"` no `next.config` para Docker
6. Criar `Dockerfile` multi-stage (deps → build → runner)

### 2.4 Docker

1. **docker-compose.yml** com backend + frontend (+ nginx opcional)
2. Healthcheck no backend antes de subir o frontend (`depends_on: condition: service_healthy`)
3. Build args para variáveis `NEXT_PUBLIC_*` no frontend
4. Perfil `production` para nginx quando necessário

### 2.5 Nginx (produção)

- Proxy `/api/` → backend
- Proxy `/ws` → backend (WebSocket com `Upgrade` header)
- Proxy `/` → frontend

### 2.6 Git e GitHub

```bash
git init
git add .
git commit -m "feat: aplicação completa com Docker e CI/CD"
gh repo create NOME_DO_REPO --public --source=. --push
```

### 2.7 GitHub Actions — Build de Imagens Docker

Criar `.github/workflows/docker-build.yml`:

- Trigger: push em `main`/`master`, tags `v*`, PRs
- Registry: `ghcr.io` (GitHub Container Registry)
- Permissões: `packages: write`
- Jobs separados para backend e frontend
- Cache com `type=gha` para builds mais rápidos
- Push apenas fora de PRs (`if: github.event_name != 'pull_request'`)

Imagens publicadas em:
```
ghcr.io/SEU_USUARIO/SEU_REPO/backend:latest
ghcr.io/SEU_USUARIO/SEU_REPO/frontend:latest
```

### 2.8 Deploy em plataformas

| Serviço   | Arquivo        | Uso                    |
|-----------|----------------|------------------------|
| Vercel    | `vercel.json`  | Frontend Next.js       |
| Railway   | `railway.json` | Backend Docker         |
| Docker    | `docker-compose.yml` | Local / VPS      |

---

## 3. Checklist Antes de Publicar

- [ ] `.gitignore` inclui `.env`, `node_modules`, `.next`, `__pycache__`
- [ ] `.env.example` documenta todas as variáveis
- [ ] Senhas padrão documentadas com aviso para trocar em produção
- [ ] Health checks funcionando
- [ ] CORS configurado para origens corretas
- [ ] Workflow CI passa no GitHub
- [ ] README com instruções de uso local e deploy

---

## 4. Comandos Úteis

```bash
# Desenvolvimento local (sem Docker)
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
cd frontend && npm install && npm run dev

# Docker local
docker compose up -d --build

# Com nginx (produção)
docker compose --profile production up -d --build

# Ver logs
docker compose logs -f backend

# Pull imagens do GHCR
docker pull ghcr.io/USUARIO/REPO/backend:latest
docker pull ghcr.io/USUARIO/REPO/frontend:latest
```

---

## 5. Variáveis de Ambiente — Referência Rápida

### Backend
| Variável | Descrição |
|----------|-----------|
| `AWS_ACCESS_KEY_ID` | Credencial AWS |
| `AWS_SECRET_ACCESS_KEY` | Credencial AWS |
| `AWS_REGION` | Região (ex: us-east-1) |
| `JWT_SECRET` | Segredo para tokens JWT |
| `ADMIN_USERNAME` | Usuário admin |
| `ADMIN_PASSWORD` | Senha admin |
| `CORS_ORIGINS` | Origens permitidas (vírgula) |

### Frontend
| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL do backend |
| `NEXT_PUBLIC_WS_URL` | URL WebSocket do backend |

---

## 6. Lições Aprendidas (dash-scte35-controller)

1. **README como spec** — Um README detalhado funciona como prompt completo para gerar a aplicação
2. **Monorepo simples** — Backend e frontend na mesma raiz facilitam Docker Compose e CI
3. **GHCR gratuito** — GitHub Container Registry integra nativamente com Actions
4. **Standalone Next.js** — Obrigatório para Docker images pequenas e eficientes
5. **WebSocket atrás de nginx** — Requer headers `Upgrade` e `Connection`
6. **Build args no frontend** — Variáveis `NEXT_PUBLIC_*` devem ser passadas no build Docker, não em runtime

---

## 7. Próximos Projetos — Template Rápido

1. Copiar estrutura de pastas deste projeto
2. Adaptar README com nova especificação
3. Gerar backend e frontend conforme stack desejada
4. Ajustar `docker-compose.yml` e workflow CI
5. `git init` → `gh repo create` → push
6. Configurar secrets/vars nas plataformas de deploy (Vercel, Railway)

---

*Gerado em: maio/2026 — Projeto: dash-scte35-controller*
