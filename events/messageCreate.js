const { EmbedBuilder, Collection, PermissionsBitField } = require("discord.js");
const ms = require("ms");
const client = require("..");
const config = require("../config.json");
const Guild = require("../schemas/guild");
const User = require("../schemas/user");
const mongoose = require("mongoose");
const prefix = client.prefix;
const cooldown = new Collection();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content === "<@1002571659443707934>") return message.reply("/help for commands :)")
  // creating Databases
  let guildProfile = await Guild.findOne({ guildId: message.guild.id });
  let userProfile = await User.findOne({ userId: message.author.id });
  if (!guildProfile) {
    guildProfile = await new Guild({
      _id: mongoose.Types.ObjectId(),
      guildId: message.guild.id,
      guildName: message.guild.name,
      guildIcon: message.guild.iconURL()
        ? message.guild.iconURL()
        : "None.",
    });
  }
  if (!userProfile) {
    userProfile = new User({
      _id: mongoose.Types.ObjectId(),
      userId: message.author.id,
      userIcon: message.author.displayAvatarURL(),
      userName: message.author.tag,
      wallet: 0,
      bank: 0,
    });
  }
  if (!userProfile.userIcon || !userProfile.userName) {
    userProfile = new User({
      _id: mongoose.Types.ObjectId(),
      userId: message.author.id,
      userIcon: message.author.displayAvatarURL(),
      userName: message.author.tag,
    });
  }
  // reading command names
  if (message.channel.type !== 0) return;
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  if (cmd.length == 0) return;
  let command = client.commands.get(cmd);
  if (!command) command = client.commands.get(client.aliases.get(cmd));

  if (command) {
    if (command.cooldown) {
      if (cooldown.has(`${command.name}${message.author.id}`))
        return message.channel.send({
          content: config.messages["COOLDOWN_MESSAGE"].replace(
            "<duration>",
            ms(
              cooldown.get(`${command.name}${message.author.id}`) - Date.now(),
              { long: true }
            )
          ),
        });
      if (command.userPerms || command.botPerms) {
        if (
          !message.member.permissions.has(
            PermissionsBitField.resolve(command.userPerms || [])
          )
        ) {
          const userPerms = new EmbedBuilder()
            .setDescription(
              `🚫 ${message.author}, You don't have \`${command.userPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return message.reply({ embeds: [userPerms] });
        }
        if (
          !message.guild.members.cache
            .get(client.author.id)
            .permissions.has(
              PermissionsBitField.resolve(command.botPerms || [])
            )
        ) {
          const botPerms = new EmbedBuilder()
            .setDescription(
              `🚫 ${message.author}, I don't have \`${command.botPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return message.reply({ embeds: [botPerms] });
        }
      }

      command.run(client, message, args);
      cooldown.set(
        `${command.name}${message.author.id}`,
        Date.now() + command.cooldown
      );
      setTimeout(() => {
        cooldown.delete(`${command.name}${message.author.id}`);
      }, command.cooldown);
    } else {
      if (command.userPerms || command.botPerms) {
        if (
          !message.member.permissions.has(
            PermissionsBitField.resolve(command.userPerms || [])
          )
        ) {
          const userPerms = new EmbedBuilder()
            .setDescription(
              `🚫 ${message.author}, You don't have \`${command.userPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return message.reply({ embeds: [userPerms] });
        }

        if (
          !message.guild.members.cache
            .get(client.author.id)
            .permissions.has(
              PermissionsBitField.resolve(command.botPerms || [])
            )
        ) {
          const botPerms = new EmbedBuilder()
            .setDescription(
              `🚫 ${message.author}, I don't have \`${command.botPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return message.reply({ embeds: [botPerms] });
        }
      }
      command.run(client, message, args);
    }
  }
});
