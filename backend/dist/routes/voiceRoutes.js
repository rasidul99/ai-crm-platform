"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const voiceController_1 = require("../controllers/voiceController");
const router = (0, express_1.Router)();
router.post('/webhook', voiceController_1.handleVoiceWebhook);
router.get('/config', voiceController_1.getAssistantConfig);
exports.default = router;
