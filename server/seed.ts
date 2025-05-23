import { User } from "./db";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  console.log("🌱 Démarrage du seeding de la base de données...");

  try {
    // Vérifier si des données existent déjà
    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      console.log("✅ Base de données déjà initialisée");
      return;
    }

    // Créer l'utilisateur admin
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const adminUser = await User.create({
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      name: "Administrateur OCP",
      team: "Administration",
      isActive: true,
    });

    // Créer un superviseur
    const supervisorUser = await User.create({
      username: "supervisor",
      email: "supervisor@example.com",
      password: await bcrypt.hash("supervisor123", 10),
      role: "supervisor",
      name: "Mohamed Alami",
      team: "Équipe Décapage A",
      isActive: true,
    });

    console.log("✅ Utilisateurs créés");

    // Créer les machines selon la liste dynamique fournie
    const machinesData = [
      // Machines de Poussage
      {
        name: "D11",
        type: "poussage",
        specifications: {
          power: "850 CV",
          weight: "104 tonnes",
          blade: "Semi-U de 7,4 m³",
          manufacturer: "Caterpillar"
        }
      },
      // Machines de Casement
      {
        name: "750011",
        type: "casement",
        specifications: {
          power: "536 CV",
          weight: "400 tonnes",
          bucket: "23 m³",
          reach: "17,7 m",
          manufacturer: "Liebherr"
        }
      },
      {
        name: "750012",
        type: "casement",
        specifications: {
          power: "536 CV",
          weight: "400 tonnes",
          bucket: "23 m³",
          reach: "17,7 m",
          manufacturer: "Liebherr"
        }
      },
      {
        name: "PH1",
        type: "casement",
        specifications: {
          power: "2x1175 CV",
          weight: "800 tonnes",
          bucket: "42 m³",
          reach: "20,5 m",
          manufacturer: "Komatsu"
        }
      },
      {
        name: "PH2",
        type: "casement",
        specifications: {
          power: "2x1175 CV",
          weight: "800 tonnes",
          bucket: "42 m³",
          reach: "20,5 m",
          manufacturer: "Komatsu"
        }
      },
      {
        name: "200B1",
        type: "casement",
        specifications: {
          power: "1450 CV",
          weight: "200 tonnes",
          bucket: "12 m³",
          reach: "14,2 m",
          manufacturer: "Hitachi"
        }
      },
      {
        name: "Libhere",
        type: "casement",
        specifications: {
          power: "700 CV",
          weight: "450 tonnes",
          bucket: "25 m³",
          reach: "18,5 m",
          manufacturer: "Liebherr"
        }
      },
      // Machines de Transport
      {
        name: "Transwine",
        type: "transport",
        specifications: {
          power: "4000 CV",
          capacity: "400 tonnes",
          payload: "363 tonnes",
          manufacturer: "Caterpillar"
        }
      },
      {
        name: "Procaneq",
        type: "transport",
        specifications: {
          power: "3500 CV",
          capacity: "320 tonnes",
          payload: "290 tonnes",
          manufacturer: "Komatsu"
        }
      }
    ];

    const createdMachines = await db.insert(machines).values(machinesData).returning();
    console.log("✅ Machines créées");

    // Créer des opérations réalistes
    const operationsData = [];
    const now = new Date();
    
    for (let i = 0; i < 15; i++) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // Derniers 15 jours
      const machine = createdMachines[Math.floor(Math.random() * createdMachines.length)];
      const operator = Math.random() > 0.5 ? adminUser.id : supervisorUser.id;
      
      operationsData.push({
        ficheId: `FO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        date: date,
        method: machine.type,
        machineId: machine.id,
        operatorId: operator,
        poste: Math.floor(Math.random() * 3) + 1, // 1, 2, ou 3
        panneau: `P${Math.floor(Math.random() * 10) + 1}`,
        tranche: `T${Math.floor(Math.random() * 5) + 1}`,
        niveau: `N${Math.floor(Math.random() * 8) + 1}`,
        machineStatus: Math.random() > 0.2 ? "marche" : "arret",
        workingHours: Math.random() * 8 + 4, // 4-12 heures
        downtime: Math.random() * 2, // 0-2 heures d'arrêt
        volumeBlasted: machine.type === 'casement' ? Math.random() * 1000 + 500 : Math.random() * 2000 + 1000,
        observations: Math.random() > 0.7 ? "Conditions météorologiques favorables" : null
      });
    }

    await db.insert(operations).values(operationsData);
    console.log("✅ Opérations créées");

    // Créer des données de progression
    const progressData = [];
    for (let p = 1; p <= 5; p++) {
      for (let t = 1; t <= 3; t++) {
        for (let n = 1; n <= 4; n++) {
          progressData.push({
            panneau: `P${p}`,
            tranche: `T${t}`,
            niveau: `N${n}`,
            method: ["transport", "casement", "poussage"][Math.floor(Math.random() * 3)],
            progressPercentage: Math.random() * 100,
            targetDepth: Math.random() * 20 + 10, // 10-30m
            currentDepth: Math.random() * 15 + 5, // 5-20m
          });
        }
      }
    }

    await db.insert(progress).values(progressData.slice(0, 20)); // Limiter à 20 entrées
    console.log("✅ Données de progression créées");

    // Créer des incidents de sécurité
    const incidentsData = [
      {
        title: "Glissement de terrain mineur",
        description: "Petit glissement de terrain détecté sur le panneau P3, zone sécurisée immédiatement",
        severity: "minor",
        status: "resolved",
        reportedBy: supervisorUser.id,
        machineId: createdMachines[2].id,
        location: "Panneau P3 - Niveau N2"
      },
      {
        title: "Maintenance préventive non conforme",
        description: "Vérification des freins non effectuée selon la procédure standard",
        severity: "major", 
        status: "in_progress",
        reportedBy: adminUser.id,
        machineId: createdMachines[0].id,
        location: "Atelier de maintenance"
      },
      {
        title: "Fuite hydraulique détectée",
        description: "Fuite hydraulique mineure sur le système de levage, réparation en cours",
        severity: "minor",
        status: "open",
        reportedBy: supervisorUser.id,
        machineId: createdMachines[3].id,
        location: "Zone de casement"
      }
    ];

    await db.insert(safetyIncidents).values(incidentsData);
    console.log("✅ Incidents de sécurité créés");

    // Créer des audits HSE
    const auditsData = [
      {
        title: "Audit sécurité mensuel - Janvier",
        auditType: "safety",
        score: 92,
        maxScore: 100,
        auditedBy: adminUser.id,
        location: "Site de décapage - Zone A",
        findings: "Conformité générale satisfaisante. Points d'amélioration: signalisation des zones de travail.",
        status: "compliant"
      },
      {
        title: "Inspection environnementale trimestrielle",
        auditType: "environmental",
        score: 88,
        maxScore: 100,
        auditedBy: supervisorUser.id,
        location: "Périmètre complet du site",
        findings: "Gestion des poussières conforme. Recommandation: améliorer le système d'arrosage.",
        status: "compliant"
      },
      {
        title: "Audit hygiène des équipements",
        auditType: "hygiene",
        score: 75,
        maxScore: 100,
        auditedBy: adminUser.id,
        location: "Cabines des machines",
        findings: "Nettoyage insuffisant de certaines cabines. Action corrective requise.",
        status: "non_compliant"
      }
    ];

    await db.insert(hseAudits).values(auditsData);
    console.log("✅ Audits HSE créés");

    console.log("🎉 Seeding terminé avec succès !");
    
    return {
      users: 2,
      machines: createdMachines.length,
      operations: operationsData.length,
      progress: 20,
      incidents: incidentsData.length,
      audits: auditsData.length
    };

  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    throw error;
  }
}