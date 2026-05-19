export interface InternalMessage {
	role: "system" | "user" | "assistant";
	content: string;
}
