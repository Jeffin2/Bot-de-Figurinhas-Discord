const {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

if (!interaction.member.permissions.has("Administrator")) {
    return interaction.reply({
        content: "❌ Você não tem permissão para usar este comando.",
        ephemeral: true
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("request-license")
        .setDescription("Solicitar licença"),

    async execute(interaction) {

        const modal = new ModalBuilder()
            .setCustomId("license_request_form")
            .setTitle("Solicitação de Licença");

        const emailInput = new TextInputBuilder()
            .setCustomId("email")
            .setLabel("Seu Email")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const usernameInput = new TextInputBuilder()
            .setCustomId("username")
            .setLabel("Seu Username")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const serverNameInput = new TextInputBuilder()
            .setCustomId("server_name")
            .setLabel("Nome do Servidor")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row1 = new ActionRowBuilder().addComponents(emailInput);
        const row2 = new ActionRowBuilder().addComponents(usernameInput);
        const row3 = new ActionRowBuilder().addComponents(serverNameInput);

        modal.addComponents(row1, row2, row3);

        await interaction.showModal(modal);
    }
};