const express = require("express");

const { query } = require("../db/pool");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const categoriesResult = await query(
      "SELECT id, name, slug, icon, sort_order FROM skill_categories ORDER BY sort_order ASC, name ASC"
    );

    const skillsResult = await query(
      "SELECT id, category_id, name, slug FROM skills ORDER BY name ASC"
    );

    const skillsByCategory = new Map();

    for (const skill of skillsResult.rows) {
      const list = skillsByCategory.get(skill.category_id) || [];
      list.push({
        id: skill.id,
        categoryId: skill.category_id,
        name: skill.name,
        slug: skill.slug,
      });
      skillsByCategory.set(skill.category_id, list);
    }

    const data = categoriesResult.rows.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      sortOrder: category.sort_order,
      skills: skillsByCategory.get(category.id) || [],
    }));

    return res.status(200).json({ data });
  } catch (error) {
    return next(error);
  }
});

router.get("/categories", async (req, res, next) => {
  try {
    const result = await query(
      "SELECT id, name, slug, icon, sort_order FROM skill_categories ORDER BY sort_order ASC, name ASC"
    );

    const data = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: row.icon,
      sortOrder: row.sort_order,
    }));

    return res.status(200).json({ data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;