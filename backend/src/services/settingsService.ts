import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SettingsService {
    static async get(key: string): Promise<string | null> {
        const setting = await prisma.appSetting.findUnique({
            where: { key }
        });
        return setting ? setting.value : null;
    }

    static async set(key: string, value: string): Promise<void> {
        await prisma.appSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
    }

    static async getAll(): Promise<Record<string, string>> {
        const settings = await prisma.appSetting.findMany();
        const result: Record<string, string> = {};
        for (const setting of settings) {
            result[setting.key] = setting.value;
        }
        return result;
    }
}
