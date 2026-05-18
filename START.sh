#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# GemmaCare — one-shot setup & run (Mac)
#   cd ~/Downloads/GemmaCare-V1 && bash START.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${BLUE}▶ $1${NC}"; }
success() { echo -e "${GREEN}✓ $1${NC}"; }
warn()    { echo -e "${YELLOW}⚠ $1${NC}"; }
error()   { echo -e "${RED}✗ $1${NC}"; exit 1; }

B1='\033[38;5;33m'
B2='\033[38;5;39m'
T1='\033[38;5;43m'
G1='\033[38;5;78m'
G2='\033[38;5;82m'
W='\033[1;97m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

echo ""
echo -e "${W}${BOLD}  ██████╗ ███████╗███╗   ███╗███╗   ███╗ █████╗  ██████╗ █████╗ ██████╗ ███████╗${RESET}"
echo -e "${W}${BOLD} ██╔════╝ ██╔════╝████╗ ████║████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝${RESET}"
echo -e "${B2}${BOLD} ██║  ███╗█████╗  ██╔████╔██║██╔████╔██║███████║██║     ███████║██████╔╝█████╗  ${RESET}"
echo -e "${T1}${BOLD} ██║   ██║██╔══╝  ██║╚██╔╝██║██║╚██╔╝██║██╔══██║██║     ██╔══██║██╔══██╗██╔══╝  ${RESET}"
echo -e "${G1}${BOLD} ╚██████╔╝███████╗██║ ╚═╝ ██║██║ ╚═╝ ██║██║  ██║╚██████╗██║  ██║██║  ██║███████╗${RESET}"
echo -e "${G2}${BOLD}  ╚═════╝ ╚══════╝╚═╝     ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝${RESET}"
echo ""
echo -e "   ${W}████████   ████████${RESET}"
echo -e "  ${W}█${B1}██████████████████${W}█${RESET}   ${W}Local AI · No cloud · No data leaves device${RESET}"
echo -e "  ${W}█${B1}██████████████████${W}█${RESET}"
echo -e "  ${W}█${B2}██████████████████${W}█${RESET}"
echo -e "  ${W}█${T1}██████████████████${W}█${RESET}   ${DIM}AI-assisted triage for frontline clinicians${RESET}"
echo -e "   ${W}█${T1}████████████████${W}█${RESET}"
echo -e "    ${W}█${G1}██████████████${W}█${RESET}   ${DIM}Developed by: Chris Golden${RESET}"
echo -e "     ${W}█${G1}████████████${W}█${RESET}"
echo -e "      ${W}█${G1}██████████${W}█${RESET}"
echo -e "       ${W}█${G2}████████${W}█${RESET}"
echo -e "        ${W}█${G2}██████${W}█${RESET}"
echo -e "         ${W}█${G2}████${W}█${RESET}"
echo -e "          ${W}████${RESET}"
echo ""

# ── 1. Node ───────────────────────────────────────────────────────────────────
info "Checking Node.js..."
command -v node &>/dev/null || error "Node.js not found. Install v22+ from https://nodejs.org"
success "Node $(node --version)"

# ── 2. pnpm ───────────────────────────────────────────────────────────────────
info "Checking pnpm..."
command -v pnpm &>/dev/null || npm install -g pnpm
success "pnpm $(pnpm --version)"

# ── 3. ffmpeg ─────────────────────────────────────────────────────────────────
info "Checking ffmpeg..."
if ! command -v ffmpeg &>/dev/null; then
  command -v brew &>/dev/null || error "ffmpeg missing. Install Homebrew first then re-run."
  brew install ffmpeg
fi
success "ffmpeg $(ffmpeg -version 2>&1 | head -1 | cut -d' ' -f3)"

# ── 4. Ollama ─────────────────────────────────────────────────────────────────
info "Checking Ollama..."
command -v ollama &>/dev/null || error "Ollama not found. Install from https://ollama.com/download then re-run."
success "Ollama installed"

if ! curl -sf http://localhost:11434/api/tags &>/dev/null; then
  warn "Ollama not running — starting it..."
  ollama serve &>/dev/null & sleep 3
fi

info "Checking for gemma4:e4b model..."
if curl -sf http://localhost:11434/api/tags | grep -q "gemma4"; then
  success "gemma4 model found"
else
  warn "Pulling gemma4:e4b (~8GB, a few minutes)..."
  ollama pull gemma4:e4b
  success "gemma4:e4b ready"
fi

# ── 5. Dependencies ───────────────────────────────────────────────────────────
info "Installing dependencies..."
pnpm install
success "Dependencies installed"

# ── 6. .env ───────────────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  info "Creating .env..."
  cat > .env << 'ENVEOF'
# Leave DATABASE_URL empty to use local SQLite (gemmacare.db created automatically)
DATABASE_URL=
NODE_ENV=development
PORT=8080
JWT_SECRET=gemmacare-v1-local-secret
VITE_APP_ID=local-dev
OAUTH_SERVER_URL=http://localhost:8080
VITE_OAUTH_PORTAL_URL=http://localhost:8080
OWNER_OPEN_ID=local-owner-id
OWNER_NAME=Local Owner
LOCAL_DEV_BYPASS_AUTH=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e4b
VITE_APP_TITLE=GemmaCare V1
ENVEOF
  success ".env created"
else
  # Make sure OLLAMA_BASE_URL is localhost not docker
  sed -i '' 's|host.docker.internal|localhost|g' .env 2>/dev/null || true
  # Make sure DATABASE_URL is empty for local SQLite
  grep -q "^DATABASE_URL=mysql" .env && \
    sed -i '' 's|^DATABASE_URL=mysql.*|DATABASE_URL=|' .env && \
    warn "DATABASE_URL cleared — using local SQLite instead" || true
  success ".env already exists"
fi

# ── 7. SQLite note ────────────────────────────────────────────────────────────
success "Database: SQLite (gemmacare.db) — created automatically on first triage ✅"

echo ""
echo -e "${B1}${BOLD}  ╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${B1}${BOLD}  ║  ${G2}♥${B1}  GemmaCare is ready                          ║${RESET}"
echo -e "${B1}${BOLD}  ║                                                  ║${RESET}"
echo -e "${B1}  ║  ${W}App:    ${G1}http://localhost:8080${B1}                   ║${RESET}"
echo -e "${B1}  ║  ${W}Triage: ${G1}http://localhost:8080/triage${B1}            ║${RESET}"
echo -e "${B1}  ║  ${W}Demo:   ${G1}http://localhost:8080/demo${B1}              ║${RESET}"
echo -e "${B1}  ║                                                  ║${RESET}"
echo -e "${B1}  ║  ${DIM}Press Ctrl+C to stop${B1}                             ║${RESET}"
echo -e "${B1}${BOLD}  ╚══════════════════════════════════════════════════╝${RESET}"
echo ""

pnpm dev
