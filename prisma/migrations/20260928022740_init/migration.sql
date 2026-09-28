-- CreateTable
CREATE TABLE "captures" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "photo" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "captures_pkey" PRIMARY KEY ("id")
);
