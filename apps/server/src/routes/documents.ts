import { Hono } from "hono";
import { db } from "@web/db";
import { documents } from "@web/db/schema/documents";
import { eq } from "drizzle-orm";
import { auth } from "@web/auth";
import { createFileStore, uploadFile } from "../lib/gemini";
import { Buffer } from "buffer";

const app = new Hono();

// Schema removed as we are parsing body manually for file upload

app.get("/project/:projectId", async (c) => {
    const projectId = c.req.param("projectId");
    const docs = await db.query.documents.findMany({
        where: eq(documents.projectId, projectId),
    });
    return c.json(docs);
});

app.post("/upload", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.parseBody();
    const projectId = body["projectId"] as string;

    if (!projectId) {
        return c.json({ error: "Missing projectId" }, 400);
    }

    const files: { title: string, file: File }[] = [];
    for (const key in body) {
        if (key.startsWith('files[')) {
            const match = key.match(/files\[(\d+)\]\[(title|file)\]/);
            if (match) {
                const index = parseInt(match[1] as string, 10);
                const property = match[2] as 'title' | 'file';
                if (!files[index]) {
                    files[index] = {} as { title: string, file: File };
                }
                files[index][property] = body[key] as any;
            }
        }
    }

    if (files.length === 0) {
        return c.json({ error: "No files to upload" }, 400);
    }

    try {
        const store = await createFileStore(`project-${projectId}`);
        const uploadedDocs = [];

        for (const fileEntry of files) {
            const buffer = await fileEntry.file.arrayBuffer();
            const uploadResponse = await uploadFile(store.displayName as string, fileEntry.file.name, Buffer.from(buffer), fileEntry.file.type);

            const [newDoc] = await db.insert(documents).values({
                projectId,
                name: fileEntry.title,
                url: uploadResponse.name as string,
                type: "other", // Or derive from file type
                indexingStatus: "completed",
                geminiFileUri: uploadResponse.name as string,
            }).returning();

            uploadedDocs.push(newDoc);
        }

        return c.json(uploadedDocs);
    } catch (error) {
        console.error("Upload failed:", error);
        return c.json({ error: "Upload failed" }, 500);
    }
});

export default app;
