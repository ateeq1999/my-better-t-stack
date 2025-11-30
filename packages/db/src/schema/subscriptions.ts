import { pgTable, text, timestamp, varchar, json, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2';

export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "past_due", "canceled", "trialing"]);

export const subscriptions = pgTable("subscription", {
    id: varchar("id", { length: 36 }).primaryKey().default(createId()),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id),
    stripeSubscriptionId: text("stripe_subscription_id"),
    plan: text("plan").notNull(),
    quota: json("quota"), // { chatCredits: number; documentUploads: number }
    status: subscriptionStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
    user: one(user, {
        fields: [subscriptions.userId],
        references: [user.id],
    }),
}));
