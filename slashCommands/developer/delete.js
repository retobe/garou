const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const mongoose = require("mongoose")
module.exports = {
    name: 'deleteuser',
    usage: `/deleteuser <name>`,
    category: 'Moderation',
    description: 'Delete all users with a specific name from the database.',
    type: ApplicationCommandType.ChatInput,
    ownerOnly: true,
    options: [
        {
            name: 'user',
            description: 'The user you want to delete.',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],
    cooldown: 3000,
    run: async (client, interaction) => {
        const userToDelete = interaction.options.getUser('user');
        console.log(userToDelete.id, userToDelete.name)

        // Validate that the user provided a name to delete
        if (!userToDelete.id) {
            return interaction.reply({ content: 'Please provide a name to delete.', ephemeral: true });
        }

        // MongoDB deletion logic
        try {
            const db = mongoose.connection; // Use the existing mongoose connection
            const collection = db.collection('users');

            // Define the filter query to match users by name
            const filter = { userId: userToDelete.id };

            // Find all documents matching the filter and delete them one by one
            const deleteResults = await collection.find(filter);
            let deletedCount = 0;

            for await (const doc of deleteResults) {
                await collection.deleteOne({ _id: doc._id });
                deletedCount++;
            }

            console.log(`Deleted ${deletedCount} user(s) with name "${userToDelete}".`);

            interaction.reply({ content: `Deleted ${deletedCount} user(s) with name "${userToDelete}".`, ephemeral: true });
        } catch (error) {
            console.error('Error deleting users:', error);
            interaction.reply({ content: 'An error occurred while deleting users.', ephemeral: true });
        }
    },
};
