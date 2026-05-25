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

        // 📦 INICIAR
        if (sub === 'iniciar') {

            const target = interaction.options.getUser('usuario');

            if (!target || target.bot || target.id === userId) {
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
                confirmed: {
                    owner: false,
                    target: false
                }
            };

            await db.set(`trade_${userId}`, trade);
            await db.set(`trade_${target.id}`, trade);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🔁 Troca Iniciada')
                        .setColor('#00BFFF')
                        .setDescription(
                            `👤 <@${userId}> → <@${target.id}>\n\n` +
                            `Use /troca add para adicionar cartas`
                        )
                ]
            });
        }

        // 🎴 ADD
        if (sub === 'add') {

            const cardId = interaction.options.getString('card');
            const trade = await db.get(`trade_${userId}`);

            if (!trade) {
                return interaction.reply({
                    content: '❌ Nenhuma troca ativa.',
                    ephemeral: true
                });
            }

            const isOwner = trade.owner === userId;
            const isTarget = trade.target === userId;

            if (!isOwner && !isTarget) {
                return interaction.reply({
                    content: '❌ Você não participa dessa troca.',
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

            // reset confirmação ao alterar troca
            trade.confirmed.owner = false;
            trade.confirmed.target = false;

            if (isOwner) {
                trade.ownerCards.push(cardId);
            } else {
                trade.targetCards.push(cardId);
            }

            await db.set(`trade_${trade.owner}`, trade);
            await db.set(`trade_${trade.target}`, trade);

            return interaction.reply({
                content: `✅ Carta adicionada à troca.`,
                ephemeral: true
            });
        }

        // ✅ ACEITAR
        if (sub === 'aceitar') {

            const trade = await db.get(`trade_${userId}`);

            if (!trade) {
                return interaction.reply({
                    content: '❌ Nenhuma troca ativa.',
                    ephemeral: true
                });
            }

            if (trade.owner === userId) trade.confirmed.owner = true;
            if (trade.target === userId) trade.confirmed.target = true;

            await db.set(`trade_${trade.owner}`, trade);
            await db.set(`trade_${trade.target}`, trade);

            // só executa se ambos confirmaram
            if (!trade.confirmed.owner || !trade.confirmed.target) {
                return interaction.reply({
                    content: '⏳ Aguardando o outro jogador confirmar.',
                    ephemeral: true
                });
            }

            let invOwner = await db.get(`inventory_${trade.owner}`) || {};
            let invTarget = await db.get(`inventory_${trade.target}`) || {};

            // OWNER → TARGET
            for (const cardId of trade.ownerCards) {
                if (!invOwner[cardId]) continue;

                invOwner[cardId]--;
                if (invOwner[cardId] <= 0) delete invOwner[cardId];

                invTarget[cardId] = (invTarget[cardId] || 0) + 1;
            }

            // TARGET → OWNER
            for (const cardId of trade.targetCards) {
                if (!invTarget[cardId]) continue;

                invTarget[cardId]--;
                if (invTarget[cardId] <= 0) delete invTarget[cardId];

                invOwner[cardId] = (invOwner[cardId] || 0) + 1;
            }

            await db.set(`inventory_${trade.owner}`, invOwner);
            await db.set(`inventory_${trade.target}`, invTarget);

            await db.delete(`trade_${trade.owner}`);
            await db.delete(`trade_${trade.target}`);

            return interaction.reply({
                content: '🔁 Troca concluída com sucesso!'
            });
        }

        // ❌ RECUSAR
        if (sub === 'recusar') {

            const trade = await db.get(`trade_${userId}`);

            if (!trade) {
                return interaction.reply({
                    content: '❌ Nenhuma troca ativa.',
                    ephemeral: true
                });
            }

            await db.delete(`trade_${trade.owner}`);
            await db.delete(`trade_${trade.target}`);

            return interaction.reply({
                content: '❌ Troca cancelada.'
            });
        }
    }
};