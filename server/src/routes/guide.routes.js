import { Router } from 'express';
import {
  getAllGuides,
  getGuideById,
} from '../controllers/guide.controller.js';

const router = Router();


router.route('/').get(getAllGuides);
router.route('/:guideId').get(getGuideById);

export default router;