import { apiRequest } from '@/lib/api';
import { logger } from '@/utils/logger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FeedPhoto {
  id: string;
  uri: string;
  thumbnailUri: string | null;
  blurhash: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
  };
  studentIds: string[];
}

export interface FeedPage {
  photos: FeedPhoto[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface PhotoDetails extends FeedPhoto {
  originalFilename: string | null;
  mimeType: string;
  fileSizeBytes: number | null;
  className: string | null;
  schoolName: string | null;
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Fetch the parent feed.
 *
 * The cursor format is `{created_at}_{id}` and is returned by the API
 * as `nextCursor` in each response page.
 */
export async function getFeed(
  studentId?: string,
  cursor?: string,
  limit: number = 20,
): Promise<FeedPage> {
  const params = new URLSearchParams();

  if (studentId) {
    params.append('studentId', studentId);
  }
  if (cursor) {
    params.append('cursor', cursor);
  }
  params.append('limit', String(limit));

  const query = params.toString();
  const endpoint = `/feed${query ? `?${query}` : ''}`;

  logger.debug('parentService.getFeed', { studentId, cursor, limit });

  return apiRequest<FeedPage>(endpoint);
}

/**
 * Fetch detailed information about a single photo.
 */
export async function getPhotoDetails(photoId: string): Promise<PhotoDetails> {
  logger.debug('parentService.getPhotoDetails', { photoId });

  return apiRequest<PhotoDetails>(`/feed/photos/${photoId}`);
}
