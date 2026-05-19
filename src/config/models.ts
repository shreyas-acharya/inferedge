/**
 * Maps the client `model` field (Anthropic API name or custom alias)
 * to a Workers AI model ID. Keys must match the request exactly.
 */
export const MODEL_MAP: Record<string, string> = {
	// Open models (@cf/) — set ANTHROPIC_MODEL to these aliases in Claude Code
	"qwen-2-5-coder": "@cf/qwen/qwen2.5-coder-32b-instruct",
	"llama-3.3-70b": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",

	// Claude API names → Cloudflare proxied Anthropic models
	"claude-opus-4-7": "anthropic/claude-opus-4.7",
	"claude-opus-4-6": "anthropic/claude-opus-4.6",
	"claude-sonnet-4-6": "anthropic/claude-sonnet-4.6",
	"claude-sonnet-4-5": "anthropic/claude-sonnet-4.5",
	"claude-sonnet-4": "anthropic/claude-sonnet-4",
	"claude-haiku-4-5": "anthropic/claude-haiku-4.5",
	// Legacy / alias names clients may still send
	"claude-3-7-sonnet": "anthropic/claude-sonnet-4.5",
	"claude-3-opus": "anthropic/claude-opus-4.6",
};

export function resolveWorkersAiModel(
	requestedModel: string,
	defaultModel: string,
): string {
	if (requestedModel.startsWith("@cf/") || requestedModel.startsWith("anthropic/")) {
		return requestedModel;
	}
	return MODEL_MAP[requestedModel] ?? defaultModel;
}
