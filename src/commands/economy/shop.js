const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Veja a loja de pacotes'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🛒 Loja FiguVerse')
            .setDescription(
                `
📦 **Basic Pack** — 500 coins
⭐ Chance comum

🎁 **Premium Pack** — 1500 coins
✨ Chance melhorada

💎 **Elite Pack** — 5000 coins
🔥 Alta chance rara
                `
            );

        interaction.reply({
            embeds: [embed]
        });
    }
};