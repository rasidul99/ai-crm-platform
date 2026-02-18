"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PrivacyService {
    // Check if an email or phone number is in the blocklist
    static async isBlocked(value) {
        if (!value)
            return false;
        const count = await prisma.blocklist.count({
            where: {
                value: value
            }
        });
        return count > 0;
    }
    // Log the scrape result
    static async logScrape(query, source, leadsFound, status = 'SUCCESS') {
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
    static async addToBlocklist(value, type, reason) {
        await prisma.blocklist.create({
            data: {
                value,
                type,
                reason
            }
        });
    }
}
exports.PrivacyService = PrivacyService;
