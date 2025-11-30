import { Hono } from "hono";
import { db } from "@web/db";
import { conversations, messages } from "@web/db/schema/chat";
import { eq, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@web/auth";
import { model } from "../lib/gemini";
import { type InsertMessage } from "@web/db/schema/chat";
import { documents } from "@web/db/schema/documents";

const app = new Hono();


// Helper function to create a new conversation
async function createConversation(userId: string, projectId: string | undefined, content: string) {
    const [newConv] = await db.insert(conversations).values({
        userId: userId,
        projectId: projectId,
        title: content.substring(0, 50) + "...",
    }).returning();
    return newConv;
}

// Helper function to verify conversation ownership
async function verifyConversationOwnership(conversationId: string, userId: string) {
    const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
    });
    if (!conversation || conversation.userId !== userId) {
        return null;
    }
    return conversation;
}

// Helper function to save a message
async function saveMessage(message: Omit<InsertMessage, "id" | "createdAt">) {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
}

const sendMessageSchema = z.object({
    conversationId: z.string().uuid().optional(),
    content: z.string().min(1),
    projectId: z.string().optional(),
});

// ... (GET routes remain same)

// Send a message (creates conversation if needed)
app.post("/", zValidator("json", sendMessageSchema), async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const data = c.req.valid("json");
    let conversationId = data.conversationId;
    let projectId = data.projectId;

    let conversation;
    if (!conversationId) {
        conversation = await createConversation(session.user.id, projectId, data.content);
        conversationId = conversation.id;
    } else {
        conversation = await verifyConversationOwnership(conversationId, session.user.id);
        if (!conversation) {
            return c.json({ error: "Conversation not found or unauthorized" }, 404);
        }
        // Use existing project ID if not provided
        if (!projectId && conversation.projectId) {
            projectId = conversation.projectId;
        }
    }

    // Save user message
    const userMsg = await saveMessage({
        conversationId: conversationId!,
        role: "user",
        content: data.content,
    });

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

        // Fetch project documents if available
        let systemInstruction = "You are a helpful real estate assistant.";
        let fileParts: any[] = [];

        if (projectId) {
            const projectDocs = await db.query.documents.findMany({
                where: eq(documents.projectId, projectId),
            });

            if (projectDocs.length > 0) {
                systemInstruction += ` You have access to the following documents for this project. Use them to answer questions.`;

                // Add file parts to the LAST user message (current message)
                // Gemini API expects fileData in the user's message parts
                fileParts = projectDocs
                    .filter(doc => doc.geminiFileUri)
                    .map(doc => ({
                        fileData: {
                            mimeType: doc.type === "legal" ? "application/pdf" : "text/plain", // Simplification, ideally store mimeType
                            fileUri: doc.geminiFileUri,
                        }
                    }));
            }
        }

        // Generate response
        // Note: We are attaching files to the current prompt.
        // For multi-turn chat with files, it's better to use system instructions or caching,
        // but attaching to the prompt works for simple cases.
        const result = await model.generateContent({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [
                ...geminiHistory.slice(0, -1), // Previous history
                {
                    role: "user",
                    parts: [
                        ...fileParts,
                        { text: data.content }
                    ]
                }
            ],
        });

        const responseText = result.response.text();

        // Save assistant message
        const assistantMsg = await saveMessage({
            conversationId: conversationId!,
            role: "assistant",
            content: responseText,
        });

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
// New GET route to fetch messages for a specific conversation
app.get("/:conversationId/messages", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const conversationId = c.req.param("conversationId");

    // Verify ownership of the conversation
    const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
    });

    if (!conversation || conversation.userId !== session.user.id) {
        return c.json({ error: "Conversation not found or unauthorized" }, 404);
    }

    // Fetch messages for the conversation
    const chatMessages = await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
        orderBy: [messages.createdAt],
    });

    return c.json(chatMessages);
});

export default app;
