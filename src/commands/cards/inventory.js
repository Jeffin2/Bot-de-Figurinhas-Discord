const { EmbedBuilder } = require('discord.js');
const db = require('../../database/database');
const cards = require('../../models/cards');

module.exports = {
    name: 'inventory',
    description: 'Veja suas figurinhas',

    async execute(interaction) {

        const userId = interaction.user.id;

        let inventory = await db.get(`inventory_${userId}`);

        if (!inventory) {
            inventory = {};
        }

        // 🔄 Converte formato antigo (array → objeto)
        if (Array.isArray(inventory)) {

            const converted = {};

            for (const card of inventory) {

                if (!card?.id) continue;

                converted[card.id] = (converted[card.id] || 0) + 1;
            }

            inventory = converted;

            await db.set(`inventory_${userId}`, inventory);
        }

        const entries = Object.entries(inventory);

        if (entries.length === 0) {
            return interaction.reply({
                content: '📭 Seu inventário está vazio.',
                ephemeral: true
            });
        }

        const formatted = entries
            .map(([cardId, amount]) => {

                const card = cards.find(c => c.id === cardId);

                if (!card) return null;

                return `🎴 ${card.name} • ${card.rarity} x${amount}`;
            })
            .filter(Boolean)
            .join('\n');

        const embed = new EmbedBuilder()
            .setColor('#00BFFF')
            .setTitle('🎒 Seu Inventário')
            .setDescription(formatted || 'Sem cartas');

        return interaction.reply({
            embeds: [embed]
        });
    }
};