const { EmbedBuilder } = require('discord.js');
const db = require('../../database/database');

module.exports = {
    name: 'balance',
    description: 'Veja seu saldo',

    async execute(interaction) {

        const userId = interaction.user.id;

        const coins = await db.get(`coins_${userId}`) || 0;

        const embed = new EmbedBuilder()
            .setColor('#00BFFF')
            .setTitle('💳 Carteira')
            .setDescription(`Você possui **${coins} coins** 💰`)
            .setFooter({ text: 'FiguVerse' });

        return interaction.reply({
            embeds: [embed]
        });
    }
};