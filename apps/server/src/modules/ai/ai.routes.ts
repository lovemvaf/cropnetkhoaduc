import { Router } from 'express';
import { 
  handleChat, 
  handleRecommendBudget, 
  handleGetSeasonalCalendar, 
  handleGetCooperatives, 
  handleDraftRfq 
} from './ai.controller';

const router = Router();

router.post('/chat', handleChat);
router.post('/recommend-budget', handleRecommendBudget);
router.get('/seasonal-calendar', handleGetSeasonalCalendar);
router.get('/cooperatives', handleGetCooperatives);
router.post('/draft-rfq', handleDraftRfq);

export default router;
