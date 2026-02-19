import { Router } from "express";
import { aiController } from "../controllers/aiController";

const router = Router();

router.post('/generate-email', aiController.generateEmail);
router.post('/analyze-lead', aiController.analyzeLead);
router.post('/score-lead', aiController.scoreLead);
router.post('/plan-call', aiController.planCall);

export default router;
