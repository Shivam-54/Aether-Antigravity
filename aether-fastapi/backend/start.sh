#!/bin/bash
# ╔══════════════════════════════════════════════════════╗
# ║  Aether — Auto-Restarting Server                    ║
# ║  Keeps the server alive indefinitely.               ║
# ║  If a worker crashes, it respawns automatically.    ║
# ╚══════════════════════════════════════════════════════╝

cd "$(dirname "$0")"

echo "🔄 Clearing port 8000..."
lsof -ti :8000 | xargs kill -9 2>/dev/null
sleep 1

echo "🚀 Starting Aether with auto-restart..."
while true; do
    uvicorn main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --workers 2 \
        --timeout-keep-alive 75 \
        --timeout-graceful-shutdown 10
    
    EXIT_CODE=$?
    echo "⚠️  Server exited with code $EXIT_CODE at $(date). Restarting in 2s..."
    sleep 2
done
