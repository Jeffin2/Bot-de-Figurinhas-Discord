const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../database/database");
const cards = require("../../models/cards");

// 🎲 raridade
function getRandomRarity() {
    const roll = Math.random() * 100;

    if (roll < 70) return "Comum";
    if (roll < 90) return "Raro";
    if (roll < 99) return "Épico";
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

// 🏅 título por completions
function getTitleByCount(count) {
    if (count === 1) return "🥇 Colecionador Iniciante";
    if (count === 2) return "🥈 Mestre das Figurinhas";
    if (count === 3) return "🥉 Lenda do Álbum";
    if (count === 5) return "👑 Deus das Coleções";
    if (count === 10) return "🔥 Imortal do Gacha";
    return `🎴 Colecionador nível ${count}`;
}

// 🔁 reset álbum
async function resetAlbum(userId) {

    let inventory = await db.get(`inventory_${userId}`) || {};

    for (const c of cards) {
        inventory[c.id] = 0;
    }

    await db.set(`inventory_${userId}`, inventory);
}

module.exports = {

    data: new SlashCommandBuilder()
        .setName("open-pack")
        .setDescription("Abre um pacote de figurinhas"),

    async execute(interaction) {

        const userId = interaction.user.id;

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
            rarity = getRandomRarity();
        }

        const card = getRandomCardByRarity(rarity);

        if (!card) {
            return msg.edit("❌ Nenhuma carta encontrada.");
        }

        // 📦 INVENTÁRIO
        let inventory = await db.get(`inventory_${userId}`) || {};

        if (Array.isArray(inventory)) {
            const converted = {};
            for (const c of inventory) {
                if (!c?.id) continue;
                converted[c.id] = (converted[c.id] || 0) + 1;
            }
            inventory = converted;
        }

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
        pity = (card.rarity === "Lendário") ? 0 : pity + 1;

        await db.set(`pity_${userId}`, pity);
        await db.set(`inventory_${userId}`, inventory);

        // 📈 XP + LEVEL
        const xpGain = 50 + Math.floor(Math.random() * 50);

        let xp = await db.get(`xp_${userId}`) || 0;
        let level = await db.get(`level_${userId}`) || 0;

        xp += xpGain;

        let newLevel = Math.floor(xp / 1000);
        let levelUp = newLevel > level;

        level = newLevel;

        await db.set(`xp_${userId}`, xp);
        await db.set(`level_${userId}`, level);

        // 🏆 SELEÇÃO COMPLETA
        const selectionCards = cards.filter(c => c.selection === card.selection);

        const selectionComplete = selectionCards.every(c =>
            inventory[c.id] && inventory[c.id] > 0
        );

        let bonusText = "";

        if (selectionComplete) {

            const already = await db.get(`completed_${userId}_${card.selection}`);

            if (!already) {

                await db.add(`coins_${userId}`, 5000);
                xp += 1000;

                await db.set(`completed_${userId}_${card.selection}`, true);
            }

            bonusText += `\n🏆 Seleção completa: ${card.selection}`;
        }

        // 🧠 ÁLBUM COMPLETO
        const allComplete = cards.every(c =>
            inventory[c.id] && inventory[c.id] > 0
        );

        if (allComplete) {

            let count = await db.get(`completed_sets_${userId}`) || 0;
            count++;

            await db.set(`completed_sets_${userId}`, count);

            const title = getTitleByCount(count);

            let titles = await db.get(`titles_${userId}`) || [];

            if (!titles.includes(title)) {
                titles.push(title);
                await db.set(`titles_${userId}`, titles);
            }

            await db.add(`coins_${userId}`, 10000);
            xp += 2000;

            await resetAlbum(userId);

            bonusText += `\n\n👑 ÁLBUM COMPLETO!\n🏅 Título: ${title}\n🔁 Reset automático\n🔢 ${count}x completo`;
        }

        await db.set(`xp_${userId}`, xp);
        await db.set(`level_${userId}`, level);

        // 🎭 FAKE MESSAGES
        let fakeMessage = null;

        if (pity >= 25) fakeMessage = "💥 Energia anormal detectada...";
        if (pity >= 28) fakeMessage = "🔥 LENDÁRIA MUITO PRÓXIMA...";

        if (fakeMessage) {
            await msg.edit(fakeMessage);
            await new Promise(r => setTimeout(r, 1200));
        }

        await msg.edit("✨ Revelando carta...");
        await new Promise(r => setTimeout(r, 800));

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
                `🎲 Drop: ${rarity}\n\n` +
                `📊 Pity: ${pity}/30\n` +
                `📈 XP: ${xp} (+${xpGain})\n` +
                `🏅 Level: ${level}` +
                (levelUp ? `\n🎉 LEVEL UP!` : "") +
                (isDuplicate ? `\n♻️ +${earnedCoins} coins (duplicata)` : "") +
                bonusText
            );

        return msg.edit({ content: null, embeds: [embed] });
    }
};