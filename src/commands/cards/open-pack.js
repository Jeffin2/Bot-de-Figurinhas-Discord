const { EmbedBuilder } = require("discord.js");
const db = require("../../database/database");
const cards = require("../../models/cards");

function getRandomCard() {
    return cards[Math.floor(Math.random() * cards.length)];
}

module.exports = {
    name: "open-pack",
    description: "Abre um pacote de figurinhas",

    async execute(interaction) {

        try {

            const card = getRandomCard();

            if (!card) {
                return interaction.reply({
                    content: "❌ Nenhuma carta encontrada.",
                    ephemeral: true
                });
            }

            const userId = interaction.user.id;

            // 📦 pega inventário
            let inventory = await db.get(`inventory_${userId}`);

            if (!inventory) inventory = {};

            // 🔄 garante formato correto
            if (Array.isArray(inventory)) {
                const converted = {};

                for (const c of inventory) {
                    if (!c?.id) continue;
                    converted[c.id] = (converted[c.id] || 0) + 1;
                }

                inventory = converted;
            }

            // 🎴 adiciona carta
            inventory[card.id] = (inventory[card.id] || 0) + 1;

            await db.set(`inventory_${userId}`, inventory);

            // 🎨 cor da raridade
            const color =
                card.rarity === "Mítico" ? 0xff0000 :
                card.rarity === "Lendário" ? 0xf1c40f :
                card.rarity === "Épico" ? 0x9b59b6 :
                card.rarity === "Raro" ? 0x3498db :
                0xffffff;

            const embed = new EmbedBuilder()
                .setTitle("🎴 Pacote Aberto!")
                .setDescription(
                    `**${card.name}**\n` +
                    `🌍 Seleção: ${card.selection}\n` +
                    `⭐ Raridade: ${card.rarity}`
                )
                .setColor(color);

            return interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);

            return interaction.reply({
                content: "❌ Erro ao abrir pack.",
                ephemeral: true
            });
        }
    }
};