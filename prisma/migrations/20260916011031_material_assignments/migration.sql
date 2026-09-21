-- CreateTable
CREATE TABLE "material_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "materialId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "material_assignments_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "material_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "material_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "material_assignments_materialId_studentId_key" ON "material_assignments"("materialId", "studentId");
