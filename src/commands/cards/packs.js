const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('packs')
        .setDescription('Veja seus pacotes'),

    async execute(interaction) {

        const userId = interaction.user.id;

        const basic = await db.get(`packs_${userId}_basic`) || 0;
        const premium = await db.get(`packs_${userId}_premium`) || 0;
        const elite = await db.get(`packs_${userId}_elite`) || 0;

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('📦 Seus Pacotes')
            .setDescription(
                `📦 Basic Packs: **${basic}**\n` +
                `✨ Premium Packs: **${premium}**\n` +
                `💎 Elite Packs: **${elite}**`
            );

        return interaction.reply({ embeds: [embed] });
    }
};