import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Get all leads
// Get all leads with pagination and filtering
export const getLeads = async (req: Request, res: Response): Promise<void> => {
    try {
        const limit = req.query.limit ? Number(req.query.limit as string) : 50;
        const offset = req.query.offset ? Number(req.query.offset as string) : 0;
        const status = req.query.status as string | undefined;

        const where: any = {};
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
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
};

// Create a new lead
export const createLead = async (req: Request, res: Response): Promise<void> => {
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
    } catch (error) {
        res.status(500).json({ error: 'Failed to create lead' });
    }
};

// Update a lead
export const updateLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = req.body;
        // const data = req.body; // Remove duplicate
        const lead = await prisma.lead.update({
            where: { id: id as string },
            data: data as any
        });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update lead' });
    }
};

// Delete a lead
export const deleteLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.lead.delete({
            where: { id: id as string }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete lead' });
    }
};

// Update lead stage (Kanban specific)
export const updateLeadStage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expecting LeadStatus enum value

        // Validate status if needed, or trust TS/Prisma to throw if invalid

        const lead = await prisma.lead.update({
            where: { id: id as string },
            data: { status: status as any }
        });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update lead stage' });
    }
};
