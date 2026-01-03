import { createClient } from '@sanity/client';
import { env } from './env';

export const sanityClient = createClient({
  projectId: env.SANITY_PROJECT_ID,
  dataset: env.SANITY_DATASET,
  apiVersion: env.SANITY_API_VERSION,
  token: env.SANITY_TOKEN,
  useCdn: false, // Use CDN for production, false for real-time data
});

/**
 * GROQ query to fetch articles from Sanity
 * Adjust fields based on your Sanity schema
 */
export const ARTICLES_QUERY = `
  *[_type in ["post", "opinion"]] | order(_createdAt desc) {
    _id,
    _type,
    title,
    "slug": slug.current,
    "author": author->name,
    _createdAt,
    _updatedAt
  }
`;