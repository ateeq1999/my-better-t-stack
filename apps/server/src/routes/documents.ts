import { Hono } from "hono";
import { db } from "@web/db";
import { documents } from "@web/db/schema/documents";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@web/auth";

const app = new Hono();

// Schema removed as we are parsing body manually for file upload

app.get("/project/:projectId", async (c) => {
    const projectId = c.req.param("projectId");
    const docs = await db.query.documents.findMany({
        where: eq(documents.projectId, projectId),
    });
    return c.json(docs);
});

import { fileManager } from "../lib/gemini";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

app.post("/", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.parseBody();
    const projectId = body["projectId"] as string;
    const file = body["file"] as File;
    const type = body["type"] as "legal" | "marketing" | "technical" | "other" | undefined;

    if (!projectId || !file) {
        return c.json({ error: "Missing projectId or file" }, 400);
    }

    try {
        // 1. Write to temp file
        const buffer = await file.arrayBuffer();
        const tempPath = join(tmpdir(), `${Date.now()}-${file.name}`);
        await writeFile(tempPath, Buffer.from(buffer));

        // 2. Upload to Gemini
        const uploadResponse = await fileManager.uploadFile(tempPath, {
            mimeType: file.type,
            displayName: file.name,
        });

        // 3. Clean up temp file
        await unlink(tempPath);

        // 4. Save to DB
        const [newDoc] = await db.insert(documents).values({
            projectId,
            name: file.name,
            url: uploadResponse.file.uri, // Using Gemini URI as the URL for now
            type: type || "other",
            indexingStatus: "completed", // Gemini handles indexing implicitly for now
            geminiFileUri: uploadResponse.file.uri,
        }).returning();

        return c.json(newDoc);
    } catch (error) {
        console.error("Upload failed:", error);
        return c.json({ error: "Upload failed" }, 500);
    }
});

export default app;
