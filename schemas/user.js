const { Schema, model } = require("mongoose");
const userSchema = new Schema({
  _id: Schema.Types.ObjectId,
  userId: String,
  notes: { type: String }
});

module.exports = model("user", userSchema, "users");
