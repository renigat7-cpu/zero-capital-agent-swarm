# Zero-Capital Economic Agent Swarm — Submission Pitch

**One-liner:** A concurrent swarm of 5 AI agents that hunts for the first real-money
opportunity at $0 capital cost — proving event-driven concurrency and shared-state
coordination with Mozaik.

## Idea
Most "AI agents" are sequential pipelines wearing a multi-agent costume. This project is the
opposite: 5 specialized agents (Scanner, Market, Evaluator, Writer, Observer) live in ONE
Mozaik `RuntimeState`, receive the SAME `message.sent` event, and process it **simultaneously**
— independently inferring, calling real tools, and writing to a shared board. Concurrency is
not a feature we claim, it is the core mechanic, proven with per-agent timestamps.

## How it works
1. Operator sends one economic question → broadcast as a single `message.sent` event.
2. **Scanner**, **Market**, **Evaluator** react concurrently:
   - Scanner finds zero-capital opportunities,
   - Market calls a real tool (`get_quotes`) for live BTC/S&P500,
   - Evaluator ranks each by Expected Value (EV = P × reward − $0).
3. All three write to a **SharedBoard** (coordinated state, not just parallelism).
4. **Writer** reads the full board and synthesizes ONE action plan.
5. **Observer** logs every agent's answer with a timestamp — live proof of concurrency.

## Why it's a real Mozaik system
- Uses the actual `@mozaik-ai/core` v4 runtime: `defineRuntime`, `createAgent`,
  `createHuman`, `SemanticEvent`, `runLoop`, situation handlers, `FunctionCallOutputItem`
  tool-calling. Verified against the official docs.
- True event-driven concurrency + adaptive coordination through shared `RuntimeState`.

## Zero cost (the "Zero-Capital" bet)
- All inference on free models via a local OpenAI-compatible omniroute (CAPEX = $0).
- Real market data from Yahoo Finance (no API key). Self-deduplication saves tokens.

## Runs anywhere in one command
```bash
npm install && npm run start:mock   # deterministic ~1s offline demo
npm run start:real                   # live swarm via free omniroute
```
Demo video: `demo.mp4` (rendered from a real LLM run log with live quotes).

## Repo
- MIT-licensed, minimal deps (`@mozaik-ai/core` + `cross-env`). See `README.md`.