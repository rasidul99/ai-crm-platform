import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    const leads = [
        {
            name: 'Alice Johnson',
            email: 'alice@example.com',
            phone: '+15550101',
            status: 'NEW',
            score: 85,
            source: 'LINKEDIN',
            createdAt: new Date('2025-02-14T10:00:00Z')
        },
        {
            name: 'Bob Smith',
            email: 'bob@techcorp.com',
            phone: '+15550102',
            status: 'CONTACTING',
            score: 92,
            source: 'WEBSITE',
            createdAt: new Date('2025-02-15T14:30:00Z')
        },
        {
            name: 'Charlie Davis',
            email: 'charlie@startup.io',
            phone: '+15550103',
            status: 'REPLIED',
            score: 75,
            source: 'MANUAL',
            createdAt: new Date('2025-02-16T09:15:00Z')
        },
        {
            name: 'Diana Evans',
            email: 'diana@enterprise.co',
            phone: '+15550104',
            status: 'BOOKED',
            score: 98,
            source: 'VAPI_INBOUND',
            createdAt: new Date('2025-02-16T11:45:00Z')
        }
    ];

    for (const lead of leads) {
        const existing = await prisma.lead.findFirst({ where: { email: lead.email } });
        if (!existing) {
            await prisma.lead.create({ data: lead as any });
            console.log(`Created lead: ${lead.name}`);
        } else {
            console.log(`Lead already exists: ${lead.name}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
