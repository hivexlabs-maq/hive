# System Architecture & Technical Design (Phase 2)

## **Cover Page**

**Group number:** 145

**Project Title:** Hive – A Secure Photo Sharing and Memory Preservation Platform for Preschools

**Student Name(s):**

Bhargav M, Ruthwik Chikoti, Naga Chaitanya Varma, Dharma Srujan Reddy

**Student ID(s):** 2023EBCS724 , 2023EBCS675 , 2023BCS10054, 2023EBCS634

**Project Advisor / Supervisor:**

Lakshya Jain

## 1. System Architecture Diagram

### High-Level Architecture

```
                +-----------------------+
                |     Parent App        |
                |     (React Native)        |
                +-----------+-----------+
                |     Teacher App       |
                |      (React Native)        |
                +-----------+-----------+
                            |
                            | HTTPS (REST API)
                            |
                +-----------v-----------------------+
                |        Backend API Layer          |
                |      (Node.js + TypeScript)       |
                +-----------+-----------------------+
                            |
        +-------------------+-------------------+
        |                                       |
+-------v--------+                      +-------v--------+
|  Supabase      |                      |  Object Storage|
|  (Relational   |                      | (AWS S3 / GCS) |
|   Database)    |                      |  Image Storage |
+----------------+                      +----------------+
                                                    |
                                                    v
                                             +--------------+
                                             |   CDN Layer  |
                                             | (Image Cache)|
                                             +--------------+

```

### Architectural Style

- Client–Server Architecture
- RESTful API design
- Role-Based Access Control (RBAC)
- Scalable cloud-based storage

The system separates concerns between presentation (Flutter apps), business logic (Node.js API), and persistence (database + object storage).

---

## 2. Module-Wise Design

### A. Mobile Application (Flutter)

### 1. Authentication Module

- OTP-based login
- Role identification (Parent / Teacher / Admin)
- Secure token storage (JWT)

### 2. Teacher Module

- Class selection
- Multi-image upload
- Image preview & publish
- Upload progress tracking

### 3. Parent Module

- Child-specific feed
- Image viewer (optimized loading)
- Select images for print
- Order placement

### 4. Order Module

- Cart management
- Product selection (print/frame/bundle)
- Payment integration
- Order history tracking

### 5. Notification Module

- Push notifications for new uploads
- Order status updates

---

### B. Backend (Node.js + TypeScript)

### 1. Authentication & Authorization Module

- OTP verification
- JWT token generation
- Role-based middleware
- Access control validation

### 2. School & User Management Module

- School registration
- Class creation
- Student mapping
- Parent-child association

### 3. Media Management Module

- Image upload endpoint
- Secure signed URL generation
- Metadata storage
- Image access validation

### 4. Feed Service Module

- Fetch images by child/class
- Pagination & sorting
- CDN URL mapping

### 5. Order & Commerce Module

- Order creation
- Payment verification
- Order status management
- Fulfillment integration hooks

### 6. Admin Dashboard Module

- School analytics
- Upload metrics
- Revenue tracking

---

## 3. Technology Stack Justification

### Frontend: Flutter

**Reasons for Selection:**

- Single codebase for Android and iOS
- High performance with native compilation
- Strong UI customization for emotional, image-heavy design
- Rapid development and iteration

Flutter ensures cost efficiency and faster deployment across platforms.

---

### Backend: Node.js with TypeScript

**Reasons for Selection:**

- Non-blocking I/O suitable for image-heavy applications
- TypeScript provides strong typing and maintainability
- Large ecosystem and community support
- Easy integration with cloud services and payment gateways

TypeScript improves long-term code reliability and scalability compared to plain JavaScript.

---

### Database: Supabase

**Reasons:**

- Strong relational integrity
- Supports complex relationships (school → class → student → parent)
- ACID compliance for order transactions
- Mature and production-ready

---

### Object Storage: AWS S3 (or equivalent)

**Reasons:**

- Scalable image storage
- Secure access via signed URLs
- Cost-effective for large media files

---

### CDN (Content Delivery Network)

**Purpose:**

- Faster image loading
- Reduced backend load
- Improved parent user experience

---

## 4. Database Design

### Core Entities

1. School
    - id (PK)
    - name
    - address
    - contact_info
2. Class
    - id (PK)
    - school_id (FK)
    - name
3. Student
    - id (PK)
    - class_id (FK)
    - name
    - date_of_birth
4. User
    - id (PK)
    - role (PARENT / TEACHER / ADMIN)
    - phone_number
    - school_id (FK)
5. ParentStudentMapping
    - parent_id (FK)
    - student_id (FK)
6. Photo
    - id (PK)
    - class_id (FK)
    - uploaded_by (FK user_id)
    - storage_url
    - created_at
7. PhotoStudentTag
    - photo_id (FK)
    - student_id (FK)
8. Order
    - id (PK)
    - parent_id (FK)
    - total_amount
    - status
    - created_at
9. OrderItem
    - id (PK)
    - order_id (FK)
    - photo_id (FK)
    - product_type
    - quantity

---

## 5. Data Flow Design

### A. Photo Upload Flow

1. Teacher logs in (JWT issued).
2. Teacher uploads image to backend.
3. Backend generates pre-signed S3 URL.
4. Image stored in object storage.
5. Metadata stored in PostgreSQL.
6. Parents receive notification.

---

### B. Parent Feed Retrieval Flow

1. Parent logs in.
2. Backend validates parent-student mapping.
3. Fetch photos tagged to child.
4. Generate secure image URLs.
5. Return paginated response.

---

### C. Order Placement Flow

1. Parent selects photos.
2. Order created in database (Pending state).
3. Payment processed.
4. Order status updated to Confirmed.
5. Fulfillment request triggered.

---

## 6. Scalability & Future Considerations

- Horizontal scaling using containerized deployment (Docker)
- Load balancer for API layer
- Background job queue for image processing
- Caching layer (Redis) for frequent feed queries
- Microservice separation in later phases (media, commerce)

---

## 7. Proof of concept

- [https://youtube.com/shorts/A3FV2d4wplE?feature=share](https://youtube.com/shorts/A3FV2d4wplE?feature=share)

## Conclusion

The proposed architecture ensures security, scalability, and maintainability while remaining feasible within a semester timeline. The separation of concerns between Flutter frontend, TypeScript-based backend, relational database, and cloud storage provides a production-grade foundation aligned with modern engineering best practices.