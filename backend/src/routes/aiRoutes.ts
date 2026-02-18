import { Router } from "express";
import { aiController } from "../controllers/aiController";

const router = Router();

router.post('/generate-email', aiController.generateEmail);
router.post('/analyze-lead', aiController.analyzeLead);

export default router;
