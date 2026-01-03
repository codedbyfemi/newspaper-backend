import { Router } from 'express';
import { CommunitiesController } from './communities.controller';

const router = Router();
const communitiesController = new CommunitiesController();

// Public routes (no auth required)
router.get('/', (req, res) => 
  communitiesController.getPublicCommunities(req, res)
);
router.get('/:slug', (req, res) => 
  communitiesController.getPublicCommunityBySlug(req, res)
);

// Public member management routes (OTP-based)
router.post('/:communityId/join/request', (req, res) => 
  communitiesController.requestJoin(req, res)
);
router.post('/:communityId/join/verify', (req, res) => 
  communitiesController.verifyJoin(req, res)
);
router.post('/:communityId/leave/request', (req, res) => 
  communitiesController.requestLeave(req, res)
);
router.post('/:communityId/leave/verify', (req, res) => 
  communitiesController.verifyLeave(req, res)
);

export default router;