import { User } from "./db";
import mongoose from 'mongoose';

export interface IStorage<T> {
  // Users
  getUser(id: string): Promise<T | undefined>;
  getUserByUsername(username: string): Promise<T | undefined>;
  createUser(user: T): Promise<T>;
  updateUser(id: string, user: Partial<T>): Promise<T | undefined>;
  getAllUsers(): Promise<T[]>;
  updateLastLogin(id: string): Promise<void>;

  // Machines
  getMachine(id: string): Promise<T | undefined>;
  getAllMachines(): Promise<T[]>;
  getMachinesByType(type: string): Promise<T[]>;
  createMachine(machine: T): Promise<T>;

  // Operations
  getOperation(id: string): Promise<T | undefined>;
  getAllOperations(): Promise<T[]>;
  getOperationsByDateRange(startDate: Date, endDate: Date): Promise<T[]>;
  createOperation(operation: T): Promise<T>;
  updateOperation(id: string, operation: Partial<T>): Promise<T | undefined>;

  // Progress
  getProgress(panneau: string, tranche: string, niveau: string): Promise<T | undefined>;
  getAllProgress(): Promise<T[]>;
  createOrUpdateProgress(progress: T): Promise<T>;

  // Safety Incidents
  getSafetyIncident(id: string): Promise<T | undefined>;
  getAllSafetyIncidents(): Promise<T[]>;
  createSafetyIncident(incident: T): Promise<T>;
  updateSafetyIncident(id: string, incident: Partial<T>): Promise<T | undefined>;

  // HSE Audits
  getHseAudit(id: string): Promise<T | undefined>;
  getAllHseAudits(): Promise<T[]>;
  createHseAudit(audit: T): Promise<T>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<any | undefined> {
    return await User.findById(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return await User.findOne({ username });
  }

  async createUser(insertUser: any): Promise<any> {
    const user = new User(insertUser);
    return await user.save();
  }

  async updateUser(id: string, userUpdate: Partial<any>): Promise<any | undefined> {
    return await User.findByIdAndUpdate(id, userUpdate, { new: true });
  }

  async getAllUsers(): Promise<any[]> {
    return await User.find();
  }

  async updateLastLogin(id: string): Promise<void> {
    await User.findByIdAndUpdate(id, { lastLogin: new Date() });
  }

  async getMachine(id: string): Promise<any | undefined> {
    return await Machine.findById(id);
  }

  async getAllMachines(): Promise<any[]> {
    return await Machine.find();
  }

  async getMachinesByType(type: string): Promise<any[]> {
    return await Machine.find({ type });
  }

  async createMachine(insertMachine: any): Promise<any> {
    const machine = new Machine(insertMachine);
    return await machine.save();
  }

  async getOperation(id: string): Promise<any | undefined> {
    return await Operation.findById(id);
  }

  async getAllOperations(): Promise<any[]> {
    return await Operation.find();
  }

  async getOperationsByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    return await Operation.find({
      date: { $gte: startDate, $lte: endDate }
    });
  }

  async createOperation(insertOperation: any): Promise<any> {
    const operation = new Operation(insertOperation);
    return await operation.save();
  }

  async updateOperation(id: string, operationUpdate: Partial<any>): Promise<any | undefined> {
    return await Operation.findByIdAndUpdate(id, operationUpdate, { new: true });
  }

  async getProgress(panneau: string, tranche: string, niveau: string): Promise<any | undefined> {
    return await Progress.findOne({
      panneau,
      tranche,
      niveau
    });
  }

  async getAllProgress(): Promise<any[]> {
    return await Progress.find();
  }

  async createOrUpdateProgress(insertProgress: any): Promise<any> {
    const existing = await this.getProgress(
      insertProgress.panneau,
      insertProgress.tranche,
      insertProgress.niveau
    );

    if (existing) {
      return await Progress.findOneAndUpdate(
        {
          panneau: insertProgress.panneau,
          tranche: insertProgress.tranche,
          niveau: insertProgress.niveau
        },
        {
          percentage: insertProgress.percentage,
          lastUpdate: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      );
    }

    const progress = new Progress(insertProgress);
    return await progress.save();
  }

  async getSafetyIncident(id: string): Promise<any | undefined> {
    return await SafetyIncident.findById(id);
  }

  async getAllSafetyIncidents(): Promise<any[]> {
    return await SafetyIncident.find();
  }

  async createSafetyIncident(insertIncident: any): Promise<any> {
    const incident = new SafetyIncident(insertIncident);
    return await incident.save();
  }

  async updateSafetyIncident(id: string, incidentUpdate: Partial<any>): Promise<any | undefined> {
    return await SafetyIncident.findByIdAndUpdate(id, incidentUpdate, { new: true });
  }

  async getHseAudit(id: string): Promise<any | undefined> {
    return await HseAudit.findById(id);
  }

  async getAllHseAudits(): Promise<any[]> {
    return await HseAudit.find();
  }

  async createHseAudit(insertAudit: any): Promise<any> {
    const audit = new HseAudit(insertAudit);
    return await audit.save();
  }
}

export const storage = new DatabaseStorage();

// Schémas MongoDB
const MachineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String },
  status: { type: String, required: true },
  lastMaintenance: { type: Date },
  team: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Machine = mongoose.model('Machine', MachineSchema);

const OperationSchema = new mongoose.Schema({
  panneau: { type: String, required: true },
  tranche: { type: String, required: true },
  niveau: { type: String, required: true },
  machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, required: true },
  comments: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Operation = mongoose.model('Operation', OperationSchema);

const ProgressSchema = new mongoose.Schema({
  panneau: { type: String, required: true },
  tranche: { type: String, required: true },
  niveau: { type: String, required: true },
  percentage: { type: Number, required: true },
  lastUpdate: { type: Date, required: true },
  team: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Progress = mongoose.model('Progress', ProgressSchema);

const SafetyIncidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  severity: { type: String, required: true },
  team: { type: String, required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SafetyIncident = mongoose.model('SafetyIncident', SafetyIncidentSchema);

const HseAuditSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  team: { type: String, required: true },
  auditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  findings: { type: [String], required: true },
  recommendations: { type: [String], required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const HseAudit = mongoose.model('HseAudit', HseAuditSchema);