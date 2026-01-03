import { Router } from 'express';
import { ArticlesController } from './articles.controller';

const router = Router();
const articlesController = new ArticlesController();

// Public routes (no auth required)
router.get('/', (req, res) => articlesController.getPublicArticles(req, res));
router.get('/:slug', (req, res) => articlesController.getPublicArticleBySlug(req, res));

export default router;