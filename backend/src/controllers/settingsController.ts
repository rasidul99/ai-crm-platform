import { Request, Response } from 'express';
import { SettingsService } from '../services/settingsService';

export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await SettingsService.getAll();
        // Mask sensitive keys if needed, but for now sending raw for editing
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const { key, value } = req.body;
        if (!key || !value) {
            return res.status(400).json({ error: 'Key and value are required' });
        }
        await SettingsService.set(key, value);
        res.json({ success: true, key, value });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
