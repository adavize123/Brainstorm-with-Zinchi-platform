import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Seeding database...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@zinchi.org" },
    update: {},
    create: {
      name: "Zinchi Admin",
      email: "admin@zinchi.org",
      passwordHash: await hash("Admin123!"),
      role: "ADMIN",
    },
  });

  const prospector = await prisma.user.upsert({
    where: { email: "prospector@zinchi.org" },
    update: {},
    create: {
      name: "Amaka Obi",
      email: "prospector@zinchi.org",
      passwordHash: await hash("Prospect123!"),
      role: "PROSPECTOR",
      createdById: admin.id,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@zinchi.org" },
    update: {},
    create: {
      name: "Marisa Juanita Udenkwo",
      email: "student@zinchi.org",
      passwordHash: await hash("Student123!"),
      role: "STUDENT",
      createdById: prospector.id,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "chidi.student@zinchi.org" },
    update: {},
    create: {
      name: "Chidi Nwosu",
      email: "chidi.student@zinchi.org",
      passwordHash: await hash("Student123!"),
      role: "STUDENT",
      createdById: prospector.id,
    },
  });

  const satCourse = await prisma.course.upsert({
    where: { slug: "sat-preparation" },
    update: {},
    create: {
      title: "📚 SAT Preparation",
      slug: "sat-preparation",
      description:
        "A comprehensive SAT preparation course covering Reading & Writing and Math, with weekly mock tests and personalized feedback.",
      category: "Exam Preparation",
      level: "Intermediate",
      durationWeeks: 8,
      imageUrl: "",
      isPublished: true,
      createdById: prospector.id,
    },
  });

  const examPrepCourses = [
    {
      slug: "ielts-preparation",
      title: "🎓 IELTS Preparation",
      description:
        "Comprehensive preparation for the IELTS exam covering Listening, Reading, Writing, and Speaking, with weekly mock tests and personalized feedback.",
      level: "Intermediate",
      durationWeeks: 6,
    },
    {
      slug: "toefl-preparation",
      title: "🇺🇸 TOEFL Preparation",
      description:
        "Build the skills and confidence to excel on the TOEFL iBT, with structured lessons, practice questions, and full-length mock exams.",
      level: "Intermediate",
      durationWeeks: 6,
    },
    {
      slug: "gre-preparation",
      title: "📊 GRE Preparation",
      description:
        "Master the GRE's Verbal Reasoning, Quantitative Reasoning, and Analytical Writing sections through targeted practice and mock testing.",
      level: "Advanced",
      durationWeeks: 8,
    },
    {
      slug: "gmat-preparation",
      title: "💼 GMAT Preparation",
      description:
        "Prepare for the GMAT with a focus on Quantitative, Verbal, and Data Insights sections, guided by experienced prospectors.",
      level: "Advanced",
      durationWeeks: 8,
    },
    {
      slug: "pte-preparation",
      title: "🌍 PTE Preparation",
      description:
        "Get exam-ready for the Pearson Test of English with practice modules covering Speaking, Writing, Reading, and Listening.",
      level: "Intermediate",
      durationWeeks: 5,
    },
    {
      slug: "duolingo-english-test",
      title: "🗣️ Duolingo English Test — Registration & Support",
      description:
        "Guidance on registering for and preparing for the Duolingo English Test, including practice items, adaptive test strategy, and test-day support.",
      level: "Beginner",
      durationWeeks: 3,
    },
  ];

  for (const c of examPrepCourses) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        title: c.title,
        slug: c.slug,
        description: c.description,
        category: "Exam Preparation",
        level: c.level,
        durationWeeks: c.durationWeeks,
        imageUrl: "",
        isPublished: true,
        createdById: prospector.id,
      },
    });
  }

  const scholarshipCourse = await prisma.course.upsert({
    where: { slug: "scholarship-essay-mastery" },
    update: {},
    create: {
      title: "Scholarship Essay Mastery",
      slug: "scholarship-essay-mastery",
      description:
        "Learn to craft compelling scholarship and college application essays that stand out, with guided workshops and reviews.",
      category: "Study Abroad",
      level: "Beginner",
      durationWeeks: 4,
      imageUrl: "",
      isPublished: true,
      createdById: prospector.id,
    },
  });

  for (const s of [student, student2]) {
    await prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: s.id, courseId: satCourse.id } },
      update: {},
      create: {
        studentId: s.id,
        courseId: satCourse.id,
        assignedById: prospector.id,
        progressPercent: s.id === student.id ? 35 : 10,
      },
    });
  }
  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: student.id, courseId: scholarshipCourse.id } },
    update: {},
    create: {
      studentId: student.id,
      courseId: scholarshipCourse.id,
      assignedById: prospector.id,
      progressPercent: 60,
    },
  });

  const materialCount = await prisma.material.count();
  if (materialCount === 0)
  await prisma.material.createMany({
    data: [
      {
        title: "SAT Math: Algebra Foundations (PDF)",
        type: "PDF",
        url: "https://example.com/materials/sat-algebra.pdf",
        courseId: satCourse.id,
        createdById: prospector.id,
      },
      {
        title: "Reading & Writing Strategies (Video)",
        type: "VIDEO",
        url: "https://example.com/materials/reading-writing.mp4",
        courseId: satCourse.id,
        createdById: prospector.id,
      },
      {
        title: "Week 1 Study Notes",
        type: "NOTE",
        content:
          "Focus on linear equations, ratios, and command of evidence questions this week. Practice 20 questions daily.",
        courseId: satCourse.id,
        createdById: prospector.id,
      },
      {
        title: "Essay Brainstorming Template",
        type: "NOTE",
        content: "Use the STAR method to structure your personal narrative before drafting.",
        courseId: scholarshipCourse.id,
        createdById: prospector.id,
      },
    ],
  });

  const materialAssignmentCount = await prisma.materialAssignment.count();
  if (materialAssignmentCount === 0) {
    const allMaterials = await prisma.material.findMany();
    for (const material of allMaterials) {
      const enrolledStudentIds = (
        await prisma.enrollment.findMany({
          where: { courseId: material.courseId },
          select: { studentId: true },
        })
      ).map((e) => e.studentId);

      for (const studentId of enrolledStudentIds) {
        await prisma.materialAssignment.upsert({
          where: { materialId_studentId: { materialId: material.id, studentId } },
          update: {},
          create: { materialId: material.id, studentId, assignedById: prospector.id },
        });
      }
    }
  }

  let assignment = await prisma.assignment.findFirst({
    where: { title: "Practice Set: Linear Equations" },
  });
  if (!assignment) {
    assignment = await prisma.assignment.create({
      data: {
        title: "Practice Set: Linear Equations",
        description: "Complete the 20-question practice set on linear equations and submit your working.",
        courseId: satCourse.id,
        createdById: prospector.id,
      },
    });

    await prisma.assignmentTarget.create({
      data: {
        assignmentId: assignment.id,
        studentId: student.id,
        dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: "PENDING",
      },
    });
  }

  let mockExam = await prisma.mockExam.findFirst({ where: { title: "SAT Mock Test 1" } });
  if (mockExam && mockExam.examType !== "SAT") {
    mockExam = await prisma.mockExam.update({ where: { id: mockExam.id }, data: { examType: "SAT" } });
  }
  if (!mockExam)
  mockExam = await prisma.mockExam.create({
    data: {
      title: "SAT Mock Test 1",
      examType: "SAT",
      courseId: satCourse.id,
      durationMinutes: 45,
      createdById: prospector.id,
      sections: {
        create: [
          {
            title: "Math",
            order: 0,
            questions: {
              create: [
                {
                  prompt: "Solve for x: 2x + 6 = 14",
                  type: "SINGLE_CHOICE",
                  options: JSON.stringify([
                    { id: "a", text: "2" },
                    { id: "b", text: "4" },
                    { id: "c", text: "6" },
                    { id: "d", text: "8" },
                  ]),
                  correctOptionIds: JSON.stringify(["b"]),
                  marks: 1,
                  order: 0,
                },
                {
                  prompt: "What is 15% of 200?",
                  type: "SINGLE_CHOICE",
                  options: JSON.stringify([
                    { id: "a", text: "20" },
                    { id: "b", text: "25" },
                    { id: "c", text: "30" },
                    { id: "d", text: "35" },
                  ]),
                  correctOptionIds: JSON.stringify(["c"]),
                  marks: 1,
                  order: 1,
                },
              ],
            },
          },
          {
            title: "Reading & Writing",
            order: 1,
            questions: {
              create: [
                {
                  prompt: "Choose the sentence that is grammatically correct.",
                  type: "SINGLE_CHOICE",
                  options: JSON.stringify([
                    { id: "a", text: "Neither of the students have finished." },
                    { id: "b", text: "Neither of the students has finished." },
                    { id: "c", text: "Neither of the student have finished." },
                    { id: "d", text: "Neither of the students finish." },
                  ]),
                  correctOptionIds: JSON.stringify(["b"]),
                  marks: 1,
                  order: 0,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.examAssignment.upsert({
    where: { mockExamId_studentId: { mockExamId: mockExam.id, studentId: student.id } },
    update: {},
    create: {
      mockExamId: mockExam.id,
      studentId: student.id,
      assignedById: prospector.id,
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "NOT_STARTED",
    },
  });

  const testimonialCount = await prisma.testimonial.count();
  if (testimonialCount === 0)
  await prisma.testimonial.createMany({
    data: [
      {
        name: "Ifeoma A.",
        role: "SAT Student, 2025",
        quote:
          "Brainstorm with Zinchi transformed how I prepared for my SAT. The mock tests felt exactly like the real exam.",
        order: 0,
      },
      {
        name: "Tunde B.",
        role: "Scholarship Recipient",
        quote:
          "My prospector guided me through every assignment with clear deadlines and honest feedback. I couldn't have done it alone.",
        order: 1,
      },
      {
        name: "Grace O.",
        role: "Parent",
        quote:
          "The dashboard made it so easy to track my daughter's progress and see exactly what she needed to work on.",
        order: 2,
      },
    ],
  });

  console.log("Seed complete. Demo accounts:");
  console.log("  admin@zinchi.org      / Admin123!");
  console.log("  prospector@zinchi.org / Prospect123!");
  console.log("  student@zinchi.org    / Student123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
