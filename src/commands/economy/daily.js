const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const db = require('../../database/database');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Pegue sua recompensa diária'),

    async execute(interaction) {

        const userId = interaction.user.id;

        const lastDaily = await db.get(`daily_${userId}`);

        const now = Date.now();

        const cooldown = 24 * 60 * 60 * 1000;

        if (lastDaily && now - lastDaily < cooldown) {

            const remaining = cooldown - (now - lastDaily);

            const hours = Math.floor(remaining / (1000 * 60 * 60));

            return interaction.reply({
                content: `⏳ Você já coletou seu daily.\nVolte em ${hours}h.`,
                ephemeral: true
            });
        }

        const reward = 500;

        await db.add(`coins_${userId}`, reward);

        await db.set(`daily_${userId}`, now);

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎁 Daily Coletado!')
            .setDescription(
                `Você recebeu **${reward} coins** 💰`
            )
            .setFooter({
                text: 'FiguVerse'
            });

        interaction.reply({
            embeds: [embed]
        });
    }
};