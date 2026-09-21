import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const createStudentSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export const createProspectorSchema = createStudentSchema;

export const enquirySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(5).max(2000),
  source: z.enum(["CONTACT", "APPLY"]).default("CONTACT"),
});

export const courseSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(10).max(4000),
  category: z.string().min(2).max(60),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  durationWeeks: z.coerce.number().int().min(1).max(104),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isPublished: z.boolean().default(true),
});

export const materialSchema = z.object({
  title: z.string().min(2).max(150),
  type: z.enum(["PDF", "VIDEO", "LINK", "NOTE"]),
  url: z.string().url().optional().or(z.literal("")),
  content: z.string().max(8000).optional(),
  courseId: z.string().min(1),
});

export const assignMaterialSchema = z.object({
  studentIds: z.array(z.string()).min(1, "Select at least one student"),
});

export const assignmentSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(5).max(4000),
  courseId: z.string().min(1),
  studentIds: z.array(z.string()).min(1, "Select at least one student"),
  dueAt: z.string().min(1, "Due date is required"),
});

export const submitAssignmentSchema = z.object({
  submissionText: z.string().max(8000).optional(),
  submissionUrl: z.string().url().optional().or(z.literal("")),
});

export const gradeAssignmentSchema = z.object({
  grade: z.coerce.number().int().min(0).max(100),
  feedback: z.string().max(2000).optional(),
});

export const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
});

export const questionSchema = z.object({
  prompt: z.string().min(3).max(1000),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE"]),
  options: z.array(optionSchema).min(2).max(8),
  correctOptionIds: z.array(z.string()).min(1),
  marks: z.coerce.number().int().min(1).max(50),
});

export const sectionSchema = z.object({
  title: z.string().min(2).max(150),
  questions: z.array(questionSchema).min(1),
});

export const mockExamSchema = z.object({
  title: z.string().min(3).max(150),
  courseId: z.string().optional(),
  durationMinutes: z.coerce.number().int().min(5).max(300),
  sections: z.array(sectionSchema).min(1),
});

export const assignExamSchema = z.object({
  studentIds: z.array(z.string()).min(1, "Select at least one student"),
  dueAt: z.string().min(1, "Due date is required"),
});
