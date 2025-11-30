import { user } from "./auth";
import { relations } from "drizzle-orm";
import {
    pgTable,
    varchar,
    text,
    timestamp,
    pgEnum,
    json,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("message_role", ["user", "assistant", "system"]);

export const conversations = pgTable("conversation", {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    title: text("title"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const messages = pgTable("message", {
    id: varchar("id", { length: 36 }).primaryKey(),
    conversationId: text("conversation_id").notNull(),
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
