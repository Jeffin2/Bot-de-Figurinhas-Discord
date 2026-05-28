const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../database/database");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("temporada")
        .setDescription("Mostra a temporada atual do álbum"),

    async execute(interaction) {

        // 📖 dados salvos
        const season =
            await db.get("current_season") || "Álbum da copa 2026";

        const albumType =
            await db.get("album_type") || "Padrão";

        const embed =
            new EmbedBuilder()

                .setTitle("📚 Temporada Atual")

                .setColor(0x3498db)

                .setDescription(

                    `🎴 **Temporada:** ${season}\n` +
                    `📦 **Tipo de Álbum:** ${albumType}`
                )

                .setFooter({
                    text: "FiguVerse"
                });

        return interaction.reply({
            embeds: [embed]
        });
    }
};