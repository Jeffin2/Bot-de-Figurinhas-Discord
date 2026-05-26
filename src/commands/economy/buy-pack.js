const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const db =
    require('../../database/database');

module.exports = {

    data: new SlashCommandBuilder()

        .setName('buy-pack')

        .setDescription(
            'Compre um pacote'
        )

        .addStringOption(option =>

            option

                .setName('tipo')

                .setDescription(
                    'Tipo do pacote'
                )

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

        const userId =
            interaction.user.id;

        const type =
            interaction.options.getString('tipo');

        let price = 0;

        // 💰 preços
        if (type === 'basic') {

            price = 500;

        } else if (type === 'premium') {

            price = 1500;

        } else if (type === 'elite') {

            price = 5000;

        } else {

            return interaction.reply({

                content:
                    '❌ Tipo inválido.',

                ephemeral: true
            });
        }

        // 💰 coins usuário
        const coins =
            await db.get(`coins_${userId}`) || 0;

        // ❌ sem dinheiro
        if (coins < price) {

            return interaction.reply({

                content:
                    `❌ Você precisa de ${price} coins.`,

                ephemeral: true
            });
        }

        // 💸 remove coins
        await db.sub(
            `coins_${userId}`,
            price
        );

        // 📦 adiciona pack
        await db.add(
            `packs_${userId}_${type}`,
            1
        );

        // 📦 quantidade atual
        const totalPacks =
            await db.get(
                `packs_${userId}_${type}`
            ) || 0;

        const embed =
            new EmbedBuilder()

                .setColor('#00FF7F')

                .setTitle(
                    '📦 Pacote Comprado!'
                )

                .setDescription(

                    `✅ Você comprou:\n` +

                    `📦 **${type} pack**\n` +

                    `💰 Preço: ${price} coins\n` +

                    `📊 Você agora possui: ${totalPacks}`
                );

        return interaction.reply({

            embeds: [embed]
        });
    }
};