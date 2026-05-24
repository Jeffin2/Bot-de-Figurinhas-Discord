const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../../database/database");
const cards = require("../../models/cards");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("auction")
        .setDescription("Sistema de leilão de cartas")
        .addSubcommand(sub =>
            sub
                .setName("create")
                .setDescription("Criar leilão")
                .addStringOption(opt =>
                    opt.setName("card")
                        .setDescription("ID da carta")
                        .setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("min")
                        .setDescription("Lance inicial")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("bid")
                .setDescription("Dar lance")
                .addStringOption(opt =>
                    opt.setName("id")
                        .setDescription("ID do leilão")
                        .setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("value")
                        .setDescription("Valor do lance")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("list")
                .setDescription("Ver leilões ativos")
        ),

    async execute(interaction) {

        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        // 📜 LISTAR
        if (sub === "list") {

            const auctions = await db.get("auctions_all") || {};

            const entries = Object.entries(auctions);

            if (entries.length === 0) {
                return interaction.reply({
                    content: "📭 Nenhum leilão ativo.",
                    ephemeral: true
                });
            }

            const text = entries.map(([id, a]) => {

                const card = cards.find(c => c.id === a.cardId);

                return `🏷️ ID: ${id}
🎴 ${card?.name}
💰 Maior lance: ${a.currentBid || a.min} coins
👤 <@${a.highestBidder || a.sellerId}>
⏳ Termina: <t:${Math.floor(a.endTime / 1000)}:R>`;
            }).join("\n\n");

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🏷️ Leilões Ativos")
                        .setColor("#FFD700")
                        .setDescription(text)
                ]
            });
        }

        // 🏗️ CRIAR LEILÃO
        if (sub === "create") {

            const cardId = interaction.options.getString("card");
            const min = interaction.options.getInteger("min");

            let inventory = await db.get(`inventory_${userId}`) || {};

            if (!inventory[cardId]) {
                return interaction.reply({
                    content: "❌ Você não tem essa carta.",
                    ephemeral: true
                });
            }

            const id = Date.now().toString();

            const auction = {
                sellerId: userId,
                cardId,
                min,
                currentBid: min,
                highestBidder: null,
                endTime: Date.now() + 5 * 60 * 1000 // 5 min
            };

            let auctions = await db.get("auctions_all") || {};
            auctions[id] = auction;

            // remove carta do dono
            inventory[cardId] -= 1;
            if (inventory[cardId] <= 0) delete inventory[cardId];

            await db.set(`inventory_${userId}`, inventory);
            await db.set("auctions_all", auctions);

            return interaction.reply({
                content: `🏷️ Leilão criado com sucesso! ID: ${id}`
            });
        }

        // 💰 DAR LANCE
        if (sub === "bid") {

            const id = interaction.options.getString("id");
            const value = interaction.options.getInteger("value");

            let auctions = await db.get("auctions_all") || {};
            const a = auctions[id];

            if (!a) {
                return interaction.reply({
                    content: "❌ Leilão não encontrado.",
                    ephemeral: true
                });
            }

            if (Date.now() > a.endTime) {
                return interaction.reply({
                    content: "⏳ Leilão encerrado.",
                    ephemeral: true
                });
            }

            const coins = await db.get(`coins_${userId}`) || 0;

            if (coins < value) {
                return interaction.reply({
                    content: "❌ Coins insuficientes.",
                    ephemeral: true
                });
            }

            if (value <= a.currentBid) {
                return interaction.reply({
                    content: "❌ Lance muito baixo.",
                    ephemeral: true
                });
            }

            a.currentBid = value;
            a.highestBidder = userId;

            auctions[id] = a;
            await db.set("auctions_all", auctions);

            return interaction.reply({
                content: `💰 Lance de ${value} coins registrado!`
            });
        }
    }
};