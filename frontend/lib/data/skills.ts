import type { SkillCategory } from "@/lib/types";

// ─── Comprehensive Skills List (Upwork-style + University-specific) ───
// Each skill has a unique id and slug for DB mapping

let _id = 0;
const sid = () => {
  _id++;
  return `skill-${_id}`;
};

const cid = (n: number) => `cat-${n}`;

export const SKILL_CATEGORIES: SkillCategory[] = [
  // ━━━ 1. Web Development ━━━
  {
    id: cid(1),
    name: "Web Development",
    slug: "web-development",
    icon: "Globe",
    skills: [
      { id: sid(), categoryId: cid(1), name: "HTML", slug: "html" },
      { id: sid(), categoryId: cid(1), name: "CSS", slug: "css" },
      { id: sid(), categoryId: cid(1), name: "JavaScript", slug: "javascript" },
      { id: sid(), categoryId: cid(1), name: "TypeScript", slug: "typescript" },
      { id: sid(), categoryId: cid(1), name: "React", slug: "react" },
      { id: sid(), categoryId: cid(1), name: "Next.js", slug: "nextjs" },
      { id: sid(), categoryId: cid(1), name: "Angular", slug: "angular" },
      { id: sid(), categoryId: cid(1), name: "Vue.js", slug: "vuejs" },
      { id: sid(), categoryId: cid(1), name: "Svelte", slug: "svelte" },
      { id: sid(), categoryId: cid(1), name: "Node.js", slug: "nodejs" },
      { id: sid(), categoryId: cid(1), name: "Express.js", slug: "expressjs" },
      { id: sid(), categoryId: cid(1), name: "Django", slug: "django" },
      { id: sid(), categoryId: cid(1), name: "Flask", slug: "flask" },
      { id: sid(), categoryId: cid(1), name: "Ruby on Rails", slug: "ruby-on-rails" },
      { id: sid(), categoryId: cid(1), name: "PHP", slug: "php" },
      { id: sid(), categoryId: cid(1), name: "Laravel", slug: "laravel" },
      { id: sid(), categoryId: cid(1), name: "WordPress", slug: "wordpress" },
      { id: sid(), categoryId: cid(1), name: "Tailwind CSS", slug: "tailwind-css" },
      { id: sid(), categoryId: cid(1), name: "Bootstrap", slug: "bootstrap" },
      { id: sid(), categoryId: cid(1), name: "SASS/SCSS", slug: "sass-scss" },
      { id: sid(), categoryId: cid(1), name: "GraphQL", slug: "graphql" },
      { id: sid(), categoryId: cid(1), name: "REST API Development", slug: "rest-api" },
      { id: sid(), categoryId: cid(1), name: "Webflow", slug: "webflow" },
      { id: sid(), categoryId: cid(1), name: "Shopify Development", slug: "shopify" },
    ],
  },

  // ━━━ 2. Mobile Development ━━━
  {
    id: cid(2),
    name: "Mobile Development",
    slug: "mobile-development",
    icon: "Smartphone",
    skills: [
      { id: sid(), categoryId: cid(2), name: "React Native", slug: "react-native" },
      { id: sid(), categoryId: cid(2), name: "Flutter", slug: "flutter" },
      { id: sid(), categoryId: cid(2), name: "Swift (iOS)", slug: "swift-ios" },
      { id: sid(), categoryId: cid(2), name: "Kotlin (Android)", slug: "kotlin-android" },
      { id: sid(), categoryId: cid(2), name: "Dart", slug: "dart" },
      { id: sid(), categoryId: cid(2), name: "Ionic", slug: "ionic" },
      { id: sid(), categoryId: cid(2), name: "Xamarin", slug: "xamarin" },
      { id: sid(), categoryId: cid(2), name: "Android Studio", slug: "android-studio" },
      { id: sid(), categoryId: cid(2), name: "Xcode", slug: "xcode" },
      { id: sid(), categoryId: cid(2), name: "App Store Optimization", slug: "aso" },
    ],
  },

  // ━━━ 3. Design & Creative ━━━
  {
    id: cid(3),
    name: "Design & Creative",
    slug: "design-creative",
    icon: "Palette",
    skills: [
      { id: sid(), categoryId: cid(3), name: "UI Design", slug: "ui-design" },
      { id: sid(), categoryId: cid(3), name: "UX Design", slug: "ux-design" },
      { id: sid(), categoryId: cid(3), name: "Figma", slug: "figma" },
      { id: sid(), categoryId: cid(3), name: "Adobe XD", slug: "adobe-xd" },
      { id: sid(), categoryId: cid(3), name: "Adobe Photoshop", slug: "photoshop" },
      { id: sid(), categoryId: cid(3), name: "Adobe Illustrator", slug: "illustrator" },
      { id: sid(), categoryId: cid(3), name: "Adobe InDesign", slug: "indesign" },
      { id: sid(), categoryId: cid(3), name: "Canva", slug: "canva" },
      { id: sid(), categoryId: cid(3), name: "Logo Design", slug: "logo-design" },
      { id: sid(), categoryId: cid(3), name: "Brand Identity", slug: "brand-identity" },
      { id: sid(), categoryId: cid(3), name: "Graphic Design", slug: "graphic-design" },
      { id: sid(), categoryId: cid(3), name: "Icon Design", slug: "icon-design" },
      { id: sid(), categoryId: cid(3), name: "Wireframing", slug: "wireframing" },
      { id: sid(), categoryId: cid(3), name: "Prototyping", slug: "prototyping" },
      { id: sid(), categoryId: cid(3), name: "Design Systems", slug: "design-systems" },
      { id: sid(), categoryId: cid(3), name: "Poster & Flyer Design", slug: "poster-flyer-design" },
      { id: sid(), categoryId: cid(3), name: "Presentation Design", slug: "presentation-design" },
      { id: sid(), categoryId: cid(3), name: "Infographic Design", slug: "infographic-design" },
    ],
  },

  // ━━━ 4. Writing & Content ━━━
  {
    id: cid(4),
    name: "Writing & Content",
    slug: "writing-content",
    icon: "PenTool",
    skills: [
      { id: sid(), categoryId: cid(4), name: "Content Writing", slug: "content-writing" },
      { id: sid(), categoryId: cid(4), name: "Copywriting", slug: "copywriting" },
      { id: sid(), categoryId: cid(4), name: "Technical Writing", slug: "technical-writing" },
      { id: sid(), categoryId: cid(4), name: "Blog Writing", slug: "blog-writing" },
      { id: sid(), categoryId: cid(4), name: "SEO Writing", slug: "seo-writing" },
      { id: sid(), categoryId: cid(4), name: "Academic Writing", slug: "academic-writing" },
      { id: sid(), categoryId: cid(4), name: "Research Paper Writing", slug: "research-paper-writing" },
      { id: sid(), categoryId: cid(4), name: "Thesis/Dissertation Help", slug: "thesis-dissertation" },
      { id: sid(), categoryId: cid(4), name: "Essay Writing", slug: "essay-writing" },
      { id: sid(), categoryId: cid(4), name: "Proofreading & Editing", slug: "proofreading-editing" },
      { id: sid(), categoryId: cid(4), name: "Ghostwriting", slug: "ghostwriting" },
      { id: sid(), categoryId: cid(4), name: "Creative Writing", slug: "creative-writing" },
      { id: sid(), categoryId: cid(4), name: "Report Writing", slug: "report-writing" },
      { id: sid(), categoryId: cid(4), name: "Grant Writing", slug: "grant-writing" },
      { id: sid(), categoryId: cid(4), name: "Resume/CV Writing", slug: "resume-cv-writing" },
      { id: sid(), categoryId: cid(4), name: "Translation", slug: "translation" },
    ],
  },

  // ━━━ 5. Data & Analytics ━━━
  {
    id: cid(5),
    name: "Data & Analytics",
    slug: "data-analytics",
    icon: "BarChart3",
    skills: [
      { id: sid(), categoryId: cid(5), name: "Data Analysis", slug: "data-analysis" },
      { id: sid(), categoryId: cid(5), name: "Data Visualization", slug: "data-visualization" },
      { id: sid(), categoryId: cid(5), name: "Python (Data Science)", slug: "python-data-science" },
      { id: sid(), categoryId: cid(5), name: "R Programming", slug: "r-programming" },
      { id: sid(), categoryId: cid(5), name: "SQL", slug: "sql" },
      { id: sid(), categoryId: cid(5), name: "Tableau", slug: "tableau" },
      { id: sid(), categoryId: cid(5), name: "Power BI", slug: "power-bi" },
      { id: sid(), categoryId: cid(5), name: "Excel / Google Sheets", slug: "excel-sheets" },
      { id: sid(), categoryId: cid(5), name: "SPSS", slug: "spss" },
      { id: sid(), categoryId: cid(5), name: "MATLAB", slug: "matlab" },
      { id: sid(), categoryId: cid(5), name: "Statistical Analysis", slug: "statistical-analysis" },
      { id: sid(), categoryId: cid(5), name: "Web Scraping", slug: "web-scraping" },
      { id: sid(), categoryId: cid(5), name: "ETL Pipelines", slug: "etl-pipelines" },
      { id: sid(), categoryId: cid(5), name: "Big Data (Hadoop/Spark)", slug: "big-data" },
    ],
  },

  // ━━━ 6. Digital Marketing ━━━
  {
    id: cid(6),
    name: "Digital Marketing",
    slug: "digital-marketing",
    icon: "Megaphone",
    skills: [
      { id: sid(), categoryId: cid(6), name: "Social Media Marketing", slug: "social-media-marketing" },
      { id: sid(), categoryId: cid(6), name: "SEO", slug: "seo" },
      { id: sid(), categoryId: cid(6), name: "Google Ads", slug: "google-ads" },
      { id: sid(), categoryId: cid(6), name: "Facebook/Meta Ads", slug: "facebook-ads" },
      { id: sid(), categoryId: cid(6), name: "Email Marketing", slug: "email-marketing" },
      { id: sid(), categoryId: cid(6), name: "Content Strategy", slug: "content-strategy" },
      { id: sid(), categoryId: cid(6), name: "TikTok Marketing", slug: "tiktok-marketing" },
      { id: sid(), categoryId: cid(6), name: "Instagram Growth", slug: "instagram-growth" },
      { id: sid(), categoryId: cid(6), name: "YouTube Marketing", slug: "youtube-marketing" },
      { id: sid(), categoryId: cid(6), name: "Influencer Outreach", slug: "influencer-outreach" },
      { id: sid(), categoryId: cid(6), name: "Community Management", slug: "community-management" },
      { id: sid(), categoryId: cid(6), name: "Event Marketing", slug: "event-marketing" },
    ],
  },

  // ━━━ 7. Video & Animation ━━━
  {
    id: cid(7),
    name: "Video & Animation",
    slug: "video-animation",
    icon: "Film",
    skills: [
      { id: sid(), categoryId: cid(7), name: "Video Editing", slug: "video-editing" },
      { id: sid(), categoryId: cid(7), name: "Adobe Premiere Pro", slug: "premiere-pro" },
      { id: sid(), categoryId: cid(7), name: "Adobe After Effects", slug: "after-effects" },
      { id: sid(), categoryId: cid(7), name: "DaVinci Resolve", slug: "davinci-resolve" },
      { id: sid(), categoryId: cid(7), name: "Final Cut Pro", slug: "final-cut-pro" },
      { id: sid(), categoryId: cid(7), name: "Motion Graphics", slug: "motion-graphics" },
      { id: sid(), categoryId: cid(7), name: "2D Animation", slug: "2d-animation" },
      { id: sid(), categoryId: cid(7), name: "3D Modeling & Animation", slug: "3d-animation" },
      { id: sid(), categoryId: cid(7), name: "Blender", slug: "blender" },
      { id: sid(), categoryId: cid(7), name: "Whiteboard Animation", slug: "whiteboard-animation" },
      { id: sid(), categoryId: cid(7), name: "YouTube Thumbnails", slug: "youtube-thumbnails" },
      { id: sid(), categoryId: cid(7), name: "Reels/Shorts Editing", slug: "reels-shorts-editing" },
    ],
  },

  // ━━━ 8. Academic & University ━━━
  {
    id: cid(8),
    name: "Academic & University",
    slug: "academic-university",
    icon: "GraduationCap",
    skills: [
      { id: sid(), categoryId: cid(8), name: "Assignment Help", slug: "assignment-help" },
      { id: sid(), categoryId: cid(8), name: "Homework Assistance", slug: "homework-assistance" },
      { id: sid(), categoryId: cid(8), name: "Handwritten Notes", slug: "handwritten-notes" },
      { id: sid(), categoryId: cid(8), name: "Handwritten Assignments", slug: "handwritten-assignments" },
      { id: sid(), categoryId: cid(8), name: "Lab Reports", slug: "lab-reports" },
      { id: sid(), categoryId: cid(8), name: "Tutoring (Math)", slug: "tutoring-math" },
      { id: sid(), categoryId: cid(8), name: "Tutoring (Physics)", slug: "tutoring-physics" },
      { id: sid(), categoryId: cid(8), name: "Tutoring (Chemistry)", slug: "tutoring-chemistry" },
      { id: sid(), categoryId: cid(8), name: "Tutoring (Computer Science)", slug: "tutoring-cs" },
      { id: sid(), categoryId: cid(8), name: "Tutoring (English/Writing)", slug: "tutoring-english" },
      { id: sid(), categoryId: cid(8), name: "Tutoring (Accounting)", slug: "tutoring-accounting" },
      { id: sid(), categoryId: cid(8), name: "Exam Preparation", slug: "exam-preparation" },
      { id: sid(), categoryId: cid(8), name: "Presentation Slides (PPT)", slug: "presentation-slides" },
      { id: sid(), categoryId: cid(8), name: "Literature Review", slug: "literature-review" },
      { id: sid(), categoryId: cid(8), name: "Plagiarism Check & Fix", slug: "plagiarism-check" },
      { id: sid(), categoryId: cid(8), name: "Citation/References (APA, MLA)", slug: "citation-references" },
      { id: sid(), categoryId: cid(8), name: "Final Year Project Help", slug: "fyp-help" },
      { id: sid(), categoryId: cid(8), name: "Capstone Project", slug: "capstone-project" },
      { id: sid(), categoryId: cid(8), name: "SOP/LOR Writing", slug: "sop-lor-writing" },
      { id: sid(), categoryId: cid(8), name: "Research Methodology", slug: "research-methodology" },
      { id: sid(), categoryId: cid(8), name: "Typing & Formatting", slug: "typing-formatting" },
      { id: sid(), categoryId: cid(8), name: "Data Entry", slug: "data-entry" },
    ],
  },

  // ━━━ 9. Programming Languages ━━━
  {
    id: cid(9),
    name: "Programming Languages",
    slug: "programming-languages",
    icon: "Code2",
    skills: [
      { id: sid(), categoryId: cid(9), name: "Python", slug: "python" },
      { id: sid(), categoryId: cid(9), name: "Java", slug: "java" },
      { id: sid(), categoryId: cid(9), name: "C", slug: "c" },
      { id: sid(), categoryId: cid(9), name: "C++", slug: "cpp" },
      { id: sid(), categoryId: cid(9), name: "C#", slug: "csharp" },
      { id: sid(), categoryId: cid(9), name: "Go", slug: "go" },
      { id: sid(), categoryId: cid(9), name: "Rust", slug: "rust" },
      { id: sid(), categoryId: cid(9), name: "Ruby", slug: "ruby" },
      { id: sid(), categoryId: cid(9), name: "Scala", slug: "scala" },
      { id: sid(), categoryId: cid(9), name: "Perl", slug: "perl" },
      { id: sid(), categoryId: cid(9), name: "Haskell", slug: "haskell" },
      { id: sid(), categoryId: cid(9), name: "Assembly", slug: "assembly" },
      { id: sid(), categoryId: cid(9), name: "Shell/Bash Scripting", slug: "shell-bash" },
      { id: sid(), categoryId: cid(9), name: "Solidity (Blockchain)", slug: "solidity" },
    ],
  },

  // ━━━ 10. DevOps & Cloud ━━━
  {
    id: cid(10),
    name: "DevOps & Cloud",
    slug: "devops-cloud",
    icon: "Cloud",
    skills: [
      { id: sid(), categoryId: cid(10), name: "AWS", slug: "aws" },
      { id: sid(), categoryId: cid(10), name: "Google Cloud (GCP)", slug: "gcp" },
      { id: sid(), categoryId: cid(10), name: "Microsoft Azure", slug: "azure" },
      { id: sid(), categoryId: cid(10), name: "Docker", slug: "docker" },
      { id: sid(), categoryId: cid(10), name: "Kubernetes", slug: "kubernetes" },
      { id: sid(), categoryId: cid(10), name: "CI/CD Pipelines", slug: "cicd" },
      { id: sid(), categoryId: cid(10), name: "GitHub Actions", slug: "github-actions" },
      { id: sid(), categoryId: cid(10), name: "Linux Administration", slug: "linux-admin" },
      { id: sid(), categoryId: cid(10), name: "Nginx/Apache", slug: "nginx-apache" },
      { id: sid(), categoryId: cid(10), name: "Terraform", slug: "terraform" },
      { id: sid(), categoryId: cid(10), name: "Firebase", slug: "firebase" },
      { id: sid(), categoryId: cid(10), name: "Supabase", slug: "supabase" },
      { id: sid(), categoryId: cid(10), name: "Vercel / Netlify", slug: "vercel-netlify" },
    ],
  },

  // ━━━ 11. Business & Finance ━━━
  {
    id: cid(11),
    name: "Business & Finance",
    slug: "business-finance",
    icon: "Briefcase",
    skills: [
      { id: sid(), categoryId: cid(11), name: "Business Plan Writing", slug: "business-plan" },
      { id: sid(), categoryId: cid(11), name: "Financial Modeling", slug: "financial-modeling" },
      { id: sid(), categoryId: cid(11), name: "Bookkeeping", slug: "bookkeeping" },
      { id: sid(), categoryId: cid(11), name: "Accounting (QuickBooks)", slug: "accounting-quickbooks" },
      { id: sid(), categoryId: cid(11), name: "Market Research", slug: "market-research" },
      { id: sid(), categoryId: cid(11), name: "Pitch Deck Creation", slug: "pitch-deck" },
      { id: sid(), categoryId: cid(11), name: "Virtual Assistant", slug: "virtual-assistant" },
      { id: sid(), categoryId: cid(11), name: "Project Management", slug: "project-management" },
      { id: sid(), categoryId: cid(11), name: "Startup Consulting", slug: "startup-consulting" },
      { id: sid(), categoryId: cid(11), name: "E-commerce Management", slug: "ecommerce-management" },
    ],
  },

  // ━━━ 12. AI & Machine Learning ━━━
  {
    id: cid(12),
    name: "AI & Machine Learning",
    slug: "ai-machine-learning",
    icon: "Brain",
    skills: [
      { id: sid(), categoryId: cid(12), name: "Machine Learning", slug: "machine-learning" },
      { id: sid(), categoryId: cid(12), name: "Deep Learning", slug: "deep-learning" },
      { id: sid(), categoryId: cid(12), name: "Natural Language Processing", slug: "nlp" },
      { id: sid(), categoryId: cid(12), name: "Computer Vision", slug: "computer-vision" },
      { id: sid(), categoryId: cid(12), name: "TensorFlow", slug: "tensorflow" },
      { id: sid(), categoryId: cid(12), name: "PyTorch", slug: "pytorch" },
      { id: sid(), categoryId: cid(12), name: "Scikit-learn", slug: "scikit-learn" },
      { id: sid(), categoryId: cid(12), name: "ChatGPT/LLM Integration", slug: "chatgpt-llm" },
      { id: sid(), categoryId: cid(12), name: "AI Chatbot Development", slug: "ai-chatbot" },
      { id: sid(), categoryId: cid(12), name: "Prompt Engineering", slug: "prompt-engineering" },
      { id: sid(), categoryId: cid(12), name: "AI Image Generation", slug: "ai-image-gen" },
      { id: sid(), categoryId: cid(12), name: "Data Labeling/Annotation", slug: "data-labeling" },
    ],
  },

  // ━━━ 13. Database & Backend ━━━
  {
    id: cid(13),
    name: "Database & Backend",
    slug: "database-backend",
    icon: "Database",
    skills: [
      { id: sid(), categoryId: cid(13), name: "PostgreSQL", slug: "postgresql" },
      { id: sid(), categoryId: cid(13), name: "MySQL", slug: "mysql" },
      { id: sid(), categoryId: cid(13), name: "MongoDB", slug: "mongodb" },
      { id: sid(), categoryId: cid(13), name: "Redis", slug: "redis" },
      { id: sid(), categoryId: cid(13), name: "Firebase Firestore", slug: "firestore" },
      { id: sid(), categoryId: cid(13), name: "Prisma ORM", slug: "prisma" },
      { id: sid(), categoryId: cid(13), name: "Sequelize", slug: "sequelize" },
      { id: sid(), categoryId: cid(13), name: "API Design", slug: "api-design" },
      { id: sid(), categoryId: cid(13), name: "Microservices Architecture", slug: "microservices" },
      { id: sid(), categoryId: cid(13), name: "Authentication Systems", slug: "auth-systems" },
    ],
  },

  // ━━━ 14. Audio & Music ━━━
  {
    id: cid(14),
    name: "Audio & Music",
    slug: "audio-music",
    icon: "Music",
    skills: [
      { id: sid(), categoryId: cid(14), name: "Audio Editing", slug: "audio-editing" },
      { id: sid(), categoryId: cid(14), name: "Podcast Editing", slug: "podcast-editing" },
      { id: sid(), categoryId: cid(14), name: "Music Production", slug: "music-production" },
      { id: sid(), categoryId: cid(14), name: "Voice Over", slug: "voice-over" },
      { id: sid(), categoryId: cid(14), name: "Sound Design", slug: "sound-design" },
      { id: sid(), categoryId: cid(14), name: "Mixing & Mastering", slug: "mixing-mastering" },
      { id: sid(), categoryId: cid(14), name: "Jingle Creation", slug: "jingle-creation" },
    ],
  },

  // ━━━ 15. Game Development ━━━
  {
    id: cid(15),
    name: "Game Development",
    slug: "game-development",
    icon: "Gamepad2",
    skills: [
      { id: sid(), categoryId: cid(15), name: "Unity", slug: "unity" },
      { id: sid(), categoryId: cid(15), name: "Unreal Engine", slug: "unreal-engine" },
      { id: sid(), categoryId: cid(15), name: "Godot", slug: "godot" },
      { id: sid(), categoryId: cid(15), name: "Game Design", slug: "game-design" },
      { id: sid(), categoryId: cid(15), name: "2D Game Art", slug: "2d-game-art" },
      { id: sid(), categoryId: cid(15), name: "3D Game Modeling", slug: "3d-game-modeling" },
      { id: sid(), categoryId: cid(15), name: "Level Design", slug: "level-design" },
    ],
  },
];

// Flat list of all skills
export const ALL_SKILLS = SKILL_CATEGORIES.flatMap((cat) =>
  cat.skills.map((skill) => ({ ...skill, categoryName: cat.name }))
);

// Get skill by id
export function getSkillById(id: string) {
  return ALL_SKILLS.find((s) => s.id === id);
}

// Get category by id
export function getCategoryById(id: string) {
  return SKILL_CATEGORIES.find((c) => c.id === id);
}

// Search skills by query
export function searchSkills(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ALL_SKILLS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.categoryName.toLowerCase().includes(q)
  );
}
