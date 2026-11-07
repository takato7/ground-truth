COMPOSE := docker compose

.PHONY: all build up down start stop restart ps logs \
        rm-containers volumes rm-volumes clean fclean re \
        install install-backend install-frontend \
        check check-backend check-frontend check-hooks check-claude-md fmt gen-api \
        clean-sandbox

all: up

# --- Images ---------------------------------------------------------------

build:
	$(COMPOSE) build

# --- Containers -------------------------------------------------------------

up: build
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

start:
	$(COMPOSE) start

stop:
	$(COMPOSE) stop

restart: down up

rm-containers:
	$(COMPOSE) rm -fsv

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f

# --- Volumes ----------------------------------------------------------------

volumes:
	docker volume ls --filter label=com.docker.compose.project=ground-truth

rm-volumes:
	$(COMPOSE) down -v

# --- Cleanup ------------------------------------------------------------

# Containers, networks, volumes, and locally built images — everything
# docker compose knows about for this project.
clean:
	$(COMPOSE) down -v --rmi local --remove-orphans

# Sandboxes a killed run left behind (.claude/scripts/sandbox.sh removes its own on exit).
clean-sandbox:
	.claude/scripts/sandbox.sh clean

# clean + local build artifacts (Python venv/caches, node build output) and
# dangling docker build cache — as close to a fresh checkout as possible.
fclean: clean
	rm -rf backend/.venv backend/.pytest_cache
	find backend -type d -name '__pycache__' -prune -exec rm -rf {} +
	rm -rf frontend/node_modules frontend/dist frontend/dist-ssr
	docker builder prune -f

re: fclean install build up

# --- Local dev tooling --------------------------------------------------

# Docker builds don't need these (each image installs its own deps), but
# your editor/TS server/local pytest runs do — fclean wipes them, so
# restore them as part of a full "re" rather than leaving that as a
# manual step.
install: install-backend install-frontend

install-backend:
	cd backend && uv sync

install-frontend:
	cd frontend && npm install

# --- Quality gates ------------------------------------------------------
# Single entry points shared by humans, the Claude Code hooks/skills, and
# /goal completion criteria. `check` must exit 0 before a PR is opened.

check: check-backend check-frontend check-hooks check-claude-md

check-backend:
	cd backend && uv run ruff check . && uv run ruff format --check . && uv run pytest -q

check-frontend:
	cd frontend && npm run lint && npm run format:check && npm run typecheck && npm test

# Claude Code hook scripts (.claude/hooks): block/allow cases and formatting. Skipped when
# nothing under .claude/ changed; FULL=1 forces a full run.
check-hooks:
	.claude/hooks/tests/run.sh $(if $(FULL),--all)

# CLAUDE.md line budget (claude_md_max_lines in .claude/workflow.yml). Always runs.
check-claude-md:
	.claude/scripts/claude-md-budget.sh

fmt:
	cd backend && uv run ruff format . && uv run ruff check --fix .
	cd frontend && npm run format

# Backend Pydantic schemas -> backend/openapi.json -> frontend/src/api/schema.gen.ts.
# Run after any change to request/response models; both outputs are committed.
gen-api:
	cd backend && uv run python scripts/export_openapi.py
	cd frontend && npm run gen:api
