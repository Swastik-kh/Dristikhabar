
export type UserRole = 'pradhan-sampadak' | 'sampadak' | 'reporter';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type NewsStatus = 'draft' | 'pending' | 'published';

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  featuredImage: string;
  videoUrl?: string; // Added videoUrl field
  authorId: string;
  authorName: string;
  status: NewsStatus;
  isBreaking: boolean;
  views: number;
  publishedAt: any; // Firebase Timestamp or ISO
  audioUrl?: string;
  seo?: {
    title: string;
    description: string;
  }
  showAuthorName?: boolean; // New: Per-news item setting for author name visibility
}

export interface BSDate {
  year: number;
  month: number;
  day: number;
  dayName: string;
  monthName: string;
}