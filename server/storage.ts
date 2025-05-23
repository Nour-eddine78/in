import { users, machines, operations, progress, safetyIncidents, hseAudits, type User, type InsertUser, type Machine, type InsertMachine, type Operation, type InsertOperation, type Progress, type InsertProgress, type SafetyIncident, type InsertSafetyIncident, type HseAudit, type InsertHseAudit } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateLastLogin(id: number): Promise<void>;

  // Machines
  getMachine(id: number): Promise<Machine | undefined>;
  getAllMachines(): Promise<Machine[]>;
  getMachinesByType(type: string): Promise<Machine[]>;
  createMachine(machine: InsertMachine): Promise<Machine>;

  // Operations
  getOperation(id: number): Promise<Operation | undefined>;
  getAllOperations(): Promise<Operation[]>;
  getOperationsByDateRange(startDate: Date, endDate: Date): Promise<Operation[]>;
  createOperation(operation: InsertOperation): Promise<Operation>;
  updateOperation(id: number, operation: Partial<InsertOperation>): Promise<Operation | undefined>;

  // Progress
  getProgress(panneau: string, tranche: string, niveau: string): Promise<Progress | undefined>;
  getAllProgress(): Promise<Progress[]>;
  createOrUpdateProgress(progress: InsertProgress): Promise<Progress>;

  // Safety
  getSafetyIncident(id: number): Promise<SafetyIncident | undefined>;
  getAllSafetyIncidents(): Promise<SafetyIncident[]>;
  createSafetyIncident(incident: InsertSafetyIncident): Promise<SafetyIncident>;
  updateSafetyIncident(id: number, incident: Partial<InsertSafetyIncident>): Promise<SafetyIncident | undefined>;

  // HSE Audits
  getHseAudit(id: number): Promise<HseAudit | undefined>;
  getAllHseAudits(): Promise<HseAudit[]>;
  createHseAudit(audit: InsertHseAudit): Promise<HseAudit>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  async getMachine(id: number): Promise<Machine | undefined> {
    const [machine] = await db.select().from(machines).where(eq(machines.id, id));
    return machine || undefined;
  }

  async getAllMachines(): Promise<Machine[]> {
    return await db.select().from(machines);
  }

  async getMachinesByType(type: string): Promise<Machine[]> {
    return await db.select().from(machines).where(eq(machines.type, type));
  }

  async createMachine(insertMachine: InsertMachine): Promise<Machine> {
    const [machine] = await db
      .insert(machines)
      .values(insertMachine)
      .returning();
    return machine;
  }

  async getOperation(id: number): Promise<Operation | undefined> {
    const [operation] = await db.select().from(operations).where(eq(operations.id, id));
    return operation || undefined;
  }

  async getAllOperations(): Promise<Operation[]> {
    return await db.select().from(operations);
  }

  async getOperationsByDateRange(startDate: Date, endDate: Date): Promise<Operation[]> {
    return await db
      .select()
      .from(operations)
      .where(and(
        gte(operations.date, startDate),
        lte(operations.date, endDate)
      ));
  }

  async createOperation(insertOperation: InsertOperation): Promise<Operation> {
    const [operation] = await db
      .insert(operations)
      .values(insertOperation)
      .returning();
    return operation;
  }

  async updateOperation(id: number, operationUpdate: Partial<InsertOperation>): Promise<Operation | undefined> {
    const [operation] = await db
      .update(operations)
      .set(operationUpdate)
      .where(eq(operations.id, id))
      .returning();
    return operation || undefined;
  }

  async getProgress(panneau: string, tranche: string, niveau: string): Promise<Progress | undefined> {
    const [progressItem] = await db
      .select()
      .from(progress)
      .where(and(
        eq(progress.panneau, panneau),
        eq(progress.tranche, tranche),
        eq(progress.niveau, niveau)
      ));
    return progressItem || undefined;
  }

  async getAllProgress(): Promise<Progress[]> {
    return await db.select().from(progress);
  }

  async createOrUpdateProgress(insertProgress: InsertProgress): Promise<Progress> {
    const existing = await this.getProgress(
      insertProgress.panneau,
      insertProgress.tranche,
      insertProgress.niveau
    );

    if (existing) {
      const [updated] = await db
        .update(progress)
        .set({ ...insertProgress, updatedAt: new Date() })
        .where(eq(progress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(progress)
        .values(insertProgress)
        .returning();
      return created;
    }
  }

  async getSafetyIncident(id: number): Promise<SafetyIncident | undefined> {
    const [incident] = await db.select().from(safetyIncidents).where(eq(safetyIncidents.id, id));
    return incident || undefined;
  }

  async getAllSafetyIncidents(): Promise<SafetyIncident[]> {
    return await db.select().from(safetyIncidents);
  }

  async createSafetyIncident(insertIncident: InsertSafetyIncident): Promise<SafetyIncident> {
    const [incident] = await db
      .insert(safetyIncidents)
      .values(insertIncident)
      .returning();
    return incident;
  }

  async updateSafetyIncident(id: number, incidentUpdate: Partial<InsertSafetyIncident>): Promise<SafetyIncident | undefined> {
    const [incident] = await db
      .update(safetyIncidents)
      .set(incidentUpdate)
      .where(eq(safetyIncidents.id, id))
      .returning();
    return incident || undefined;
  }

  async getHseAudit(id: number): Promise<HseAudit | undefined> {
    const [audit] = await db.select().from(hseAudits).where(eq(hseAudits.id, id));
    return audit || undefined;
  }

  async getAllHseAudits(): Promise<HseAudit[]> {
    return await db.select().from(hseAudits);
  }

  async createHseAudit(insertAudit: InsertHseAudit): Promise<HseAudit> {
    const [audit] = await db
      .insert(hseAudits)
      .values(insertAudit)
      .returning();
    return audit;
  }
}

export const storage = new DatabaseStorage();