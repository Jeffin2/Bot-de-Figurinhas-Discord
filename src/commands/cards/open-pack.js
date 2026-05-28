const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../database/database");
const cards = require("../../models/cards");

// 🎲 raridade base
function getRandomRarity(boost = 1) {

    const roll = Math.random() * 100;

    const common = 70 / boost;
    const rare = 90 / boost;
    const epic = 99 / boost;

    if (roll < common) return "Comum";
    if (roll < rare) return "Raro";
    if (roll < epic) return "Épico";

    return "Lendário";
}

// 🎴 carta por raridade
function getRandomCardByRarity(rarity) {

    const pool =
        cards.filter(c => c.rarity === rarity);

    return pool[
        Math.floor(Math.random() * pool.length)
    ];
}

// 💰 valor duplicata
function getDuplicateValue(rarity) {

    if (rarity === "Comum") return 50;
    if (rarity === "Raro") return 150;
    if (rarity === "Épico") return 400;
    if (rarity === "Lendário") return 1500;

    return 50;
}

module.exports = {

    data: new SlashCommandBuilder()

        .setName("open-pack")
        .setDescription("Abre um pacote de figurinhas")

        .addStringOption(option =>
            option

                .setName("tipo")
                .setDescription("Tipo do pack")
                .setRequired(false)

                .addChoices(
                    {
                        name: 'Basic Pack',
                        value: 'basic'
                    },

                    {
                        name: 'Premium Pack',
                        value: 'premium'
                    },

                    {
                        name: 'Elite Pack',
                        value: 'elite'
                    }
                )
        ),

    async execute(interaction) {

        const userId =
            interaction.user.id;

        // 📦 tipo do pacote
        const type =
            interaction.options.getString("tipo") || "basic";

        // 📦 verifica packs
        let packs =
            await db.get(`packs_${userId}_${type}`) || 0;

        if (packs <= 0) {

            return interaction.reply({

                content:
                    "❌ Você não tem pacotes desse tipo para abrir.",

                ephemeral: true
            });
        }

        // 💸 remove 1 pack
        await db.set(
            `packs_${userId}_${type}`,
            packs - 1
        );

        // ⚙️ configuração dos packs
        const packConfig = {

            basic: {
                amount: 3,
                boost: 1,
                pityBonus: 0
            },

            premium: {
                amount: 5,
                boost: 1.3,
                pityBonus: 2
            },

            elite: {
                amount: 7,
                boost: 1.7,
                pityBonus: 4
            }
        };

        const config =
            packConfig[type];

        const amount =
            config.amount;

        const boost =
            config.boost;

        const pityBonus =
            config.pityBonus;

        const msg =
            await interaction.reply({

                content:
                    "📦 Abrindo pacote...",

                fetchReply: true
            });

        await new Promise(r =>
            setTimeout(r, 1000)
        );

        await msg.edit({
            content:
                "🎲 Sorteando cartas..."
        });

        await new Promise(r =>
            setTimeout(r, 1000)
        );

        // 📊 pity
        let pity =
            await db.get(`pity_${userId}`) || 0;

        // 📦 inventário
        let inventory =
            await db.get(`inventory_${userId}`) || {};

        let pulledCards = [];

        // 🎴 abrir múltiplas cartas
        for (let i = 0; i < amount; i++) {

            let rarity;

            if (pity >= 29) {

                rarity = "Lendário";
                pity = 0;

            } else {

                rarity =
                    getRandomRarity(boost);
            }

            const card =
                getRandomCardByRarity(rarity);

            if (!card) continue;

            let isDuplicate = false;
            let earnedCoins = 0;

            // ♻️ duplicata
            if (inventory[card.id]) {

                isDuplicate = true;

                earnedCoins =
                    getDuplicateValue(card.rarity);

                await db.add(
                    `coins_${userId}`,
                    earnedCoins
                );

            } else {

                inventory[card.id] = 1;
            }

            // 📊 pity update
            pity =
                (card.rarity === "Lendário")
                    ? 0
                    : pity + 1 + pityBonus;

            pulledCards.push({
                card,
                duplicate: isDuplicate,
                coins: earnedCoins
            });
        }

        await db.set(
            `pity_${userId}`,
            pity
        );

        await db.set(
            `inventory_${userId}`,
            inventory
        );

        // 📈 XP
        const xpGain =
            50 + Math.floor(Math.random() * 50);

        let xp =
            await db.get(`xp_${userId}`) || 0;

        let level =
            await db.get(`level_${userId}`) || 0;

        xp += xpGain;

        let newLevel =
            Math.floor(xp / 1000);

        let levelUp =
            newLevel > level;

        level = newLevel;

        await db.set(
            `xp_${userId}`,
            xp
        );

        await db.set(
            `level_${userId}`,
            level
        );

        const colors = {

            "Comum": 0xffffff,
            "Raro": 0x3498db,
            "Épico": 0x9b59b6,
            "Lendário": 0xf1c40f
        };

        // 🎨 cor pela melhor carta
        const bestRarity =
            pulledCards.some(c => c.card.rarity === "Lendário")
                ? "Lendário"
                : pulledCards.some(c => c.card.rarity === "Épico")
                    ? "Épico"
                    : pulledCards.some(c => c.card.rarity === "Raro")
                        ? "Raro"
                        : "Comum";

        const embed =
            new EmbedBuilder()

                .setTitle("🎴 Pacote Aberto!")

                .setColor(
                    colors[bestRarity]
                )

                .setDescription(

                    pulledCards.map(p =>

                        `🎴 **${p.card.name}**\n` +
                        `🌍 ${p.card.selection}\n` +
                        `⭐ ${p.card.rarity}` +

                        (p.duplicate
                            ? `\n♻️ +${p.coins} coins`
                            : "")

                    ).join("\n\n") +

                    `\n\n📦 Tipo: ${type}` +
                    `\n📊 Pity: ${pity}/30` +
                    `\n📈 XP: ${xp} (+${xpGain})` +
                    `\n🏅 Level: ${level}` +

                    (levelUp
                        ? `\n🎉 LEVEL UP!`
                        : "")
                );

        return msg.edit({

            content: null,
            embeds: [embed]
        });
    }
};