const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'purge',
    usage: `/purge <type> <amount>`,
    category: `Mod`,
    userPerms: ["ManageMessages", "ManageChannels"],
    description: "Use this command to delete messages faster.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "channel",
            description: "Delete messages from a specific channel.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "target_channel",
                    description: "Select the channel to delete messages from.",
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                },
                {
                    name: "amount",
                    description: "The number of messages to delete.",
                    min_value: 1,
                    max_value: 100,
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                },
            ],
        },
        {
            name: "user",
            description: "Delete messages from a specific user.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "target_user",
                    description: "Select the user to delete messages from.",
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "amount",
                    description: "The number of messages to delete.",
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 1,
                    max_value: 100,
                    required: true,
                }
            ],
        },
        {
            name: "range",
            description: "Delete messages within a specified message ID range.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "start_id",
                    description: "The starting message ID for the range.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "end_id",
                    description: "The ending message ID for the range.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: "message",
            description: "Delete messages within the current channel",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "amount",
                    description: "The number of messages to delete.",
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 1,
                    max_value: 100,
                    required: true,
                },
            ],
        }
    ],
    cooldown: 3000,
    run: async (client, interaction) => {
        var subCmd = interaction.options.getSubcommand();

        switch (subCmd) {
            case "message":
                var amountX = interaction.options.getInteger("amount");

                try {
                    await messageBulkDelete(interaction, amountX);
                } catch (error) {
                    console.error(error);
                    interaction.reply({ content: `Something went wrong with deleting the messages.`, ephemeral: true }).then(msg => msg.delete({ timeout: 5000 }));
                }
                break;
            case "channel":
                var channel = interaction.options.getChannel("target_channel");
                var amountX = interaction.options.getInteger("amount");
                if (channel.type != 0) {
                    return interaction.reply("Invalid Text Channel")
                };

                try {
                    const targetChannel = interaction.guild.channels.cache.get(channel.id);
                    if (!targetChannel) {
                        return interaction.reply({ content: `The specified channel doesn't exist in this guild.` });
                    }

                    const fetchedMessages = await targetChannel.messages.fetch({ limit: amountX });
                    const messageArray = fetchedMessages.map((message) => message.id);
                    if (fetchedMessages.size === 0) {
                        return interaction.reply({ content: `There are no messages in "**${channel.name}**".`, ephemeral: true }).then((reply) => {
                            setTimeout(() => {
                                reply.delete().catch(console.error);
                            }, 3500);
                        });;
                    }

                    await targetChannel.bulkDelete(messageArray);

                    return interaction.reply({ content: `I have deleted **${fetchedMessages.size}** messages in "**${channel.name}**" channel.`, ephemeral: true }).then((reply) => {
                        setTimeout(() => {
                            reply.delete().catch(console.error);
                        }, 3500);
                    });
                } catch (e) {
                    console.error(e);
                    return interaction.reply({ content: `Something went wrong.`, ephemeral: true });
                }
                break;
            case "user":
                var user = interaction.options.getUser("target_user");
                var amountX = interaction.options.getInteger("amount");

                // Fetch messages sent by the specified user in the channel
                const messages = await interaction.channel.messages.fetch({ limit: 100 }); // Adjust the limit as needed

                // Filter messages sent by the user
                const userMessages = messages.filter((message) => message.author.id === user.id);

                // Limit the number of messages to delete
                const messagesToDelete = userMessages.map((message) => message.id).slice(0, amountX);

                try {
                    // Bulk delete the selected messages
                    await interaction.channel.bulkDelete(messagesToDelete);
                    interaction.reply(`Deleted ${messagesToDelete.length} messages sent by ${user.tag}.`);
                } catch (error) {
                    console.error(error);
                    interaction.reply("An error occurred while deleting messages.");
                }
                break;
            case "range":
                interaction.reply(`Still in the works`);
                break;
            default:
                interaction.reply("Error 404");
                break;
        }
    }
};

async function messageBulkDelete(interaction, amountX) {
    var channel = interaction.guild.channels.cache.get(interaction.channel.id);
    const fetchedMessages = await interaction.channel.messages.fetch({ limit: amountX });
    const messageArray = fetchedMessages.map((message) => message.id);

    try {
        await interaction.channel.bulkDelete(messageArray);

        interaction.reply({ content: `I have deleted ${fetchedMessages.size} messages in "${interaction.channel.name}" channel.`, ephemeral: true }).then((reply) => {
            setTimeout(() => {
                reply.delete().catch(console.error);
            }, 3500);
        });
    } catch (error) {
        console.error(error);
        interaction.reply({ content: `Something went wrong with deleting the messages.`, ephemeral: true }).then((msg) => {
            setTimeout(() => {
                msg.delete().catch(console.error);
            }, 5000);
        });
    }
}