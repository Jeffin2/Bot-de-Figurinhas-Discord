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
    const pool = cards.filter(c => c.rarity === rarity);
    return pool[Math.floor(Math.random() * pool.length)];
}

// 💰 duplicata
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
                    { name: "Normal", value: "normal" },
                    { name: "Raro Boost", value: "rare" },
                    { name: "Lendário Boost", value: "legendary" }
                )
        ),

    async execute(interaction) {

        const userId = interaction.user.id;

        const type = interaction.options.getString("tipo") || "normal";

        let boost = 1;
        let pityBonus = 0;

        if (type === "rare") {
            boost = 1.3;
            pityBonus = 2;
        }

        if (type === "legendary") {
            boost = 1.7;
            pityBonus = 4;
        }

        const msg = await interaction.reply({
            content: "📦 Abrindo pacote...",
            fetchReply: true
        });

        await new Promise(r => setTimeout(r, 1000));
        await msg.edit("🎲 Sorteando energia do pack...");
        await new Promise(r => setTimeout(r, 1000));

        // 📊 PITY
        let pity = await db.get(`pity_${userId}`) || 0;

        let rarity;

        if (pity >= 29) {
            rarity = "Lendário";
            pity = 0;
        } else {
            rarity = getRandomRarity(boost);
        }

        const card = getRandomCardByRarity(rarity);

        if (!card) {
            return msg.edit("❌ Nenhuma carta encontrada.");
        }

        // 📦 INVENTÁRIO
        let inventory = await db.get(`inventory_${userId}`) || {};

        let isDuplicate = false;
        let earnedCoins = 0;

        if (inventory[card.id]) {
            isDuplicate = true;
            earnedCoins = getDuplicateValue(card.rarity);
            await db.add(`coins_${userId}`, earnedCoins);
        } else {
            inventory[card.id] = 1;
        }

        // 📊 PITY UPDATE
        pity = (card.rarity === "Lendário")
            ? 0
            : pity + 1 + pityBonus;

        await db.set(`pity_${userId}`, pity);
        await db.set(`inventory_${userId}`, inventory);

        // 📈 XP
        const xpGain = 50 + Math.floor(Math.random() * 50);

        let xp = await db.get(`xp_${userId}`) || 0;
        let level = await db.get(`level_${userId}`) || 0;

        xp += xpGain;

        let newLevel = Math.floor(xp / 1000);
        let levelUp = newLevel > level;

        level = newLevel;

        await db.set(`xp_${userId}`, xp);
        await db.set(`level_${userId}`, level);

        const colors = {
            "Comum": 0xffffff,
            "Raro": 0x3498db,
            "Épico": 0x9b59b6,
            "Lendário": 0xf1c40f
        };

        const embed = new EmbedBuilder()
            .setTitle("🎴 Pacote Aberto!")
            .setColor(colors[rarity] || 0xffffff)
            .setDescription(
                `**${card.name}**\n` +
                `🌍 ${card.selection}\n` +
                `⭐ ${card.rarity}\n` +
                `🎲 Drop: ${rarity}\n` +
                `📦 Tipo: ${type}\n\n` +
                `📊 Pity: ${pity}/30\n` +
                `📈 XP: ${xp} (+${xpGain})\n` +
                `🏅 Level: ${level}` +
                (levelUp ? `\n🎉 LEVEL UP!` : "") +
                (isDuplicate ? `\n♻️ +${earnedCoins} coins (duplicata)` : "")
            );

        return msg.edit({ content: null, embeds: [embed] });
    }
};