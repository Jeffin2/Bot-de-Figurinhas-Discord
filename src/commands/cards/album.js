const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const db = require('../../database/database');
const cards = require('../../models/cards');

function getTeamTypeName(type) {
    if (type === "worldcup") return "World Cup";
    if (type === "legends") return "Lendárias";
    if (type === "mythics") return "Míticas";
    return "Desconhecido";
}

function getRarityStyle(rarity) {
    if (rarity === "Comum") return "⬜ Comum";
    if (rarity === "Raro") return "🟨 Raro";
    if (rarity === "Épico") return "🟪 Épico";
    return "❔";
}

module.exports = {
    name: 'album',
    description: 'Veja seu álbum por seleção',

    async execute(interaction) {

        const userId = interaction.user.id;

        // garante que inventory nunca quebra
        const inventory = await db.get(`inventory_${userId}`) || {};

        const selections = [...new Set(cards.map(c => c.selection))];

        let currentIndex = 0;

        function getSelectionCards(selection) {
            return cards.filter(c => c.selection === selection);
        }

        function buildEmbed(index) {

            const selection = selections[index];
            const selectionCards = getSelectionCards(selection);

            const teamType = selectionCards[0]?.teamType || "worldcup";

            const formatted = selectionCards.map(card => {

                const owned = inventory[card.id] || 0;

                return owned > 0
                    ? `✅ ${card.id} • ${card.name} • ${getRarityStyle(card.rarity)} x${owned}`
                    : `❌ ${card.id} • ????? • ${getRarityStyle(card.rarity)}`;

            }).join('\n');

            const collected = selectionCards.filter(c => inventory[c.id]).length;

            return new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`🌍 ${selection} • ${getTeamTypeName(teamType)}`)
                .setDescription(formatted || "Sem cartas")
                .addFields(
                    {
                        name: '📊 Progresso',
                        value: `${collected}/${selectionCards.length}`,
                        inline: true
                    },
                    {
                        name: '📖 Página',
                        value: `${index + 1}/${selections.length}`,
                        inline: true
                    }
                );
        }

        function buildButtons(index) {

            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`album_prev_${userId}`)
                    .setLabel('⬅️ Anterior')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(index <= 0),

                new ButtonBuilder()
                    .setCustomId(`album_next_${userId}`)
                    .setLabel('Próxima ➡️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(index >= selections.length - 1)
            );
        }

        await interaction.reply({
            embeds: [buildEmbed(currentIndex)],
            components: [buildButtons(currentIndex)]
        });

        const message = await interaction.fetchReply();

        const collector = message.createMessageComponentCollector({
            time: 300000
        });

        collector.on('collect', async i => {

            if (i.user.id !== userId) {
                return i.reply({
                    content: '❌ Esse álbum não é seu.',
                    ephemeral: true
                });
            }

            if (i.customId.startsWith('album_prev')) {
                currentIndex = Math.max(0, currentIndex - 1);
            }

            if (i.customId.startsWith('album_next')) {
                currentIndex = Math.min(selections.length - 1, currentIndex + 1);
            }

            await i.update({
                embeds: [buildEmbed(currentIndex)],
                components: [buildButtons(currentIndex)]
            });
        });
    }
};