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

const PHOTOS_BUCKET = 'photos';

/**
 * Request a photo slot from the backend (Supabase Storage). Returns photoId and
 * storage path; the app then uploads the file via uploadPhotoToSupabaseStorage.
 */
export async function requestUploadUrl(data: UploadUrlRequest): Promise<UploadUrlResponse> {
  return apiRequest<UploadUrlResponse>('/photos/upload-url', {
    method: 'POST',
    body: data,
  });
}

/**
 * Upload file to Supabase Storage. Call after requestUploadUrl; then call confirmUpload.
 */
export async function uploadPhotoToSupabaseStorage(
  storagePath: string,
  localUri: string,
  contentType: string,
): Promise<void> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(storagePath, blob, {
    contentType,
    upsert: true,
  });
  if (error) {
    logger.error('Supabase Storage upload failed', { error: error.message, storagePath });
    throw error;
  }
}

/**
 * Confirm that the upload to Supabase Storage has completed and the photo is ready.
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
