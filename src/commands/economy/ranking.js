const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranking')
        .setDescription('Ranking global de jogadores'),

    async execute(interaction) {

        const allKeys = await db.all();

        const users = [];

        for (const key of allKeys) {

            if (!key.id.startsWith('xp_')) continue;

            const userId = key.id.replace('xp_', '');
            const xp = key.value;

            const level = Math.floor(xp / 1000);

            users.push({
                userId,
                xp,
                level
            });
        }

        users.sort((a, b) => b.xp - a.xp);

        const top = users.slice(0, 10);

        const text = await Promise.all(top.map(async (u, i) => {

            let user;

            try {
                user = await interaction.client.users.fetch(u.userId);
            } catch {
                user = { username: 'Desconhecido' };
            }

            return `**${i + 1}. ${user.username}** — XP: ${u.xp} | Level: ${u.level}`;
        }));

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🏆 Ranking Global')
            .setDescription(text.join('\n'));

        return interaction.reply({ embeds: [embed] });
    }
};