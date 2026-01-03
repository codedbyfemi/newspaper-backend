import { Request, Response } from 'express';
import { ArticlesService } from './articles.service';
import { ResponseUtil } from '../../utils/response.util';
import { UpdateVisibilityRequest } from './articles.types';

const articlesService = new ArticlesService();

export class ArticlesController {
  /**
   * POST /admin/articles/sync
   * Manual sync from Sanity
   */
  async syncArticles(req: Request, res: Response) {
    try {
      const result = await articlesService.syncFromSanity();
      return ResponseUtil.success(res, {
        message: 'Articles synced successfully',
        ...result,
      }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * GET /admin/articles
   * List all articles (admin view)
   */
  async listArticles(req: Request, res: Response) {
    try {
      const articles = await articlesService.listArticles();
      return ResponseUtil.success(res, { articles }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch articles';
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * PATCH /admin/articles/:id/visibility
   * Update article visibility
   */
  async updateVisibility(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { visibility } = req.body as UpdateVisibilityRequest;

      if (!visibility || !['public', 'private'].includes(visibility)) {
        return ResponseUtil.error(res, 'Invalid visibility value. Must be "public" or "private"', 400);
      }

      const article = await articlesService.updateVisibility(id, visibility);
      return ResponseUtil.success(res, { article }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update visibility';
      
      if (message === 'Article not found') {
        return ResponseUtil.error(res, message, 404);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * POST /admin/articles/:id/editors-pick
   * Set article as Editor's Pick (exclusive)
   */
  async setEditorsPick(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const article = await articlesService.setEditorsPick(id);
      return ResponseUtil.success(res, { 
        message: "Article set as Editor's Pick",
        article 
      }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to set Editor's Pick";
      
      if (message === 'Article not found') {
        return ResponseUtil.error(res, message, 404);
      }

      if (message === 'Only posts can be set as Editor\'s Pick') {
        return ResponseUtil.error(res, message, 400);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * GET /articles
   * Get public articles (frontend)
   */
  async getPublicArticles(req: Request, res: Response) {
    try {
      const articles = await articlesService.getPublicArticles();
      return ResponseUtil.success(res, { articles }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch articles';
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * GET /articles/:slug
   * Get single public article by slug
   */
  async getPublicArticleBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const article = await articlesService.getPublicArticleBySlug(slug);
      return ResponseUtil.success(res, { article }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch article';
      
      if (message === 'Article not found') {
        return ResponseUtil.error(res, message, 404);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }
}