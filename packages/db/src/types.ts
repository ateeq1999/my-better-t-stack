import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import * as schema from "./schema";

// Auth
export type User = InferSelectModel<typeof schema.user>;
export type NewUser = InferInsertModel<typeof schema.user>;

export type Session = InferSelectModel<typeof schema.session>;
export type NewSession = InferInsertModel<typeof schema.session>;

export type Account = InferSelectModel<typeof schema.account>;
export type NewAccount = InferInsertModel<typeof schema.account>;

export type Verification = InferSelectModel<typeof schema.verification>;
export type NewVerification = InferInsertModel<typeof schema.verification>;

// Projects
export type Project = InferSelectModel<typeof schema.projects>;
export type NewProject = InferInsertModel<typeof schema.projects>;

// Documents
export type Document = InferSelectModel<typeof schema.documents>;
export type NewDocument = InferInsertModel<typeof schema.documents>;

// Chat
export type Conversation = InferSelectModel<typeof schema.conversations>;
export type NewConversation = InferInsertModel<typeof schema.conversations>;

export type Message = InferSelectModel<typeof schema.messages>;
export type NewMessage = InferInsertModel<typeof schema.messages>;

// Subscriptions
export type Subscription = InferSelectModel<typeof schema.subscriptions>;
export type NewSubscription = InferInsertModel<typeof schema.subscriptions>;

// Audit Logs
export type AuditLog = InferSelectModel<typeof schema.auditLogs>;
export type NewAuditLog = InferInsertModel<typeof schema.auditLogs>;
