import { Router } from 'express';
import { triggerScrapeAndOutreach } from '../controllers/automationController';

const router = Router();

// POST /api/automation/scrape
router.post('/scrape', triggerScrapeAndOutreach);

export default router;
