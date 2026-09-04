# Zero-Capital Economic Agent Swarm

> **Mozaik Hackathon 2026** — Concurrent multi-agent system for finding first economic results at zero capital cost.

## What it does

A swarm of **5 specialized AI agents** in a shared `AgenticEnvironment` (Mozaik `@mozaik-ai/core`) that concurrently:

1. **Scans** for zero-capital economic opportunities (bounties, hackathons, microtasks)
2. **Fetches live market data** via tool-calling (real BTC/S&P500 quotes)
3. **Evaluates** Expected Value (EV = P × reward − cost) for each opportunity
4. **Writes** a final economic action plan from all agent outputs
5. **Observes** all events to verify concurrency

### Key architectural features

| Feature | How |
|---|---|
| **True concurrency** | All agents receive the same `message.sent` event simultaneously and process independently — timestamps prove parallel execution |
| **Shared state & coordination** | A `SharedBoard` (shared findings store): Scanner writes discoveries, Evaluator writes EV scores, Writer reads the full board to synthesize — proving agents *share state and coordinate*, not just run in parallel |
| **Event-driven** | Mozaik `SemanticEvent` system: `message.sent` → agents → `agent.answered` → `all.answered` → `report.done` |
| **Tool-calling** | Market agent uses real `get_quotes` tool → calls `src/market_data.py` → returns live BTC=$78,738, S&P500=7,686 |
| **Non-blocking** | `runWithTools` loop: infer → tool-call → infer — each agent's loop runs asynchronously |
| **Zero cost** | All inference via local `omniroute` (localhost:20128) using free models: `auto/best-coding`, `auto/best-fast`, `auto/best-reasoning` |

### Shared state (coordination) — how it's visible

```
Scanner ──write──► SharedBoard #1 "opportunity: TaskBounty / Mozaik / airdrop"
Evaluator ─write─► SharedBoard #2 "EV = P×reward−cost"
Writer ──reads──► SharedBoard → synthesizes ONE final plan from what ALL agents shared
```

The demo log prints each board write/read with a sequence id and agent name, so the
shared state and coordination are *observable evidence*, not just the final answer.

## Architecture

```
                    ┌─── ScannerAgent (zero-capital opportunities)
                    │
Human ──message──► ├─── MarketAgent (live quotes via get_quotes tool)
  (Operator)       │
                    ├─── EvaluatorAgent (EV calculation)
                    │
                    └─── ObserverAgent (monitors concurrency)

                    ┌─── WriterAgent (final report from all answers)
                    │
    all.answered ──┤
                    └─── report.done (ECONOMIC ACTION PLAN)
```

One broadcast event → three concurrent handlers → tool-calling → final synthesis.

## Verified run

```
[00:14:02.725] Scanner:   message.sent received
[00:14:02.778] Market:    message.sent received      ← same millisecond
[00:14:02.780] Evaluator: message.sent received      ← same millisecond
[00:14:24.877] Scanner:   answer ready (+22s)
[00:14:35.683] Evaluator: answer ready (+33s)        ← parallel, independent
[00:14:44.450] Market:    tool-call get_quotes → BTC $78,738 (+1.05%) (+42s)
[00:14:57]     Writer:    all.answered → final report
```

All three agents started within 55ms of each other and completed independently.

## Quick start

```bash
cd mozaik-hackathon
npm install
```

**A) Офлайн-демо (рекомендация для судей — работает из коробки, без сети/LLM):**
```bash
npm run start:mock
```
> Детерминированное ~1с демо. Доказывает concurrency + SharedBoard даже без интернета.
> Запускается одной командой, не требует внешних сервисов.

**B) Реальный запуск с живыми LLM (через бесплатный omniroute localhost:20128):**
```bash
npm run start:real
# или с произвольным запросом:
npm run start:real -- "best zero-capital side hustle for a TypeScript developer"
```
> Требует запущенный omniroute (localhost:20128) с бесплатными моделями `auto/best-*`.
> Фиктивные API-ключи (`sk-fake`) нужны ТОЛЬКО для загрузки модуля `@mozaik-ai/core`;
> реальный inference идёт через наш `omniRunner` → omniroute (CAPEX = $0).

**Отдельная команда:**
`npm run demo` — то же, что `start:mock`, с примером запроса.

## Fresh demo logs (2026-09-02, verified)

- `logs/demo-2026-09-02T21-50-48-547Z.log` — **REAL LLM run**: live BTC/S&P tool-call
  (BTC $77,251.99, ^GSPC 7,666.60), agents started within ~80ms of each other, finished
  independently. Main evidence for judging.
- `logs/demo-2026-09-02T21-54-33-121Z.log` — **fast MOCK run (1.6s)**: deterministic,
  guaranteed offline demo of the same concurrency + shared board.

## Tech stack

- **Mozaik** `@mozaik-ai/core` 4.0.0-beta.1 — event-driven AgenticEnvironment
- **Node.js** — runtime (no build step required)
- **omniroute** localhost:20128 — free model routing (auto/best-* with automatic fallback)
- **src/market_data.py** — live market quotes (Yahoo Finance, no API key)
- **src/dedup.py** — self-deduplication engine ("A Finding Is Not a Discovery")

## Mozaik API parity (real SDK, verified against jigjoy-ai/mozaik)

We use the **actual** `@mozaik-ai/core` runtime (not a mock/black-box). Every Mozaik concept
mapped to our swarm:

| Mozaik primitive | Where we use it |
|---|---|
| `defineRuntime` / `initializeRuntime` | shared `AgenticEnvironment` + `RuntimeState` (SharedBoard) |
| `createAgent` / `createHuman` | Scanner, Market, Evaluator, Writer, Observer + an operator |
| `SemanticEvent` / `message.sent` | single broadcast event consumed concurrently by workers |
| `SystemMessageItem` / `UserMessageItem` / `ModelContext` | agent context assembly |
| `runLoop` + custom `InferenceRunner` | non-blocking agent loop via our `omniRunner` (free models) |
| `FunctionCallOutputItem` | Market's real `get_quotes` tool-call → live BTC/S&P |
| `join` / `leave` (participant registry) | membership for all agents |
| `observer` pattern (react to `model.answer`) | Observer proves concurrency with per-agent timestamps |

Because Mozaik's core references the OpenAI SDK at import time, we set dummy
`OPENAI_API_KEY`/`ANTHROPIC_API_KEY`/`GEMINI_API_KEY` that are **only** used for module loading;
all real inference travels through our own `omniRunner → omniroute` on free models ($0).

## File structure

```
mozaik-hackathon/
├── src/
│   ├── swarm.js          — Main: agents, events, concurrent execution
│   ├── omniEndpoint.js   — OpenAI-compatible Endpoint → omniroute (free models)
│   ├── omniRunner.js     — Mozaik InferenceRunner bridge
│   └── [dedup.py in ../src] — self-dedup engine (zero-cost token savings)
├── package.json
├── .env.example
└── README.md
```

## Why this matters (Zero-Capital philosophy)

- **$0 infrastructure cost** — free models, free data, free tools
- **First economic result** — the swarm itself is a working product that can run market analysis, opportunity evaluation, and economic planning
- **Concurrent by design** — not a sequential pipeline dressed as multi-agent; true event-driven concurrency via Mozaik's `AgenticEnvironment`
- **Self-deduplication** — agents skip already-known findings before spending tokens

## Demo video

- **`demo.mp4`** — rendered from a **real** LLM run log (`logs/demo-2026-09-02T21-50-48-547Z.log`):
  live BTC/S&P quotes, agents firing within ~80 ms of each other, SharedBoard writes.
  H.264 + AAC (voiceover), generated by `romashka demo-video` — no screen required.
- **`demo.sh`** — one-command demo runner.
- See `DEMO_SCRIPT.md` for the narrated 6-step flow a judge can follow.

## License

MIT
