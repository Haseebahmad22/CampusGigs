const express = require("express");

const { query } = require("../db/pool");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { mapProfileRowToResponse, calculateProfileCompletion } = require("../utils/profile");

const router = express.Router();

async function ensureFreelancerProfile(userId) {
  await query(
    `
      INSERT INTO freelancer_profiles (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
    `,
    [userId]
  );
}

async function getProfileRowByUserId(userId) {
  const result = await query(
    `
      SELECT
        fp.id AS profile_id,
        fp.user_id,
        u.email,
        u.full_name,
        fp.bio,
        fp.headline,
        fp.hourly_rate,
        fp.avatar_url,
        fp.location,
        fp.university,
        fp.department,
        fp.semester,
        fp.languages,
        fp.availability,
        fp.total_earnings,
        fp.total_jobs_completed,
        fp.average_rating,
        fp.profile_completion_pct,
        fp.created_at AS profile_created_at,
        fp.updated_at AS profile_updated_at,
        u.created_at AS user_created_at,
        u.updated_at AS user_updated_at,
        u.role
      FROM users u
      LEFT JOIN freelancer_profiles fp ON fp.user_id = u.id
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

async function getSkillsByUserId(userId) {
  const result = await query(
    `
      SELECT
        fs.id,
        s.slug AS skill_slug,
        s.name AS skill_name,
        sc.name AS category_name,
        fs.proficiency_level
      FROM freelancer_skills fs
      INNER JOIN skills s ON s.id = fs.skill_id
      INNER JOIN skill_categories sc ON sc.id = s.category_id
      WHERE fs.user_id = $1
      ORDER BY sc.sort_order ASC, s.name ASC
    `,
    [userId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    skillId: row.skill_slug,
    skillName: row.skill_name,
    categoryName: row.category_name,
    proficiencyLevel: row.proficiency_level,
  }));
}

router.get("/me", auth, async (req, res, next) => {
  try {
    if (req.user.role === "freelancer") {
      await ensureFreelancerProfile(req.user.id);
    }

    const row = await getProfileRowByUserId(req.user.id);

    if (!row) {
      return res.status(404).json({ error: "Profile not found." });
    }

    const skills = req.user.role === "freelancer" ? await getSkillsByUserId(req.user.id) : [];
    return res.status(200).json(mapProfileRowToResponse(row, skills));
  } catch (error) {
    return next(error);
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const row = await getProfileRowByUserId(userId);

    if (!row || row.role !== "freelancer") {
      return res.status(404).json({ error: "Freelancer profile not found." });
    }

    const skills = await getSkillsByUserId(userId);
    return res.status(200).json(mapProfileRowToResponse(row, skills));
  } catch (error) {
    return next(error);
  }
});

router.put("/me", auth, async (req, res, next) => {
  try {
    const {
      fullName,
      headline,
      bio,
      hourlyRate,
      location,
      university,
      department,
      semester,
      languages,
      availability,
    } = req.body;

    const validAvailabilities = new Set(["available", "busy", "away", "not_available"]);
    const safeAvailability = validAvailabilities.has(availability) ? availability : "available";
    const safeLanguages = Array.isArray(languages)
      ? languages.filter((value) => typeof value === "string" && value.trim().length > 0)
      : [];

    await query("UPDATE users SET full_name = $1 WHERE id = $2", [fullName || null, req.user.id]);

    if (req.user.role === "freelancer") {
      await ensureFreelancerProfile(req.user.id);

      const currentRow = await getProfileRowByUserId(req.user.id);
      const completion = calculateProfileCompletion({
        fullName,
        headline,
        bio,
        hourlyRate,
        avatarUrl: currentRow?.avatar_url || null,
        location,
        university,
        department,
        semester,
        languages: safeLanguages,
      });

      await query(
        `
          UPDATE freelancer_profiles
          SET
            bio = $1,
            headline = $2,
            hourly_rate = $3,
            location = $4,
            university = $5,
            department = $6,
            semester = $7,
            languages = $8,
            availability = $9,
            profile_completion_pct = $10
          WHERE user_id = $11
        `,
        [
          bio || null,
          headline || null,
          hourlyRate !== undefined && hourlyRate !== null ? Number(hourlyRate) : null,
          location || null,
          university || null,
          department || null,
          semester || null,
          safeLanguages,
          safeAvailability,
          completion,
          req.user.id,
        ]
      );
    }

    const row = await getProfileRowByUserId(req.user.id);
    const skills = req.user.role === "freelancer" ? await getSkillsByUserId(req.user.id) : [];
    return res.status(200).json(mapProfileRowToResponse(row, skills));
  } catch (error) {
    return next(error);
  }
});

router.post("/me/avatar", auth, requireRole("freelancer"), async (req, res, next) => {
  try {
    const { avatarUrl } = req.body;

    if (!avatarUrl || typeof avatarUrl !== "string") {
      return res.status(400).json({ error: "avatarUrl is required." });
    }

    await ensureFreelancerProfile(req.user.id);
    await query("UPDATE freelancer_profiles SET avatar_url = $1 WHERE user_id = $2", [
      avatarUrl,
      req.user.id,
    ]);

    const updatedRow = await getProfileRowByUserId(req.user.id);
    const completion = calculateProfileCompletion({
      fullName: updatedRow.full_name,
      headline: updatedRow.headline,
      bio: updatedRow.bio,
      hourlyRate: updatedRow.hourly_rate,
      avatarUrl,
      location: updatedRow.location,
      university: updatedRow.university,
      department: updatedRow.department,
      semester: updatedRow.semester,
      languages: updatedRow.languages || [],
    });
    await query(
      "UPDATE freelancer_profiles SET profile_completion_pct = $1 WHERE user_id = $2",
      [completion, req.user.id]
    );

    return res.status(200).json({ message: "Avatar updated successfully.", avatarUrl, profileCompletionPct: completion });
  } catch (error) {
    return next(error);
  }
});

router.delete("/me/avatar", auth, requireRole("freelancer"), async (req, res, next) => {
  try {
    await ensureFreelancerProfile(req.user.id);
    await query("UPDATE freelancer_profiles SET avatar_url = NULL WHERE user_id = $1", [req.user.id]);

    const updatedRow = await getProfileRowByUserId(req.user.id);
    const completion = calculateProfileCompletion({
      fullName: updatedRow.full_name,
      headline: updatedRow.headline,
      bio: updatedRow.bio,
      hourlyRate: updatedRow.hourly_rate,
      avatarUrl: null,
      location: updatedRow.location,
      university: updatedRow.university,
      department: updatedRow.department,
      semester: updatedRow.semester,
      languages: updatedRow.languages || [],
    });
    await query(
      "UPDATE freelancer_profiles SET profile_completion_pct = $1 WHERE user_id = $2",
      [completion, req.user.id]
    );

    return res.status(200).json({ message: "Avatar removed successfully.", profileCompletionPct: completion });
  } catch (error) {
    return next(error);
  }
});

router.get("/me/skills", auth, requireRole("freelancer"), async (req, res, next) => {
  try {
    await ensureFreelancerProfile(req.user.id);
    const skills = await getSkillsByUserId(req.user.id);
    return res.status(200).json({ data: skills });
  } catch (error) {
    return next(error);
  }
});

router.post("/me/skills", auth, requireRole("freelancer"), async (req, res, next) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: "skills must be a non-empty array." });
    }

    const validLevels = new Set(["beginner", "intermediate", "expert"]);

    for (const item of skills) {
      const skillSlug = item && item.skillId;
      const proficiencyLevel = validLevels.has(item?.proficiencyLevel)
        ? item.proficiencyLevel
        : "intermediate";

      if (!skillSlug) {
        return res.status(400).json({ error: "Each skill must include skillId." });
      }

      const skillLookup = await query("SELECT id FROM skills WHERE slug = $1", [skillSlug]);
      if (!skillLookup.rows.length) {
        return res.status(400).json({ error: `Skill not found: ${skillSlug}` });
      }
      const skillUuid = skillLookup.rows[0].id;

      await query(
        `
          INSERT INTO freelancer_skills (user_id, skill_id, proficiency_level)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, skill_id)
          DO UPDATE SET proficiency_level = EXCLUDED.proficiency_level
        `,
        [req.user.id, skillUuid, proficiencyLevel]
      );
    }

    const updated = await getSkillsByUserId(req.user.id);
    return res.status(200).json({ message: "Skills updated successfully.", data: updated });
  } catch (error) {
    return next(error);
  }
});

router.delete("/me/skills/:skillId", auth, requireRole("freelancer"), async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const skillLookup = await query("SELECT id FROM skills WHERE slug = $1", [skillId]);
    if (!skillLookup.rows.length) {
      return res.status(404).json({ error: "Skill not found." });
    }
    await query("DELETE FROM freelancer_skills WHERE user_id = $1 AND skill_id = $2", [
      req.user.id,
      skillLookup.rows[0].id,
    ]);

    return res.status(200).json({ message: "Skill removed successfully." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;