/**
 * CampusGigs seed script
 * Creates client Amar Waqar, freelancer accounts with full profiles, gigs, and proposals
 */

const BASE = "http://localhost:4000/api";

async function post(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function put(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.json();
}

// ── helpers ──
async function signupOrLogin(email, password, fullName, role) {
  // Try signup first
  await post("/auth/signup", { email, password, fullName, role });
  // Then login (works whether signup succeeded or user already existed)
  const r = await post("/auth/login", { email, password });
  if (!r.token) throw new Error(`Login failed for ${email}: ${JSON.stringify(r)}`);
  return { token: r.token, user: r.user };
}

// ── main ──
async function seed() {
  console.log("🌱 Starting seed...\n");

  // ── 1. Client: Amar Waqar ──
  console.log("Creating client: Amar Waqar...");
  const { token: clientToken, user: client } = await signupOrLogin(
    "amarwaqar15@gmail.com", "t6k1#90g", "Amar Waqar", "client"
  );
  console.log(`  ✓ Client ID: ${client.id}`);

  // ── 2. Freelancers ──
  const freelancerDefs = [
    {
      email: "sara.khan@seed.com", password: "Seed1234!", fullName: "Sara Khan",
      profile: {
        headline: "Full-Stack Web Developer & React Specialist",
        bio: "Hi! I'm Sara, a 3rd-year CS student at LUMS with 2+ years of freelance experience building web apps. I specialize in React, Next.js, and Node.js. I've delivered 18+ projects for clients ranging from startups to university societies. I write clean, well-documented code and communicate proactively throughout the project.",
        hourlyRate: 40, location: "Lahore, Pakistan", university: "LUMS",
        department: "Computer Science", semester: "6th Semester",
        languages: ["English", "Urdu"],
        availability: "available",
        skills: [
          { skillId: "react", proficiencyLevel: "expert" },
          { skillId: "nextjs", proficiencyLevel: "expert" },
          { skillId: "nodejs", proficiencyLevel: "intermediate" },
          { skillId: "typescript", proficiencyLevel: "intermediate" },
          { skillId: "tailwind-css", proficiencyLevel: "expert" },
          { skillId: "postgresql", proficiencyLevel: "intermediate" },
        ],
      },
    },
    {
      email: "ahmed.malik@seed.com", password: "Seed1234!", fullName: "Ahmed Malik",
      profile: {
        headline: "UI/UX Designer & Figma Expert",
        bio: "I'm Ahmed, a design-focused developer at FAST-NUCES Karachi. I create beautiful, user-centered designs that convert. My workflow goes from research → wireframes → high-fidelity Figma prototypes → handoff. I've worked on 12+ projects including mobile apps, SaaS dashboards, and e-commerce stores. I believe great design is invisible — it just works.",
        hourlyRate: 35, location: "Karachi, Pakistan", university: "FAST-NUCES",
        department: "Software Engineering", semester: "5th Semester",
        languages: ["English", "Urdu", "Hindi"],
        availability: "available",
        skills: [
          { skillId: "figma", proficiencyLevel: "expert" },
          { skillId: "ui-ux-design", proficiencyLevel: "expert" },
          { skillId: "adobe-photoshop", proficiencyLevel: "intermediate" },
          { skillId: "react", proficiencyLevel: "beginner" },
          { skillId: "css", proficiencyLevel: "intermediate" },
        ],
      },
    },
    {
      email: "zara.hussain@seed.com", password: "Seed1234!", fullName: "Zara Hussain",
      profile: {
        headline: "Python Developer & Data Analyst",
        bio: "4th-year Data Science student at NUST. I build data pipelines, dashboards, and ML models. Comfortable with Python, Pandas, scikit-learn, and Power BI. I've completed projects in sentiment analysis, sales forecasting, and student performance prediction. Currently looking for freelance gigs in data analysis and backend Python work.",
        hourlyRate: 30, location: "Islamabad, Pakistan", university: "NUST",
        department: "Data Science", semester: "7th Semester",
        languages: ["English", "Urdu"],
        availability: "available",
        skills: [
          { skillId: "python", proficiencyLevel: "expert" },
          { skillId: "data-analysis", proficiencyLevel: "expert" },
          { skillId: "machine-learning", proficiencyLevel: "intermediate" },
          { skillId: "sql", proficiencyLevel: "intermediate" },
          { skillId: "power-bi", proficiencyLevel: "intermediate" },
        ],
      },
    },
    {
      email: "bilal.raza@seed.com", password: "Seed1234!", fullName: "Bilal Raza",
      profile: {
        headline: "Content Writer & Academic Writing Expert",
        bio: "I'm Bilal, an English Literature graduate from GCU Lahore with a passion for writing. I've written blog posts, whitepapers, research articles, and marketing copy for 25+ clients. My writing is SEO-optimized, plagiarism-free, and always delivered on time. I specialize in tech, education, and business niches. Fluent in English and Urdu.",
        hourlyRate: 20, location: "Lahore, Pakistan", university: "GCU Lahore",
        department: "English Literature", semester: "Graduated",
        languages: ["English", "Urdu"],
        availability: "available",
        skills: [
          { skillId: "copywriting", proficiencyLevel: "expert" },
          { skillId: "seo-writing", proficiencyLevel: "expert" },
          { skillId: "academic-writing", proficiencyLevel: "expert" },
          { skillId: "blog-writing", proficiencyLevel: "expert" },
          { skillId: "research", proficiencyLevel: "intermediate" },
        ],
      },
    },
    {
      email: "hania.ali@seed.com", password: "Seed1234!", fullName: "Hania Ali",
      profile: {
        headline: "Mobile Developer — React Native & Flutter",
        bio: "2nd-year MS student at IBA Karachi specializing in mobile development. I've built and launched 4 mobile apps — 2 on the Play Store. My stack is React Native for cross-platform and Flutter for high-performance apps. I handle everything from UI to API integration to app store submission. Quick turnaround, clean architecture.",
        hourlyRate: 45, location: "Karachi, Pakistan", university: "IBA Karachi",
        department: "Computer Science", semester: "Masters",
        languages: ["English", "Urdu", "Sindhi"],
        availability: "available",
        skills: [
          { skillId: "react-native", proficiencyLevel: "expert" },
          { skillId: "flutter", proficiencyLevel: "expert" },
          { skillId: "typescript", proficiencyLevel: "intermediate" },
          { skillId: "firebase", proficiencyLevel: "intermediate" },
        ],
      },
    },
  ];

  const freelancers = [];
  console.log("\nCreating freelancers...");

  for (const def of freelancerDefs) {
    process.stdout.write(`  Creating ${def.fullName}... `);
    const { token, user } = await signupOrLogin(def.email, def.password, def.fullName, "freelancer");

    // Update profile
    await put("/profile/me", {
      fullName: def.fullName,
      headline: def.profile.headline,
      bio: def.profile.bio,
      hourlyRate: def.profile.hourlyRate,
      location: def.profile.location,
      university: def.profile.university,
      department: def.profile.department,
      semester: def.profile.semester,
      languages: def.profile.languages,
      availability: def.profile.availability,
    }, token);

    // Add skills
    await post("/profile/me/skills", { skills: def.profile.skills }, token);

    console.log(`✓ ID: ${user.id}`);
    freelancers.push({ token, user, def });
  }

  // ── 3. Gigs for Amar Waqar ──
  const gigDefs = [
    {
      title: "Build a Personal Portfolio Website",
      description: "I need a modern, responsive portfolio website built with Next.js and Tailwind CSS. It should include:\n- Home/hero section with animated introduction\n- Projects section with filterable cards\n- Skills section\n- Contact form (connected to email)\n- Dark mode toggle\n\nDesign should be clean and professional. Source code required. Should be deployable on Vercel.",
      tokenReward: 80,
    },
    {
      title: "Design Figma UI for Mobile App",
      description: "I have a mobile food delivery app idea and need a complete UI design in Figma. Required screens:\n- Onboarding (3 screens)\n- Home feed\n- Restaurant detail\n- Cart & checkout\n- Order tracking\n- Profile\n\nStyle: modern, colorful, food-focused. Deliverable: Figma file with components, auto-layout, and prototype linking.",
      tokenReward: 60,
    },
    {
      title: "Write 5 SEO Blog Posts for Tech Startup",
      description: "Our early-stage SaaS startup needs 5 long-form blog posts (1500-2000 words each) targeting specific keywords in the productivity tools niche. Topics will be provided. Requirements:\n- Keyword-optimized\n- Engaging tone (not corporate)\n- Internal linking suggestions\n- Meta descriptions included\n- No AI-generated filler\n\nDeadline: 1 week.",
      tokenReward: 50,
    },
    {
      title: "Python Data Analysis Dashboard",
      description: "I have a CSV dataset of 12 months of e-commerce sales data and need:\n1. Data cleaning and preprocessing\n2. Exploratory analysis with key insights\n3. Interactive dashboard (Streamlit or Plotly Dash)\n4. Charts: revenue trends, top products, customer segments, monthly growth\n5. PDF export of key metrics\n\nDataset will be shared after hiring. Python only.",
      tokenReward: 70,
    },
    {
      title: "React Native Expense Tracker App",
      description: "I need a simple but polished expense tracker mobile app built in React Native (Expo). Features:\n- Add/edit/delete expenses with categories\n- Monthly summary with pie chart\n- Budget setting and alerts\n- Local storage persistence\n- Clean, minimal UI\n\nMust work on both iOS and Android. Submit Expo project with README.",
      tokenReward: 90,
    },
    {
      title: "Logo Design + Brand Identity Pack",
      description: "Need a complete brand identity for my new tutoring business 'MentorMate'. Deliverables:\n- Logo (3 concepts, 1 refined)\n- Color palette\n- Typography selection\n- Business card design\n- Social media profile/cover templates (Facebook, Instagram)\n\nStyle: friendly, professional, academic. File formats: AI, SVG, PNG.",
      tokenReward: 45,
    },
  ];

  console.log("\nCreating gigs for Amar Waqar...");
  const createdGigs = [];
  for (const g of gigDefs) {
    process.stdout.write(`  "${g.title.substring(0, 40)}..."  `);
    const gig = await post("/gigs", g, clientToken);
    if (gig.id) {
      console.log(`✓ ID: ${gig.id}`);
      createdGigs.push(gig);
    } else {
      console.log(`✗ Failed: ${JSON.stringify(gig)}`);
    }
  }

  // ── 4. Freelancers apply to gigs ──
  console.log("\nSubmitting proposals...");

  const proposals = [
    // Portfolio website — Sara and Ahmed apply
    {
      gigIndex: 0,
      freelancerIndex: 0, // Sara
      coverLetter: "Hi Amar! Portfolio sites are my specialty. I've built 6 of them this year using Next.js + Tailwind. I can handle the animated hero, filterable projects, dark mode, and Vercel deployment. My typical turnaround for this scope is 5-6 days. I'll share a Loom walkthrough of my previous portfolio work before starting. Happy to hop on a quick call to align on the design direction.",
    },
    {
      gigIndex: 0,
      freelancerIndex: 1, // Ahmed
      coverLetter: "Hey! I do both design and development so I can give you a really polished result — not just functional but visually sharp. I'll start with a Figma mockup for your approval before coding. Next.js + Tailwind is my stack. Let me know your timeline.",
    },
    // Figma UI — Ahmed applies
    {
      gigIndex: 1,
      freelancerIndex: 1, // Ahmed
      coverLetter: "Figma UI for mobile apps is exactly my thing. I've designed full app UI kits for 4 clients, 2 of which are live on the store. I work with proper component libraries, auto-layout, and interactive prototypes so your handoff to dev is smooth. I'll start with a style guide and get your approval before going into full screens. 5-7 days for this scope.",
    },
    {
      gigIndex: 1,
      freelancerIndex: 4, // Hania — mobile background
      coverLetter: "As a mobile developer I design with implementation in mind, so you'll get a UI that's not just beautiful but actually buildable without hacks. I use Figma daily for my own projects. I can design all 7 screens with a prototype and a developer-ready component spec.",
    },
    // Blog posts — Bilal applies
    {
      gigIndex: 2,
      freelancerIndex: 3, // Bilal
      coverLetter: "SEO blog writing for tech startups is my core niche. I've written 80+ articles for SaaS companies in the productivity and project management space. I do full keyword research, competitor analysis, and proper on-page SEO. I write like a human, not a keyword robot. I'll send you 1 sample post before starting so you can feel the tone. 5 articles in 7 days — no problem.",
    },
    {
      gigIndex: 2,
      freelancerIndex: 2, // Zara — data background, also writes
      coverLetter: "I write a tech blog myself with 1.2k monthly readers so I understand what makes content resonate in the tech space. My writing is data-backed and structured for both readers and search engines. I can cover productivity tools, automation, and SaaS topics with authority. Let me write the first post as a test — if you like it, we move forward.",
    },
    // Python Dashboard — Zara applies
    {
      gigIndex: 3,
      freelancerIndex: 2, // Zara
      coverLetter: "This is exactly the type of project I love. I've built 3 Streamlit dashboards for e-commerce data in the last semester — revenue trends, customer cohorts, product performance. I'll start with EDA and share my findings before building the dashboard so we're aligned on what matters. Plotly charts, clean layout, and PDF export included. 4-5 days for this.",
    },
    {
      gigIndex: 3,
      freelancerIndex: 0, // Sara — full stack, handles Python too
      coverLetter: "I've been using Python for data work alongside my web dev projects. I can build you a clean Streamlit dashboard with Plotly charts. My approach: clean the data first, share insights doc for your review, then build the interactive dashboard. Straightforward and no surprises.",
    },
    // React Native app — Hania applies, Sara applies
    {
      gigIndex: 4,
      freelancerIndex: 4, // Hania
      coverLetter: "Expense trackers are a great starting project and I've built one as part of my portfolio! Happy to adapt and extend it for your requirements. I use Expo + AsyncStorage for local persistence and Victory Native for charts. My version of this took me 4 days to build cleanly. For your spec I'd say 5 days comfortably. I'll share my existing expense tracker code so you can see my approach.",
    },
    {
      gigIndex: 4,
      freelancerIndex: 0, // Sara
      coverLetter: "I've built 2 React Native apps with Expo and this spec is very achievable. Pie chart for categories, budget alerts, AsyncStorage for persistence — all standard but I'll implement them cleanly with a good folder structure. I'd say 6 days including testing on both platforms.",
    },
    // Logo & brand — Ahmed applies
    {
      gigIndex: 5,
      freelancerIndex: 1, // Ahmed
      coverLetter: "Brand identity work is my favourite. 'MentorMate' has a lot of potential — academic + approachable is a great brief to work with. I'll give you 3 distinct logo directions and we'll refine the one you like. Color palette, typography, business card, and social templates are all included. Deliverables in AI, SVG, and PNG. 4-5 days.",
    },
    {
      gigIndex: 5,
      freelancerIndex: 3, // Bilal — also does some design support
      coverLetter: "I work closely with designers on brand projects and have handled the copywriting and brand voice for 4 identity projects. For MentorMate I can deliver the logo concepts and brand pack. Friendly and professional is a tone I've worked with a lot in the education space.",
    },
  ];

  for (const p of proposals) {
    const gig = createdGigs[p.gigIndex];
    const fl = freelancers[p.freelancerIndex];
    if (!gig || !fl) continue;

    process.stdout.write(`  ${fl.def.fullName} → "${gig.title.substring(0, 35)}..."  `);
    const res = await post(`/gigs/${gig.id}/proposals`, { coverLetter: p.coverLetter }, fl.token);
    if (res.id) {
      console.log("✓");
    } else {
      console.log(`✗ ${JSON.stringify(res)}`);
    }
  }

  // ── 5. Summary ──
  console.log("\n" + "─".repeat(60));
  console.log("✅ Seed complete!\n");
  console.log("CLIENT LOGIN:");
  console.log("  Email   : amarwaqar15@gmail.com");
  console.log("  Password: t6k1#90g");
  console.log("\nFREELANCER LOGINS (all use password: Seed1234!):");
  for (const fl of freelancers) {
    console.log(`  ${fl.def.fullName.padEnd(16)} : ${fl.def.email}`);
  }
  console.log("\nGIGS CREATED:", createdGigs.length);
  console.log("─".repeat(60));
}

seed().catch((e) => { console.error("Seed failed:", e); process.exit(1); });
