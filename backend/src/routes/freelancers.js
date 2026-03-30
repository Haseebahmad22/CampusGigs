const express = require("express");

const { query } = require("../db/pool");
const { mapProfileRowToResponse } = require("../utils/profile");

const router = express.Router();

async function getSkillsByUserId(userId) {
  const result = await query(
    `
      SELECT
        fs.id,
        fs.skill_id,
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
    skillId: row.skill_id,
    skillName: row.skill_name,
    categoryName: row.category_name,
    proficiencyLevel: row.proficiency_level,
  }));
}

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const sortMap = {
      rating: "fp.average_rating DESC NULLS LAST",
      jobs: "fp.total_jobs_completed DESC NULLS LAST",
      rate_low: "fp.hourly_rate ASC NULLS LAST",
      rate_high: "fp.hourly_rate DESC NULLS LAST",
    };

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const availability =
      typeof req.query.availability === "string" ? req.query.availability.trim() : "";
    const sort = typeof req.query.sort === "string" ? req.query.sort.trim() : "";

    const where = ["u.role = 'freelancer'"];
    const params = [];

    if (q) {
      params.push(`%${q}%`);
      const searchParam = `$${params.length}`;
      where.push(`(
        u.full_name ILIKE ${searchParam}
        OR fp.headline ILIKE ${searchParam}
        OR fp.bio ILIKE ${searchParam}
        OR fp.university ILIKE ${searchParam}
        OR EXISTS (
          SELECT 1
          FROM freelancer_skills fs
          INNER JOIN skills s ON s.id = fs.skill_id
          WHERE fs.user_id = u.id AND s.name ILIKE ${searchParam}
        )
      )`);
    }

    if (category) {
      params.push(category);
      const categoryParam = `$${params.length}`;
      where.push(`EXISTS (
        SELECT 1
        FROM freelancer_skills fs
        INNER JOIN skills s ON s.id = fs.skill_id
        INNER JOIN skill_categories sc ON sc.id = s.category_id
        WHERE fs.user_id = u.id AND sc.name ILIKE ${categoryParam}
      )`);
    }

    if (availability) {
      params.push(availability);
      where.push(`fp.availability = $${params.length}`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const orderBy = sortMap[sort] || "fp.created_at DESC";

    const countResult = await query(
      `
        SELECT COUNT(*)::int AS total
        FROM users u
        INNER JOIN freelancer_profiles fp ON fp.user_id = u.id
        ${whereClause}
      `,
      params
    );

    const queryParams = [...params, limit, offset];
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
          u.updated_at AS user_updated_at
        FROM users u
        INNER JOIN freelancer_profiles fp ON fp.user_id = u.id
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT $${queryParams.length - 1}
        OFFSET $${queryParams.length}
      `,
      queryParams
    );

    const data = [];

    for (const row of result.rows) {
      const skills = await getSkillsByUserId(row.user_id);
      data.push(mapProfileRowToResponse(row, skills));
    }

    return res.status(200).json({
      data,
      total: countResult.rows[0]?.total || 0,
      page,
      limit,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
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
        INNER JOIN freelancer_profiles fp ON fp.user_id = u.id
        WHERE u.id = $1
        LIMIT 1
      `,
      [userId]
    );

    const row = result.rows[0];

    if (!row || row.role !== "freelancer") {
      return res.status(404).json({ error: "Freelancer profile not found." });
    }

    const skills = await getSkillsByUserId(userId);
    return res.status(200).json(mapProfileRowToResponse(row, skills));
  } catch (error) {
    return next(error);
  }
});

router.get("/:userId/active-gigs", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await query(
      `
        SELECT g.id, g.title, g.token_reward, g.status, g.created_at
        FROM gigs g
        WHERE g.freelancer_id = $1 AND g.status IN ('in_progress', 'pending_completion')
        ORDER BY g.created_at DESC
      `,
      [userId]
    );

    const data = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      tokenReward: row.token_reward,
      status: row.status,
      createdAt: row.created_at,
    }));

    return res.status(200).json({ data });
  } catch (error) {
    return next(error);
  }
});

router.get("/:userId/reviews", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await query(
      `
        SELECT
          r.id,
          r.rating,
          r.comment,
          r.created_at,
          c.full_name AS client_name,
          fp.avatar_url AS client_avatar,
          g.title AS gig_title
        FROM reviews r
        INNER JOIN users c ON c.id = r.client_id
        LEFT JOIN freelancer_profiles fp ON fp.user_id = c.id
        LEFT JOIN gigs g ON g.id = r.gig_id
        WHERE r.freelancer_id = $1
        ORDER BY r.created_at DESC
      `,
      [userId]
    );

    const stats = await query(
      `
        SELECT
          COALESCE(AVG(rating), 0)::numeric(3,2) AS average_rating,
          COUNT(*)::int AS total
        FROM reviews
        WHERE freelancer_id = $1
      `,
      [userId]
    );

    const data = result.rows.map((row) => ({
      id: row.id,
      clientName: row.client_name,
      clientAvatar: row.client_avatar,
      rating: Number(row.rating),
      comment: row.comment,
      gigTitle: row.gig_title || null,
      createdAt: row.created_at,
    }));

    return res.status(200).json({
      data,
      averageRating: Number(stats.rows[0]?.average_rating || 0),
      total: stats.rows[0]?.total || 0,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;