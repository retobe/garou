const { Schema, model } = require("mongoose");

const guildLoggings = new Schema({
  welcomeLogging: {
    type: Boolean,
    default: false
  },
  leaveLogging: {
    type: Boolean,
    default: false
  }
})

const guildSchema = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: String,
  guildName: String,
  guildIcon: { type: String, required: false },
  guildChannelLogs: String,
  CurrencyEnabled: { type: String, default: "true" }, 
  FunEnabled: { type: String, default: "true" }, 
  InfoEnabled: { type: String, default: "true" }, 
  ModerationEnabled: { type: String, default: "true" }, 
  UtilityEnabled: { type: String, default: "true" }, 
  suggestionChannel: {
    type: String,
  },
  guildLogs: {type: guildLoggings, default: {}}
});

module.exports = model("Guild", guildSchema, "guilds");
