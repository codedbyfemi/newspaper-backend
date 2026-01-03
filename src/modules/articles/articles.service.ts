import prisma from '../../config/database';
import { sanityClient, ARTICLES_QUERY } from '../../config/sanity';
import { SanityArticle, SyncResult } from './articles.types';

export class ArticlesService {
  /**
   * Fetch articles from Sanity and sync to database
   */
  async syncFromSanity(): Promise<SyncResult> {
    // Fetch articles from Sanity
    const sanityArticles: SanityArticle[] = await sanityClient.fetch(ARTICLES_QUERY);

    let created = 0;
    let updated = 0;

    for (const sanityArticle of sanityArticles) {
      const existingArticle = await prisma.article.findUnique({
        where: { sanityId: sanityArticle._id },
      });

      if (!existingArticle) {
        // Create new article
        await prisma.article.create({
          data: {
            sanityId: sanityArticle._id,
            title: sanityArticle.title,
            slug: sanityArticle.slug,
            author: sanityArticle.author || null,
            visibility: 'private', // Default to private
            isEditorsPick: false,
            lastSyncedAt: new Date(),
          },
        });
        created++;
      } else {
        // Update existing article metadata (preserve visibility and editor's pick)
        await prisma.article.update({
          where: { sanityId: sanityArticle._id },
          data: {
            title: sanityArticle.title,
            slug: sanityArticle.slug,
            author: sanityArticle.author || null,
            lastSyncedAt: new Date(),
          },
        });
        updated++;
      }
    }

    return {
      created,
      updated,
      total: sanityArticles.length,
    };
  }

  /**
   * List all articles (admin view)
   */
  async listArticles() {
    return prisma.article.findMany({
      orderBy: { lastSyncedAt: 'desc' },
      select: {
        id: true,
        sanityId: true,
        title: true,
        slug: true,
        author: true,
        visibility: true,
        isEditorsPick: true,
        lastSyncedAt: true,
      },
    });
  }

  /**
   * Update article visibility
   */
  async updateVisibility(articleId: string, visibility: 'public' | 'private') {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    return prisma.article.update({
      where: { id: articleId },
      data: { visibility },
    });
  }

  /**
   * Set article as Editor's Pick (exclusive - only one at a time)
   */
  async setEditorsPick(articleId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    // Use transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      // Unset previous editor's pick
      await tx.article.updateMany({
        where: { isEditorsPick: true },
        data: { isEditorsPick: false },
      });

      // Set new editor's pick
      return tx.article.update({
        where: { id: articleId },
        data: { isEditorsPick: true },
      });
    });
  }

  /**
   * Get public articles (for frontend)
   */
  async getPublicArticles() {
    return prisma.article.findMany({
      where: { visibility: 'public' },
      orderBy: { lastSyncedAt: 'desc' },
      select: {
        id: true,
        sanityId: true,
        title: true,
        slug: true,
        author: true,
        isEditorsPick: true,
        lastSyncedAt: true,
      },
    });
  }

  /**
   * Get single public article by slug
   */
  async getPublicArticleBySlug(slug: string) {
    const article = await prisma.article.findUnique({
      where: { slug, visibility: 'public' },
      select: {
        id: true,
        sanityId: true,
        title: true,
        slug: true,
        author: true,
        isEditorsPick: true,
        lastSyncedAt: true,
      },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    return article;
  }
}