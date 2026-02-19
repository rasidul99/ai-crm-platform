import { Router } from 'express';
import { getLeads, createLead, updateLead, deleteLead, updateLeadStage } from '../controllers/leadController';

const router = Router();

router.get('/', getLeads);
router.post('/', createLead);
router.patch('/:id', updateLead);
router.delete('/:id', deleteLead);
router.patch('/:id/stage', updateLeadStage);

export default router;
