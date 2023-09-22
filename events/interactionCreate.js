const { EmbedBuilder, Collection, PermissionsBitField } = require("discord.js");
const ms = require("ms");
const client = require("..");
const config = require("../config.json");
const chalk = require("chalk");
const mongoose = require("mongoose");
const User = require("../schemas/user")

const cooldown = new Collection();

client.on("interactionCreate", async (interaction) => {
  const slashCommand = client.slashCommands.get(interaction.commandName);
  const log = client.channels.cache.get("1154918261058711552");
  if (interaction.type == 4) {
    if (slashCommand.autocomplete) {
      const choices = [];
      await slashCommand.autocomplete(interaction, choices);
    }
  }
  if (!interaction.type == 2) return;

  if (!slashCommand)
    return client.slashCommands.delete(interaction.commandName);
  try {
    let userProfile = await User.findOne({ userId: interaction.user.id });

    if (!userProfile) {
      userProfile = new User({
        _id: new mongoose.Types.ObjectId(),
        userId: interaction.user.id,
        userIcon: interaction.user.displayAvatarURL(),
        userName: interaction.user.tag
      })
      await userProfile.save().catch(console.error);
      const mongoDbEmbed = new EmbedBuilder()
      .setTitle("New Document Created! " + interaction.user.tag)
      .setDescription(`${JSON.stringify(userProfile)}`)
      .setColor("Green")
      .setThumbnail(interaction.user.displayAvatarURL());
      log.send({embeds: [mongoDbEmbed]});
      console.log(userProfile);
    }

    if (slashCommand.ownerOnly === true) {
      if (interaction.user.id != process.env.ownerID) {
        return;
      }
    }

    if (slashCommand.cooldown && interaction.user.id != "659117023502270474") {
      if (cooldown.has(`slash-${slashCommand.name}${interaction.user.id}`))
        return interaction.reply({
          content: config.messages["COOLDOWN_MESSAGE"].replace(
            "<duration>",
            ms(
              cooldown.get(`slash-${slashCommand.name}${interaction.user.id}`) -
              Date.now(),
              { long: true }
            )
          ),
        });
      if (slashCommand.userPerms || slashCommand.botPerms) {
        if (
          !interaction.memberPermissions.has(
            PermissionsBitField.resolve(slashCommand.userPerms || [])
          )
        ) {
          const userPerms = new EmbedBuilder()
            .setDescription(
              `${interaction.user}, You don't have \`${slashCommand.userPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return interaction.reply({ embeds: [userPerms], ephemeral: true });
        }
        if (
          !interaction.guild.members.cache
            .get(client.user.id)
            .permissions.has(
              PermissionsBitField.resolve(slashCommand.botPerms || [])
            )
        ) {
          const botPerms = new EmbedBuilder()
            .setDescription(
              `${interaction.user}, I don't have \`${slashCommand.botPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return interaction.reply({ embeds: [botPerms] });
        }
      }


      await slashCommand.run(client, interaction);


      cooldown.set(
        `slash-${slashCommand.name}${interaction.user.id}`,
        Date.now() + slashCommand.cooldown
      );
      setTimeout(() => {
        cooldown.delete(`slash-${slashCommand.name}${interaction.user.id}`);
      }, slashCommand.cooldown);
    } else {
      if (slashCommand.userPerms || slashCommand.botPerms) {
        if (
          !interaction.memberPermissions.has(
            PermissionsBitField.resolve(slashCommand.userPerms || [])
          )
        ) {
          const userPerms = new EmbedBuilder()
            .setDescription(
              `${interaction.user}, You don't have \`${slashCommand.userPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return interaction.reply({ embeds: [userPerms], ephemeral: true });
        }
        if (
          !interaction.guild.members.cache
            .get(client.user.id)
            .permissions.has(
              PermissionsBitField.resolve(slashCommand.botPerms || [])
            )
        ) {
          const botPerms = new EmbedBuilder()
            .setDescription(
              `${interaction.user}, I don't have \`${slashCommand.botPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return interaction.reply({ embeds: [botPerms] });
        }
      }
      var contentMsg = "Command has been issued! <@659117023502270474>";
      if (interaction.user.id === "659117023502270474") {
        contentMsg = "its just by the developer, BOOOO 👎";
      }
      const usedEmbed = new EmbedBuilder()
        .setTitle(`Command used!`)
        .setDescription(
          `Command: **${slashCommand.name}**\nExecuted by: **${interaction.user.tag}** | **${interaction.user.id}**`
        )
        .setColor(`Blue`);
      log.send({ content: contentMsg, embeds: [usedEmbed] });
      await slashCommand.run(client, interaction);
    }
  } catch (error) {
    var contentMsg = "Error has occured! <@659117023502270474>";
    if (interaction.user.id === "659117023502270474") {
      contentMsg = "Error but its just drip who executed the cmd";
    }
    const errorEmbed = new EmbedBuilder()
      .setTitle(`Error!`)
      .setDescription(
        `${error}\nCommand: **${slashCommand.name}**\nExecuted by: **${interaction.user.tag}** | **${interaction.user.id}**`
      )
      .setColor(`Red`);
    log.send({ content: contentMsg, embeds: [errorEmbed] });
    return interaction.reply({
      content: `There's been an error in the code.\n\`${error}\``,
      ephemeral: true,
    }).then(console.log(error));
  }
});
