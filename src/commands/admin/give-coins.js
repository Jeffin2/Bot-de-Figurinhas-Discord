const db = require('../../database/database');

module.exports = {
    name: 'give-coins',
    description: 'Dar coins para um usuário',

    async execute(interaction) {

        const user = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('quantidade');

        if (!user) {
            return interaction.reply({
                content: '❌ Usuário inválido.',
                ephemeral: true
            });
        }

        if (!amount || amount <= 0) {
            return interaction.reply({
                content: '❌ Quantidade inválida.',
                ephemeral: true
            });
        }

        await db.add(`coins_${user.id}`, amount);

        return interaction.reply(
            `✅ ${amount} coins adicionadas para **${user.username}**`
        );
    }
};