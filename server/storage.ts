import { users, medicalRecords, wellnessEntries, type User, type InsertUser, type MedicalRecord, type InsertMedicalRecord, type WellnessEntry, type InsertWellnessEntry } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createMedicalRecord(record: InsertMedicalRecord & { userId: number }): Promise<MedicalRecord>;
  getUserMedicalRecords(userId: number): Promise<MedicalRecord[]>;
  getMedicalRecord(id: number, userId: number): Promise<MedicalRecord | undefined>;
  deleteMedicalRecord(id: number, userId: number): Promise<boolean>;
  
  createWellnessEntry(entry: InsertWellnessEntry & { userId: number }): Promise<WellnessEntry>;
  getUserWellnessEntries(userId: number): Promise<WellnessEntry[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async createMedicalRecord(record: InsertMedicalRecord & { userId: number }): Promise<MedicalRecord> {
    const [medicalRecord] = await db
      .insert(medicalRecords)
      .values(record)
      .returning();
    return medicalRecord;
  }

  async getUserMedicalRecords(userId: number): Promise<MedicalRecord[]> {
    return await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.userId, userId))
      .orderBy(desc(medicalRecords.uploadedAt));
  }

  async getMedicalRecord(id: number, userId: number): Promise<MedicalRecord | undefined> {
    const [record] = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.id, id))
      .where(eq(medicalRecords.userId, userId));
    return record || undefined;
  }

  async deleteMedicalRecord(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(medicalRecords)
      .where(eq(medicalRecords.id, id))
      .where(eq(medicalRecords.userId, userId));
    return result.rowCount > 0;
  }

  async createWellnessEntry(entry: InsertWellnessEntry & { userId: number }): Promise<WellnessEntry> {
    const [wellnessEntry] = await db
      .insert(wellnessEntries)
      .values(entry)
      .returning();
    return wellnessEntry;
  }

  async getUserWellnessEntries(userId: number): Promise<WellnessEntry[]> {
    return await db
      .select()
      .from(wellnessEntries)
      .where(eq(wellnessEntries.userId, userId))
      .orderBy(desc(wellnessEntries.createdAt));
  }
}

export const storage = new DatabaseStorage();
