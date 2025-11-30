import { user } from "./auth";
import { projects } from "./projects";
import { relations } from "drizzle-orm";
import {
    pgTable,
    varchar,
    text,
    timestamp,
    pgEnum,
    json,
} from "drizzle-orm/pg-core";
import { createId } from '@paralleldrive/cuid2';

export const roleEnum = pgEnum("message_role", ["user", "assistant", "system"]);

export const conversations = pgTable("conversation", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").notNull().references(() => user.id),
    projectId: varchar("project_id", { length: 36 }).references(() => projects.id, { onDelete: 'set null' }), // Optional link to a project
    title: text("title"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const messages = pgTable("message", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => createId()),
    conversationId: varchar("conversation_id", { length: 36 }).notNull().references(() => conversations.id, { onDelete: 'cascade' }),
    role: roleEnum("role").notNull(),
    content: text("content").notNull(),
    citations: json('citations'), // Store citations as JSON
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
    user: one(user, {
        fields: [conversations.userId],
        references: [user.id],
    }),
    messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id],
    }),
}));
