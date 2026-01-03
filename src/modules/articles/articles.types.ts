// Sanity article structure (adjust based on your schema)
export interface SanityArticle {
  _id: string;
  title: string;
  slug: string;
  author?: string;
  _type?: string; // Optional in case some articles don't have type set
  _createdAt: string;
  _updatedAt: string;
}

// Database article structure
export interface Article {
  id: string;
  sanityId: string;
  title: string;
  slug: string;
  author: string | null;
  type: string;
  isPost: boolean;
  visibility: 'public' | 'private';
  isEditorsPick: boolean;
  lastSyncedAt: Date;
  createdAt: Date;
}

// Admin list response
export interface ArticleListItem {
  id: string;
  sanityId: string;
  title: string;
  slug: string;
  author: string | null;
  type: string;
  isPost: boolean;
  visibility: 'public' | 'private';
  isEditorsPick: boolean;
  lastSyncedAt: Date;
}

// Update visibility request
export interface UpdateVisibilityRequest {
  visibility: 'public' | 'private';
}

// Sync result
export interface SyncResult {
  created: number;
  updated: number;
  total: number;
}