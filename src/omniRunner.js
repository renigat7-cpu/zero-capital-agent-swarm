// omniRunner.js — InferenceRunner для Mozaik runtime, работающий на бесплатных
// моделях через локальный omniroute. Позволяет указать свою модель через
// inferenceInput.model (иначе DEFAULT_MODEL).
//
// Мы передаём этот runner в initializeRuntime({ inferenceRunnerConfig:{ runner } }),
// поэтому DefaultInferenceRunner/InferenceInputValidator не используются —
// нет платных моделей и нет валидации, которая требовала бы полный ModelSpecification.

const { endpoint } = require("./omniEndpoint");

async function run(inferenceInput) {
  return endpoint.infer(inferenceInput);
}

async function* streamInference(inferenceInput) {
  yield* endpoint.stream(inferenceInput);
}

const runner = { run, streamInference };

module.exports = { runner };
