const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'notes',
    usage: `/notes <notes>`,
    category: `Fun`,
    description: "Add notes to your notes.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "notes",
            description: "Add notes to your notebook.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    cooldown: 3000,
    run: async (client, interaction) => {
        var notes = interaction.options.get("notes") === null ? "You suck" : interaction.options.get("notes");
        if (notes) {
            return interaction.reply({content: `Added: ${notes}`})
        } else {
            return interaction.reply({content: `Why is u a fag.`})
        }
    }
};