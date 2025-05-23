import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin' | 'supervisor'
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  team: text("team"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Machines table
export const machines = pgTable("machines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // 'transport' | 'casement' | 'poussage'
  specifications: jsonb("specifications"), // { power: string, capacity: string, etc. }
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Operations table
export const operations = pgTable("operations", {
  id: serial("id").primaryKey(),
  ficheId: text("fiche_id").notNull().unique(),
  date: timestamp("date").notNull(),
  method: text("method").notNull(), // 'transport' | 'casement' | 'poussage'
  machineId: integer("machine_id").references(() => machines.id),
  operatorId: integer("operator_id").references(() => users.id),
  poste: integer("poste").notNull(), // 1, 2, or 3
  panneau: text("panneau").notNull(),
  tranche: text("tranche").notNull(),
  niveau: text("niveau").notNull(),
  machineStatus: text("machine_status").notNull(), // 'marche' | 'arret'
  workingHours: real("working_hours"),
  downtime: real("downtime"),
  volumeBlasted: real("volume_blasted"),
  observations: text("observations"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Progress tracking table
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  panneau: text("panneau").notNull(),
  tranche: text("tranche").notNull(),
  niveau: text("niveau").notNull(),
  method: text("method").notNull(),
  progressPercentage: real("progress_percentage").default(0),
  targetDepth: real("target_depth"),
  currentDepth: real("current_depth"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Safety incidents table
export const safetyIncidents = pgTable("safety_incidents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // 'minor' | 'major' | 'critical'
  status: text("status").notNull(), // 'open' | 'in_progress' | 'resolved'
  reportedBy: integer("reported_by").references(() => users.id),
  machineId: integer("machine_id").references(() => machines.id),
  location: text("location"),
  reportedAt: timestamp("reported_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// HSE Audits table
export const hseAudits = pgTable("hse_audits", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  auditType: text("audit_type").notNull(),
  score: real("score"),
  maxScore: real("max_score"),
  auditedBy: integer("audited_by").references(() => users.id),
  location: text("location"),
  findings: text("findings"),
  status: text("status").notNull(), // 'compliant' | 'non_compliant' | 'pending'
  auditDate: timestamp("audit_date").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, lastLogin: true });
export const insertMachineSchema = createInsertSchema(machines).omit({ id: true, createdAt: true });
export const insertOperationSchema = createInsertSchema(operations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgressSchema = createInsertSchema(progress).omit({ id: true, updatedAt: true });
export const insertSafetyIncidentSchema = createInsertSchema(safetyIncidents).omit({ id: true, reportedAt: true, resolvedAt: true });
export const insertHseAuditSchema = createInsertSchema(hseAudits).omit({ id: true, auditDate: true });

// Types
// Relations
export const usersRelations = relations(users, ({ many }) => ({
  operations: many(operations),
  reportedIncidents: many(safetyIncidents),
  audits: many(hseAudits),
}));

export const machinesRelations = relations(machines, ({ many }) => ({
  operations: many(operations),
  incidents: many(safetyIncidents),
}));

export const operationsRelations = relations(operations, ({ one }) => ({
  machine: one(machines, {
    fields: [operations.machineId],
    references: [machines.id],
  }),
  operator: one(users, {
    fields: [operations.operatorId],
    references: [users.id],
  }),
}));

export const safetyIncidentsRelations = relations(safetyIncidents, ({ one }) => ({
  reportedBy: one(users, {
    fields: [safetyIncidents.reportedBy],
    references: [users.id],
  }),
  machine: one(machines, {
    fields: [safetyIncidents.machineId],
    references: [machines.id],
  }),
}));

export const hseAuditsRelations = relations(hseAudits, ({ one }) => ({
  auditedBy: one(users, {
    fields: [hseAudits.auditedBy],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Machine = typeof machines.$inferSelect;
export type InsertMachine = z.infer<typeof insertMachineSchema>;
export type Operation = typeof operations.$inferSelect;
export type InsertOperation = z.infer<typeof insertOperationSchema>;
export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type SafetyIncident = typeof safetyIncidents.$inferSelect;
export type InsertSafetyIncident = z.infer<typeof insertSafetyIncidentSchema>;
export type HseAudit = typeof hseAudits.$inferSelect;
export type InsertHseAudit = z.infer<typeof insertHseAuditSchema>;
