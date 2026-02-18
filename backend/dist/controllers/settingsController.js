"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const settingsService_1 = require("../services/settingsService");
const getSettings = async (req, res) => {
    try {
        const settings = await settingsService_1.SettingsService.getAll();
        // Mask sensitive keys if needed, but for now sending raw for editing
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || !value) {
            return res.status(400).json({ error: 'Key and value are required' });
        }
        await settingsService_1.SettingsService.set(key, value);
        res.json({ success: true, key, value });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
exports.updateSettings = updateSettings;
