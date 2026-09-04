#!/usr/bin/env bash
# demo.sh — запуск Zero-Capital Economic Agent Swarm и сохранение демо-лога
# (доказательство concurrent multi-agent работы для Mozaik Hackathon 2026)
#
# Fake API-ключи нужны только для загрузки @mozaik-ai/core (см. Урок 7);
# реальный inference идёт через бесплатный локальный omniroute (CAPEX=0).

set -euo pipefail
cd "$(dirname "$0")"

export OPENAI_API_KEY="${OPENAI_API_KEY:-sk-fake}"
export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-fake}"
export GEMINI_API_KEY="${GEMINI_API_KEY:-fake}"
export OMNI_MODEL="${OMNI_MODEL:-auto/best-coding}"

REQUEST="${1:-Find a zero-capital way to earn first money and check current BTC market.}"

echo ">>> Zero-Capital Agent Swarm — demo run"
echo ">>> Request: $REQUEST"
echo ">>> Free models via omniroute (OMNI_MODEL=$OMNI_MODEL), CAPEX=0"

node src/swarm.js "$REQUEST"
