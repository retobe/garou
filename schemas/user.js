const { Schema, model } = require("mongoose");
const userSchema = new Schema({
  _id: Schema.Types.ObjectId,
  userId: String,
  userIcon: String,
  userName: String,
  notes: { type: String, default: "" }
});

module.exports = model("user", userSchema, "users");
