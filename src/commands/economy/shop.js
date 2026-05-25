const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Veja a loja de pacotes'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🛒 Loja FiguVerse')
            .setDescription(`
📦 Basic Pack — 500 coins
⭐ Comum

🎁 Premium Pack — 1500 coins
✨ Melhor chance

💎 Elite Pack — 5000 coins
🔥 Alta raridade
            `);

        return interaction.reply({ embeds: [embed] });
    }
};