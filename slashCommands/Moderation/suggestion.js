const { ApplicationCommandType, ApplicationCommandOptionType, Permissions } = require('discord.js');
const Guild = require("../../schemas/guild");
const mongoose = require("mongoose");
module.exports = {
    name: 'suggestion',
    usage: `/suggestion channel <set/remove/check>`,
    category: `Moderation`,
    description: "Set the guild's suggestion channel.",
    userPerms: ["ManageChannels"],
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "channel",
            description: "Options related to the suggestion channel",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "set",
                    description: "Set the suggestion guild's channel",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "suggestion_channel",
                            description: "Mention the channel over here",
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "Remove the current suggestion channel for the guild",
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: "check",
                    description: "Check the current suggestion channel",
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ]
        },
    ],
    cooldown: 3000,
    run: async (client, interaction, channel) => {
        const subCmdGrp = interaction.options.getSubcommandGroup();

        if (subCmdGrp) {
            const subCmd = interaction.options.getSubcommand();
            switch (subCmd) {
                case "set":
                    var channelOption = interaction.options.get("suggestion_channel");
                    var channel = interaction.guild.channels.cache.get(channelOption.value);

                    if (!channel || channel.type !== 0) {
                        return interaction.reply({ content: "Please specify a valid text channel for suggestions.", ephemeral: true });
                    }

                    let guildProfile = await Guild.findOne({ guildId: interaction.guild.id });

                    if (!guildProfile) {
                        guildProfile = new Guild({
                            _id: new mongoose.Types.ObjectId(),
                            guildId: interaction.guild.id,
                        });
                        await guildProfile.save().catch(console.error);
                        console.log(guildProfile);
                    }

                    guildProfile.suggestionChannel = channel.id; // Store the channel ID, not the value
                    await guildProfile.save().catch(console.error);

                    return interaction.reply({ content: `I have set <#${channel.id}> as **${interaction.guild.name}** suggestion channel.` });

                    break;
                case "remove":
                    let removedChannel = null;
                    const existingProfile = await Guild.findOne({ guildId: interaction.guild.id });

                    if (existingProfile && existingProfile.suggestionChannel) {
                        removedChannel = existingProfile.suggestionChannel;
                        existingProfile.suggestionChannel = null;
                        await existingProfile.save().catch(console.error);
                    }

                    if (removedChannel) {
                        return interaction.reply({ content: `I have removed <#${removedChannel}> as **${interaction.guild.name}** suggestion channel.` });
                    } else {
                        return interaction.reply({ content: "There was no suggestion channel set to remove." });
                    }
                    break;
                case "check":
                    const profile = await Guild.findOne({ guildId: interaction.guild.id });

                    if (profile && profile.suggestionChannel) {
                        return interaction.reply({ content: `The suggestion channel for **${interaction.guild.name}** is <#${profile.suggestionChannel}>.` });
                    } else {
                        return interaction.reply({ content: `There is no suggestion channel set for **${interaction.guild.name}**.` });
                    }
                    break;
                default:
                    return interaction.reply({ content: "ERROR", ephemeral: true });
                    break;
            }

        } else {
            return interaction.reply({ content: "ERROR", ephemeral: true });
        }
    }
};