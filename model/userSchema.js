const mongoose = require("mongoose");

const user = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});
user.set("timestamps", true);
module.exports = mongoose.model("user", user);
