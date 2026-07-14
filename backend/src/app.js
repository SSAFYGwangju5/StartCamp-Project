require("dotenv").config();

const express = require("express");
const cors = require("cors");
const postsRouter = require("./routes/posts");

require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "LocalHub backend server is running",
  });
});

app.use("/api/posts", postsRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});