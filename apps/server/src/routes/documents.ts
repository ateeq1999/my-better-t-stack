import { Hono } from "hono";
import { db } from "@web/db";
import { documents } from "@web/db/schema/documents";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@web/auth";

const app = new Hono();

const createDocumentSchema = z.object({
    projectId: z.string().uuid(),
    name: z.string().min(1),
    url: z.string().url(),
    type: z.enum(["legal", "marketing", "technical", "other"]).optional(),
});

app.get("/project/:projectId", async (c) => {
    const projectId = c.req.param("projectId");
    const docs = await db.query.documents.findMany({
        where: eq(documents.projectId, projectId),
    });
    return c.json(docs);
});

app.post("/", zValidator("json", createDocumentSchema), async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const data = c.req.valid("json");

    const [newDoc] = await db.insert(documents).values({
        projectId: data.projectId,
        name: data.name,
        url: data.url,
        type: data.type,
        indexingStatus: "pending",
    }).returning();

    return c.json(newDoc);
});

export default app;
