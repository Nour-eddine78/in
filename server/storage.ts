import { 
  users, machines, operations, progress, safetyIncidents, hseAudits,
  type User, type InsertUser, type Machine, type InsertMachine,
  type Operation, type InsertOperation, type Progress, type InsertProgress,
  type SafetyIncident, type InsertSafetyIncident, type HseAudit, type InsertHseAudit
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private machines: Map<number, Machine>;
  private operations: Map<number, Operation>;
  private progress: Map<string, Progress>;
  private safetyIncidents: Map<number, SafetyIncident>;
  private hseAudits: Map<number, HseAudit>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.machines = new Map();
    this.operations = new Map();
    this.progress = new Map();
    this.safetyIncidents = new Map();
    this.hseAudits = new Map();
    this.currentId = 1;
    this.initializeData();
  }

  private initializeData() {
    // Initialize with default admin user
    const adminUser: User = {
      id: this.currentId++,
      username: "admin",
      password: "$2b$10$hash", // In real app, this would be properly hashed
      role: "admin",
      name: "Mohamed Alami",
      email: "m.alami@ocp.ma",
      team: "Équipe A",
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Initialize machines
    const defaultMachines: Machine[] = [
      {
        id: this.currentId++,
        name: "D11",
        type: "poussage",
        specifications: { power: "850 HP", capacity: "35 m³" },
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        name: "750011",
        type: "casement",
        specifications: { power: "520 HP", reach: "12.8 m" },
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        name: "750012",
        type: "casement",
        specifications: { power: "520 HP", reach: "12.8 m" },
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        name: "Transwine",
        type: "transport",
        specifications: { capacity: "220 tonnes", maxSpeed: "65 km/h" },
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        name: "Procaneq",
        type: "transport",
        specifications: { capacity: "200 tonnes", maxSpeed: "60 km/h" },
        isActive: true,
        createdAt: new Date(),
      },
    ];

    defaultMachines.forEach(machine => {
      this.machines.set(machine.id, machine);
    });
  }

  // Users methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateLastLogin(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date();
      this.users.set(id, user);
    }
  }

  // Machines methods
  async getMachine(id: number): Promise<Machine | undefined> {
    return this.machines.get(id);
  }

  async getAllMachines(): Promise<Machine[]> {
    return Array.from(this.machines.values());
  }

  async getMachinesByType(type: string): Promise<Machine[]> {
    return Array.from(this.machines.values()).filter(machine => machine.type === type);
  }

  async createMachine(insertMachine: InsertMachine): Promise<Machine> {
    const id = this.currentId++;
    const machine: Machine = {
      ...insertMachine,
      id,
      isActive: true,
      createdAt: new Date(),
    };
    this.machines.set(id, machine);
    return machine;
  }

  // Operations methods
  async getOperation(id: number): Promise<Operation | undefined> {
    return this.operations.get(id);
  }

  async getAllOperations(): Promise<Operation[]> {
    return Array.from(this.operations.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getOperationsByDateRange(startDate: Date, endDate: Date): Promise<Operation[]> {
    return Array.from(this.operations.values()).filter(operation => {
      const opDate = new Date(operation.date);
      return opDate >= startDate && opDate <= endDate;
    });
  }

  async createOperation(insertOperation: InsertOperation): Promise<Operation> {
    const id = this.currentId++;
    const operation: Operation = {
      ...insertOperation,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.operations.set(id, operation);
    return operation;
  }

  async updateOperation(id: number, operationUpdate: Partial<InsertOperation>): Promise<Operation | undefined> {
    const operation = this.operations.get(id);
    if (!operation) return undefined;
    
    const updatedOperation = { ...operation, ...operationUpdate, updatedAt: new Date() };
    this.operations.set(id, updatedOperation);
    return updatedOperation;
  }

  // Progress methods
  async getProgress(panneau: string, tranche: string, niveau: string): Promise<Progress | undefined> {
    const key = `${panneau}-${tranche}-${niveau}`;
    return this.progress.get(key);
  }

  async getAllProgress(): Promise<Progress[]> {
    return Array.from(this.progress.values());
  }

  async createOrUpdateProgress(insertProgress: InsertProgress): Promise<Progress> {
    const key = `${insertProgress.panneau}-${insertProgress.tranche}-${insertProgress.niveau}`;
    const existingProgress = this.progress.get(key);
    
    const progress: Progress = {
      ...insertProgress,
      id: existingProgress?.id || this.currentId++,
      updatedAt: new Date(),
    };
    
    this.progress.set(key, progress);
    return progress;
  }

  // Safety methods
  async getSafetyIncident(id: number): Promise<SafetyIncident | undefined> {
    return this.safetyIncidents.get(id);
  }

  async getAllSafetyIncidents(): Promise<SafetyIncident[]> {
    return Array.from(this.safetyIncidents.values()).sort((a, b) => 
      new Date(b.reportedAt!).getTime() - new Date(a.reportedAt!).getTime()
    );
  }

  async createSafetyIncident(insertIncident: InsertSafetyIncident): Promise<SafetyIncident> {
    const id = this.currentId++;
    const incident: SafetyIncident = {
      ...insertIncident,
      id,
      reportedAt: new Date(),
      resolvedAt: null,
    };
    this.safetyIncidents.set(id, incident);
    return incident;
  }

  async updateSafetyIncident(id: number, incidentUpdate: Partial<InsertSafetyIncident>): Promise<SafetyIncident | undefined> {
    const incident = this.safetyIncidents.get(id);
    if (!incident) return undefined;
    
    const updatedIncident = { ...incident, ...incidentUpdate };
    if (incidentUpdate.status === 'resolved' && !incident.resolvedAt) {
      updatedIncident.resolvedAt = new Date();
    }
    
    this.safetyIncidents.set(id, updatedIncident);
    return updatedIncident;
  }

  // HSE Audits methods
  async getHseAudit(id: number): Promise<HseAudit | undefined> {
    return this.hseAudits.get(id);
  }

  async getAllHseAudits(): Promise<HseAudit[]> {
    return Array.from(this.hseAudits.values()).sort((a, b) => 
      new Date(b.auditDate!).getTime() - new Date(a.auditDate!).getTime()
    );
  }

  async createHseAudit(insertAudit: InsertHseAudit): Promise<HseAudit> {
    const id = this.currentId++;
    const audit: HseAudit = {
      ...insertAudit,
      id,
      auditDate: new Date(),
    };
    this.hseAudits.set(id, audit);
    return audit;
  }
}

export const storage = new MemStorage();
