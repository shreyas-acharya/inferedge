import { Hono } from "hono";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/v1/models", (c) => {
    return c.json(
        {
            "data": [
                {
                    "id": "claude-opus-4-6",
                    "capabilities": {
                        "batch": {
                            "supported": true
                        },
                        "citations": {
                            "supported": true
                        },
                        "code_execution": {
                            "supported": true
                        },
                        "context_management": {
                            "clear_thinking_20251015": {
                                "supported": true
                            },
                            "clear_tool_uses_20250919": {
                                "supported": true
                            },
                            "compact_20260112": {
                                "supported": true
                            },
                            "supported": true
                        },
                        "effort": {
                            "high": {
                                "supported": true
                            },
                            "low": {
                                "supported": true
                            },
                            "max": {
                                "supported": true
                            },
                            "medium": {
                                "supported": true
                            },
                            "supported": true,
                            "xhigh": {
                                "supported": true
                            }
                        },
                        "image_input": {
                            "supported": true
                        },
                        "pdf_input": {
                            "supported": true
                        },
                        "structured_outputs": {
                            "supported": true
                        },
                        "thinking": {
                            "supported": true,
                            "types": {
                                "adaptive": {
                                    "supported": true
                                },
                                "enabled": {
                                    "supported": true
                                }
                            }
                        }
                    },
                    "created_at": "2026-02-04T00:00:00Z",
                    "display_name": "Claude Opus 4.6",
                    "max_input_tokens": 0,
                    "max_tokens": 0,
                    "type": "model"
                }
            ],
            "first_id": "first_id",
            "has_more": true,
            "last_id": "last_id"
        }
    )
});

app.post("/v1/message", (c) => {
    return c.json(
        {
            "id": "msg_013Zva2CMHLNnXjNJJKqJ2EF",
            "container": {
                "id": "id",
                "expires_at": "2019-12-27T18:11:19.117Z"
            },
            "content": [
                {
                    "citations": [
                        {
                            "cited_text": "cited_text",
                            "document_index": 0,
                            "document_title": "document_title",
                            "end_char_index": 0,
                            "file_id": "file_id",
                            "start_char_index": 0,
                            "type": "char_location"
                        }
                    ],
                    "text": "Hi! My name is Claude.",
                    "type": "text"
                }
            ],
            "model": "claude-opus-4-6",
            "role": "assistant",
            "stop_details": {
                "category": "cyber",
                "explanation": "explanation",
                "type": "refusal"
            },
            "stop_reason": "end_turn",
            "stop_sequence": null,
            "type": "message",
            "usage": {
                "cache_creation": {
                    "ephemeral_1h_input_tokens": 0,
                    "ephemeral_5m_input_tokens": 0
                },
                "cache_creation_input_tokens": 2051,
                "cache_read_input_tokens": 2051,
                "inference_geo": "inference_geo",
                "input_tokens": 2095,
                "output_tokens": 503,
                "server_tool_use": {
                    "web_fetch_requests": 2,
                    "web_search_requests": 0
                },
                "service_tier": "standard"
            }
        }
    )
});

export default app;
