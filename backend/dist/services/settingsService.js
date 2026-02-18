"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SettingsService {
    static async get(key) {
        const setting = await prisma.appSetting.findUnique({
            where: { key }
        });
        return setting ? setting.value : null;
    }
    static async set(key, value) {
        await prisma.appSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
    }
    static async getAll() {
        const settings = await prisma.appSetting.findMany();
        const result = {};
        for (const setting of settings) {
            result[setting.key] = setting.value;
        }
        return result;
    }
}
exports.SettingsService = SettingsService;
