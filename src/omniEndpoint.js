// omniEndpoint.js — OpenAI-compatible Endpoint для Mozaik, работающий на бесплатных
// моделях через локальный omniroute (http://localhost:20128/v1/chat/completions).
// Без API-ключа. Реализует интерфейс Endpoint (infer / stream) из @mozaik-ai/core.
//
// InferenceInput → OpenAI chat.completions → InferenceOutput
// (только free/локальные каналы — требование Zero-Capital, CAPEX=0)

const { ModelMessageItem, ReasoningItem, FunctionCallItem } = require("@mozaik-ai/core");

const OMNIROUTE_BASE_URL = process.env.OMNIROUTE_BASE_URL || "http://localhost:20128/v1";
// Модель по умолчанию (бесплатная, рабочая через omniroute). Можно переопределить env.
const DEFAULT_MODEL = process.env.OMNI_MODEL || "auto/best-coding";
// Кандидаты для fallback: бесплатные модели omniroute могут иметь переменный rate-limit
// (401/429), поэтому при ошибке пробуем следующую. Все бесплатные, CAPEX=0.
const MODEL_CANDIDATES = (process.env.OMNI_MODEL_CANDIDATES || "auto/best-coding,auto/best-fast,auto/best-reasoning").split(",").map((s) => s.trim()).filter(Boolean);
const TIMEOUT_MS = Number(process.env.OMNI_TIMEOUT_MS || 120000);

// Маппинг ContextItem → OpenAI chat message.
// Mozaik использует: SystemMessageItem, DeveloperMessageItem, UserMessageItem,
// ModelMessageItem, ReasoningItem, FunctionCallItem, FunctionCallOutputItem.
function contextToMessages(inferenceInput) {
  const messages = [];
  let system = null;
  for (const item of inferenceInput.context.getItems()) {
    const type = item.getType();
    if (type === "message") {
      if (item.role === "system") {
        system = (system ? system + "\n" : "") + item.content.text;
      } else if (item.role === "developer") {
        system = (system ? system + "\n" : "") + item.content.text;
      } else if (item.role === "user") {
        messages.push({ role: "user", content: item.content.text });
      } else if (item.role === "assistant") {
        messages.push({ role: "assistant", content: item.content.text });
      }
    } else if (type === "function_call") {
      let args;
      try {
        args = JSON.parse(item.args);
      } catch {
        args = item.args;
      }
      messages.push({ role: "assistant", content: null, tool_calls: [{ id: item.callId, type: "function", function: { name: item.name, arguments: JSON.stringify(args) } }] });
    } else if (type === "function_call_output") {
      messages.push({ role: "tool", tool_call_id: item.callId, content: item.output.text });
    }
    // ReasoningItem игнорируем в запросе (безопасно для большинства провайдеров)
  }
  // NOTE: system-сообщение собирается отдельно и добавляется в начало messages
  // в infer() (см. строку messages.unshift). Здесь оно только возвращается.
  return { messages, system };
}

async function infer(inferenceInput) {
  const { messages, system } = contextToMessages(inferenceInput);
  const requestedModel = inferenceInput.model || DEFAULT_MODEL;
  const body = { model: requestedModel, messages };
  if (system) {
    // Если у модели нет системного слота, кладём system первым сообщением
    messages.unshift({ role: "system", content: system });
  }
  if (inferenceInput.maxOutputTokens) {
    body.max_tokens = inferenceInput.maxOutputTokens;
  }
  // Поддержка tool-calling, если модель умеет
  if (inferenceInput.tools && inferenceInput.tools.length > 0) {
    body.tools = inferenceInput.tools.map((t) => ({
      type: "function",
      function: { name: t.name, description: t.description, parameters: t.parameters },
    }));
  }
  if (inferenceInput.streaming) {
    return inferStreaming(inferenceInput, body);
  }

  // Fallback: если модель в rate-limit (401/429), пробуем следующего кандидата.
  const models = [requestedModel, ...MODEL_CANDIDATES.filter((m) => m !== requestedModel)];
  let lastError = null;
  for (const model of models) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let resp;
    try {
      resp = await fetch(`${OMNIROUTE_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...body, model }),
        signal: controller.signal,
      });
    } catch (e) {
      lastError = e;
      clearTimeout(timer);
      continue;
    } finally {
      clearTimeout(timer);
    }
    if (!resp.ok) {
      lastError = new Error(`omniroute ${resp.status} (model ${model}): ${(await resp.text().catch(() => "")).slice(0, 120)}`);
      if (resp.status === 401 || resp.status === 429) continue; // пробуем следующего кандидата
      throw lastError;
    }
    const data = await resp.json();
    return toInferenceOutput(data);
  }
  throw lastError || new Error("all omniroute models failed");
}

async function* inferStreaming(inferenceInput, body) {
  const resp = await fetch(`${OMNIROUTE_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ ...body, stream: true }),
  });
  if (!resp.ok) throw new Error(`omniroute stream ${resp.status}`);
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (line.startsWith("data: ")) {
        const payload = line.slice(6);
        if (payload === "[DONE]") return;
        try {
          const chunk = JSON.parse(payload);
          const delta = chunk.choices && chunk.choices[0] && chunk.choices[0].delta;
          if (delta && delta.content) {
            yield { type: "inference.stream", producerId: inferenceInput.callerId || "agent", occurredAt: new Date(), payload: { text: delta.content } };
          }
        } catch { /* ignore malformed */ }
      }
    }
  }
}

// OpenAI chat.completions (non-stream) → InferenceOutput
function toInferenceOutput(data) {
  const items = [];
  const choice = (data.choices && data.choices[0]) || {};
  const message = choice.message || {};
  if (message.content) {
    items.push(ModelMessageItem.rehydrate({ text: message.content }));
  } else if (Array.isArray(message.content)) {
    for (const block of message.content) {
      if (block.type === "text" && block.text) items.push(ModelMessageItem.rehydrate({ text: block.text }));
      else if (block.type === "thinking" && block.thinking) {
        items.push(ReasoningItem.rehydrate({ content: block.thinking, encryptedContent: null, summary: [] }));
      }
    }
  }
  if (Array.isArray(message.tool_calls)) {
    for (const tc of message.tool_calls) {
      items.push(FunctionCallItem.rehydrate({ callId: tc.id, name: tc.function.name, args: tc.function.arguments || "{}" }));
    }
  }
  return { items, rowResponse: data };
}

const endpoint = {
  endpointMapper: null, // простой passthrough, mapper не критичен для нашего runner
  infer,
  stream: inferStreaming,
};

module.exports = { endpoint, infer, toInferenceOutput, contextToMessages, DEFAULT_MODEL };
