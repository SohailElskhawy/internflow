import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/src/config/env";

const connectionString = env.DATABASE_URL;

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter: new PrismaPg(
            new Pool({
                connectionString,
                ssl: {
                    rejectUnauthorized: env.NODE_ENV === "production",
                },
            })
        ),
        log: ["query"],
    });

if (env.NODE_ENV !== "production")
    globalForPrisma.prisma = prisma;