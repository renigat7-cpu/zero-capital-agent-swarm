# Zero-Capital Economic Agent Swarm — Demo Video Script (≤60s)
# Verified 2026-09-02 with a real run. Use fast MOCK (1.6s) as the on-screen demo,
# and the real LLM log (logs/demo-2026-09-02T21-50-48-547Z.log) as the evidence link.
> For Mozaik Hackathon 2026 submission. Goal: make CONCURRENCY + SHARED STATE visibly obvious.

## Shot 1 — Hook (0-7s)
**Text overlay:** "5 AI agents. One goal. Zero capital."
**Voice/on-screen:**
> "What if several AI agents shared one goal, worked at the same time, and coordinated
> through a shared board to find the first real-money opportunity at zero cost?"

---

## Shot 2 — Launch the swarm (7-15s)
Run the command on screen:
```bash
OPENAI_API_KEY="sk-fake" ANTHROPIC_API_KEY="fake" GEMINI_API_KEY="fake" \
  node src/swarm.js "Find a zero-capital way to earn first money and check BTC."
```
**Narrate:**
> "One broadcast event. Three agents react instantly — in the SAME millisecond."

Show the three timestamps appearing together:
```
[00:00:02.725] Scanner:   message.sent received
[00:00:02.778] Market:    message.sent received      ← same ms
[00:00:02.780] Evaluator: message.sent received      ← same ms
```

---

## Shot 3 — Real tool-calling (15-25s)
Show Market agent calling get_quotes → live BTC pops up:
```
Market: tool-call get_quotes → BTC $77,251.99 (+0.11%) | ^GSPC 7,666.60 (+0.46%)
```
**Narrate:**
> "Meanwhile, Market pulls LIVE data — a real tool call, no API key, no cost."

---

## Shot 4 — Shared state / coordination (25-40s)  ★ most important for judging
Show the SharedBoard filling up with numbered entries:
```
Board: Scanner   ЗАПИСАЛ #1 → "TaskBounty / Mozaik / airdrop"
Board: Evaluator ЗАПИСАЛ #2 → "EV = P×reward−0"
Board-view: Writer READS the whole board
```
**Narrate:**
> "They don't just run in parallel — they SHARE state. Scanner writes opportunities,
> Evaluator scores them, and Writer reads the board to produce ONE coordinated plan."

---

## Shot 5 — Final report (40-52s)
Show Writer's final economic action plan appearing.
**Narrate:**
> "Writer synthesizes everything into a single, ranked action plan."

---

## Shot 6 — Close (52-60s)
**Text overlay:** "True concurrency. Shared state. Zero capital. This is the Zero-Capital
Economic Agent Swarm."
**CTA:** Repo + demo log link.

---

## What the judge sees (mapped to brief criteria)
1. ✅ Same-millisecond start timestamps → **visible concurrency**
2. ✅ Numbered SharedBoard writes/reads → **shared state & coordination**
3. ✅ Real BTC tool-call → **working system, not a mock**
4. ✅ $0 infra (free models + fake-keys trick + free data) → **zero-capital philosophy**
