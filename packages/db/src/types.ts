import {
    user,
    session,
    account,
    verification,
} from "./schema/auth";
import { projects } from "./schema/projects";
import { documents } from "./schema/documents";
import { conversations, messages } from "./schema/chat";
import { subscriptions } from "./schema/subscriptions";
import { auditLogs } from "./schema/audit-logs";

// Auth
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

// Projects
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// Documents
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

// Chat
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

// Subscriptions
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

// Audit Logs
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;