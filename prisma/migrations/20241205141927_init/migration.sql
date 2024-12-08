-- CreateTable
CREATE TABLE "Produtor" (
    "id" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "fazenda" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "areaTotal" DOUBLE PRECISION NOT NULL,
    "areaAgricola" DOUBLE PRECISION NOT NULL,
    "areaVegetacao" DOUBLE PRECISION NOT NULL,
    "culturas" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produtor_pkey" PRIMARY KEY ("id")
);
