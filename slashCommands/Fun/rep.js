const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const User = require("../../schemas/user");
const mongoose = require("mongoose");
const { formatWarningId, diffHours, getRemainingTime } = require("../../helpers/Utils")
const moment = require("moment");
module.exports = {
    name: 'reputation',
    usage: `/reputation <check/add> [@user]`,
    category: `Fun`,
    description: "Add/check reputation.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "add",
            description: `Add rep to a user inside this guild.`,
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "@ the user who you want to add reputation.",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "reason",
                    description: "What's the reason for this reputation",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }, {
                    name: "good_bad",
                    description: "Is this a good rep or bad?",
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: "Good",
                            value: "good"
                        }, {
                            name: "Bad",
                            value: "bad"
                        }
                    ],
                    required: true
                }
            ]
        },
        {
            name: "check",
            description: `Check your or another users reputation in this server!`,
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "@ the user whose reputation you wish to check. If not, it will default to yourself!",
                    type: ApplicationCommandOptionType.User,
                    required: false
                }
            ]
        },
        {
            name: "remove",
            description: `/rep remove <@user> <rep_id> <reason>`,
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: `user`,
                    description: `The user you want to remove rep`,
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: `id`,
                    description: `EX: (001) | the ID of the reputation (STRICT QUERY)`,
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: `reason`,
                    description: `The reasoning behind the reputation removal`,
                    type: ApplicationCommandOptionType.String,
                    required: false,
                }
            ]
        },
    ],
    cooldown: 3000,
    run: async (client, interaction) => {
        const subCmd = interaction.options.getSubcommand();


        switch (subCmd) {
            case "add":
                const member = interaction.options.getUser("user");
                const reason = interaction.options.getString("reason") || "No reason provided";
                const goodBad = interaction.options.getString("good_bad");
                const timestamp = new Date();
                if (member.id === interaction.user.id || member.bot) {
                    return interaction.reply({ content: `Invalid User.\nMusn't be a bot or yourself.` })
                }

                let memberProfile = await User.findOne({ userId: member.id });
                let userProfile = await User.findOne({ userId: interaction.user.id });
                if (!memberProfile) {
                    memberProfile = new User({
                        _id: new mongoose.Types.ObjectId(),
                        userId: member.id,
                        userIcon: member.displayAvatarURL(),
                        userName: member.tag,
                        reputations: [],
                        reputationCount: 0,
                        reputationCountId: 1,
                    });
                } else {
                    memberProfile.reputationCountId++;

                }


                // Adds 24 cooldown to the interacation user
                if (userProfile?.cooldowns?.repCooldown && interaction.user.id != process.env.ownerID) {
                    console.log(userProfile?.cooldowns?.repCooldown);
                    const lastUpdated = new Date(userProfile?.cooldowns?.repCooldown);
                    const difference = diffHours(new Date(), lastUpdated);
                    console.log(difference)
                    if (difference < 24) {
                        const nextUsage = lastUpdated.setHours(lastUpdated.getHours() + 24);
                        return interaction.reply({
                            content: `You can again run this command in \`${getRemainingTime(
                                nextUsage
                            )}\``, ephemeral: true
                        });
                    }
                }
                var description;
                const repId = formatWarningId(memberProfile.reputationCountId);

                if (goodBad === "good") {
                    memberProfile.reputations.push({ id: repId, reason: reason, userName: interaction.user.tag, userId: interaction.user.id, goodBad: "Good", timestamp: timestamp });
                    memberProfile.reputationCount++;
                    description = `I have added reps to ${member.tag}!`
                } else {
                    memberProfile.reputations.push({ id: repId, reason: reason, userName: interaction.user.tag, userId: interaction.user.id, goodBad: "Bad", timestamp: timestamp });
                    memberProfile.reputationCount--;
                    description = `I have removed reps from ${member.tag}.`
                }

                userProfile.cooldowns.repCooldown = new Date();

                await memberProfile.save().catch(console.error);
                await userProfile.save().catch(console.error);

                const sentEmbed = new EmbedBuilder()
                    .setTitle("Added Reputation!")
                    .setDescription(description)
                    .addFields(
                        {
                            name: "Reason",
                            value: `> ***${reason}***`,
                        },
                        {
                            name: "User who gave this rep:",
                            value: "<@" + interaction.user.id + ">"
                        },
                        {
                            name: `Timestamp`,
                            value: `> ${moment(timestamp).format("LLLL")}`,
                            inline: true
                        },
                        {
                            name: "Targeted User",
                            value: "<@" + member.id + ">",
                            inline: true
                        },
                        {
                            name: "User's Reputation:",
                            value: `${memberProfile.reputationCount}`,
                            inline: true
                        },
                    )
                    .setFooter({ text: "You can't give anymore reps until the next 24-hours", iconURL: interaction.user.displayAvatarURL() })
                    .setColor(goodBad === "good" ? "Green" : "Red")
                    .setThumbnail(member.displayAvatarURL());
                interaction.reply({ content: `<@${member.id}>`, embeds: [sentEmbed] });
                break;
            case "remove":
                if (!interaction.member.permissions.has("BanMembers")) {
                    return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
                }
                try {
                    const member = interaction.options.getUser("user") || interaction.user;
                    const reputationIdToRemove = interaction.options.getString("id");
                    const reasonToRemove = interaction.options.getString("reason") || "No reason provided";

                    // Find the user in your MongoDB database
                    const userDoc = await User.findOne({ userId: member.id });

                    if (!userDoc || !userDoc.reputations || userDoc.reputations.length === 0) {
                        return interaction.reply({ content: `${member.tag} has no reputations to remove.`, ephemeral: false });
                    }

                    // Find the reputation to remove by ID (as a string with leading zeros)
                    const reputationToRemoveIndex = userDoc.reputations.findIndex((reputation) => reputation.id === reputationIdToRemove);

                    if (reputationToRemoveIndex === -1) {
                        return interaction.reply({ content: `No matching reputation found for ID "${reputationIdToRemove}".`, ephemeral: false });
                    }

                    // Remove the reputation from the user's reputations array
                    const removedWarning = userDoc.reputations.splice(reputationToRemoveIndex, 1);

                    // Save the updated user document
                    await userDoc.save();

                    interaction.reply({ content: `Removed reputation with ID "${reputationIdToRemove}" from ${member.tag}. Reason: ${reasonToRemove}`, ephemeral: false });
                } catch (error) {
                    console.error(error);
                    interaction.reply({ content: "An error occurred while removing the reputation.", ephemeral: true });
                }
                break;
            case "check":
                try {
                    const userToCheck = interaction.options.getUser("user") || interaction.user;

                    // Find the user in your MongoDB database
                    const userDoc = await User.findOne({ userId: userToCheck.id });

                    if (!userDoc || !userDoc.reputations || userDoc.reputations.length === 0) {
                        const noReputationEmbed = new EmbedBuilder()
                            .setTitle(`${userToCheck.tag} has no reputations.`)
                            .setColor('RED'); // You can customize the color

                        interaction.reply({ embeds: [noReputationEmbed], ephemeral: false });
                    } else {
                        const reputationList = userDoc.reputations.map((reputation, index) => {
                            const timestamp = moment(new Date(reputation.timestamp)).format("LLLL"); // Format the timestamp
                            const moderator = reputation.userId || "Unknown"; // Get the moderator's ID or "Unknown" if not available

                            const fields = [
                                { name: 'ID', value: reputation.id || "Couldn't find an ID" },
                                { name: 'Reason', value: reputation.reason },
                                { name: 'Timestamp', value: timestamp },
                                { name: 'User Giver', value: moderator },
                                { name: 'Good or Bad?', value: reputation.goodBad },
                            ];

                            const reputationEmbed = new EmbedBuilder()
                                .setTitle(`Reputation #${index + 1}`)
                                .setColor(reputation.goodBad === "Good" ? "Green" : "Red")
                                .setThumbnail(userToCheck.displayAvatarURL())
                                .setFields(fields);

                            return reputationEmbed;
                        });

                        interaction.reply({ embeds: reputationList, ephemeral: false });
                    }
                } catch (error) {
                    console.error(error);
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('An error occurred while checking reputations.')
                        .setColor('red'); // You can customize the color

                    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }

                break;
            default:
                interaction.reply(`Error 404`);
                break;
        }



    }
};