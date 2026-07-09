import "dotenv/config";
import { prisma } from "../lib/db";

async function main() {
    try {
        console.log("Connecting to database with URL:", process.env.DATABASE_URL ? "URL is set" : "URL is NOT set");
        const usersCount = await prisma.user.count();
        console.log(`Success! Total users in database: ${usersCount}`);
    } catch (error: any) {
        console.error("Database connection failed:", error);
        if (error.meta) {
            console.error("Error Meta:", JSON.stringify(error.meta, null, 2));
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
