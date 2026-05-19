import { Hono } from "hono";
import { z } from "zod";
import { formatAnthropicMessage } from "../anthropic/formatter";
import { normalizeAnthropicMessages } from "../anthropic/parser";
import { resolveWorkersAiModel } from "../config/models";
import { generateWithWorkersAi } from "../providers/workers-ai";

const MessageRequestSchema = z.object({
	model: z.string(),
	max_tokens: z.number().optional(),
	stream: z.boolean().optional(),
	system: z.union([z.string(), z.array(z.object({ type: z.string().optional(), text: z.string().optional() }))]).optional(),
	messages: z.array(
		z.object({
			role: z.string(),
			content: z.union([
				z.string(),
				z.array(z.object({ type: z.string().optional(), text: z.string().optional() })),
			]),
		}),
	),
});

const anthropic = new Hono<{ Bindings: CloudflareBindings }>();

anthropic.post("/messages", async (c) => {
	let body: z.infer<typeof MessageRequestSchema>;
	try {
		const json = await c.req.json();
		body = MessageRequestSchema.parse(json);
	} catch {
		return c.json(
			{
				type: "error",
				error: { type: "invalid_request_error", message: "Invalid request body" },
			},
			400,
		);
	}

	if (body.stream) {
		return c.json(
			{
				type: "error",
				error: {
					type: "invalid_request_error",
					message: "Streaming is not supported yet",
				},
			},
			501,
		);
	}

	const messages = normalizeAnthropicMessages(body);
	if (messages.length === 0) {
		return c.json(
			{
				type: "error",
				error: { type: "invalid_request_error", message: "No messages provided" },
			},
			400,
		);
	}

	const workersModel = resolveWorkersAiModel(
		body.model,
		c.env.DEFAULT_MODEL,
	);

	try {
		const result = await generateWithWorkersAi(
			c.env.AI,
			workersModel,
			messages,
			body.max_tokens,
		);

		return c.json(
			formatAnthropicMessage({
				model: body.model,
				text: result.text,
				inputTokens: result.usage?.prompt_tokens,
				outputTokens: result.usage?.completion_tokens,
			}),
		);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Workers AI request failed";
		return c.json(
			{
				type: "error",
				error: { type: "api_error", message },
			},
			500,
		);
	}
});

export default anthropic;
