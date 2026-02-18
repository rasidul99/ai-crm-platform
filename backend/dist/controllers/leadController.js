"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeadStage = exports.deleteLead = exports.updateLead = exports.createLead = exports.getLeads = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all leads
// Get all leads with pagination and filtering
const getLeads = async (req, res) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 50;
        const offset = req.query.offset ? Number(req.query.offset) : 0;
        const status = req.query.status;
        const where = {};
        if (status) {
            where.status = status;
        }
        const leads = await prisma.lead.findMany({
            where,
            take: limit,
            skip: offset,
            include: {
                campaign: true,
                assignedUser: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(leads);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
};
exports.getLeads = getLeads;
// Create a new lead
const createLead = async (req, res) => {
    try {
        const { name, email, phone, source, status, campaignId, assignedUserId } = req.body;
        const lead = await prisma.lead.create({
            data: {
                name,
                email,
                phone,
                source,
                status,
                campaignId,
                assignedUserId
            }
        });
        res.status(201).json(lead);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create lead' });
    }
};
exports.createLead = createLead;
// Update a lead
const updateLead = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        // const data = req.body; // Remove duplicate
        const lead = await prisma.lead.update({
            where: { id: id },
            data: data
        });
        res.json(lead);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update lead' });
    }
};
exports.updateLead = updateLead;
// Delete a lead
const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.lead.delete({
            where: { id: id }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete lead' });
    }
};
exports.deleteLead = deleteLead;
// Update lead stage (Kanban specific)
const updateLeadStage = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expecting LeadStatus enum value
        // Validate status if needed, or trust TS/Prisma to throw if invalid
        const lead = await prisma.lead.update({
            where: { id: id },
            data: { status: status }
        });
        res.json(lead);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update lead stage' });
    }
};
exports.updateLeadStage = updateLeadStage;
