import { pgTable, text, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const auditLogs = pgTable("audit_log", {
    id: varchar("id", { length: 36 }).primaryKey(),
    actorId: varchar("actor_id", { length: 36 }).references(() => user.id),
    action: text("action").notNull(),
    resource: json("resource"), // { type: string; id?: string }
    meta: json("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    actor: one(user, {
        fields: [auditLogs.actorId],
        references: [user.id],
    }),
}));
