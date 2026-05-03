const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT || 4000),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  defaultStartingTokens: Number(process.env.DEFAULT_STARTING_TOKENS || 50),
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

if (!env.databaseUrl) {
  throw new Error("Missing DATABASE_URL in environment variables.");
}

if (!env.jwtSecret) {
  throw new Error("Missing JWT_SECRET in environment variables.");
}

if (!env.supabaseUrl || !env.supabaseServiceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.");
}

module.exports = env;