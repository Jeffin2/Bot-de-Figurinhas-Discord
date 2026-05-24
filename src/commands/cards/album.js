const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const db = require('../../database/database');
const cards = require('../../models/cards');

function getTeamTypeName(type) {

    if (type === "worldcup") return "World Cup";
    if (type === "legends") return "Legends";
    if (type === "mythics") return "Mythics";

    return "Unknown";
}

module.exports = {

    data: new SlashCommandBuilder()
        .setName('album')
        .setDescription('Veja seu álbum completo'),

    async execute(interaction) {

        const userId = interaction.user.id;

        let currentPage = 1;

        const inventory =
            await db.get(`inventory_${userId}`) || {};

        const maxPage =
            Math.max(...cards.map(c => Number(c.page || 1)));

        function getPageCards(page) {

            return cards.filter(card =>
                Number(card.page) === Number(page)
            );
        }

        function buildEmbed(page) {

            const pageCards = getPageCards(page);

            if (!pageCards.length) {

                return new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('❌ Página vazia')
                    .setDescription('Não há cartas nesta página.');
            }

            const selection = pageCards[0]?.selection || "Unknown";
            const teamType = pageCards[0]?.teamType || "worldcup";

            const formatted = pageCards.map(card => {

                const owned = inventory?.[card.id] || 0;

                return owned > 0
                    ? `✅ ${card.id} • ${card.name} x${owned}`
                    : `❌ ${card.id} • ??????`;

            }).join('\n');

            const collected =
                pageCards.filter(c => inventory?.[c.id]).length;

            return new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`🌍 ${selection} • ${getTeamTypeName(teamType)}`)
                .setDescription(formatted)
                .addFields(
                    {
                        name: '📊 Progresso da página',
                        value: `${collected}/${pageCards.length}`,
                        inline: true
                    },
                    {
                        name: '📖 Página',
                        value: `${page} / ${maxPage}`,
                        inline: true
                    }
                );
        }

        function buildButtons(page) {

            return new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('⬅️ Anterior')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page <= 1),

                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Próxima ➡️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page >= maxPage)
                );
        }

        const message =
            await interaction.reply({
                embeds: [buildEmbed(currentPage)],
                components: [buildButtons(currentPage)],
                fetchReply: true
            });

        const collector =
            message.createMessageComponentCollector({
                time: 300000
            });

        collector.on('collect', async i => {

            if (i.user.id !== userId) {

                return i.reply({
                    content: '❌ Esse álbum não é seu.',
                    ephemeral: true
                });
            }

            if (i.customId === 'prev') {

                currentPage = Math.max(1, currentPage - 1);
            }

            if (i.customId === 'next') {

                currentPage = Math.min(maxPage, currentPage + 1);
            }

            await i.update({
                embeds: [buildEmbed(currentPage)],
                components: [buildButtons(currentPage)]
            });
        });
    }
};