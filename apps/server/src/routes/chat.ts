import { Hono } from "hono";
import { db } from "@web/db";
import { conversations, messages } from "@web/db/schema";
import { eq, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@web/auth";
import { model } from "../lib/gemini";

const app = new Hono();

const sendMessageSchema = z.object({
    conversationId: z.string().uuid().optional(),
    content: z.string().min(1),
});

// Get all conversations for the current user
app.get("/conversations", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const userConversations = await db.query.conversations.findMany({
        where: eq(conversations.userId, session.user.id),
        orderBy: [desc(conversations.updatedAt)],
    });

    return c.json(userConversations);
});

// Get messages for a conversation
app.get("/:conversationId/messages", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const conversationId = c.req.param("conversationId");

    // Verify ownership
    const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
    });

    if (!conversation || conversation.userId !== session.user.id) {
        return c.json({ error: "Conversation not found or unauthorized" }, 404);
    }

    const conversationMessages = await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
        orderBy: [desc(messages.createdAt)], // Newest first usually for chat UI, or oldest first depending on UI
    });

    return c.json(conversationMessages);
});

// Send a message (creates conversation if needed)
app.post("/", zValidator("json", sendMessageSchema), async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const data = c.req.valid("json");
    let conversationId = data.conversationId;

    if (!conversationId) {
        const [newConv] = await db.insert(conversations).values({
            userId: session.user.id,
            title: data.content.substring(0, 50) + "...",
        }).returning();
        conversationId = newConv.id;
    } else {
        // Verify ownership
        const conversation = await db.query.conversations.findFirst({
            where: eq(conversations.id, conversationId),
        });
        if (!conversation || conversation.userId !== session.user.id) {
            return c.json({ error: "Conversation not found or unauthorized" }, 404);
        }
    }

    // Save user message
    const [userMsg] = await db.insert(messages).values({
        conversationId: conversationId!,
        role: "user",
        content: data.content,
    }).returning();

    // Fetch conversation history
    const history = await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId!),
        orderBy: [desc(messages.createdAt)],
        limit: 20, // Limit context window
    });

    try {
        // Prepare history for Gemini
        const geminiHistory = history.reverse().map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
        }));

        // Generate response
        const result = await model.generateContent({
            contents: [
                ...geminiHistory,
                { role: "user", parts: [{ text: data.content }] }
            ],
        });

        const responseText = result.response.text();

        // Save assistant message
        const [assistantMsg] = await db.insert(messages).values({
            conversationId: conversationId!,
            role: "assistant",
            content: responseText,
        }).returning();

        return c.json({
            conversationId,
            userMessage: userMsg,
            assistantMessage: assistantMsg,
        });
    } catch (error) {
        console.error("Gemini API Error:", error);
        return c.json({ error: "Failed to generate response" }, 500);
    }
});

export default app;
