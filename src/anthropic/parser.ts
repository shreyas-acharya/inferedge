import type { InternalMessage } from "../internal/messages";

type ContentBlock = { type?: string; text?: string };
type AnthropicMessage = { role: string; content: string | ContentBlock[] };
type SystemBlock = { type?: string; text?: string };

function flattenContent(content: string | ContentBlock[] | undefined): string {
	if (content == null) return "";
	if (typeof content === "string") return content;
	return content
		.filter((block) => block.type === "text" || block.text != null)
		.map((block) => block.text ?? "")
		.join("");
}

function normalizeSystem(
	system: string | SystemBlock[] | undefined,
): InternalMessage[] {
	if (system == null) return [];
	const text =
		typeof system === "string"
			? system
			: system.map((block) => block.text ?? "").join("\n");
	if (!text.trim()) return [];
	return [{ role: "system", content: text }];
}

export function normalizeAnthropicMessages(body: {
	system?: string | SystemBlock[];
	messages: AnthropicMessage[];
}): InternalMessage[] {
	const out = normalizeSystem(body.system);

	for (const message of body.messages) {
		const content = flattenContent(message.content);
		if (!content.trim() && message.role !== "assistant") continue;

		if (message.role === "user" || message.role === "assistant") {
			out.push({ role: message.role, content });
		}
	}

	return out;
}
