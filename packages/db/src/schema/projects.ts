import { pgTable, text, timestamp, uuid, json, date } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const projects = pgTable("project", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    location: text("location"),
    phase: text("phase"),
    launchDate: date("launch_date"),
    unitConfigs: json("unit_configs"), // Store as JSON for flexibility
    pricingRanges: json("pricing_ranges"), // Store as JSON
    amenities: json("amenities"), // Store as JSON array
    images: json("images"), // Store as JSON array of URLs
    developerId: text("developer_id").notNull().references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const projectsRelations = relations(projects, ({ one }) => ({
    developer: one(user, {
        fields: [projects.developerId],
        references: [user.id],
    }),
}));
