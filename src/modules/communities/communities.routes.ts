import { Router } from 'express';
import { CommunitiesController } from './communities.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const communitiesController = new CommunitiesController();

// Admin routes - Community Submissions
router.get('/submissions', authMiddleware, (req, res) => 
  communitiesController.listSubmissions(req, res)
);
router.get('/submissions/:id', authMiddleware, (req, res) => 
  communitiesController.getSubmission(req, res)
);
router.post('/submissions/:id/approve', authMiddleware, (req, res) => 
  communitiesController.approveSubmission(req, res)
);
router.post('/submissions/:id/reject', authMiddleware, (req, res) => 
  communitiesController.rejectSubmission(req, res)
);

// Admin routes - Communities
router.get('/', authMiddleware, (req, res) => 
  communitiesController.listCommunities(req, res)
);
router.get('/:id', authMiddleware, (req, res) => 
  communitiesController.getCommunity(req, res)
);

// Admin routes - Member Management
router.post('/:id/members', authMiddleware, (req, res) => 
  communitiesController.addMember(req, res)
);
router.patch('/:communityId/members/:memberId', authMiddleware, (req, res) => 
  communitiesController.updateMember(req, res)
);
router.delete('/:communityId/members/:memberId', authMiddleware, (req, res) => 
  communitiesController.removeMember(req, res)
);

export default router;