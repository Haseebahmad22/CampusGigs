-- CampusGigs schema and seed
-- NEW TO RUN SCHEMA CODE

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'freelancer' CHECK (role IN ('client', 'freelancer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'freelancer';

ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check CHECK (role IN ('client', 'freelancer'));

DROP TRIGGER IF EXISTS trg_users_set_updated_at ON public.users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

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
  languages TEXT[],
  availability VARCHAR(30) DEFAULT 'available'
    CHECK (availability IN ('available', 'busy', 'away', 'not_available')),
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  total_jobs_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  profile_completion_pct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_freelancer_profiles_set_updated_at ON public.freelancer_profiles;
CREATE TRIGGER trg_freelancer_profiles_set_updated_at
BEFORE UPDATE ON public.freelancer_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.skill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.skill_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category_id);

CREATE TABLE IF NOT EXISTS public.freelancer_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20) DEFAULT 'intermediate'
    CHECK (proficiency_level IN ('beginner', 'intermediate', 'expert')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_freelancer_skills_user ON public.freelancer_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_skills_skill ON public.freelancer_skills(skill_id);

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

DROP TRIGGER IF EXISTS trg_portfolio_items_set_updated_at ON public.portfolio_items;
CREATE TRIGGER trg_portfolio_items_set_updated_at
BEFORE UPDATE ON public.portfolio_items
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  gig_id UUID,
  rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_freelancer ON public.reviews(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client ON public.reviews(client_id);

-- =============================================
-- Token system: accounts, escrows, transactions
-- =============================================

CREATE TABLE IF NOT EXISTS public.token_accounts (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_token_accounts_set_updated_at ON public.token_accounts;
CREATE TRIGGER trg_token_accounts_set_updated_at
BEFORE UPDATE ON public.token_accounts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.token_escrows (
  gig_id UUID PRIMARY KEY REFERENCES public.gigs(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_token_escrows_client ON public.token_escrows(client_id);
CREATE INDEX IF NOT EXISTS idx_token_escrows_freelancer ON public.token_escrows(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_token_escrows_status ON public.token_escrows(status);

CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  gig_id UUID REFERENCES public.gigs(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('signup_bonus', 'gig_payout', 'manual_adjustment')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_transactions_from ON public.token_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_to ON public.token_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_gig ON public.token_transactions(gig_id);

INSERT INTO public.skill_categories (name, slug, icon, sort_order)
VALUES
  ('Web Development', 'web-development', 'Globe', 1),
  ('Mobile Development', 'mobile-development', 'Smartphone', 2),
  ('Design & Creative', 'design-creative', 'Palette', 3),
  ('Writing & Content', 'writing-content', 'PenTool', 4),
  ('Data & Analytics', 'data-analytics', 'BarChart3', 5),
  ('Digital Marketing', 'digital-marketing', 'Megaphone', 6),
  ('Video & Animation', 'video-animation', 'Film', 7),
  ('Academic & University', 'academic-university', 'GraduationCap', 8),
  ('Programming Languages', 'programming-languages', 'Code2', 9),
  ('DevOps & Cloud', 'devops-cloud', 'Cloud', 10),
  ('Business & Finance', 'business-finance', 'Briefcase', 11),
  ('AI & Machine Learning', 'ai-machine-learning', 'Brain', 12),
  ('Database & Backend', 'database-backend', 'Database', 13),
  ('Audio & Music', 'audio-music', 'Music', 14),
  ('Game Development', 'game-development', 'Gamepad2', 15)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.skills (category_id, name, slug)
VALUES
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'HTML', 'html'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'CSS', 'css'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'JavaScript', 'javascript'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'TypeScript', 'typescript'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'React', 'react'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'Next.js', 'nextjs'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'Angular', 'angular'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'Vue.js', 'vuejs'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'Svelte', 'svelte'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'Node.js', 'nodejs'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'Express.js', 'expressjs'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'Django', 'django'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'Flask', 'flask'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'Ruby on Rails', 'ruby-on-rails'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'PHP', 'php'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'Laravel', 'laravel'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'WordPress', 'wordpress'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'Tailwind CSS', 'tailwind-css'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'Bootstrap', 'bootstrap'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'SASS/SCSS', 'sass-scss'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'GraphQL', 'graphql'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'REST API Development', 'rest-api'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'Webflow', 'webflow'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'web-development'), 'Shopify Development', 'shopify'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'mobile-development'), 'React Native', 'react-native'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'mobile-development'), 'Flutter', 'flutter'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'mobile-development'), 'Swift (iOS)', 'swift-ios'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'mobile-development'), 'Kotlin (Android)', 'kotlin-android'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'mobile-development'), 'Dart', 'dart'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'mobile-development'), 'Ionic', 'ionic'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'mobile-development'), 'Xamarin', 'xamarin'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'mobile-development'), 'Android Studio', 'android-studio'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'mobile-development'), 'Xcode', 'xcode'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'mobile-development'), 'App Store Optimization', 'aso'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'UI Design', 'ui-design'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'UX Design', 'ux-design'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Figma', 'figma'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Adobe XD', 'adobe-xd'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Adobe Photoshop', 'photoshop'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Adobe Illustrator', 'illustrator'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Adobe InDesign', 'indesign'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Canva', 'canva'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Logo Design', 'logo-design'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Brand Identity', 'brand-identity'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Graphic Design', 'graphic-design'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Icon Design', 'icon-design'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Wireframing', 'wireframing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Prototyping', 'prototyping'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Design Systems', 'design-systems'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Poster & Flyer Design', 'poster-flyer-design'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Presentation Design', 'presentation-design'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'design-creative'), 'Infographic Design', 'infographic-design'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Content Writing', 'content-writing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Copywriting', 'copywriting'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Technical Writing', 'technical-writing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Blog Writing', 'blog-writing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'SEO Writing', 'seo-writing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Academic Writing', 'academic-writing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Research Paper Writing', 'research-paper-writing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Thesis/Dissertation Help', 'thesis-dissertation'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Essay Writing', 'essay-writing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Proofreading & Editing', 'proofreading-editing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Ghostwriting', 'ghostwriting'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Creative Writing', 'creative-writing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Report Writing', 'report-writing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Grant Writing', 'grant-writing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Resume/CV Writing', 'resume-cv-writing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'writing-content'), 'Translation', 'translation'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'data-analytics'), 'Data Analysis', 'data-analysis'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'data-analytics'), 'Data Visualization', 'data-visualization'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'data-analytics'), 'Python (Data Science)', 'python-data-science'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'data-analytics'), 'R Programming', 'r-programming'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'data-analytics'), 'SQL', 'sql'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'data-analytics'), 'Tableau', 'tableau'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'data-analytics'), 'Power BI', 'power-bi'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'data-analytics'), 'Excel / Google Sheets', 'excel-sheets'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'data-analytics'), 'SPSS', 'spss'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'data-analytics'), 'MATLAB', 'matlab'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'data-analytics'), 'Statistical Analysis', 'statistical-analysis'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'data-analytics'), 'Web Scraping', 'web-scraping'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'data-analytics'), 'ETL Pipelines', 'etl-pipelines'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'data-analytics'), 'Big Data (Hadoop/Spark)', 'big-data'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'digital-marketing'), 'Social Media Marketing', 'social-media-marketing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'digital-marketing'), 'SEO', 'seo'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'digital-marketing'), 'Google Ads', 'google-ads'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'digital-marketing'), 'Facebook/Meta Ads', 'facebook-ads'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'digital-marketing'), 'Email Marketing', 'email-marketing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'digital-marketing'), 'Content Strategy', 'content-strategy'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'digital-marketing'), 'TikTok Marketing', 'tiktok-marketing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'digital-marketing'), 'Instagram Growth', 'instagram-growth'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'digital-marketing'), 'YouTube Marketing', 'youtube-marketing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'digital-marketing'), 'Influencer Outreach', 'influencer-outreach'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'digital-marketing'), 'Community Management', 'community-management'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'digital-marketing'), 'Event Marketing', 'event-marketing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'video-animation'), 'Video Editing', 'video-editing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'video-animation'), 'Adobe Premiere Pro', 'premiere-pro'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'video-animation'), 'Adobe After Effects', 'after-effects'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'video-animation'), 'DaVinci Resolve', 'davinci-resolve'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'video-animation'), 'Final Cut Pro', 'final-cut-pro'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'video-animation'), 'Motion Graphics', 'motion-graphics'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'video-animation'), '2D Animation', '2d-animation'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'video-animation'), '3D Modeling & Animation', '3d-animation'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'video-animation'), 'Blender', 'blender'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'video-animation'), 'Whiteboard Animation', 'whiteboard-animation'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'video-animation'), 'YouTube Thumbnails', 'youtube-thumbnails'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'video-animation'), 'Reels/Shorts Editing', 'reels-shorts-editing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Assignment Help', 'assignment-help'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Homework Assistance', 'homework-assistance'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Handwritten Notes', 'handwritten-notes'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Handwritten Assignments', 'handwritten-assignments'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Lab Reports', 'lab-reports'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Tutoring (Math)', 'tutoring-math'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Tutoring (Physics)', 'tutoring-physics'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Tutoring (Chemistry)', 'tutoring-chemistry'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Tutoring (Computer Science)', 'tutoring-cs'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Tutoring (English/Writing)', 'tutoring-english'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Tutoring (Accounting)', 'tutoring-accounting'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Exam Preparation', 'exam-preparation'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Presentation Slides (PPT)', 'presentation-slides'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Literature Review', 'literature-review'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Plagiarism Check & Fix', 'plagiarism-check'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Citation/References (APA, MLA)', 'citation-references'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Final Year Project Help', 'fyp-help'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Capstone Project', 'capstone-project'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'SOP/LOR Writing', 'sop-lor-writing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Research Methodology', 'research-methodology'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Typing & Formatting', 'typing-formatting'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'academic-university'), 'Data Entry', 'data-entry'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'programming-languages'), 'Python', 'python'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'programming-languages'), 'Java', 'java'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'programming-languages'), 'C', 'c'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'programming-languages'), 'C++', 'cpp'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'programming-languages'), 'C#', 'csharp'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'programming-languages'), 'Go', 'go'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'programming-languages'), 'Rust', 'rust'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'programming-languages'), 'Ruby', 'ruby'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'programming-languages'), 'Scala', 'scala'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'programming-languages'), 'Perl', 'perl'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'programming-languages'), 'Haskell', 'haskell'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'programming-languages'), 'Assembly', 'assembly'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'programming-languages'), 'Shell/Bash Scripting', 'shell-bash'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'programming-languages'), 'Solidity (Blockchain)', 'solidity'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'devops-cloud'), 'AWS', 'aws'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'devops-cloud'), 'Google Cloud (GCP)', 'gcp'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'devops-cloud'), 'Microsoft Azure', 'azure'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'devops-cloud'), 'Docker', 'docker'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'devops-cloud'), 'Kubernetes', 'kubernetes'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'devops-cloud'), 'CI/CD Pipelines', 'cicd'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'devops-cloud'), 'GitHub Actions', 'github-actions'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'devops-cloud'), 'Linux Administration', 'linux-admin'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'devops-cloud'), 'Nginx/Apache', 'nginx-apache'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'devops-cloud'), 'Terraform', 'terraform'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'devops-cloud'), 'Firebase', 'firebase'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'devops-cloud'), 'Supabase', 'supabase'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'devops-cloud'), 'Vercel / Netlify', 'vercel-netlify'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'business-finance'), 'Business Plan Writing', 'business-plan'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'business-finance'), 'Financial Modeling', 'financial-modeling'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'business-finance'), 'Bookkeeping', 'bookkeeping'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'business-finance'), 'Accounting (QuickBooks)', 'accounting-quickbooks'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'business-finance'), 'Market Research', 'market-research'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'business-finance'), 'Pitch Deck Creation', 'pitch-deck'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'business-finance'), 'Virtual Assistant', 'virtual-assistant'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'business-finance'), 'Project Management', 'project-management'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'business-finance'), 'Startup Consulting', 'startup-consulting'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'business-finance'), 'E-commerce Management', 'ecommerce-management'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'ai-machine-learning'), 'Machine Learning', 'machine-learning'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'ai-machine-learning'), 'Deep Learning', 'deep-learning'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'ai-machine-learning'), 'Natural Language Processing', 'nlp'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'ai-machine-learning'), 'Computer Vision', 'computer-vision'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'ai-machine-learning'), 'TensorFlow', 'tensorflow'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'ai-machine-learning'), 'PyTorch', 'pytorch'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'ai-machine-learning'), 'Scikit-learn', 'scikit-learn'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'ai-machine-learning'), 'ChatGPT/LLM Integration', 'chatgpt-llm'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'ai-machine-learning'), 'AI Chatbot Development', 'ai-chatbot'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'ai-machine-learning'), 'Prompt Engineering', 'prompt-engineering'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'ai-machine-learning'), 'AI Image Generation', 'ai-image-gen'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'ai-machine-learning'), 'Data Labeling/Annotation', 'data-labeling'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'database-backend'), 'PostgreSQL', 'postgresql'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'database-backend'), 'MySQL', 'mysql'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'database-backend'), 'MongoDB', 'mongodb'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'database-backend'), 'Redis', 'redis'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'database-backend'), 'Firebase Firestore', 'firestore'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'database-backend'), 'Prisma ORM', 'prisma'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'database-backend'), 'Sequelize', 'sequelize'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'database-backend'), 'API Design', 'api-design'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'database-backend'), 'Microservices Architecture', 'microservices'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'database-backend'), 'Authentication Systems', 'auth-systems'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'audio-music'), 'Audio Editing', 'audio-editing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'audio-music'), 'Podcast Editing', 'podcast-editing'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'audio-music'), 'Music Production', 'music-production'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'audio-music'), 'Voice Over', 'voice-over'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'audio-music'), 'Sound Design', 'sound-design'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'audio-music'), 'Mixing & Mastering', 'mixing-mastering'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'audio-music'), 'Jingle Creation', 'jingle-creation'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'game-development'), 'Unity', 'unity'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'game-development'), 'Unreal Engine', 'unreal-engine'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'game-development'), 'Godot', 'godot'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'game-development'), 'Game Design', 'game-design'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'game-development'), '2D Game Art', '2d-game-art'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'game-development'), '3D Game Modeling', '3d-game-modeling'),
  ((SELECT id FROM public.skill_categories WHERE slug = 'game-development'), 'Level Design', 'level-design')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('assets', 'assets', true)
    ON CONFLICT (id) DO NOTHING;

    DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

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
  END IF;
END;
$$;
