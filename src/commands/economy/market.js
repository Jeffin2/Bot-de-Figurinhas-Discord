const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../../database/database");
const cards = require("../../models/cards");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("market")
        .setDescription("Marketplace de cartas")
        .addSubcommand(sub =>
            sub
                .setName("list")
                .setDescription("Ver cartas à venda")
        )
        .addSubcommand(sub =>
            sub
                .setName("sell")
                .setDescription("Vender uma carta")
                .addStringOption(opt =>
                    opt.setName("card")
                        .setDescription("ID da carta")
                        .setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("price")
                        .setDescription("Preço em coins")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("buy")
                .setDescription("Comprar uma carta")
                .addStringOption(opt =>
                    opt.setName("id")
                        .setDescription("ID do anúncio")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {

        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        // 🛒 LISTAR
        if (sub === "list") {

            const all = await db.get("market_all") || {};
            const entries = Object.entries(all);

            if (entries.length === 0) {
                return interaction.reply({
                    content: "📭 Nenhuma carta à venda.",
                    ephemeral: true
                });
            }

            const text = entries.map(([id, item]) => {

                const card = cards.find(c => c.id === item.cardId);

                return `🆔 ${id}
🎴 ${card?.name || "Carta desconhecida"}
💰 ${item.price} coins
👤 <@${item.sellerId}>
⏳ Disponível`;

            }).join("\n\n-----------------\n\n");

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🛒 Marketplace")
                        .setColor("#FFD700")
                        .setDescription(text)
                ]
            });
        }

        // 💰 VENDER
        if (sub === "sell") {

            const cardId = interaction.options.getString("card");
            const price = interaction.options.getInteger("price");

            if (price <= 0) {
                return interaction.reply({
                    content: "❌ Preço inválido.",
                    ephemeral: true
                });
            }

            let inventory = await db.get(`inventory_${userId}`) || {};

            if (!inventory[cardId] || inventory[cardId] <= 0) {
                return interaction.reply({
                    content: "❌ Você não tem essa carta.",
                    ephemeral: true
                });
            }

            const id = Date.now().toString();

            let market = await db.get("market_all") || {};

            market[id] = {
                sellerId: userId,
                cardId,
                price,
                timestamp: Date.now()
            };

            // remove do inventário
            inventory[cardId] -= 1;
            if (inventory[cardId] <= 0) delete inventory[cardId];

            await db.set(`inventory_${userId}`, inventory);
            await db.set("market_all", market);

            return interaction.reply({
                content: `✅ Carta colocada à venda por ${price} coins. (ID: ${id})`,
                ephemeral: true
            });
        }

        // 🛍 COMPRAR
        if (sub === "buy") {

            const id = interaction.options.getString("id");

            let market = await db.get("market_all") || {};
            const item = market[id];

            if (!item) {
                return interaction.reply({
                    content: "❌ Anúncio não encontrado.",
                    ephemeral: true
                });
            }

            if (item.sellerId === userId) {
                return interaction.reply({
                    content: "❌ Você não pode comprar sua própria carta.",
                    ephemeral: true
                });
            }

            const buyerCoins = await db.get(`coins_${userId}`) || 0;

            if (buyerCoins < item.price) {
                return interaction.reply({
                    content: "❌ Coins insuficientes.",
                    ephemeral: true
                });
            }

            // 💰 transferir coins
            await db.sub(`coins_${userId}`, item.price);
            await db.add(`coins_${item.sellerId}`, item.price);

            // 🎴 adicionar carta
            let inventory = await db.get(`inventory_${userId}`) || {};

            inventory[item.cardId] = (inventory[item.cardId] || 0) + 1;

            await db.set(`inventory_${userId}`, inventory);

            // 🧹 remover do market
            delete market[id];
            await db.set("market_all", market);

            return interaction.reply({
                content: "🛒 Compra realizada com sucesso!"
            });
        }
    }
};