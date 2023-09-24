const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { MongoClient } = require('mongodb');

module.exports = {
    name: 'deleteuser',
    usage: `/deleteuser <name>`,
    category: 'Moderation',
    description: 'Delete a user by name from the database.',
    type: ApplicationCommandType.ChatInput,
    ownerOnly: true,
    options: [
        {
            name: 'name',
            description: 'The name of the user to delete.',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    cooldown: 3000,
    run: async (client, interaction) => {
        const nameToDelete = interaction.options.getString('name');

        // Validate that the user provided a name to delete
        if (!nameToDelete) {
            return interaction.reply({ content: 'Please provide a name to delete.', ephemeral: true });
        }

        // MongoDB deletion logic
        try {
            const clientMongo = new MongoClient(process.env.DATABASETOKEN, { useUnifiedTopology: true });
            await clientMongo.connect();

            const db = clientMongo.db('test');
            const collection = db.collection('users');

            // Define the filter query to match users by name
            const filter = { userName: nameToDelete };

            // Delete the documents that match the filter
            const result = await collection.deleteMany(filter);

            await clientMongo.close();

            interaction.reply({ content: `Deleted ${result.deletedCount} user(s) with name "${nameToDelete}".`, ephemeral: true });
        } catch (error) {
            console.error('Error deleting users:', error);
            interaction.reply({ content: 'An error occurred while deleting users.', ephemeral: true });
        }
    },
};
