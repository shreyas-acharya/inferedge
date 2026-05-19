import type { InternalMessage } from "../internal/messages";

export interface WorkersAiResult {
	text: string;
	usage?: {
		prompt_tokens?: number;
		completion_tokens?: number;
	};
}

export async function generateWithWorkersAi(
	ai: Ai,
	model: string,
	messages: InternalMessage[],
	maxTokens?: number,
): Promise<WorkersAiResult> {
	const result = await ai.run(model, {
		messages: messages.map((m) => ({ role: m.role, content: m.content })),
		...(maxTokens != null ? { max_tokens: maxTokens } : {}),
	});

	const text =
		typeof result.response === "string"
			? result.response
			: String(result.response ?? "");

	return {
		text,
		usage: result.usage as WorkersAiResult["usage"],
	};
}
