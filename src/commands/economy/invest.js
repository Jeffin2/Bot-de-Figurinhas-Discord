const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../../database/database");
const cards = require("../../models/cards");

// 🎲 chance por raridade
function getChance(rarity) {
    if (rarity === "Comum") return 0.35;
    if (rarity === "Raro") return 0.5;
    if (rarity === "Épico") return 0.65;
    if (rarity === "Lendário") return 0.8;
    return 0.3;
}

// 💰 valor base da carta
function getBaseValue(rarity) {
    if (rarity === "Comum") return 100;
    if (rarity === "Raro") return 300;
    if (rarity === "Épico") return 800;
    if (rarity === "Lendário") return 2000;
    return 100;
}

module.exports = {

    data: new SlashCommandBuilder()
        .setName("invest")
        .setDescription("Sistema de investimento de cartas")
        .addSubcommand(sub =>
            sub
                .setName("add")
                .setDescription("Investir carta duplicada")
                .addStringOption(opt =>
                    opt.setName("card")
                        .setDescription("ID da carta")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("claim")
                .setDescription("Resgatar investimento (24h)")
        )
        .addSubcommand(sub =>
            sub
                .setName("view")
                .setDescription("Ver investimentos ativos")
        ),

    async execute(interaction) {

        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        // 📦 VIEW
        if (sub === "view") {

            const inv = await db.get(`investments_${userId}`) || [];

            if (inv.length === 0) {
                return interaction.reply({
                    content: "📭 Nenhum investimento ativo.",
                    ephemeral: true
                });
            }

            const text = inv.map((i, idx) => {

                const card = cards.find(c => c.id === i.cardId);

                const ready = Date.now() >= i.time + 86400000;

                return `#${idx + 1}
🎴 ${card?.name || "Carta desconhecida"}
⭐ ${i.rarity}
⏳ ${ready ? "✅ Pronto para resgatar" : `<t:${Math.floor((i.time + 86400000) / 1000)}:R>`}`;

            }).join("\n\n");

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🏦 Investimentos")
                        .setColor("#00BFFF")
                        .setDescription(text)
                ]
            });
        }

        // 📈 ADD
        if (sub === "add") {

            const cardId = interaction.options.getString("card");

            let inventory = await db.get(`inventory_${userId}`) || {};

            if (!inventory[cardId] || inventory[cardId] <= 0) {
                return interaction.reply({
                    content: "❌ Você não tem essa carta.",
                    ephemeral: true
                });
            }

            const card = cards.find(c => c.id === cardId);

            if (!card) {
                return interaction.reply({
                    content: "❌ Carta inválida.",
                    ephemeral: true
                });
            }

            let investments = await db.get(`investments_${userId}`) || [];

            // 🔁 remove do inventário
            inventory[cardId] -= 1;
            if (inventory[cardId] <= 0) delete inventory[cardId];

            investments.push({
                cardId,
                rarity: card.rarity,
                time: Date.now(),
                claimed: false
            });

            await db.set(`inventory_${userId}`, inventory);
            await db.set(`investments_${userId}`, investments);

            return interaction.reply({
                content: `📈 Carta investida com sucesso!`,
                ephemeral: true
            });
        }

        // 💰 CLAIM
        if (sub === "claim") {

            let investments = await db.get(`investments_${userId}`) || [];

            if (investments.length === 0) {
                return interaction.reply({
                    content: "📭 Nenhum investimento ativo.",
                    ephemeral: true
                });
            }

            const now = Date.now();
            let totalProfit = 0;

            const remaining = [];

            for (const inv of investments) {

                const ready = now >= inv.time + 86400000;

                if (!ready) {
                    remaining.push(inv);
                    continue;
                }

                if (inv.claimed) {
                    continue;
                }

                const chance = getChance(inv.rarity);
                const success = Math.random() < chance;

                if (success) {
                    const base = getBaseValue(inv.rarity);
                    const profit = Math.floor(base * (0.5 + Math.random()));

                    totalProfit += profit;
                }

                // marca como processado
                inv.claimed = true;
                remaining.push(inv);
            }

            await db.set(`investments_${userId}`, remaining);

            if (totalProfit > 0) {
                await db.add(`coins_${userId}`, totalProfit);
            }

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🏦 Resultado do Investimento")
                        .setColor("#FFD700")
                        .setDescription(
                            `💰 Lucro total: **${totalProfit} coins**`
                        )
                ]
            });
        }
    }
};