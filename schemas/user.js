const { Schema, model } = require("mongoose");

const warningSchema = new Schema({
  id: String,
  reason: String,
  moderator: String,
  timestamp: { type: Date, default: Date.now },
});

const reputationSchema = new Schema({
  id: String,
  reason: String,
  userName: String,
  userId: String,
  goodBad: String,
  timestamp: { type: Date, default: Date.now },
});

const cooldownSchema = new Schema({
  repCooldown: { type: Date }
})

const userSchema = new Schema({
  _id: Schema.Types.ObjectId,
  userId: String,
  userIcon: String,
  userName: String,
  notes: { type: String, default: "" },
  warnings: [warningSchema],
  warningCount: { type: Number, default: 0 }, // Total number of warnings
  reputations: [reputationSchema],
  reputationCount: { type: Number, default: 0 }, // Total number of reps
  reputationCountId: { type: Number, default: 0 }, // Total number of reps
  cooldowns: { type: cooldownSchema, default: {} }
});

module.exports = model("user", userSchema, "users");
