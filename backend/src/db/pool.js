const { Pool } = require("pg");
const { databaseUrl } = require("../config/env");

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};