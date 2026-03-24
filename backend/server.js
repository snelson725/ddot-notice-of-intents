require("dotenv").config();

const express = require("express");
const cors = require("cors");

const commentsRoute = require("./routes/comments");
const noisRoute = require("./routes/nois");

console.log("commentsRoute =", commentsRoute);
console.log("noisRoute =", noisRoute);

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/comments", commentsRoute);
app.use("/api/nois", noisRoute);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

