const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'shop',
    description: 'Veja a loja de pacotes',

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🛒 Loja FiguVerse')
            .setDescription(
                `📦 **Basic Pack** — 500 coins\n` +
                `⭐ Cartas comuns e raras\n\n` +
                
                `🎁 **Premium Pack** — 1500 coins\n` +
                `✨ Mais chance de raras e épicas\n\n` +
                
                `💎 **Elite Pack** — 5000 coins\n` +
                `🔥 Alta chance de épicas e lendárias`
            );

        return interaction.reply({ embeds: [embed] });
    }
};