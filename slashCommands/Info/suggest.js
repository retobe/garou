const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const Guild = require("../../schemas/guild");
module.exports = {
    name: 'suggest',
    usage: `/suggest`,
    category: `Info`,
    description: "Add a suggestion to the server.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "message",
            description: `Write down the message you want to suggest`,
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    cooldown: 60000,
    run: async (client, interaction) => {
        const suggestonMessage = interaction.options.getString("message");
        let guildProfile = await Guild.findOne(
            { guildId: `${interaction.guild.id}` }
        )
        if (!guildProfile.suggestionChannel) {
            return interaction.reply({ content: `There's no suggestion channel for this server`, ephemeral: true })
        }
        const suggestionChannel = client.channels.cache.get(guildProfile.suggestionChannel);

        if (suggestonMessage.length < 4) {
            return interaction.reply({ content: `Your suggestion was too short.`, ephemeral: true })
        } else if (suggestonMessage.length > 300) {
            return interaction.reply({ content: `Your suggestion was too long.`, ephemeral: true })
        }
        const suggestionEmbed = new EmbedBuilder()
            .setTitle(`New suggestion!`)
            .setDescription(`${suggestonMessage}`)
            .setColor("Blue")
            .setFooter({ text: "Suggestion by " + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(interaction.guild.iconURL());
        const sentMessage = await suggestionChannel.send({ embeds: [suggestionEmbed] });
        await sentMessage.react('👍');
        await sentMessage.react('👎');
        return interaction.reply({ content: `Just sent the suggestion!`, ephemeral: true })
    }
};