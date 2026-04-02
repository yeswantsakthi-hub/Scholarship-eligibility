import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  users, scholarships, applications,
  type User, type InsertUser, 
  type Scholarship, type InsertScholarship,
  type Application, type ApplicationWithDetails
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getScholarships(): Promise<Scholarship[]>;
  createScholarship(scholarship: InsertScholarship): Promise<Scholarship>;
  deleteScholarship(id: number): Promise<void>;
  
  getApplications(): Promise<ApplicationWithDetails[]>;
  getApplicationsByStudent(studentId: number): Promise<ApplicationWithDetails[]>;
  createApplication(app: Omit<Application, "id" | "createdAt" | "status" | "remarks">): Promise<Application>;
  updateApplicationStatus(id: number, status: "Pending" | "Approved" | "Rejected", remarks?: string): Promise<Application>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getScholarships(): Promise<Scholarship[]> {
    return await db.select().from(scholarships);
  }

  async createScholarship(scholarship: InsertScholarship): Promise<Scholarship> {
    const [created] = await db.insert(scholarships).values(scholarship).returning();
    return created;
  }

  async deleteScholarship(id: number): Promise<void> {
    await db.delete(scholarships).where(eq(scholarships.id, id));
  }

  async getApplications(): Promise<ApplicationWithDetails[]> {
    const results = await db.query.applications.findMany({
      with: {
        student: true,
        scholarship: true,
      },
    });
    return results as ApplicationWithDetails[];
  }

  async getApplicationsByStudent(studentId: number): Promise<ApplicationWithDetails[]> {
    const results = await db.query.applications.findMany({
      where: eq(applications.studentId, studentId),
      with: {
        student: true,
        scholarship: true,
      },
    });
    return results as ApplicationWithDetails[];
  }

  async createApplication(app: Omit<Application, "id" | "createdAt" | "status" | "remarks">): Promise<Application> {
    const [created] = await db.insert(applications).values({
      ...app,
      status: 'Pending',
    }).returning();
    return created;
  }

  async updateApplicationStatus(id: number, status: "Pending" | "Approved" | "Rejected", remarks?: string): Promise<Application> {
    const [updated] = await db.update(applications)
      .set({ status, remarks })
      .where(eq(applications.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();