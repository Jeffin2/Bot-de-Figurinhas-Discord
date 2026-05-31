const {
    SlashCommandBuilder
} = require("discord.js");

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("activate-license")
        .setDescription("Ativar uma licença")
        .addStringOption(option =>
            option
                .setName("chave")
                .setDescription("Chave da licença")
                .setRequired(true)
        ),

    async execute(interaction) {

        const chave = interaction.options.getString("chave");

        const dbPath = path.join(
            __dirname,
            "..",
            "LicensingSystem",
            "database",
            "licenses.db"
        );

        const db = new sqlite3.Database(dbPath);

        db.get(
            "SELECT * FROM licenses WHERE license_key = ?",
            [chave],
            async (err, licenca) => {

                if (err) {

                    console.error(err);

                    return interaction.reply({
                        content: "❌ Erro ao consultar licença.",
                        ephemeral: true
                    });
                }

                if (!licenca) {

                    return interaction.reply({
                        content: "❌ Licença não encontrada.",
                        ephemeral: true
                    });
                }

                if (licenca.active === 0) {

                    return interaction.reply({
                        content: "❌ Esta licença foi revogada.",
                        ephemeral: true
                    });
                }

                if (licenca.guild_id) {

                    return interaction.reply({
                        content:
                            "❌ Esta licença já está vinculada a outro servidor.",
                        ephemeral: true
                    });
                }

                const agora = new Date().toISOString();

                db.run(
                    `
                    UPDATE licenses
                    SET guild_id = ?,
                        activated_at = ?
                    WHERE license_key = ?
                    `,
                    [
                        interaction.guild.id,
                        agora,
                        chave
                    ],
                    async (erroUpdate) => {

                        if (erroUpdate) {

                            console.error(erroUpdate);

                            return interaction.reply({
                                content: "❌ Erro ao ativar licença.",
                                ephemeral: true
                            });
                        }

                        try {

                            const serversPath = path.join(
                                __dirname,
                                "..",
                                "LicensingSystem",
                                "servers.json"
                            );

                            const servidores = JSON.parse(
                                fs.readFileSync(
                                    serversPath,
                                    "utf8"
                                )
                            );

                            const servidor = servidores.find(
                                s => s.id === interaction.guild.id
                            );

                            if (servidor) {

                                servidor.license_status = "active";

                                fs.writeFileSync(
                                    serversPath,
                                    JSON.stringify(
                                        servidores,
                                        null,
                                        2
                                    )
                                );
                            }

                        } catch (erro) {

                            console.error(
                                "Erro ao atualizar servers.json:",
                                erro
                            );
                        }

                        await interaction.reply({
                            content:
                                "✅ Licença ativada com sucesso!",
                            ephemeral: true
                        });
                    }
                );
            }
        );
    }
};