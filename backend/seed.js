const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database via JS...');

    const leads = [
        {
            name: 'Alice Johnson (JS)',
            email: 'alice.js@example.com',
            phone: '+15550101',
            status: 'NEW',
            score: 85,
            source: 'LINKEDIN'
        },
        {
            name: 'Bob Smith (JS)',
            email: 'bob.js@techcorp.com',
            phone: '+15550102',
            status: 'CONTACTING',
            score: 92,
            source: 'WEBSITE'
        },
        {
            name: 'Charlie Davis (JS)',
            email: 'charlie.js@startup.io',
            phone: '+15550103',
            status: 'REPLIED',
            score: 75,
            source: 'MANUAL'
        },
        {
            name: 'Diana Evans (JS)',
            email: 'diana.js@enterprise.co',
            phone: '+15550104',
            status: 'BOOKED',
            score: 98,
            source: 'VAPI_INBOUND'
        }
    ];

    for (const lead of leads) {
        const existing = await prisma.lead.findFirst({ where: { email: lead.email } });
        if (!existing) {
            await prisma.lead.create({ data: lead });
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
