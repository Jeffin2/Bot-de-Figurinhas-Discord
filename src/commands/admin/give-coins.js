const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const db = require('../../database/database');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('give-coins')
        .setDescription('Dar coins para um usuário')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('quantidade')
                .setDescription('Quantidade')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        const user =
            interaction.options.getUser('usuario');

        const amount =
            interaction.options.getInteger('quantidade');

        await db.add(`coins_${user.id}`, amount);

        interaction.reply(
            `✅ ${amount} coins adicionadas para ${user.username}`
        );
    }
};