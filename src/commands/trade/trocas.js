const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const db = require('../../database/database');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('troca')
        .setDescription('Sistema de trocas')
        .addSubcommand(sub =>
            sub
                .setName('iniciar')
                .setDescription('Inicia uma troca')
                .addUserOption(opt =>
                    opt.setName('usuario')
                        .setDescription('Usuário para trocar')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('add')
                .setDescription('Adiciona carta na troca')
                .addStringOption(opt =>
                    opt.setName('card')
                        .setDescription('ID da carta')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('aceitar')
                .setDescription('Aceita a troca')
        )
        .addSubcommand(sub =>
            sub
                .setName('recusar')
                .setDescription('Recusa a troca')
        ),

    async execute(interaction) {

        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        // 📦 INICIAR TROCA
        if (sub === 'iniciar') {

            const target = interaction.options.getUser('usuario');

            if (!target || target.bot) {
                return interaction.reply({
                    content: '❌ Usuário inválido.',
                    ephemeral: true
                });
            }

            const trade = {
                owner: userId,
                target: target.id,
                ownerCards: [],
                targetCards: [],
                status: 'pending'
            };

            await db.set(`trade_${userId}`, trade);
            await db.set(`trade_${target.id}`, trade);

            const embed = new EmbedBuilder()
                .setTitle('🔁 Troca Iniciada')
                .setColor('#00BFFF')
                .setDescription(
                    `👤 <@${userId}> iniciou uma troca com <@${target.id}>\n\n` +
                    `Use /troca add para adicionar cartas`
                );

            return interaction.reply({ embeds: [embed] });
        }

        // 🎴 ADICIONAR CARTA
        if (sub === 'add') {

            const cardId = interaction.options.getString('card');

            const trade = await db.get(`trade_${userId}`);

            if (!trade || trade.owner !== userId) {
                return interaction.reply({
                    content: '❌ Você não iniciou uma troca.',
                    ephemeral: true
                });
            }

            let inventory = await db.get(`inventory_${userId}`) || {};

            if (!inventory[cardId] || inventory[cardId] <= 0) {
                return interaction.reply({
                    content: '❌ Você não tem essa carta.',
                    ephemeral: true
                });
            }

            trade.ownerCards.push(cardId);

            await db.set(`trade_${userId}`, trade);
            await db.set(`trade_${trade.target}`, trade);

            return interaction.reply({
                content: `✅ Carta **${cardId}** adicionada à troca.`,
                ephemeral: true
            });
        }

        // ✅ ACEITAR TROCA
        if (sub === 'aceitar') {

            const trade = await db.get(`trade_${userId}`);

            if (!trade || trade.target !== userId) {
                return interaction.reply({
                    content: '❌ Nenhuma troca pendente.',
                    ephemeral: true
                });
            }

            let invOwner = await db.get(`inventory_${trade.owner}`) || {};
            let invTarget = await db.get(`inventory_${trade.target}`) || {};

            // 🔁 remover do owner e dar pro target
            for (const cardId of trade.ownerCards) {

                invOwner[cardId] = (invOwner[cardId] || 1) - 1;
                invTarget[cardId] = (invTarget[cardId] || 0) + 1;
            }

            // 🔁 remover do target e dar pro owner
            for (const cardId of trade.targetCards) {

                invTarget[cardId] = (invTarget[cardId] || 1) - 1;
                invOwner[cardId] = (invOwner[cardId] || 0) + 1;
            }

            await db.set(`inventory_${trade.owner}`, invOwner);
            await db.set(`inventory_${trade.target}`, invTarget);

            await db.delete(`trade_${trade.owner}`);
            await db.delete(`trade_${trade.target}`);

            return interaction.reply({
                content: '🔁 Troca realizada com sucesso!'
            });
        }

        // ❌ RECUSAR TROCA
        if (sub === 'recusar') {

            const trade = await db.get(`trade_${userId}`);

            if (!trade || trade.target !== userId) {
                return interaction.reply({
                    content: '❌ Nenhuma troca pendente.',
                    ephemeral: true
                });
            }

            await db.delete(`trade_${trade.owner}`);
            await db.delete(`trade_${trade.target}`);

            return interaction.reply({
                content: '❌ Troca recusada.'
            });
        }
    }
};