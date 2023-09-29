const { ApplicationCommandType, ApplicationCommandOptionType, BitField, IntentsBitField, PermissionsBitField, ApplicationCommandPermissionType } = require('discord.js');
const User = require("../../schemas/user")
const mongoose = require("mongoose");
const moment = require("moment");
const { formatWarningId } = require("../../helpers/Utils")
module.exports = {
    name: 'warn',
    usage: `/warn <add/remove/check>`,
    category: `Moderation`,
    description: "User's warnings",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "add",
            description: "/warn add <@user> <reason>",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: `user`,
                    description: `The user you want to warn`,
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: `reason`,
                    description: `The reasoning behind the warning`,
                    type: ApplicationCommandOptionType.String,
                    required: false,
                }
            ]
        },
        {
            name: "remove",
            description: `/warn remove <@user> <warn_id> <reason>`,
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: `user`,
                    description: `The user you want to remove warn`,
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: `id`,
                    description: `EX: (001) | the ID of the warning (STRICT QUERY)`,
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: `reason`,
                    description: `The reasoning behind the warning removal`,
                    type: ApplicationCommandOptionType.String,
                    required: false,
                }
            ]
        },
        {
            name: "check",
            description: `/warn check <@user>`,
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: `user`,
                    description: `The user you want to warn`,
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
            ]
        }
    ],
    cooldown: 3000,
    run: async (client, interaction) => {
        var subCmd = interaction.options.getSubcommand();
        switch (subCmd) {
            case "add":
                if (!interaction.member.permissions.has("BanMembers")) {
                    return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
                }
                try {
                    const userToWarn = interaction.options.getUser("user");
                    if (userToWarn.bot === true) {
                        return interaction.reply({ content: `Can't warn a API.`, ephemeral: true })
                    }
                    const reason = interaction.options.getString("reason") || "No reason";
                    const timestamp = new Date();
                    if (userToWarn.id === interaction.user.id) {
                        return interaction.reply({ content: "You can't add a warn to yourself!", ephemeral: true });
                    }

                    const moderatorId = interaction.user.id;

                    // Find the user in your MongoDB database
                    let userDoc = await User.findOne({ userId: userToWarn.id });

                    if (!userDoc) {
                        userDoc = new User({
                            _id: new mongoose.Types.ObjectId(),
                            userId: userToWarn.id,
                            userIcon: userToWarn.displayAvatarURL(),
                            userName: userToWarn.tag,
                            warnings: [],
                            warningCount: 1, // Initialize warning count to 1
                        });
                    } else {
                        // Increment the warning count and use it as the warning ID
                        userDoc.warningCount++;
                    }

                    // Format the warning ID with leading zeros
                    const warningId = formatWarningId(userDoc.warningCount);
                    userDoc.warnings.push({ id: warningId, reason, timestamp, moderator: moderatorId });

                    // Save the user document
                    await userDoc.save();

                    interaction.reply({ content: `Warned ${userToWarn.tag} (Warning ID: ${warningId}) for: ${reason}`, ephemeral: false });
                } catch (error) {
                    console.error(error);
                    interaction.reply({ content: "An error occurred while processing the warning.", ephemeral: true });
                }
                break;
            case "check":
                try {
                    const userToCheck = interaction.options.getUser("user") || interaction.user;

                    // Find the user in your MongoDB database
                    const userDoc = await User.findOne({ userId: userToCheck.id });

                    if (!userDoc || !userDoc.warnings || userDoc.warnings.length === 0) {
                        interaction.reply({ content: `${userToCheck.tag} has no warnings.`, ephemeral: false });
                    } else {
                        const warningList = userDoc.warnings.map((warning, index) => {
                            const timestamp = moment(new Date(warning.timestamp)).format("LLLL"); // Format the timestamp
                            const moderator = warning.moderator || "Unknown"; // Get the moderator's ID or "Unknown" if not available
                            return `${index + 1}. ID: ${warning.id || "Couldn't find an ID"}\n   Reason: ${warning.reason}\n   Timestamp: ${timestamp}\n   ModeratorID: ${moderator}`;
                        });

                        const warningMessage = `Warnings for ${userToCheck.tag}:\n\n${warningList.join("\n\n")}`;
                        interaction.reply({ content: warningMessage, ephemeral: false });
                    }
                } catch (error) {
                    console.error(error);
                    interaction.reply({ content: "An error occurred while checking warnings.", ephemeral: true });
                }
                break;
            // ...
            case "remove":
                if (!interaction.member.permissions.has("BanMembers")) {
                    return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
                }
                try {
                    const userToRemoveWarningFrom = interaction.options.getUser("user");
                    const warningIdToRemove = interaction.options.getString("id");
                    const reasonToRemove = interaction.options.getString("reason") || "No reason provided";

                    // Find the user in your MongoDB database
                    const userDoc = await User.findOne({ userId: userToRemoveWarningFrom.id });

                    if (!userDoc || !userDoc.warnings || userDoc.warnings.length === 0) {
                        return interaction.reply({ content: `${userToRemoveWarningFrom.tag} has no warnings to remove.`, ephemeral: false });
                    }

                    // Find the warning to remove by ID (as a string with leading zeros)
                    const warningToRemoveIndex = userDoc.warnings.findIndex((warning) => warning.id === warningIdToRemove);

                    if (warningToRemoveIndex === -1) {
                        return interaction.reply({ content: `No matching warning found for ID "${warningIdToRemove}".`, ephemeral: false });
                    }

                    // Remove the warning from the user's warnings array
                    const removedWarning = userDoc.warnings.splice(warningToRemoveIndex, 1);

                    // Save the updated user document
                    await userDoc.save();

                    interaction.reply({ content: `Removed warning with ID "${warningIdToRemove}" from ${userToRemoveWarningFrom.tag}. Reason: ${reasonToRemove}`, ephemeral: false });
                } catch (error) {
                    console.error(error);
                    interaction.reply({ content: "An error occurred while removing the warning.", ephemeral: true });
                }
                break;
            default:
                return interaction.reply({ content: "An error occurred.", ephemeral: true });
                break;
        }
    }
};