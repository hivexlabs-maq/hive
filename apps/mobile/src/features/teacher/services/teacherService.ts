import { apiRequest } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import type { StudentItem } from '@/components/forms/StudentTagger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UploadUrlRequest {
  classId: string;
  filename: string;
  contentType: string;
  fileSize: number;
  sha256Hash: string;
}

export interface UploadUrlResponse {
  photoId: string;
  uploadUrl: string;
  s3Key: string;
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * Request a presigned S3 upload URL from the backend.
 */
export async function requestUploadUrl(data: UploadUrlRequest): Promise<UploadUrlResponse> {
  return apiRequest<UploadUrlResponse>('/photos/upload-url', {
    method: 'POST',
    body: data,
  });
}

/**
 * Confirm that the upload to S3 has completed and the photo record can be
 * marked as available.
 */
export async function confirmUpload(photoId: string): Promise<void> {
  await apiRequest(`/photos/${photoId}/confirm`, {
    method: 'POST',
  });
}

/**
 * Tag students in a photo.
 */
export async function tagStudents(
  photoId: string,
  studentIds: string[],
): Promise<void> {
  await apiRequest(`/photos/${photoId}/tag`, {
    method: 'POST',
    body: { studentIds },
  });
}

/**
 * Fetch students belonging to a particular class from supabase.
 */
export async function getClassStudents(classId: string): Promise<StudentItem[]> {
  const { data, error } = await supabase
    .from('students')
    .select('id, name, avatar_url')
    .eq('class_id', classId)
    .order('name', { ascending: true });

  if (error) {
    logger.error('Failed to fetch class students:', error);
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url ?? null,
  }));
}
