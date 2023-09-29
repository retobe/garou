const {
    EmbedBuilder,
    ApplicationCommandType,
    ApplicationCommandOptionType,
    ActionRowBuilder,
    ButtonBuilder,
  } = require("discord.js");
  const fs = require("fs");
  const path = require("path");
  module.exports = {
    name: "help",
    usage: `/help <category>`,
    category: `Info`,
    description: "Replies with all commands & categories!",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
      {
        name: `category`,
        description: `Choose a category!`,
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: `Currency`,
            value: `currency`,
          },
          {
            name: `Moderation`,
            value: `moderation`,
          },
          {
            name: `Info`,
            value: `info`,
          },
          {
            name: `Fun`,
            value: `fun`,
          },
        ],
        required: false,
      },
    ],
    run: async (client, interaction) => {
      const choice = interaction.options.get(`category`)?.value;
      if (!choice) {
        const commands = client.slashCommands.map(({ name }) => name);
        const getDirs = (path) =>
          fs
            .readdirSync(path)
            .filter((file) => fs.statSync(`${path}/${file}`).isDirectory());
  
        const folders = getDirs("./slashCommands/");
  
        currencyCommands = fs.readdirSync("./slashCommands/Currency");
  
        const currencyDesc = currencyCommands.map((file) =>
          file.replace(".js", "")
        );
  
        modCmds = fs.readdirSync("./slashCommands/Moderation");
  
        const modDesc = modCmds.map((file) =>
          file.replace(".js", "")
        );
  
        funCmds = fs.readdirSync("./slashCommands/Fun");
  
        const funDesc = funCmds.map((file) =>
          file.replace(".js", "")
        );
  
        funCmds = fs.readdirSync("./slashCommands/Fun");
  
        const InfoDesc = funCmds.map((file) =>
          file.replace(".js", "")
        );
  
        const helpMenu = new EmbedBuilder()
          .setTitle(`Help Menu`)
          .setDescription(
            `All Categories: **${folders.join(
              "**, **"
            )}**\nAll Commands:  \`${currencyDesc.join("`, `")} \` | \`${modDesc.join("`, `")}\` |  \`${funDesc.join("`, `")}\` |  \`${InfoDesc.join("`, `")} \``
          )
          .setThumbnail(client.user.displayAvatarURL())
          .setTimestamp()
  
          .setFooter({
            text: `Requested by: ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setColor(`White`);
        return interaction.reply({ embeds: [helpMenu] });
      }
  
      if (choice === "currency") {
        currencyCommands = fs.readdirSync("./slashCommands/Currency");
  
        const currencyDesc = currencyCommands.map((file) =>
          file.replace(".js", "")
        );
  
        const currencyMenu = new EmbedBuilder()
          .setTitle("Currency Menu")
          .setDescription(
            `To get information about a command, use the command \`/info\` <**command-name**> to get more details about a command!\nAll currency commands: **${currencyDesc.join("**, **")}**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .setTimestamp()
          .setFooter({
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setColor("#85bb65");
  
        return interaction.reply({ embeds: [currencyMenu] });
      } else if (choice === "moderation") {
        categoryCommands = fs.readdirSync("./slashCommands/Moderation");
  
        const categoryDesc = categoryCommands.map((file) =>
          file.replace(".js", "")
        );
        const modMenu = new EmbedBuilder()
          .setTitle(`Moderation Menu`)
          .setDescription(
            `To get information about a command, use the command \`/info\` <**command-name**> to get more details about a command!\nAll moderation commands: **${categoryDesc.join("**, **")}**`
          )
          .setTimestamp()
  
          .setFooter({
            text: `Requested by: ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setThumbnail(client.user.displayAvatarURL())
          .setColor(`#9f9f9f`);
        return interaction.reply({ embeds: [modMenu] });
      } else if (choice === "fun") {
        categoryCommands = fs.readdirSync("./slashCommands/Fun");
  
        const categoryDesc = categoryCommands.map((file) =>
          file.replace(".js", "")
        );
        const funMenu = new EmbedBuilder()
          .setTitle(`Fun Menu`)
          .setDescription(`To get information about a command, use the command \`/info\` <**command-name**> to get more details about a command!\nAll fun commands: **${categoryDesc.join("**, **")}**`)
          .setTimestamp()
          .setThumbnail(client.user.displayAvatarURL())
          .setFooter({
            text: `Requested by: ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setColor(`#a31515`);
        return interaction.reply({ embeds: [funMenu] });
      } else if (choice === "info") {
        categoryCommands = fs.readdirSync("./slashCommands/Info");
  
        const categoryDesc = categoryCommands.map((file) =>
          file.replace(".js", "")
        );
        const infomenu = new EmbedBuilder()
          .setTitle(`Info Menu`)
          .setDescription(`To get information about a command, use the command \`/info\` <**command-name**> to get more details about a command!\nAll Info commands: **${categoryDesc.join("**, **")}**`)
          .setThumbnail(client.user.displayAvatarURL())
          .setTimestamp()
          .setFooter({
            text: `Requested by: ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setColor(`#a31515`);
        return interaction.reply({ embeds: [infomenu] });
      }
    },
  };
  