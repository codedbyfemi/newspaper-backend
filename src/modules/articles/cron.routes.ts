import { Router } from 'express';
import { ArticlesController } from './articles.controller';

const router = Router();
const articlesController = new ArticlesController();

/**
 * POST /internal/articles/sync
 * Internal cron endpoint for automatic syncing
 * Should be protected by IP allowlist or secret token in production
 */
router.post('/sync', (req, res) => articlesController.syncArticles(req, res));

export default router;