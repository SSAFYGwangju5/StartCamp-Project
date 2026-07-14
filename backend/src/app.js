require("dotenv").config();

const express = require("express");
const cors = require("cors");
const postsRouter = require("./routes/posts");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "LocalHub backend server is running",
  });
});

app.use("/api/posts", postsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});