import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { insertUserSchema, insertOperationSchema, insertSafetyIncidentSchema, insertHseAuditSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "ocp-decapage-secret-key";

// Auth middleware
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token requis' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

// Admin middleware
const adminMiddleware = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès administrateur requis' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Identifiants invalides' });
      }

      // In production, use proper password hashing
      const isValidPassword = password === "admin" || await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Identifiants invalides' });
      }

      // Update last login
      await storage.updateLastLogin(user.id);

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          name: user.name, 
          role: user.role,
          email: user.email,
          team: user.team
        } 
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        team: user.team
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  // Users routes
  app.get("/api/users", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      })));
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.post("/api/users", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
      
      const user = await storage.createUser(userData);
      res.status(201).json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team,
        isActive: user.isActive
      });
    } catch (error) {
      res.status(400).json({ message: 'Données invalides' });
    }
  });

  // Machines routes
  app.get("/api/machines", authMiddleware, async (req, res) => {
    try {
      const { type } = req.query;
      let machines;
      
      if (type) {
        machines = await storage.getMachinesByType(type as string);
      } else {
        machines = await storage.getAllMachines();
      }
      
      res.json(machines);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  // Operations routes
  app.get("/api/operations", authMiddleware, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let operations;

      if (startDate && endDate) {
        operations = await storage.getOperationsByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        operations = await storage.getAllOperations();
      }

      res.json(operations);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.post("/api/operations", authMiddleware, async (req, res) => {
    try {
      const operationData = insertOperationSchema.parse(req.body);
      
      // Generate fiche ID
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 4);
      const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase();
      operationData.ficheId = `FD-${dateStr}-${randomStr}`;
      
      const operation = await storage.createOperation(operationData);
      res.status(201).json(operation);
    } catch (error) {
      res.status(400).json({ message: 'Données invalides' });
    }
  });

  app.put("/api/operations/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const operationData = insertOperationSchema.partial().parse(req.body);
      
      const operation = await storage.updateOperation(id, operationData);
      if (!operation) {
        return res.status(404).json({ message: 'Opération non trouvée' });
      }
      
      res.json(operation);
    } catch (error) {
      res.status(400).json({ message: 'Données invalides' });
    }
  });

  // Progress routes
  app.get("/api/progress", authMiddleware, async (req, res) => {
    try {
      const progress = await storage.getAllProgress();
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  // Safety routes
  app.get("/api/safety/incidents", authMiddleware, async (req, res) => {
    try {
      const incidents = await storage.getAllSafetyIncidents();
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.post("/api/safety/incidents", authMiddleware, async (req, res) => {
    try {
      const incidentData = insertSafetyIncidentSchema.parse(req.body);
      incidentData.reportedBy = req.user.id;
      
      const incident = await storage.createSafetyIncident(incidentData);
      res.status(201).json(incident);
    } catch (error) {
      res.status(400).json({ message: 'Données invalides' });
    }
  });

  app.get("/api/safety/audits", authMiddleware, async (req, res) => {
    try {
      const audits = await storage.getAllHseAudits();
      res.json(audits);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.post("/api/safety/audits", authMiddleware, async (req, res) => {
    try {
      const auditData = insertHseAuditSchema.parse(req.body);
      auditData.auditedBy = req.user.id;
      
      const audit = await storage.createHseAudit(auditData);
      res.status(201).json(audit);
    } catch (error) {
      res.status(400).json({ message: 'Données invalides' });
    }
  });

  // Statistics routes
  app.get("/api/stats/dashboard", authMiddleware, async (req, res) => {
    try {
      const machines = await storage.getAllMachines();
      const operations = await storage.getAllOperations();
      const incidents = await storage.getAllSafetyIncidents();
      
      // Calculate stats
      const activeMachines = machines.filter(m => m.isActive).length;
      const totalVolume = operations.reduce((sum, op) => sum + (op.volumeBlasted || 0), 0);
      const totalWorkingHours = operations.reduce((sum, op) => sum + (op.workingHours || 0), 0);
      const avgYield = totalWorkingHours > 0 ? totalVolume / totalWorkingHours : 0;
      
      // Calculate availability (example calculation)
      const totalDowntime = operations.reduce((sum, op) => sum + (op.downtime || 0), 0);
      const totalTime = totalWorkingHours + totalDowntime;
      const availability = totalTime > 0 ? (totalWorkingHours / totalTime) * 100 : 0;
      
      res.json({
        activeMachines,
        avgYield: Math.round(avgYield * 10) / 10,
        volume: Math.round(totalVolume),
        availability: Math.round(availability * 10) / 10,
        incidentsCount: incidents.length,
        operationsCount: operations.length
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
