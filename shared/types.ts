import { z } from "zod";

// User schemas
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Medical Record schemas
export const insertMedicalRecordSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  originalName: z.string().min(1, "Original name is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().positive("File size must be positive"),
  downloadUrl: z.string().url("Invalid download URL"),
});

// Wellness Entry schemas
export const insertWellnessEntrySchema = z.object({
  mood: z.number().min(1).max(5, "Mood must be between 1 and 5"),
  notes: z.string().optional(),
});

// Type definitions
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface MedicalRecord {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
  uploadedAt: Date;
}

export interface WellnessEntry {
  id: string;
  userId: string;
  mood: number;
  notes?: string;
  createdAt: Date;
}

// Inferred types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type InsertWellnessEntry = z.infer<typeof insertWellnessEntrySchema>;