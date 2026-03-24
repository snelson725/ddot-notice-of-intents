require("dotenv").config();

const express = require("express");
const cors = require("cors");

const commentsRoute =   require("./routes/comments");
const noisRoute     =   require("./routes/nois");
const summaryRoute  =   require("./routes/summary");
const commentsByNoiRoute = require("./routes/commentsByNoi");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/comments", commentsRoute);
app.use("/api/comments", commentsByNoiRoute);
app.use("/api/nois", noisRoute);
app.use("/api/summary", summaryRoute);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

