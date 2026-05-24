const { EmbedBuilder } = require('discord.js');
const db = require('../../database/database');

module.exports = {
    name: 'buy-pack',
    description: 'Compre um pacote',

    async execute(interaction) {

        const userId = interaction.user.id;

        const type = interaction.options.getString('tipo');

        let price = 0;

        if (type === 'basic') price = 500;
        else if (type === 'premium') price = 1500;
        else if (type === 'elite') price = 5000;
        else {
            return interaction.reply({
                content: '❌ Tipo de pack inválido.',
                ephemeral: true
            });
        }

        const coins = await db.get(`coins_${userId}`) || 0;

        if (coins < price) {
            return interaction.reply({
                content: '❌ Coins insuficientes.',
                ephemeral: true
            });
        }

        // 💰 remove coins
        await db.sub(`coins_${userId}`, price);

        // 📦 adiciona pack
        await db.add(`packs_${userId}_${type}`, 1);

        const embed = new EmbedBuilder()
            .setColor('#00FF7F')
            .setTitle('📦 Pacote Comprado!')
            .setDescription(
                `✔ Você comprou um **${type} pack** por **${price} coins**`
            );

        return interaction.reply({
            embeds: [embed]
        });
    }
};