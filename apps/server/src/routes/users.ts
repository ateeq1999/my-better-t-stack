import { Hono } from "hono";
import { db } from "@web/db";
import { user } from "@web/db/schema/auth";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@web/auth";

const app = new Hono();

const updateProfileSchema = z.object({
    name: z.string().min(1).optional(),
    image: z.string().optional().or(z.literal("")),
});

app.get("/me", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const currentUser = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
    });

    if (!currentUser) {
        return c.json({ error: "User not found" }, 404);
    }

    return c.json(currentUser);
});

app.patch("/me", zValidator("json", updateProfileSchema), async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const data = c.req.valid("json");

    const [updatedUser] = await db
        .update(user)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(user.id, session.user.id))
        .returning();

    return c.json(updatedUser);
});

export default app;
