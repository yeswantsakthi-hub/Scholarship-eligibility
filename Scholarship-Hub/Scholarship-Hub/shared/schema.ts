import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const scholarships = pgTable("scholarships", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  deadline: text("deadline").notNull(), // YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  scholarshipId: integer("scholarship_id").notNull(),
  studentId: integer("student_id").notNull(),
  status: text("status", { enum: ['Pending', 'Approved', 'Rejected'] }).notNull().default('Pending'),
  remarks: text("remarks"),
  documentUrl: text("document_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applicationsRelations = relations(applications, ({ one }) => ({
  student: one(users, {
    fields: [applications.studentId],
    references: [users.id],
  }),
  scholarship: one(scholarships, {
    fields: [applications.scholarshipId],
    references: [scholarships.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertScholarshipSchema = createInsertSchema(scholarships).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Scholarship = typeof scholarships.$inferSelect;
export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;
export type Application = typeof applications.$inferSelect;

export type ApplicationWithDetails = Application & {
  student: User;
  scholarship: Scholarship;
};
