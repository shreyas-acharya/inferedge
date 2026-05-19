import { nanoid } from "nanoid";

export interface AnthropicMessageResponse {
	id: string;
	type: "message";
	role: "assistant";
	model: string;
	content: Array<{ type: "text"; text: string }>;
	stop_reason: "end_turn" | "max_tokens";
	stop_sequence: null;
	usage: {
		input_tokens: number;
		output_tokens: number;
	};
}

export function formatAnthropicMessage(params: {
	model: string;
	text: string;
	inputTokens?: number;
	outputTokens?: number;
	stopReason?: "end_turn" | "max_tokens";
}): AnthropicMessageResponse {
	return {
		id: `msg_${nanoid()}`,
		type: "message",
		role: "assistant",
		model: params.model,
		content: [{ type: "text", text: params.text }],
		stop_reason: params.stopReason ?? "end_turn",
		stop_sequence: null,
		usage: {
			input_tokens: params.inputTokens ?? 0,
			output_tokens: params.outputTokens ?? 0,
		},
	};
}
