"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const automationController_1 = require("../controllers/automationController");
const router = (0, express_1.Router)();
// POST /api/automation/scrape
router.post('/scrape', automationController_1.triggerScrapeAndOutreach);
exports.default = router;
