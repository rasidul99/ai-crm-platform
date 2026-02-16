import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PrivacyService {
    // Check if an email or phone number is in the blocklist
    static async isBlocked(value: string): Promise<boolean> {
        if (!value) return false;

        const count = await prisma.blocklist.count({
            where: {
                value: value
            }
        });

        return count > 0;
    }

    // Log the scrape result
    static async logScrape(query: string, source: string, leadsFound: number, status: string = 'SUCCESS'): Promise<string> {
        const log = await prisma.scrapeLog.create({
            data: {
                query,
                source,
                leadsFound,
                status
            }
        });
        return log.id;
    }

    // Add to blocklist (utility for future use)
    static async addToBlocklist(value: string, type: string, reason?: string): Promise<void> {
        await prisma.blocklist.create({
            data: {
                value,
                type,
                reason
            }
        });
    }
}
