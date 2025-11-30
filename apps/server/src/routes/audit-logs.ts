import { Hono } from "hono";
import { db } from "@web/db";
import { auditLogs } from "@web/db/schema/audit-logs";
import { desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono()
    .get("/", async (c) => {
        const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
        return c.json(logs);
    })
    .post(
        "/",
        zValidator(
            "json",
            z.object({
                actorId: z.string().optional(),
                action: z.string(),
                resource: z.any().optional(),
                meta: z.any().optional(),
            }),
        ),
        async (c) => {
            const data = c.req.valid("json");
            const id = crypto.randomUUID();
            const newLog = await db
                .insert(auditLogs)
                .values({
                    id,
                    ...data,
                })
                .returning();
            return c.json(newLog[0]);
        },
    );

export default app;
