const {
    SlashCommandBuilder
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Veja a latência do bot'),

    async execute(interaction) {

        const ping = interaction.client.ws.ping;

        await interaction.reply(
            `🏓 Pong!\n📡 Ping: ${ping}ms`
        );
    }
};