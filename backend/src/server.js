const express = require("express");
const cors = require("cors");

const env = require("./config/env");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const skillsRoutes = require("./routes/skills");
const freelancerRoutes = require("./routes/freelancers");
const gigRoutes = require("./routes/gigs");
const messageRoutes = require("./routes/messages");
const notificationRoutes = require("./routes/notifications");
const reviewRoutes = require("./routes/reviews");
const tokenRoutes = require("./routes/tokens");
const uploadRoutes = require("./routes/upload");
const errorHandler = require("./middleware/error-handler");
const { query } = require("./db/pool");

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", async (req, res, next) => {
  try {
    await query("SELECT 1");
    return res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    return next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/freelancers", freelancerRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/gigs/:gigId/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/upload", uploadRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Backend API running on http://localhost:${env.port}`);
});