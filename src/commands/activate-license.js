const {
    SlashCommandBuilder
} = require("discord.js");

const Database = require("better-sqlite3");
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

        try {

            const dbPath = path.join(
                __dirname,
                "..",
                "LicensingSystem",
                "database",
                "licenses.db"
            );

            const db = new Database(dbPath);

            const licenca = db
                .prepare(
                    "SELECT * FROM licenses WHERE license_key = ?"
                )
                .get(chave);

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

            db.prepare(`
                UPDATE licenses
                SET guild_id = ?,
                    activated_at = ?
                WHERE license_key = ?
            `).run(
                interaction.guild.id,
                agora,
                chave
            );

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

            db.close();

            await interaction.reply({
                content:
                    "✅ Licença ativada com sucesso!",
                ephemeral: true
            });

        } catch (erro) {

            console.error(erro);

            return interaction.reply({
                content: "❌ Erro ao ativar licença.",
                ephemeral: true
            });
        }
    }
};