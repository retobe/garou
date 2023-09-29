const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const Guild = require("../../schemas/guild");
const mongoose = require("mongoose");
module.exports = {
    name: 'logging',
    usage: `/logging <type> <enable/disable>`,
    category: `Server`,
    description: "Enabled/disable types of loggings..",
    userPerms: "ManageGuild",
    botPerms: ["ManageGuild"],
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "channel",
            description: "Set the logging channel for this guild.",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "set",
                    description: "Set the guild's logging channel",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "logging_channel",
                            description: "Mention the channel over here",
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "Remove the current logging channel for the guild",
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: "check",
                    description: "Check the current logging channel",
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ]
        },
        {
            name: "type",
            description: "Choose the type of loggings you want to disable/enable.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "choice",
                    description: "Choose which loggings",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "👋 UserJoined (Welcome)",
                            value: "welcome"
                        },
                        {
                            name: "❌ UserLeft (Leave)",
                            value: "leave"
                        }
                    ],
                },
                {
                    name: "enable_disable",
                    description: "Choose wether to enable or disable",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "Enable",
                            value: "enable"
                        },
                        {
                            name: "Disable",
                            value: "disable"
                        }
                    ],
                }
            ]
        }
    ],
    cooldown: 3000,
    run: async (client, interaction) => {
        var subCmdGrp = interaction.options.getSubcommandGroup();
        if (subCmdGrp === "channel") {
            const subCmd = interaction.options.getSubcommand();
            switch (subCmd) {
                case "set":
                    var channelOption = interaction.options.get("logging_channel");
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

                    guildProfile.guildChannelLogs = channel.id; // Store the channel ID, not the value
                    await guildProfile.save().catch(console.error);

                    return interaction.reply({ content: `I have set <#${channel.id}> as **${interaction.guild.name}** logging channel.` });
                    break;
                case "remove":
                    let removedChannel = null;
                    const existingProfile = await Guild.findOne({ guildId: interaction.guild.id });

                    if (existingProfile && existingProfile.guildChannelLogs) {
                        removedChannel = existingProfile.guildChannelLogs;
                        existingProfile.guildChannelLogs = null;
                        await existingProfile.save().catch(console.error);
                    }

                    if (removedChannel) {
                        return interaction.reply({ content: `I have removed <#${removedChannel}> as **${interaction.guild.name}** logging channel.` });
                    } else {
                        return interaction.reply({ content: "There was no logging channel set to remove." });
                    }
                    break;
                case "check":
                    const profile = await Guild.findOne({ guildId: interaction.guild.id });

                    if (profile && profile.guildChannelLogs) {
                        return interaction.reply({ content: `The logging channel for **${interaction.guild.name}** is <#${profile.guildChannelLogs}>.` });
                    } else {
                        return interaction.reply({ content: `There is no logging channel set for **${interaction.guild.name}**.` });
                    }
                    break;
                default:
                    return interaction.reply({ content: "ERROR", ephemeral: true });
                    break;
            }

        }

        //variables for logging types 
        const choice = interaction.options.getString("choice");
        const enableDisable = interaction.options.getString("enable_disable");
        let guildProfile = await Guild.findOne({ guildId: interaction.guild.id });

        switch (choice) {
            // Welcome type
            case "welcome":
                if (enableDisable === "enable") {
                    if (guildProfile.guildLogs.welcomeLogging) {
                        return interaction.reply({ content: "Welcome Loggings is already enabled.", ephemeral: true });
                    } else {
                        try {
                            guildProfile.guildLogs.welcomeLogging = true;
                            await guildProfile.save();
                            return interaction.reply({ content: `I have set **${interaction.guild.name}** leaving loggings to true.\n\n>>> To customize leaving loggings use \`/customize leave <channel/message> <channel/message>\``, ephemeral: true })
                        } catch (e) {
                            return interaction.reply({ content: `There has been error that occured`, ephemeral: true })
                        }
                    }
                } else {
                    if (!guildProfile.guildLogs.welcomeLogging) {
                        return interaction.reply({ content: "Welcome Loggings is already disabled.", ephemeral: true });
                    } else {
                        try {
                            guildProfile.guildLogs.welcomeLogging = false;
                            await guildProfile.save();
                            return interaction.reply({ content: `I have set **${interaction.guild.name}** leaving loggings to false.`, ephemeral: true })
                        } catch (e) {
                            return interaction.reply({ content: `There has been error that occured`, ephemeral: true })
                        }
                    }
                }
                break;
            // Leave type
            case "leave":
                if (enableDisable === "enable") {
                    if (guildProfile.guildLogs.leaveLogging) {
                        return interaction.reply({ content: "Leave Loggings is already enabled.", ephemeral: true });
                    } else {
                        try {
                            guildProfile.guildLogs.leaveLogging = true;
                            await guildProfile.save();
                            return interaction.reply({ content: `I have set **${interaction.guild.name}** leaving loggings to true.\n\n>>> To customize leave loggings use \`/customize leave <channel/message> <channel/message>\``, ephemeral: true })
                        } catch (e) {
                            return interaction.reply({ content: `There has been error that occured`, ephemeral: true })
                        }
                    }
                } else {
                    if (!guildProfile.guildLogs.leaveLogging) {
                        return interaction.reply({ content: "Leave Loggings is already disabled.", ephemeral: true });
                    } else {
                        try {
                            guildProfile.guildLogs.leaveLogging = false;
                            await guildProfile.save();
                            return interaction.reply({ content: `I have set **${interaction.guild.name}** leaving loggings to false.`, ephemeral: true })
                        } catch (e) {
                            return interaction.reply({ content: `There has been error that occured`, ephemeral: true })
                        }
                    }
                }
                break;
            default:
                return interaction.reply("how the fuck did this happen.")
                break;
        }
    }
};