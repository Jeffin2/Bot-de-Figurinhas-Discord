const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require('../database/database');

module.exports = {

    data: new SlashCommandBuilder()
        .setName("atualizacoes")
        .setDescription("Veja as novidades e próximos álbuns"),

    async execute(interaction) {

        db.get(
            "SELECT * FROM atualizacoes ORDER BY id DESC LIMIT 1",
            [],
            (err, row) => {

                if (err) {

                    console.error(err);

                    return interaction.reply({
                        content: "❌ Erro ao buscar atualizações.",
                        ephemeral: true
                    });
                }

                if (!row) {

                    return interaction.reply({
                        content: "📭 Nenhuma atualização cadastrada.",
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor("#5865F2")
                    .setTitle("📢 Atualizações do FiguVerse")
                    .addFields(

                        {
                            name: "📅 Temporada Atual",
                            value: row.temporada || "Não definida",
                            inline: true
                        },

                        {
                            name: "🎴 Próximo Álbum",
                            value: row.album || "Não definido",
                            inline: true
                        },

                        {
                            name: "📝 Informações",
                            value: row.info || "Nenhuma informação."
                        }
                    )
                    .setFooter({
                        text: "FiguVerse • Sistema de Atualizações"
                    })
                    .setTimestamp();

                return interaction.reply({
                    embeds: [embed]
                });
            }
        );
    }
};