import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createOpenAIProvider(apiKey: string, baseURL: string, name: string) {
  return createOpenAICompatible({
    name,
    baseURL,
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

export function createXaiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "xai",
    baseURL: "https://api.x.ai/v1",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

/**
 * Returns the primary model and an optional fallback provider.
 * Callers should try primary first and, on failure, retry with fallback.
 */
export function getStudyModels() {
  const xaiKey = process.env.XAI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const gatewayUrl = process.env.AI_GATEWAY_URL;
  const gatewayKey = process.env.AI_GATEWAY_API_KEY;

  if (xaiKey) {
    const xai = createXaiProvider(xaiKey);
    const fallback = createXaiProvider(xaiKey)("grok-4-standard");
    return { primary: xai("grok-4-fast-reasoning"), fallback, hasPrimary: true };
  }

  if (gatewayKey && gatewayUrl) {
    const generic = createOpenAIProvider(gatewayKey, gatewayUrl, "ai-gateway");
    return { primary: generic("gpt-4"), fallback: generic("gpt-4o-mini"), hasPrimary: true };
  }

  if (openAiKey) {
    const openai = createOpenAIProvider(openAiKey, "https://api.openai.com/v1", "openai");
    return { primary: openai("gpt-4"), fallback: openai("gpt-4o-mini"), hasPrimary: true };
  }

  throw new Error(
    "Missing AI provider environment variable(s): XAI_API_KEY, OPENAI_API_KEY, or AI_GATEWAY_API_KEY."
  );
}
