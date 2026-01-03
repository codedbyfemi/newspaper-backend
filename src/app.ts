import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import articleRoutes from './modules/articles/articles.routes';
import publicArticleRoutes from './modules/articles/public.routes';
import cronArticleRoutes from './modules/articles/cron.routes';
import communityRoutes from './modules/communities/communities.routes';
import publicCommunityRoutes from './modules/communities/public.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/admin/auth', authRoutes);
app.use('/admin/articles', articleRoutes);
app.use('/admin/communities', communityRoutes);
app.use('/articles', publicArticleRoutes);
app.use('/communities', publicCommunityRoutes);
app.use('/internal/articles', cronArticleRoutes);

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;