import { adminDb } from "./firebase";
import { 
  User, 
  InsertUser, 
  MedicalRecord, 
  InsertMedicalRecord, 
  WellnessEntry, 
  InsertWellnessEntry 
} from "@shared/types";
import { hashPassword } from "./middleware/auth";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createMedicalRecord(record: InsertMedicalRecord & { userId: string }): Promise<MedicalRecord>;
  getUserMedicalRecords(userId: string): Promise<MedicalRecord[]>;
  getMedicalRecord(id: string, userId: string): Promise<MedicalRecord | undefined>;
  deleteMedicalRecord(id: string, userId: string): Promise<boolean>;
  
  createWellnessEntry(entry: InsertWellnessEntry & { userId: string }): Promise<WellnessEntry>;
  getUserWellnessEntries(userId: string): Promise<WellnessEntry[]>;
}

export class FirebaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      const doc = await adminDb.collection('users').doc(id).get();
      if (!doc.exists) return undefined;
      
      const data = doc.data()!;
      return {
        id: doc.id,
        username: data.username,
        email: data.email,
        createdAt: data.createdAt.toDate(),
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const snapshot = await adminDb.collection('users').where('email', '==', email).limit(1).get();
      if (snapshot.empty) return undefined;
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        username: data.username,
        email: data.email,
        createdAt: data.createdAt.toDate(),
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const snapshot = await adminDb.collection('users').where('username', '==', username).limit(1).get();
      if (snapshot.empty) return undefined;
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        username: data.username,
        email: data.email,
        createdAt: data.createdAt.toDate(),
      };
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const hashedPassword = await hashPassword(insertUser.password);
      const userData = {
        username: insertUser.username,
        email: insertUser.email,
        password: hashedPassword,
        createdAt: new Date(),
      };
      
      const docRef = await adminDb.collection('users').add(userData);
      
      return {
        id: docRef.id,
        username: userData.username,
        email: userData.email,
        createdAt: userData.createdAt,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async createMedicalRecord(record: InsertMedicalRecord & { userId: string }): Promise<MedicalRecord> {
    try {
      const recordData = {
        ...record,
        uploadedAt: new Date(),
      };
      
      const docRef = await adminDb.collection('medicalRecords').add(recordData);
      
      return {
        id: docRef.id,
        ...recordData,
      };
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw new Error('Failed to create medical record');
    }
  }

  async getUserMedicalRecords(userId: string): Promise<MedicalRecord[]> {
    try {
      const snapshot = await adminDb
        .collection('medicalRecords')
        .where('userId', '==', userId)
        .orderBy('uploadedAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.data().userId,
        fileName: doc.data().fileName,
        originalName: doc.data().originalName,
        fileType: doc.data().fileType,
        fileSize: doc.data().fileSize,
        downloadUrl: doc.data().downloadUrl,
        uploadedAt: doc.data().uploadedAt.toDate(),
      }));
    } catch (error) {
      console.error('Error getting user medical records:', error);
      return [];
    }
  }

  async getMedicalRecord(id: string, userId: string): Promise<MedicalRecord | undefined> {
    try {
      const doc = await adminDb.collection('medicalRecords').doc(id).get();
      if (!doc.exists || doc.data()?.userId !== userId) return undefined;
      
      const data = doc.data()!;
      return {
        id: doc.id,
        userId: data.userId,
        fileName: data.fileName,
        originalName: data.originalName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        downloadUrl: data.downloadUrl,
        uploadedAt: data.uploadedAt.toDate(),
      };
    } catch (error) {
      console.error('Error getting medical record:', error);
      return undefined;
    }
  }

  async deleteMedicalRecord(id: string, userId: string): Promise<boolean> {
    try {
      const doc = await adminDb.collection('medicalRecords').doc(id).get();
      if (!doc.exists || doc.data()?.userId !== userId) return false;
      
      await adminDb.collection('medicalRecords').doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting medical record:', error);
      return false;
    }
  }

  async createWellnessEntry(entry: InsertWellnessEntry & { userId: string }): Promise<WellnessEntry> {
    try {
      const entryData = {
        ...entry,
        createdAt: new Date(),
      };
      
      const docRef = await adminDb.collection('wellnessEntries').add(entryData);
      
      return {
        id: docRef.id,
        ...entryData,
      };
    } catch (error) {
      console.error('Error creating wellness entry:', error);
      throw new Error('Failed to create wellness entry');
    }
  }

  async getUserWellnessEntries(userId: string): Promise<WellnessEntry[]> {
    try {
      const snapshot = await adminDb
        .collection('wellnessEntries')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.data().userId,
        mood: doc.data().mood,
        notes: doc.data().notes,
        createdAt: doc.data().createdAt.toDate(),
      }));
    } catch (error) {
      console.error('Error getting wellness entries:', error);
      return [];
    }
  }
}

// Temporary in-memory storage for development
class MemoryStorage implements IStorage {
  private users: Map<string, User & { password: string }> = new Map();
  private medicalRecords: Map<string, MedicalRecord> = new Map();
  private wellnessEntries: Map<string, WellnessEntry> = new Map();
  private userIdCounter = 1;
  private recordIdCounter = 1;
  private entryIdCounter = 1;

  async getUser(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    }
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = (this.userIdCounter++).toString();
    const hashedPassword = await hashPassword(insertUser.password);
    const user = {
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: hashedPassword,
      createdAt: new Date(),
    };
    
    this.users.set(id, user);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createMedicalRecord(record: InsertMedicalRecord & { userId: string }): Promise<MedicalRecord> {
    const id = (this.recordIdCounter++).toString();
    const medicalRecord = {
      id,
      ...record,
      uploadedAt: new Date(),
    };
    
    this.medicalRecords.set(id, medicalRecord);
    return medicalRecord;
  }

  async getUserMedicalRecords(userId: string): Promise<MedicalRecord[]> {
    const records = Array.from(this.medicalRecords.values())
      .filter(record => record.userId === userId)
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    return records;
  }

  async getMedicalRecord(id: string, userId: string): Promise<MedicalRecord | undefined> {
    const record = this.medicalRecords.get(id);
    if (!record || record.userId !== userId) return undefined;
    return record;
  }

  async deleteMedicalRecord(id: string, userId: string): Promise<boolean> {
    const record = this.medicalRecords.get(id);
    if (!record || record.userId !== userId) return false;
    return this.medicalRecords.delete(id);
  }

  async createWellnessEntry(entry: InsertWellnessEntry & { userId: string }): Promise<WellnessEntry> {
    const id = (this.entryIdCounter++).toString();
    const wellnessEntry = {
      id,
      ...entry,
      createdAt: new Date(),
    };
    
    this.wellnessEntries.set(id, wellnessEntry);
    return wellnessEntry;
  }

  async getUserWellnessEntries(userId: string): Promise<WellnessEntry[]> {
    const entries = Array.from(this.wellnessEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return entries;
  }

  // Helper method to get user with password for authentication
  async getUserWithPassword(email: string): Promise<(User & { password: string }) | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }
}

// Use Firebase if available, otherwise use memory storage
export const storage = adminDb ? new FirebaseStorage() : new MemoryStorage();
