-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_mock_exams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "examType" TEXT NOT NULL DEFAULT 'GENERAL',
    "courseId" TEXT,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mock_exams_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "mock_exams_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_mock_exams" ("courseId", "createdAt", "createdById", "durationMinutes", "id", "title") SELECT "courseId", "createdAt", "createdById", "durationMinutes", "id", "title" FROM "mock_exams";
DROP TABLE "mock_exams";
ALTER TABLE "new_mock_exams" RENAME TO "mock_exams";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
