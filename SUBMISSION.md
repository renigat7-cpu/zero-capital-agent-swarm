# Mozaik Hackathon 2026 — Submission Brief
# Zero-Capital Economic Agent Swarm

> One-line pitch: **A concurrent swarm of AI agents that finds and evaluates the first
> real-money opportunity at zero capital cost — sharing state and coordinating via
> Mozaik's event-driven AgenticEnvironment.**

## The shared goal
All agents drive toward ONE goal: **find a zero-capital, human-readable way to earn first
real money** and rank the best option by Expected Value (EV = P × reward − cost, cost = $0).

## What each agent observes / reacts to
| Agent | Capacity | Observes | Reacts / produces |
|---|---|---|---|
| **Scanner** | scan | `message.sent` (shared operator request) | 2–3 concrete zero-capital opportunities → writes to SharedBoard #1 |
| **Market** | quotes | `message.sent` | **Real tool-call** `get_quotes` → live BTC/S&P500 → shares snapshot |
| **Evaluator** | ev | `message.sent` (and reads SharedBoard) | EV = P×reward−0 for each opportunity → writes EV to SharedBoard #2 |
| **Observer** | observe | every `agent.answered` | Logs each agent's answer → *proves* concurrency (independent timestamps) |
| **Writer** | report | `all.answered` | **Reads the whole SharedBoard**, synthesizes ONE final action plan |

## Concurrency — made visible (the core judging criterion)
All three workers receive the **same** `message.sent` event and process it **simultaneously**.

- They **start within the same millisecond** and **finish independently** (separate timestamps).
- Mozaik's non-blocking `runInference()` / our `runWithTools` loop lets each agent's
  infer → tool-call → infer pipeline run asynchronously, not as a sequential pipeline.
- Every agent answer is timestamped and observed live in the demo log.

Note: this is **true event-driven concurrency** (one broadcast, N concurrent handlers),
not a sequential pipeline dressed up as "multi-agent".

## Shared state & coordination (second judging criterion)
A **SharedBoard** is the shared findings store:
```
Scanner  ──write──► SharedBoard #1 "TaskBounty / Mozaik / airdrop"
Evaluator ──write─► SharedBoard #2 "EV = P×reward−0"
Writer   ──reads──► SharedBoard → ONE synthesized plan
```
Each write/read is logged with a **sequence id + agent name**, so coordination is
*observable evidence* — agents explicitly share and coordinate state, not just run in parallel.

## Real tool-calling (evidence it's not a toy)
The Market agent invokes a real `get_quotes` tool (backed by `src/market_data.py` on Yahoo
Finance, no API key) and returns **live quotes** — e.g. BTC=$79,074 (+1.38%) — into the run.

## Zero-cost constraint honored
- **CAPEX = $0**: all inference through free local models (omniroute: auto/best-coding,
  auto/best-fast, auto/best-reasoning with automatic fallback).
- **Free data**: market_data.py (Yahoo Finance), no API keys.
- **Self-dedup**: `src/dedup.py` ("A finding is not a discovery") — agents skip already-known
  results before spending tokens.

## How to reproduce
```bash
cd mozaik-hackathon && npm install
# Fake API keys only for @mozaik-ai/core module loading (Lesson 7); real inference → free omni
OPENAI_API_KEY="sk-fake" ANTHROPIC_API_KEY="fake" GEMINI_API_KEY="fake" node src/swarm.js
# (needs local omniroute at localhost:20128; or set OMNIROUTE_BASE_URL env to any OpenAI-compat)
```
**Guaranteed offline demo (2s, deterministic — recommended for judging):**
```bash
# Proves concurrency + shared-state with zero network/LLM dependency (rate-limit-proof).
MOCK=1 OPENAI_API_KEY="sk-fake" ANTHROPIC_API_KEY="fake" GEMINI_API_KEY="fake" \
  node src/swarm.js "best zero-capital income" --mock
```
A timestamped demo log is auto-saved to `logs/demo-*.log` for evidence.

## Files
```
src/swarm.js        — agents, SharedBoard, concurrent event flow (main)
src/omniEndpoint.js — OpenAI-compatible Endpoint → free omniroute (CAPEX=0)
src/omniRunner.js   — Mozaik InferenceRunner bridge
```
