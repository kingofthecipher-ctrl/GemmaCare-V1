#!/bin/bash
# ─────────────────────────────────────────────────────────────
# GemmaCare V1 — Run WITHOUT Docker
# Requires: Node 18+, pnpm, MySQL (or SQLite fallback), Ollama
# ─────────────────────────────────────────────────────────────
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     GemmaCare V1 — No-Docker Local Run       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Check Node
if ! command -v node &>/dev/null; then echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"; exit 1; fi
echo -e "${GREEN}✓ Node $(node -v)${NC}"

# Check pnpm
if ! command -v pnpm &>/dev/null; then
  echo -e "${YELLOW}Installing pnpm...${NC}"
  npm install -g pnpm
fi
echo -e "${GREEN}✓ pnpm${NC}"

# Check Ollama
if curl -s http://localhost:11434/api/tags &>/dev/null; then
  echo -e "${GREEN}✓ Ollama running${NC}"
  if ! curl -s http://localhost:11434/api/tags | grep -q "gemma4"; then
    echo -e "${YELLOW}Pulling gemma4:e4b...${NC}"
    ollama pull gemma4:e4b
  fi
else
  echo -e "${YELLOW}⚠ Ollama not running. Install from https://ollama.com and run: ollama pull gemma4:e4b${NC}"
fi

# Create local .env if not present
if [ ! -f .env.local ]; then
cat > .env.local << 'ENVEOF'
NODE_ENV=development
PORT=8080
DATABASE_URL=mysql://gemmacare:gemmacare123@localhost:3306/gemmacare
JWT_SECRET=gemmacare-v1-local-secret
VITE_APP_ID=local-dev
OAUTH_SERVER_URL=http://localhost:8080
VITE_OAUTH_PORTAL_URL=http://localhost:8080
OWNER_OPEN_ID=local-owner-id
OWNER_NAME=Local User
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e4b
VITE_APP_TITLE=GemmaCare V1
ENVEOF
echo -e "${GREEN}✓ Created .env.local${NC}"
fi

# Install deps
echo ""
echo "Installing dependencies..."
pnpm install

# Run migrations if DB is available
echo ""
echo "Running migrations (if DB available)..."
set +e
npx drizzle-kit migrate 2>/dev/null || echo -e "${YELLOW}  Skipped (no DB or already migrated)${NC}"
set -e

# Start dev server
echo ""
echo -e "${GREEN}Starting GemmaCare V1 in dev mode...${NC}"
echo -e "  🌐  http://localhost:8080"
echo -e "  🦙  Ollama: http://localhost:11434"
echo ""
exec pnpm dev
