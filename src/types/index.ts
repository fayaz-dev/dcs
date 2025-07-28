export interface ForemUser {
  id: number;
  name: string;
  username: string;
  profile_image: string;
  profile_image_90: string;
}

export interface ForemOrganization {
  name: string;
  username: string;
  slug: string;
  profile_image: string;
  profile_image_90: string;
}

export interface ForemArticle {
  id: number;
  title: string;
  description: string;
  readable_publish_date: string;
  slug: string;
  path: string;
  url: string;
  comments_count: number;
  public_reactions_count: number;
  collection_id?: number;
  published_timestamp: string;
  positive_reactions_count: number;
  cover_image?: string;
  social_image: string;
  canonical_url: string;
  created_at: string;
  edited_at?: string;
  crossposted_at?: string;
  published_at: string;
  last_comment_at: string;
  reading_time_minutes: number;
  tag_list: string[];
  tags: string;
  user: ForemUser;
  organization?: ForemOrganization;
  body_html?: string;
  body_markdown?: string;
}

export interface TagData {
  tag: string;
  submissions: ForemArticle[];
  announcements?: ForemArticle[];
  fetchedAt: string;
}

export interface AppState {
  selectedTag: string | null;
  availableTags: string[];
  loading: boolean;
  error: string | null;
}
