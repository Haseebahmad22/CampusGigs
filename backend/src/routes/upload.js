const express = require("express");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const auth = require("../middleware/auth");
const env = require("../config/env");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/zip",
]);

function getSupabase() {
  return createClient(env.supabaseUrl, env.supabaseServiceKey);
}

// POST /api/upload
// Body: multipart/form-data — file (required), prefix (optional folder path)
// Returns: { publicUrl, path }
router.post("/", auth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided." });
    }

    if (!ALLOWED_MIME.has(req.file.mimetype)) {
      return res
        .status(400)
        .json({ error: "File type not allowed. Use PDF, PNG, JPEG, WEBP, or ZIP." });
    }

    const prefix = (req.body.prefix || "uploads").replace(/\.\./g, "");
    const ext = (req.file.originalname.split(".").pop() || "bin").toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const storagePath = `${prefix}/${filename}`;

    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from("assets")
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("assets").getPublicUrl(data.path);

    return res.status(200).json({ publicUrl, path: data.path });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
