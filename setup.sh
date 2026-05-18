#!/bin/bash
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         GemmaCare V1 — Local Setup               ║${NC}"
echo -e "${CYAN}║   100% local · Gemma 4 E4B · No external APIs    ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Audio transcription, vision, reasoning, and"
echo -e "  translation all run through a single local model."
echo ""

# ── Prerequisites ──────────────────────────────────────────────────────────────
echo "Checking prerequisites..."

if ! command -v docker &>/dev/null; then
  echo -e "${RED}✗ Docker not found. Install Docker Desktop from https://docker.com${NC}"; exit 1
fi
echo -e "${GREEN}✓ Docker${NC}"

if ! docker compose version &>/dev/null; then
  echo -e "${RED}✗ Docker Compose not found${NC}"; exit 1
fi
echo -e "${GREEN}✓ Docker Compose${NC}"

# ── Ollama + Gemma 4 E4B ───────────────────────────────────────────────────────
echo ""
echo "Checking Ollama..."

if curl -s http://localhost:11434/api/tags &>/dev/null; then
  echo -e "${GREEN}✓ Ollama is running${NC}"

  if curl -s http://localhost:11434/api/tags | grep -q "gemma4"; then
    echo -e "${GREEN}✓ Gemma 4 E4B found${NC}"
    echo -e "  Audio · Vision · Reasoning · Translation — all ready"
  else
    echo -e "${YELLOW}⚠ Gemma 4 E4B not found. Pulling now (this may take a while)...${NC}"
    echo -e "  Model size: ~9.6GB"
    ollama pull gemma4:e4b || {
      echo -e "${RED}  Pull failed. Run manually: ollama pull gemma4:e4b${NC}"
      echo -e "${RED}  Then re-run this script.${NC}"
      exit 1
    }
    echo -e "${GREEN}✓ Gemma 4 E4B ready${NC}"
  fi
else
  echo -e "${RED}✗ Ollama is not running.${NC}"
  echo -e "  1. Install from https://ollama.com"
  echo -e "  2. Run: ollama pull gemma4:e4b"
  echo -e "  3. Re-run this script"
  exit 1
fi

# ── Clean up orphans ───────────────────────────────────────────────────────────
echo ""
echo "Cleaning up any orphaned containers..."
docker rm -f gemmacareV1-db gemmacareV1-app 2>/dev/null && \
  echo "Removed orphaned containers" || echo "No orphaned containers"

# ── Build & start ─────────────────────────────────────────────────────────────
echo ""
echo "Building Docker image..."
docker compose build

echo ""
echo "Starting services (DB + App)..."
docker compose up -d

echo ""
echo "Waiting for app to be ready..."
for i in $(seq 1 30); do
  if curl -s http://localhost:8080/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ App is up!${NC}"
    break
  fi
  echo -n "."
  sleep 2
done

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         GemmaCare V1 is running!                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  🌐  App:          ${CYAN}http://localhost:8080${NC}"
echo -e "  🦙  Model:        ${CYAN}gemma4:e4b (Ollama on your Mac)${NC}"
echo -e "  🎙  Transcription:${CYAN}Gemma 4 native audio (140+ languages)${NC}"
echo -e "  🔤  Translation:  ${CYAN}Gemma 4 native (speech-to-translated-text)${NC}"
echo -e "  👁  Vision:       ${CYAN}Gemma 4 native (medication labels, wounds)${NC}"
echo ""
echo -e "  View logs:   ${CYAN}docker compose logs -f app${NC}"
echo -e "  Stop:        ${CYAN}docker compose down${NC}"
echo -e "  Full reset:  ${CYAN}docker compose down -v${NC}"
echo ""
