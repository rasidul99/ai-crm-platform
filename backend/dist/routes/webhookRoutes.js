"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhookController_1 = require("../controllers/webhookController");
const router = (0, express_1.Router)();
router.get('/', webhookController_1.verifyWebhook);
router.post('/', webhookController_1.handleWebhookEvent);
exports.default = router;
