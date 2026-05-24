const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const db = require('../../database/database');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('buy-pack')
        .setDescription('Compre um pacote')
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

        let price = 0;

        if (type === 'basic') price = 500;
        if (type === 'premium') price = 1500;
        if (type === 'elite') price = 5000;

        const coins =
            await db.get(`coins_${userId}`) || 0;

        if (coins < price) {

            return interaction.reply({
                content: '❌ Coins insuficientes.',
                ephemeral: true
            });
        }

        await db.sub(`coins_${userId}`, price);

        await db.add(`packs_${userId}_${type}`, 1);

        const embed = new EmbedBuilder()
            .setColor('#00FF7F')
            .setTitle('📦 Pacote Comprado!')
            .setDescription(
                `Você comprou um **${type} pack**`
            );

        interaction.reply({
            embeds: [embed]
        });
    }
};