const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const User = require("../../schemas/user")
module.exports = {
    name: 'notes',
    usage: `/notes <add/remove/check>`,
    category: `Fun`,
    description: "Add notes to your notes.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "add",
            description: "Add notes to your notebook.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: `notes`,
                    description: `Add whatever you want to your notes`,
                    type: ApplicationCommandOptionType.String,
                    required: true,
                }
            ]
        },
        {
            name: "remove",
            description: `Remove existing notes.`,
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "check",
            description: `Check existing notes.`,
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    cooldown: 3000,
    run: async (client, interaction) => {
        var subCmd = interaction.options.getSubcommand();
        let userProfile = await User.findOne({ userId: `${interaction.user.id}` });
        switch (subCmd) {
            case "add":
                const userNotes = interaction.options.get("notes").value;
                if (userNotes.length > 150) {
                    return interaction.reply({ content: `Your notes were too long, make them shorter.\n\n"${userNotes}"`, ephemeral: true })
                }

                if (userNotes.length < 4) {
                    return interaction.reply({ content: `Your notes were too short, make them longer.\n\n"${userNotes}"`, ephemeral: true })
                }

                await User.updateOne(
                    { userId: `${interaction.user.id}` },
                    { $set: { notes: `${userNotes}` } }
                )
                return interaction.reply({ content: `Added your note!`, ephemeral: false });
                break;
            case "check":
                if (userProfile.notes != "") {
                    return interaction.reply(`Your current notes are:\n${userProfile?.notes}`);
                } else {
                    return interaction.reply('You have no saved notes.');
                }
                break;
            case "remove":
                if (userProfile.notes != "") {
                    await User.updateOne(
                        { userId: `${interaction.user.id}` },
                        { $set: { notes: `` } }
                    )
                    return interaction.reply(`I have removed your notes.`);
                } else {
                    return interaction.reply('You have no saved notes.');
                }
                break;
            default:
                return interaction.reply({ content: `Error 404` });
                break;
        }

    }
};