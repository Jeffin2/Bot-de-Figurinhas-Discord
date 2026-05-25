const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Veja seu perfil'),

    async execute(interaction) {

        const userId = interaction.user.id;

        const coins = await db.get(`coins_${userId}`) || 0;
        const inventory = await db.get(`inventory_${userId}`) || {};

        // 📊 conta total de cartas corretamente
        const totalCards = Object.values(inventory)
            .reduce((acc, amount) => acc + amount, 0);

        const embed = new EmbedBuilder()
            .setColor('#00BFFF')
            .setTitle(`👤 Perfil de ${interaction.user.username}`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                {
                    name: '💰 Coins',
                    value: `${coins}`,
                    inline: true
                },
                {
                    name: '🎴 Cartas',
                    value: `${totalCards}`,
                    inline: true
                }
            )
            .setFooter({ text: 'FiguVerse' });

        return interaction.reply({ embeds: [embed] });
    }
};