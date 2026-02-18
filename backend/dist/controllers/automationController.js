"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerScrapeAndOutreach = void 0;
const client_1 = require("@prisma/client");
const scraperService_1 = require("../services/scraperService");
const privacyService_1 = require("../services/privacyService");
const aiService_1 = require("../services/aiService");
const emailService_1 = require("../services/emailService");
const prisma = new client_1.PrismaClient();
const triggerScrapeAndOutreach = async (req, res) => {
    const { query } = req.body;
    if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
    }
    try {
        console.log(`[Automation] Starting workflow for query: ${query}`);
        // 1. Scrape Leads
        const scrapedLeads = await scraperService_1.ScraperService.fetchLeads(query);
        let leadsProcessed = 0;
        let emailsSent = 0;
        for (const rawLead of scrapedLeads) {
            // 2. Privacy Check
            if (rawLead.email && await privacyService_1.PrivacyService.isBlocked(rawLead.email)) {
                console.log(`[Automation] Skipped blocked email: ${rawLead.email}`);
                continue;
            }
            // 3. AI Analysis
            const aiResult = await aiService_1.AIService.analyzeLead(rawLead.description);
            // Only proceed if score is high enough (e.g., > 50)
            if (aiResult.score < 50) {
                console.log(`[Automation] Skipped low score lead: ${rawLead.name} (${aiResult.score})`);
                continue;
            }
            // 4. Save to Database
            const savedLead = await prisma.lead.create({
                data: {
                    name: rawLead.name,
                    email: rawLead.email,
                    phone: rawLead.phone,
                    source: 'OTHER',
                    sourceUrl: rawLead.sourceUrl,
                    status: 'NEW',
                    score: aiResult.score,
                    initialQuery: query
                }
            });
            // 5. Automated Outreach
            if (savedLead.email) {
                const subject = `Question about ${aiResult.category}`;
                const body = `<p>${aiResult.suggestedDraft}</p>`; // Basic HTML wrapper
                // Send first email
                const emailSent = await emailService_1.EmailService.sendEmail(savedLead.email, subject, body);
                if (emailSent) {
                    // Update connection to CONTACTING
                    await prisma.lead.update({
                        where: { id: savedLead.id },
                        data: { status: 'CONTACTING' }
                    });
                    // Log the interaction
                    await prisma.interaction.create({
                        data: {
                            leadId: savedLead.id,
                            type: 'EMAIL',
                            direction: 'OUTBOUND',
                            content: body,
                            metadata: { subject, aiAnalysis: aiResult }
                        }
                    });
                    emailsSent++;
                }
            }
            leadsProcessed++;
        }
        // Log the overall scrape operation
        await privacyService_1.PrivacyService.logScrape(query, 'MOCK_APIFY', leadsProcessed, 'SUCCESS');
        res.json({
            message: 'Automation workflow completed',
            leadsFound: scrapedLeads.length,
            leadsProcessed,
            emailsSent
        });
    }
    catch (error) {
        console.error('[Automation] Workflow failed:', error);
        res.status(500).json({ error: 'Automation workflow failed' });
    }
};
exports.triggerScrapeAndOutreach = triggerScrapeAndOutreach;
