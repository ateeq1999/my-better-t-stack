import { Hono } from "hono";
import { db } from "@web/db";
import { projects } from "@web/db/schema/projects";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@web/auth";

const app = new Hono();

// Schema for creating a project
const createProjectSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    location: z.string().optional(),
    phase: z.string().optional(),
    launchDate: z.string().optional(), // ISO date string
});

app.get("/", async (c) => {
    const allProjects = await db.query.projects.findMany({
        with: {
            developer: true,
            documents: true,
        },
    });
    return c.json(allProjects);
});

app.post("/", zValidator("json", createProjectSchema), async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const data = c.req.valid("json");

    const [newProject] = await db.insert(projects).values({
        name: data.name,
        description: data.description,
        location: data.location,
        phase: data.phase,
        launchDate: data.launchDate,
        developerId: session.user.id,
    }).returning();

    return c.json(newProject);
});

app.get("/:id", async (c) => {
    const id = c.req.param("id");
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, id),
        with: {
            developer: true,
            documents: true,
        },
    });

    if (!project) {
        return c.json({ error: "Project not found" }, 404);
    }

    return c.json(project);
});

const updateProjectSchema = createProjectSchema.partial();

app.patch("/:id", zValidator("json", updateProjectSchema), async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const data = c.req.valid("json");

    const [updatedProject] = await db
        .update(projects)
        .set(data)
        .where(eq(projects.id, id))
        .returning();

    if (!updatedProject) {
        return c.json({ error: "Project not found" }, 404);
    }

    return c.json(updatedProject);
});

export default app;
