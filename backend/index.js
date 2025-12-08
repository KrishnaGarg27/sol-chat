const express = require("express");
const app = express();
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/sol-chat")
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log("Error while connecting to database: ", err));

app.listen(3000, () => console.log("Listening on Port 3000"));
