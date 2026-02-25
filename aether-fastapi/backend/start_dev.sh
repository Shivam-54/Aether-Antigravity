#!/bin/bash
# ╔══════════════════════════════════════════════════════╗
# ║  Aether Dev Start — 1 Worker, Hot-Reload ON          ║
# ║  Use this when editing backend Python files          ║
# ║  (--workers is incompatible with --reload)           ║
# ╚══════════════════════════════════════════════════════╝

cd "$(dirname "$0")"

echo "🔄 Clearing port 8000..."
lsof -ti :8000 | xargs kill -9 2>/dev/null
sleep 1

echo "🚀 Starting Aether (dev, hot-reload)..."
uvicorn main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --reload
