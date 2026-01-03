import { Router } from 'express';
import { ArticlesController } from './articles.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const articlesController = new ArticlesController();

// Admin routes (protected)
router.post('/sync', authMiddleware, (req, res) => articlesController.syncArticles(req, res));
router.get('/', authMiddleware, (req, res) => articlesController.listArticles(req, res));
router.patch('/:id/visibility', authMiddleware, (req, res) => articlesController.updateVisibility(req, res));
router.post('/:id/editors-pick', authMiddleware, (req, res) => articlesController.setEditorsPick(req, res));

export default router;