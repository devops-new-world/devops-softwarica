const express = require("express");
const cors = require("cors");
require("dotenv").config();

const itemRoutes = require("./routes/itemRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : null;

app.use(
  cors({
    origin: allowedOrigins || true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/items", itemRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
