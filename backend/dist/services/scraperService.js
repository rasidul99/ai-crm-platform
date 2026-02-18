"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const settingsService_1 = require("./settingsService");
class ScraperService {
    // Mock method to simulate fetching leads from Apify
    static async fetchLeads(query) {
        const apifyToken = await settingsService_1.SettingsService.get('APIFY_TOKEN');
        console.log(`[Mock Scraper] Fetching leads for query: "${query}" using token: ${apifyToken ? '***' : 'missing'}`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Return mock data
        return [
            {
                name: "John Doe Design",
                email: "contact@johndoe.design",
                phone: "+15550101",
                source: "GOOGLE",
                sourceUrl: "https://johndoe.design",
                description: "We are a boutique web design studio looking for partnerships to scale our development capabilities."
            },
            {
                name: "TechStart Inc",
                email: "hello@techstart.io",
                source: "LINKEDIN",
                sourceUrl: "https://linkedin.com/company/techstart",
                description: "Startup seeking full-stack support for our new SaaS product launch next month."
            },
            {
                name: "Local Bakery",
                source: "FACEBOOK",
                sourceUrl: "https://facebook.com/localbakery",
                description: "Family owned bakery looking to update our old website with a new online ordering system."
            }
        ];
    }
}
exports.ScraperService = ScraperService;
