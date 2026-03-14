# CampusGigs — Backend TODO

## Database Tables

### 1. `freelancer_profiles` — Freelancer Bio & Profile Info
```sql
CREATE TABLE IF NOT EXISTS public.freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  headline VARCHAR(200),
  hourly_rate DECIMAL(10, 2),
  avatar_url TEXT,
  location VARCHAR(100),
  university VARCHAR(200),
  department VARCHAR(200),
  semester VARCHAR(50),
  languages TEXT[], -- e.g. {'English', 'Urdu', 'Hindi'}
  availability VARCHAR(30) DEFAULT 'available'
    CHECK (availability IN ('available', 'busy', 'away', 'not_available')),
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  total_jobs_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  profile_completion_pct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER trg_freelancer_profiles_set_updated_at
BEFORE UPDATE ON public.freelancer_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
```

### 2. `skill_categories` — Skill Category Definitions
```sql
CREATE TABLE IF NOT EXISTS public.skill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50), -- icon identifier for frontend
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3. `skills` — Skill Definitions (Master List)
```sql
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.skill_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skills_category ON public.skills(category_id);
```

### 4. `freelancer_skills` — Skills Linked to Freelancer Profiles
```sql
CREATE TABLE IF NOT EXISTS public.freelancer_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20) DEFAULT 'intermediate'
    CHECK (proficiency_level IN ('beginner', 'intermediate', 'expert')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

CREATE INDEX idx_freelancer_skills_user ON public.freelancer_skills(user_id);
CREATE INDEX idx_freelancer_skills_skill ON public.freelancer_skills(skill_id);
```

### 5. `portfolio_items` — Freelancer Portfolio (Future)
```sql
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 6. `reviews` — Client Reviews of Freelancers (Future)
```sql
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  gig_id UUID, -- REFERENCES public.gigs(id) when gigs table is created
  rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Supabase Storage Buckets

### `assets` bucket
- **Purpose**: Store freelancer profile images (avatars)
- **Access**: Public read, authenticated write
- **File naming convention**: `avatars/{user_id}/{timestamp}_{filename}`
- **Max file size**: 5MB
- **Accepted types**: image/jpeg, image/png, image/webp
- **RLS Policies**:
  - `SELECT`: Public (anyone can view avatars)
  - `INSERT`: Authenticated users can upload to their own folder
  - `UPDATE`: Users can update their own files
  - `DELETE`: Users can delete their own files

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);

-- RLS Policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assets');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[2]);
```

---

## Backend API Endpoints to Implement

### Profile Endpoints
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/api/profile/:userId` | Get public freelancer profile | No |
| `GET` | `/api/profile/me` | Get own profile | Yes |
| `PUT` | `/api/profile/me` | Update own profile (bio, headline, rate, etc.) | Yes |
| `POST` | `/api/profile/me/avatar` | Upload avatar (proxy to Supabase storage) | Yes |
| `DELETE` | `/api/profile/me/avatar` | Remove avatar | Yes |

### Skills Endpoints
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/api/skills` | Get all skills grouped by category | No |
| `GET` | `/api/skills/categories` | Get just categories | No |
| `GET` | `/api/profile/me/skills` | Get freelancer's selected skills | Yes |
| `POST` | `/api/profile/me/skills` | Add skills to profile (batch) | Yes |
| `DELETE` | `/api/profile/me/skills/:skillId` | Remove skill from profile | Yes |

### Public Profile (Client View)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/api/freelancers` | List freelancers with filters/search | No |
| `GET` | `/api/freelancers/:userId` | Get freelancer public profile + skills + rating | No |

---

## Seed Data: Skill Categories & Skills

The following categories and skills need to be inserted into the database.
See the frontend `lib/data/skills.ts` file for the full list used in the UI.

### Categories:
1. **Web Development** — Frontend, backend, full-stack web skills
2. **Mobile Development** — iOS, Android, cross-platform
3. **Design & Creative** — UI/UX, graphic design, illustration
4. **Writing & Content** — Copywriting, SEO, technical writing
5. **Data & Analytics** — Data science, ML, visualization
6. **Marketing** — Digital marketing, social media, ads
7. **Video & Animation** — Video editing, motion graphics
8. **Academic & University** — Assignments, tutoring, research
9. **Programming Languages** — Individual language skills
10. **DevOps & Cloud** — Cloud infra, CI/CD, containers
11. **Business & Finance** — Accounting, business plans
12. **AI & Machine Learning** — AI/ML specific skills

Each category contains 10-25+ skills. Refer to `frontend/lib/data/skills.ts` for the full seed list.

---

## Middleware to Add

### `auth.js` — JWT Auth Middleware
```js
// Verify JWT token and attach user to req
// Extract from Authorization: Bearer <token>
// Attach req.user = { id, email, role }
```

### `requireRole.js` — Role-based Access
```js
// Check req.user.role matches required role
// Used for freelancer-only or client-only routes
```

---

## Notes
- Profile images should be uploaded to Supabase Storage bucket `assets` under `avatars/{userId}/`
- Skills are a many-to-many relationship (freelancer_skills junction table)
- Skills master list should be seeded and managed from the `skills` + `skill_categories` tables
- Profile completion percentage should be calculated server-side based on filled fields
- Consider adding full-text search on freelancer profiles for the client browse feature

---

## Frontend–Backend Data Contracts

Below are the exact JSON shapes the frontend expects from each API endpoint.
The frontend currently uses dummy data (see `frontend/lib/data/dummy-profiles.ts`).
When the backend is ready, replace dummy data with real API calls.

### `GET /api/profile/:userId` — Response shape
```json
{
  "id": "uuid",
  "userId": "uuid",
  "fullName": "string",
  "email": "string",
  "bio": "string",
  "headline": "string (max 200)",
  "hourlyRate": "number | null",
  "avatarUrl": "string | null",
  "location": "string",
  "university": "string",
  "department": "string",
  "semester": "string",
  "languages": ["English", "Urdu"],
  "availability": "available | busy | away | not_available",
  "totalEarnings": 1250,
  "totalJobsCompleted": 18,
  "averageRating": 4.9,
  "profileCompletionPct": 92,
  "skills": [
    {
      "id": "uuid (freelancer_skills.id)",
      "skillId": "uuid (skills.id)",
      "skillName": "React",
      "categoryName": "Web Development",
      "proficiencyLevel": "beginner | intermediate | expert"
    }
  ],
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

### `PUT /api/profile/me` — Request body
```json
{
  "fullName": "string",
  "headline": "string",
  "bio": "string",
  "hourlyRate": "number | null",
  "location": "string",
  "university": "string",
  "department": "string",
  "semester": "string",
  "languages": ["English", "Urdu"],
  "availability": "available | busy | away | not_available"
}
```

### `POST /api/profile/me/skills` — Request body (batch add)
```json
{
  "skills": [
    { "skillId": "uuid", "proficiencyLevel": "expert" },
    { "skillId": "uuid", "proficiencyLevel": "intermediate" }
  ]
}
```

### `GET /api/freelancers` — Query params & Response
**Query params:**
- `q` (string) — search by name, headline, bio, skill name, university
- `category` (string) — filter by skill category name
- `availability` (string) — filter: `available`, `busy`, `away`, `not_available`
- `sort` (string) — `rating`, `jobs`, `rate_low`, `rate_high`
- `page` (number) — pagination (default 1)
- `limit` (number) — items per page (default 20)

**Response:**
```json
{
  "data": [ /* array of FreelancerProfile objects (same shape as GET /api/profile/:userId) */ ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

### `GET /api/freelancers/:userId/reviews` — Response
```json
{
  "data": [
    {
      "id": "uuid",
      "clientName": "string",
      "clientAvatar": "string | null",
      "rating": 5.0,
      "comment": "string",
      "gigTitle": "string",
      "createdAt": "ISO 8601 timestamp"
    }
  ],
  "averageRating": 4.9,
  "total": 3
}
```

### Frontend files to update when backend is ready
1. `frontend/app/(protected)/freelancer/profile/edit/page.tsx` — Replace `getCurrentUserProfile()` with `GET /api/profile/me`, replace `handleSave()` mock with `PUT /api/profile/me`
2. `frontend/app/(protected)/freelancer/profile/[userId]/page.tsx` — Replace `SAMPLE_FREELANCER` with `GET /api/profile/:userId`, replace `DUMMY_REVIEWS` with `GET /api/freelancers/:userId/reviews`
3. `frontend/app/(protected)/client/freelancers/page.tsx` — Replace `FREELANCERS` array with `GET /api/freelancers`
4. `frontend/components/profile/AvatarUpload.tsx` — Already attempts Supabase storage upload, just needs the bucket to exist
5. `frontend/components/profile/SkillsSelector.tsx` — Currently uses local `SKILL_CATEGORIES` from `lib/data/skills.ts`. Can optionally replace with `GET /api/skills`
