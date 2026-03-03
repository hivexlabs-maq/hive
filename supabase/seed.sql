-- =============================================================================
-- Seed Data for Hive (Development / Demo)
-- =============================================================================
-- NOTE: In production, profiles are created via the auth signup flow and a
-- database trigger or Edge Function. This seed data simulates that flow
-- by inserting directly. The auth.users entries would need to exist first
-- in a real Supabase instance.
--
-- These UUIDs are deterministic so they can be referenced in tests.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. DEMO SCHOOL
-- ---------------------------------------------------------------------------

INSERT INTO schools (id, name, address, phone) VALUES
    ('a0000000-0000-4000-8000-000000000001',
     'Sunshine Preschool',
     '123 Rainbow Lane, Happy Valley, CA 94000',
     '(555) 123-4567');

-- ---------------------------------------------------------------------------
-- 2. DEMO PROFILES
-- ---------------------------------------------------------------------------
-- NOTE: In a real environment these IDs must match auth.users entries.
-- For seeding purposes we insert directly. If running against a live
-- Supabase instance, create the auth users first, then update these IDs.
-- ---------------------------------------------------------------------------

-- Teacher
INSERT INTO profiles (id, email, full_name, role, school_id) VALUES
    ('b0000000-0000-4000-8000-000000000001',
     'teacher.sarah@sunshine.edu',
     'Sarah Johnson',
     'teacher',
     'a0000000-0000-4000-8000-000000000001');

-- Parent 1
INSERT INTO profiles (id, email, full_name, role, school_id) VALUES
    ('c0000000-0000-4000-8000-000000000001',
     'parent.mike@example.com',
     'Mike Thompson',
     'parent',
     'a0000000-0000-4000-8000-000000000001');

-- Parent 2
INSERT INTO profiles (id, email, full_name, role, school_id) VALUES
    ('c0000000-0000-4000-8000-000000000002',
     'parent.lisa@example.com',
     'Lisa Chen',
     'parent',
     'a0000000-0000-4000-8000-000000000001');

-- ---------------------------------------------------------------------------
-- 3. DEMO CLASSES
-- ---------------------------------------------------------------------------

INSERT INTO classes (id, school_id, name, grade, teacher_id, academic_year) VALUES
    ('d0000000-0000-4000-8000-000000000001',
     'a0000000-0000-4000-8000-000000000001',
     'Butterflies',
     'Pre-K',
     'b0000000-0000-4000-8000-000000000001',
     '2025-2026'),
    ('d0000000-0000-4000-8000-000000000002',
     'a0000000-0000-4000-8000-000000000001',
     'Ladybugs',
     'Toddlers',
     'b0000000-0000-4000-8000-000000000001',
     '2025-2026');

-- ---------------------------------------------------------------------------
-- 4. DEMO STUDENTS
-- ---------------------------------------------------------------------------

-- Emma Thompson (Mike's daughter) - in Butterflies
INSERT INTO students (id, school_id, class_id, full_name, date_of_birth) VALUES
    ('e0000000-0000-4000-8000-000000000001',
     'a0000000-0000-4000-8000-000000000001',
     'd0000000-0000-4000-8000-000000000001',
     'Emma Thompson',
     '2021-03-15');

-- Liam Thompson (Mike's son) - in Ladybugs
INSERT INTO students (id, school_id, class_id, full_name, date_of_birth) VALUES
    ('e0000000-0000-4000-8000-000000000002',
     'a0000000-0000-4000-8000-000000000001',
     'd0000000-0000-4000-8000-000000000002',
     'Liam Thompson',
     '2022-07-22');

-- Mei Chen (Lisa's daughter) - in Butterflies
INSERT INTO students (id, school_id, class_id, full_name, date_of_birth) VALUES
    ('e0000000-0000-4000-8000-000000000003',
     'a0000000-0000-4000-8000-000000000001',
     'd0000000-0000-4000-8000-000000000001',
     'Mei Chen',
     '2021-09-10');

-- ---------------------------------------------------------------------------
-- 5. PARENT-STUDENT MAPPINGS
-- ---------------------------------------------------------------------------

-- Mike is parent of Emma and Liam
INSERT INTO parent_student_mappings (parent_id, student_id, relationship) VALUES
    ('c0000000-0000-4000-8000-000000000001',
     'e0000000-0000-4000-8000-000000000001',
     'parent'),
    ('c0000000-0000-4000-8000-000000000001',
     'e0000000-0000-4000-8000-000000000002',
     'parent');

-- Lisa is parent of Mei
INSERT INTO parent_student_mappings (parent_id, student_id, relationship) VALUES
    ('c0000000-0000-4000-8000-000000000002',
     'e0000000-0000-4000-8000-000000000003',
     'parent');

-- ---------------------------------------------------------------------------
-- 6. DEMO PHOTOS
-- ---------------------------------------------------------------------------

-- Photo 1: Butterflies class - art time (both Emma and Mei visible)
INSERT INTO photos (id, school_id, class_id, uploaded_by, s3_key, thumbnail_s3_key,
                    original_filename, mime_type, file_size_bytes, width, height,
                    sha256_hash, caption, status) VALUES
    ('f0000000-0000-4000-8000-000000000001',
     'a0000000-0000-4000-8000-000000000001',
     'd0000000-0000-4000-8000-000000000001',
     'b0000000-0000-4000-8000-000000000001',
     'schools/a0000000/photos/f0000001-art-time.jpg',
     'schools/a0000000/thumbs/f0000001-art-time.jpg',
     'IMG_2025_art_time.jpg',
     'image/jpeg',
     2457600,
     4032,
     3024,
     'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd',
     'Art time in Butterflies class! The kids loved finger painting today.',
     'ready');

-- Photo 2: Butterflies class - story time (only Emma visible)
INSERT INTO photos (id, school_id, class_id, uploaded_by, s3_key, thumbnail_s3_key,
                    original_filename, mime_type, file_size_bytes, width, height,
                    sha256_hash, caption, status) VALUES
    ('f0000000-0000-4000-8000-000000000002',
     'a0000000-0000-4000-8000-000000000001',
     'd0000000-0000-4000-8000-000000000001',
     'b0000000-0000-4000-8000-000000000001',
     'schools/a0000000/photos/f0000002-story-time.jpg',
     'schools/a0000000/thumbs/f0000002-story-time.jpg',
     'IMG_2025_story_time.jpg',
     'image/jpeg',
     1843200,
     3024,
     4032,
     'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd',
     'Story time with Emma - she was so engaged!',
     'ready');

-- Photo 3: Ladybugs class - playground (Liam visible)
INSERT INTO photos (id, school_id, class_id, uploaded_by, s3_key, thumbnail_s3_key,
                    original_filename, mime_type, file_size_bytes, width, height,
                    sha256_hash, caption, status) VALUES
    ('f0000000-0000-4000-8000-000000000003',
     'a0000000-0000-4000-8000-000000000001',
     'd0000000-0000-4000-8000-000000000002',
     'b0000000-0000-4000-8000-000000000001',
     'schools/a0000000/photos/f0000003-playground.jpg',
     'schools/a0000000/thumbs/f0000003-playground.jpg',
     'IMG_2025_playground.jpg',
     'image/jpeg',
     3072000,
     4032,
     3024,
     'e3f4a5b6c7d8e3f4a5b6c7d8e3f4a5b6c7d8e3f4a5b6c7d8e3f4a5b6c7d8abcd',
     'Playground fun in the Ladybugs class!',
     'ready');

-- Photo 4: Butterflies class - snack time (only Mei visible)
INSERT INTO photos (id, school_id, class_id, uploaded_by, s3_key, thumbnail_s3_key,
                    original_filename, mime_type, file_size_bytes, width, height,
                    sha256_hash, caption, status) VALUES
    ('f0000000-0000-4000-8000-000000000004',
     'a0000000-0000-4000-8000-000000000001',
     'd0000000-0000-4000-8000-000000000001',
     'b0000000-0000-4000-8000-000000000001',
     'schools/a0000000/photos/f0000004-snack-time.jpg',
     'schools/a0000000/thumbs/f0000004-snack-time.jpg',
     'IMG_2025_snack_time.jpg',
     'image/jpeg',
     1536000,
     3024,
     3024,
     'c4d5e6f7a8b9c4d5e6f7a8b9c4d5e6f7a8b9c4d5e6f7a8b9c4d5e6f7a8b9abcd',
     'Snack time - Mei loves her apple slices!',
     'ready');

-- ---------------------------------------------------------------------------
-- 7. PHOTO-STUDENT TAGS
-- ---------------------------------------------------------------------------

-- Photo 1 (art time): tagged with Emma AND Mei
INSERT INTO photo_student_tags (photo_id, student_id, tagged_by) VALUES
    ('f0000000-0000-4000-8000-000000000001',
     'e0000000-0000-4000-8000-000000000001',
     'b0000000-0000-4000-8000-000000000001'),
    ('f0000000-0000-4000-8000-000000000001',
     'e0000000-0000-4000-8000-000000000003',
     'b0000000-0000-4000-8000-000000000001');

-- Photo 2 (story time): tagged with Emma only
INSERT INTO photo_student_tags (photo_id, student_id, tagged_by) VALUES
    ('f0000000-0000-4000-8000-000000000002',
     'e0000000-0000-4000-8000-000000000001',
     'b0000000-0000-4000-8000-000000000001');

-- Photo 3 (playground): tagged with Liam only
INSERT INTO photo_student_tags (photo_id, student_id, tagged_by) VALUES
    ('f0000000-0000-4000-8000-000000000003',
     'e0000000-0000-4000-8000-000000000002',
     'b0000000-0000-4000-8000-000000000001');

-- Photo 4 (snack time): tagged with Mei only
INSERT INTO photo_student_tags (photo_id, student_id, tagged_by) VALUES
    ('f0000000-0000-4000-8000-000000000004',
     'e0000000-0000-4000-8000-000000000003',
     'b0000000-0000-4000-8000-000000000001');

-- ---------------------------------------------------------------------------
-- EXPECTED PRIVACY BEHAVIOR WITH THIS SEED DATA:
-- ---------------------------------------------------------------------------
-- Mike (parent 1) should see:
--   - Photo 1 (art time)       -> Emma is tagged
--   - Photo 2 (story time)     -> Emma is tagged
--   - Photo 3 (playground)     -> Liam is tagged
--   Mike should NOT see Photo 4 (snack time) - only Mei is tagged
--
-- Lisa (parent 2) should see:
--   - Photo 1 (art time)       -> Mei is tagged
--   - Photo 4 (snack time)     -> Mei is tagged
--   Lisa should NOT see Photo 2 (story time) or Photo 3 (playground)
--
-- Teacher Sarah should see all 4 photos (they are in her school)
-- ---------------------------------------------------------------------------
