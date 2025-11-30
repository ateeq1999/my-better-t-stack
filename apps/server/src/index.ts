import "dotenv/config";
import { auth } from "@web/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import projectsRouter from "./routes/projects";
import documentsRouter from "./routes/documents";
import chatRouter from "./routes/chat";
import subscriptionsRouter from "./routes/subscriptions";
import auditLogsRouter from "./routes/audit-logs";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: process.env.CORS_ORIGIN || "",
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/", (c) => {
	return c.text("OK");
});

app.get("/dashboard", (c) => {
	return c.redirect("http://localhost:3001/dashboard");
});

app.route("/api/subscriptions", subscriptionsRouter);
app.route("/api/projects", projectsRouter);
app.route("/api/documents", documentsRouter);
app.route("/api/chat", chatRouter);
app.route("/api/audit-logs", auditLogsRouter);

export default app;
export type AppType = typeof app;
