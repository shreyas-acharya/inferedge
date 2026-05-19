import { Hono } from "hono";
import anthropicRoutes from "./routes/anthropic";
import healthRoutes from "./routes/health";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.route("/v1", anthropicRoutes);
app.route("/", healthRoutes);

export default app;
