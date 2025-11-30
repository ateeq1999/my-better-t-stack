import { Hono } from "hono";
import { db } from "@web/db";
import { subscriptions } from "@web/db/schema/subscriptions";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono()
    .get("/", async (c) => {
        const allSubscriptions = await db.select().from(subscriptions);
        return c.json(allSubscriptions);
    })
    .get("/:userId", async (c) => {
        const userId = c.req.param("userId");
        const subscription = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.userId, userId),
        });
        return c.json(subscription || null);
    })
    .post(
        "/",
        zValidator(
            "json",
            z.object({
                userId: z.string(),
                plan: z.string(),
                stripeSubscriptionId: z.string().optional(),
                quota: z.any().optional(),
            }),
        ),
        async (c) => {
            const data = c.req.valid("json");
            const id = crypto.randomUUID();
            const newSubscription = await db
                .insert(subscriptions)
                .values({
                    id,
                    ...data,
                    status: "active",
                })
                .returning();
            return c.json(newSubscription[0]);
        },
    )
    .patch(
        "/:id",
        zValidator(
            "json",
            z.object({
                plan: z.string().optional(),
                status: z.enum(["active", "past_due", "canceled", "trialing"]).optional(),
                quota: z.any().optional(),
            })
        ),
        async (c) => {
            const id = c.req.param("id");
            const data = c.req.valid("json");
            const updated = await db
                .update(subscriptions)
                .set(data)
                .where(eq(subscriptions.id, id))
                .returning();
            return c.json(updated[0]);
        }
    );

export default app;
