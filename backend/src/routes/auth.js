const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { query } = require("../db/pool");
const { jwtSecret, defaultStartingTokens } = require("../config/env");

const router = express.Router();

const allowedRoles = new Set(["client", "freelancer"]);

function validateSignupInput({ email, password, fullName, role }) {
  if (!email || !password) {
    return "Email and password are required.";
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return "Please provide a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (fullName && fullName.length > 100) {
    return "Full name must be at most 100 characters.";
  }

  if (!role || !allowedRoles.has(role)) {
    return "Role must be either client or freelancer.";
  }

  return null;
}

function validateLoginInput({ email, password }) {
  if (!email || !password) {
    return "Email and password are required.";
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return "Please provide a valid email address.";
  }

  return null;
}

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, fullName, role } = req.body;
    const validationError = validateSignupInput({ email, password, fullName, role });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);

    if (existingUser.rowCount > 0) {
      return res.status(409).json({ error: "User already exists with this email." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      `
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, full_name, role, created_at
      `,
      [normalizedEmail, passwordHash, fullName || null, role]
    );

    const user = result.rows[0];

    const startingTokens = Math.max(Number(defaultStartingTokens) || 0, 0);
    await query(
      `INSERT INTO token_accounts (user_id, balance) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING`,
      [user.id, startingTokens]
    );

    if (startingTokens > 0) {
      await query(
        `
          INSERT INTO token_transactions (type, from_user_id, to_user_id, amount, note)
          VALUES ('signup_bonus', NULL, $1, $2, $3)
        `,
        [user.id, startingTokens, "Signup bonus"]
      );
    }

    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, jwtSecret, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      message: "Signup successful.",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const validationError = validateLoginInput({ email, password });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const result = await query(
      "SELECT id, email, full_name, role, password_hash, created_at FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, jwtSecret, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;