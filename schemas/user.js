const { Schema, model } = require("mongoose");

const warningSchema = new Schema({
  id: String, 
  reason: String,
  moderator: String,
  timestamp: { type: Date, default: Date.now },
});

const userSchema = new Schema({
  _id: Schema.Types.ObjectId,
  userId: String,
  userIcon: String,
  userName: String,
  notes: { type: String, default: "" },
  warnings: [warningSchema],
  warningCount: { type: Number, default: 0 }, // Total number of warnings
});

module.exports = model("user", userSchema, "users");
