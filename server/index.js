const express = require("express");
const app = express();

const cors = require("cors");

const api_route = require("./routes");

app.use(express.json({ extended: true, limit: "10mb" }));
app.use(cors());
app.use((req, res, next) => {
  req.auth = {};
  req.errors = [];
  return next();
});

app.use("/api", api_route);

app.use((req, res, next) => {
  return res.sendStatus(404);
});

app.listen(3000, () => {
  console.log("Server Running");
});
