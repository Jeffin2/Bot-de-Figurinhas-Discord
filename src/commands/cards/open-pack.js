const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const db = require('../../database/database');

const {
    getRandomCard
} = require('../../utils/randomCard');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('open-pack')
        .setDescription('Abra um pacote')
        .addStringOption(option =>
            option
                .setName('tipo')
                .setDescription('Tipo do pacote')
                .setRequired(true)
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

        const userId = interaction.user.id;

        const type =
            interaction.options.getString('tipo');

        const packs =
            await db.get(`packs_${userId}_${type}`) || 0;

        if (packs <= 0) {

            return interaction.reply({
                content:
                    `❌ Você não possui ${type} packs.`,
                ephemeral: true
            });
        }

        await db.sub(
            `packs_${userId}_${type}`,
            1
        );

        let amount = 3;

        if (type === 'premium') amount = 5;

        if (type === 'elite') amount = 7;

        // PRIMEIRA MENSAGEM
        const openingEmbed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('📦 Abrindo pacote...')
            .setDescription(
                '🌀 Preparando suas figurinhas...'
            );

        await interaction.reply({
            embeds: [openingEmbed]
        });

        // ESPERA 2 SEGUNDOS
        await new Promise(resolve =>
            setTimeout(resolve, 2000)
        );

        // SEGUNDA MENSAGEM
        const revealEmbed = new EmbedBuilder()
            .setColor('#00BFFF')
            .setTitle('✨ Revelando cartas...')
            .setDescription(
                '🎴 As figurinhas estão aparecendo...'
            );

        await interaction.editReply({
            embeds: [revealEmbed]
        });

        // ESPERA 2 SEGUNDOS
        await new Promise(resolve =>
            setTimeout(resolve, 2000)
        );

        let inventory =
            await db.get(`inventory_${userId}`) || {};

        const openedCards = [];

        for (let i = 0; i < amount; i++) {

            const card = getRandomCard(type);

            if (!inventory[card.id]) {

                inventory[card.id] = 1;

            } else {

                inventory[card.id]++;
            }

            let emoji = '⚪';

            if (card.rarity === 'Rare')
                emoji = '🔵';

            if (card.rarity === 'Epic')
                emoji = '🟣';

            if (card.rarity === 'Legendary')
                emoji = '🟡';

            if (card.rarity === 'Mythic')
                emoji = '🔴';

            openedCards.push(
                `${emoji} ${card.name} • ${card.rarity}`
            );
        }

        await db.set(
            `inventory_${userId}`,
            inventory
        );

        const finalEmbed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎉 Pack Aberto!')
            .setDescription(
                openedCards.join('\n')
            )
            .setFooter({
                text:
                    `${type.toUpperCase()} PACK`
            });

        await interaction.editReply({
            embeds: [finalEmbed]
        });
    }
};