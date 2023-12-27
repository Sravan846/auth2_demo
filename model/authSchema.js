const mongoose = require("mongoose");

const user = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  clientId: String,
  clientSecrate: String,
  grantType: Array,
  authCode: String,
  refreshToken: String,
  userCode: String,
  deviceCode: String,
});
user.set("timestamps", true);
module.exports = mongoose.model("userAuth", user);
