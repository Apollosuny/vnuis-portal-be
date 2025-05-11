-- CreateEnum
CREATE TYPE "FormSubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "AdministrativeProceduresForm" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "fileUrl" TEXT,
    "allowEditAfterSubmit" BOOLEAN NOT NULL DEFAULT false,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdByOperatorId" UUID,

    CONSTRAINT "AdministrativeProceduresForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdministrativeProceduresFormSubmission" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "result" JSONB NOT NULL,
    "status" "FormSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "handleAt" TIMESTAMP(3),
    "handleByOperatorId" UUID,
    "formId" UUID NOT NULL,
    "studentId" UUID NOT NULL,

    CONSTRAINT "AdministrativeProceduresFormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdministrativeProceduresForm_name_key" ON "AdministrativeProceduresForm"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AdministrativeProceduresForm_slug_key" ON "AdministrativeProceduresForm"("slug");

-- AddForeignKey
ALTER TABLE "AdministrativeProceduresForm" ADD CONSTRAINT "AdministrativeProceduresForm_createdByOperatorId_fkey" FOREIGN KEY ("createdByOperatorId") REFERENCES "Operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdministrativeProceduresFormSubmission" ADD CONSTRAINT "AdministrativeProceduresFormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "AdministrativeProceduresForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdministrativeProceduresFormSubmission" ADD CONSTRAINT "AdministrativeProceduresFormSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdministrativeProceduresFormSubmission" ADD CONSTRAINT "AdministrativeProceduresFormSubmission_handleByOperatorId_fkey" FOREIGN KEY ("handleByOperatorId") REFERENCES "Operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
