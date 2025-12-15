import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.listen(4004, () => {
  console.log("server running on 4004");
});
