import { pgTable, text, timestamp, pgEnum, varchar } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { relations } from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2';

export const documentTypeEnum = pgEnum("document_type", ["legal", "marketing", "technical", "other"]);
export const indexingStatusEnum = pgEnum("indexing_status", ["pending", "processing", "completed", "failed"]);

export const documents = pgTable("document", {
    id: varchar("id", { length: 36 }).primaryKey().default(createId()),
    projectId: text("project_id").notNull().references(() => projects.id),
    name: text("name").notNull(),
    url: text("url").notNull(),
    type: documentTypeEnum("type").default("other"),
    indexingStatus: indexingStatusEnum("indexing_status").default("pending"),
    geminiFileUri: text("gemini_file_uri"), // URI from Gemini File API
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const documentsRelations = relations(documents, ({ one }) => ({
    project: one(projects, {
        fields: [documents.projectId],
        references: [projects.id],
    }),
}));
