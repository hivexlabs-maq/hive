import { v4 as uuidv4 } from 'uuid';
import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { supabaseAdmin } from '../config/supabase';
import { s3Client, s3Bucket } from '../config/s3';
import { logger } from '../config/logger';
import { generateUploadUrl, generateViewUrl } from '../utils/signedUrl';
import { AppError } from '../middleware/errorHandler';
import { imageProcessingQueue } from '../jobs/imageProcessor.job';
import type { RequestUploadInput, GetPhotosInput } from '../validators/photo.validator';

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
};

interface UploadResult {
  photoId: string;
  uploadUrl: string;
  s3Key: string;
}

interface PhotoWithUrl {
  id: string;
  s3_key: string;
  thumbnail_s3_key: string | null;
  blurhash: string | null;
  width: number | null;
  height: number | null;
  status: string;
  created_at: string;
  uploaded_by: string;
  class_id: string;
  url: string;
  thumbnailUrl: string | null;
}

interface PaginatedPhotos {
  photos: PhotoWithUrl[];
  nextCursor: string | null;
}

export async function requestUpload(
  userId: string,
  data: RequestUploadInput,
): Promise<UploadResult> {
  // 1. Look up the user's school
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('school_id')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.school_id) {
    throw new AppError('User school not found', 404, 'SCHOOL_NOT_FOUND');
  }

  const schoolId = profile.school_id;

  // 2. Check for SHA-256 duplicate in same class
  const { data: existing } = await supabaseAdmin
    .from('photos')
    .select('id')
    .eq('class_id', data.classId)
    .eq('sha256_hash', data.sha256Hash)
    .limit(1)
    .single();

  if (existing) {
    throw new AppError(
      'A photo with this hash already exists in this class',
      409,
      'DUPLICATE_PHOTO',
    );
  }

  // 3. Verify teacher belongs to the class's school
  const { data: classRecord, error: classError } = await supabaseAdmin
    .from('classes')
    .select('school_id')
    .eq('id', data.classId)
    .single();

  if (classError || !classRecord) {
    throw new AppError('Class not found', 404, 'CLASS_NOT_FOUND');
  }

  if (classRecord.school_id !== schoolId) {
    throw new AppError(
      'You do not have permission to upload to this class',
      403,
      'FORBIDDEN',
    );
  }

  // 4. Generate S3 key
  const ext = CONTENT_TYPE_TO_EXT[data.contentType] ?? 'jpg';
  const photoId = uuidv4();
  const s3Key = `photos/${schoolId}/${data.classId}/${photoId}.${ext}`;

  // 5. Generate presigned upload URL
  const uploadUrl = await generateUploadUrl(s3Key, data.contentType);

  // 6. Create photo record
  const { error: insertError } = await supabaseAdmin.from('photos').insert({
    id: photoId,
    s3_key: s3Key,
    class_id: data.classId,
    school_id: schoolId,
    uploaded_by: userId,
    status: 'processing',
    filename: data.filename,
    content_type: data.contentType,
    file_size: data.fileSize,
    sha256_hash: data.sha256Hash,
  });

  if (insertError) {
    logger.error('Failed to create photo record', {
      error: insertError.message,
      photoId,
    });
    throw new AppError('Failed to create photo record', 500, 'INSERT_FAILED');
  }

  logger.info('Upload requested', { photoId, s3Key, userId });

  return { photoId, uploadUrl, s3Key };
}

export async function confirmUpload(photoId: string): Promise<void> {
  // 1. Get photo record
  const { data: photo, error: photoError } = await supabaseAdmin
    .from('photos')
    .select('s3_key, status')
    .eq('id', photoId)
    .single();

  if (photoError || !photo) {
    throw new AppError('Photo not found', 404, 'PHOTO_NOT_FOUND');
  }

  if (photo.status !== 'processing') {
    throw new AppError(
      `Photo is already in '${photo.status}' state`,
      400,
      'INVALID_STATE',
    );
  }

  // 2. Verify photo exists in S3
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: s3Bucket,
        Key: photo.s3_key,
      }),
    );
  } catch {
    throw new AppError(
      'Photo file not found in storage. Please upload the file first.',
      404,
      'FILE_NOT_FOUND',
    );
  }

  // 3. Queue image processing job
  await (imageProcessingQueue as any).add(
    'process-image',
    { photoId, s3Key: photo.s3_key },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  logger.info('Upload confirmed, processing queued', { photoId });
}

export async function tagStudents(
  userId: string,
  photoId: string,
  studentIds: string[],
): Promise<void> {
  // 1. Verify photo exists
  const { data: photo, error: photoError } = await supabaseAdmin
    .from('photos')
    .select('school_id')
    .eq('id', photoId)
    .single();

  if (photoError || !photo) {
    throw new AppError('Photo not found', 404, 'PHOTO_NOT_FOUND');
  }

  // 2. Verify user (teacher) is at the same school
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('school_id')
    .eq('id', userId)
    .single();

  if (!profile || profile.school_id !== photo.school_id) {
    throw new AppError(
      'You can only tag students in photos from your school',
      403,
      'FORBIDDEN',
    );
  }

  // 3. Verify all students belong to the same school
  const { data: students, error: studentsError } = await supabaseAdmin
    .from('students')
    .select('id')
    .in('id', studentIds)
    .eq('school_id', photo.school_id);

  if (studentsError) {
    throw new AppError('Failed to verify students', 500, 'QUERY_FAILED');
  }

  const validStudentIds = new Set(students?.map((s) => s.id) ?? []);
  const invalidIds = studentIds.filter((id) => !validStudentIds.has(id));

  if (invalidIds.length > 0) {
    throw new AppError(
      `Students not found at this school: ${invalidIds.join(', ')}`,
      400,
      'INVALID_STUDENTS',
    );
  }

  // 4. Insert photo_student_tags (upsert to avoid duplicates)
  const tags = studentIds.map((studentId) => ({
    photo_id: photoId,
    student_id: studentId,
    tagged_by: userId,
  }));

  const { error: tagError } = await supabaseAdmin
    .from('photo_student_tags')
    .upsert(tags, {
      onConflict: 'photo_id,student_id',
      ignoreDuplicates: true,
    });

  if (tagError) {
    logger.error('Failed to tag students', {
      error: tagError.message,
      photoId,
    });
    throw new AppError('Failed to tag students', 500, 'TAG_FAILED');
  }

  logger.info('Students tagged', {
    photoId,
    studentCount: studentIds.length,
    userId,
  });
}

export async function getPhotosByClass(
  classId: string,
  cursor?: string,
  limit: number = 20,
): Promise<PaginatedPhotos> {
  let query = supabaseAdmin
    .from('photos')
    .select('id, s3_key, thumbnail_s3_key, blurhash, width, height, status, created_at, uploaded_by, class_id')
    .eq('class_id', classId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1);

  // Cursor-based pagination using (created_at, id)
  if (cursor) {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString());
      query = query.or(
        `created_at.lt.${decoded.createdAt},and(created_at.eq.${decoded.createdAt},id.lt.${decoded.id})`,
      );
    } catch {
      throw new AppError('Invalid cursor', 400, 'INVALID_CURSOR');
    }
  }

  const { data: photos, error } = await query;

  if (error) {
    logger.error('Failed to fetch photos', { error: error.message, classId });
    throw new AppError('Failed to fetch photos', 500, 'QUERY_FAILED');
  }

  const hasNext = (photos?.length ?? 0) > limit;
  const results = photos?.slice(0, limit) ?? [];

  // Generate signed URLs
  const photosWithUrls: PhotoWithUrl[] = await Promise.all(
    results.map(async (photo) => {
      const url = await generateViewUrl(photo.s3_key);
      const thumbnailUrl = photo.thumbnail_s3_key
        ? await generateViewUrl(photo.thumbnail_s3_key)
        : null;

      return { ...photo, url, thumbnailUrl };
    }),
  );

  const nextCursor = hasNext && results.length > 0
    ? Buffer.from(
        JSON.stringify({
          createdAt: results[results.length - 1].created_at,
          id: results[results.length - 1].id,
        }),
      ).toString('base64url')
    : null;

  return { photos: photosWithUrls, nextCursor };
}

export async function getParentFeed(
  parentId: string,
  childId?: string,
  cursor?: string,
  limit: number = 20,
): Promise<PaginatedPhotos> {
  // 1. Get parent's student IDs
  let studentQuery = supabaseAdmin
    .from('parent_student_links')
    .select('student_id')
    .eq('parent_id', parentId);

  if (childId) {
    studentQuery = studentQuery.eq('student_id', childId);
  }

  const { data: links, error: linksError } = await studentQuery;

  if (linksError) {
    throw new AppError('Failed to fetch student links', 500, 'QUERY_FAILED');
  }

  const studentIds = links?.map((l) => l.student_id) ?? [];

  if (studentIds.length === 0) {
    return { photos: [], nextCursor: null };
  }

  // 2. Query photos tagged with those students
  let query = supabaseAdmin
    .from('photo_student_tags')
    .select(
      'photo_id, photos!inner(id, s3_key, thumbnail_s3_key, blurhash, width, height, status, created_at, uploaded_by, class_id)',
    )
    .in('student_id', studentIds)
    .eq('photos.status', 'ready')
    .order('photos(created_at)', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString());
      query = query.or(
        `photos.created_at.lt.${decoded.createdAt},and(photos.created_at.eq.${decoded.createdAt},photos.id.lt.${decoded.id})`,
      );
    } catch {
      throw new AppError('Invalid cursor', 400, 'INVALID_CURSOR');
    }
  }

  const { data: tags, error } = await query;

  if (error) {
    logger.error('Failed to fetch parent feed', {
      error: error.message,
      parentId,
    });
    throw new AppError('Failed to fetch feed', 500, 'QUERY_FAILED');
  }

  // Deduplicate photos (a photo may be tagged with multiple children)
  const seenIds = new Set<string>();
  const uniquePhotos: Array<Record<string, unknown>> = [];

  for (const tag of tags ?? []) {
    const photo = tag.photos as unknown as Record<string, unknown>;
    if (photo && !seenIds.has(photo.id as string)) {
      seenIds.add(photo.id as string);
      uniquePhotos.push(photo);
    }
  }

  const hasNext = uniquePhotos.length > limit;
  const results = uniquePhotos.slice(0, limit);

  const photosWithUrls: PhotoWithUrl[] = await Promise.all(
    results.map(async (photo) => {
      const url = await generateViewUrl(photo.s3_key as string);
      const thumbnailUrl = photo.thumbnail_s3_key
        ? await generateViewUrl(photo.thumbnail_s3_key as string)
        : null;

      return {
        id: photo.id as string,
        s3_key: photo.s3_key as string,
        thumbnail_s3_key: photo.thumbnail_s3_key as string | null,
        blurhash: photo.blurhash as string | null,
        width: photo.width as number | null,
        height: photo.height as number | null,
        status: photo.status as string,
        created_at: photo.created_at as string,
        uploaded_by: photo.uploaded_by as string,
        class_id: photo.class_id as string,
        url,
        thumbnailUrl,
      };
    }),
  );

  const nextCursor =
    hasNext && results.length > 0
      ? Buffer.from(
          JSON.stringify({
            createdAt: results[results.length - 1].created_at,
            id: results[results.length - 1].id,
          }),
        ).toString('base64url')
      : null;

  return { photos: photosWithUrls, nextCursor };
}
