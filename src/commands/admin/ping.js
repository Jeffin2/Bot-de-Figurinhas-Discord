module.exports = {
    name: 'ping',
    description: 'Veja a latência do bot',

    async execute(interaction) {

        const ping = interaction.client.ws.ping;

        return interaction.reply(`🏓 Pong!\n📡 Ping: ${ping}ms`);
    }
};