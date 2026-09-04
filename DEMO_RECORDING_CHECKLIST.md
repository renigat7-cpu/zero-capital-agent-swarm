# Demo Video — Recording Checklist (Mozaik Hackathon 2026)

> Точный чек-лист для съёмки демо-видео, согласованный с **реальными** логами
> (см. `logs/`). Использовать как основу для съёмки и последнего сабмита.
> Обновлено: 2026-09-02.

## Цель видео
За **≤60 секунд** показать жюри ДВА главных критерия брифа:
1. **Concurrency** — агенты реально работают одновременно (не последовательно).
2. **Shared state / координация** — агенты делят общую доску и координируются.

---

## ПЕРЕД съёмкой (подготовка)

### Инструменты записи экрана (одно из)
- [ ] **OBS Studio** (бесплатно) — запись окна терминала + микрофон.
- [ ] Или любое: `simplescreenrecorder`, встроенный recorder (Gnome `Win+Shift+R` в KDE/GNOME).
- [ ] Финальный рендер сохранить в **MP4** (H.264), размер <100 МБ, либо короткий **loom/screen recording link**.

### Окружение (чтобы видео не падало)
- [ ] Закрыть лишние окна; терминал на весь экран, шрифт крупный (Ctrl+= в терминале).
- [ ] Проверить, что `omniroute` живёт: `curl -s localhost:20128/v1/models` → 200.
- [ ] Каталог `mozaik-hackathon`, `npm install` уже выполнен (node_modules есть).

### Два варианта прогона для демо — выбери один
- **A. Реальный LLM (по умолчанию, ~85–90с на экране)** — живые BTC-котировки,
  максимально убедительно. Рекомендуется, если интернет/omniroute работают.
- **B. Быстрый MOCK (`MOCK=1`, ~1.6с)** — гарантированно мгновенно, идеально для
  короткого фрагмента "запуск + таймштампы", не зависит от сети.

> Рекомендация: снять фрагменты реальным прогоном, а для "чистых" таймштампов
> параллельности использовать быстрый MOCK (B) — он детерминированный.

---

## СЪЁМКА (по кадрам / shots)

### Shot 1 — Хук (0–7с)
- [ ] Текстовый оверлей поверх экрана: **"5 AI agents. One goal. Zero capital."**
- [ ] Озвучка (необязательно, но желательно):
  > "What if several AI agents shared one goal, worked at the same time, and
  > coordinated through a shared board to find the first real-money opportunity at zero cost?"

### Shot 2 — Запуск swarm (7–15с)
- [ ] На экране команда (вариант B — быстрый mock):
```bash
MOCK=1 OPENAI_API_KEY="sk-fake" ANTHROPIC_API_KEY="fake" GEMINI_API_KEY="fake" \
  node src/swarm.js "Find a zero-capital way to earn first money and check BTC." --mock
```
- [ ] Показать, как **три таймштампа появляются почти одновременно** (Frame из реального лога):
```
[21:52:51.054] Scanner:   получил событие message.sent
[21:52:51.054] Market:    получил событие message.sent
[21:52:51.054] Evaluator: получил событие message.sent      ← одна и та же миллисекунда
```
- [ ] Озвучка:
  > "One broadcast event. Three agents react instantly — in the same millisecond."

### Shot 3 — Реальный tool-call (15–25с) *(если вариант A)*
- [ ] Показать вывод Market с живыми котировками:
```
Market: BTC-USD $77,251.99 (+0.11%) | ^GSPC 7,666.60 (+0.46%)
```
- [ ] Озвучка:
  > "Meanwhile, Market pulls LIVE data — a real tool call, no API key, no cost."
- [ ] *(Если вариант B)* — вместо живых котировок проговорить, что mock отвечает
  заранее прописанными числами, но механика concurrency + shared-state та же.

### Shot 4 — Shared state / координация (25–40с) ★ главное для судьи
- [ ] Показать участок лога с **общей доской**:
```
Board: Scanner   ЗАПИСАЛ на общую доску #1 → "Opportunity 1: TaskBounty agent coding task..."
Board: Evaluator ЗАПИСАЛ на общую доску #2 → "EV-оценка: Mozaik — P=0.15, reward=$300, cost=$0 → EV≈$45"
Board-view: Writer читает всю доску (SHARED BOARD ...)
```
- [ ] Озвучка:
  > "They don't just run in parallel — they SHARE state. Scanner writes opportunities,
  > Evaluator scores them, and Writer reads the board to produce ONE coordinated plan."

### Shot 5 — Итоговый отчёт (40–52с)
- [ ] Показать, как Writer выдаёт **единый экономический план действий**:
```
Writer: ИТОГОВЫЙ ОТЧЁТ:
# Economic Action Plan ... 1) Ship Mozaik submission ... 2) Watch TaskBounty ...
```
- [ ] Озвучка:
  > "Writer synthesizes everything into a single, ranked action plan."

### Shot 6 — Финальный кадр (52–60с)
- [ ] Текстовый оверлей: **"True concurrency. Shared state. Zero capital.
  The Zero-Capital Economic Agent Swarm."**
- [ ] CTA: ссылка на репозиторий + demo-лог.

---

## ПОСЛЕ съёмки (проверка перед сабмитом)

### Техническая проверка видео
- [ ] Длительность ≤60с (если чуть больше — лучше сократить, не тянуть).
- [ ] Звук/наложение читается; оверлеи не закрывают важный вывод лога.
- [ ] Сохранено в MP4 (H.264) или есть публичный loom/YouTube link (unlisted ok).
- [ ] Размер приемлем для загрузки (обычно <100–200 МБ).
- [ ] В видео **нет** настоящих API-ключей/секретов (только `sk-fake`).

### Проверка по критериям брифа (самопроверка)
- [ ] Видно, что **3+ агента работают одновременно** (таймштампы рядом) — concurrency.
- [ ] Видна **общая доска** (запись/чтение) — shared state & coordination.
- [ ] Виден **реальный tool-call** (живые BTC/индекс) — рабочая система, не мок.
- [ ] Упомянут **CAPEX=0** (бесплатные модели, fake-keys трюк, бесплатные данные).

### Материалы для сабмита рядом
- [ ] Репо (GitHub) с кодом: `mozaik-hackathon/` (README, src/, package.json).
- [ ] Демо-лог(и): `logs/demo-2026-09-02T21-50-48-547Z.log` (реальный) и
  `demo-2026-09-02T21-54-33-121Z.log` (быстрый mock).
- [ ] Ссылку на demo-видео.
- [ ] При необходимости — заполнить форму на build.jigjoy.ai до вечера 6 сентября.

---

## Маппинг «кадр → критерий брифа» (шпаргалка для судьи)
| Кадр | Что показывает | Критерий брифа |
|---|---|---|
| Shot 2 | Таймштампы старта в одну мс | **Concurrency** |
| Shot 4 | Общая доска: записи+чтение | **Shared state / координация** |
| Shot 3 | Реальный tool-call (BTC) | Рабочая система |
| Shot 1,5,6 | $0 инфра, единый план | Zero-capital философия |
