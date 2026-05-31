const express = require('express');
const app = express();
const nodemailer = require("nodemailer");

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const {
    Client,
    Collection,
    GatewayIntentBits
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// ==========================
// CARREGAR COMANDOS
// ==========================

const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath, { recursive: true });

console.log("🔄 Carregando comandos...");

for (const file of commandFiles) {

    if (!file.endsWith('.js')) continue;

    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (!command.data || !command.data.name) {
        console.log(`⚠️ Comando inválido: ${file}`);
        continue;
    }

    client.commands.set(command.data.name, command);
    console.log(`✅ Carregado: ${command.data.name}`);
}

// ==========================
// BOT ONLINE (ÚNICO READY)
// ==========================

client.once("clientReady", () => {

    console.log(`🤖 Bot online como ${client.user.tag}`);

    const serversPath = path.join(
        __dirname,
        "src",
        "LicensingSystem",
        "servers.json"
    );

    let servidoresExistentes = [];

    if (fs.existsSync(serversPath)) {

        try {

            servidoresExistentes = JSON.parse(
                fs.readFileSync(serversPath, "utf8")
            );

        } catch (erro) {

            console.error(
                "❌ Erro ao ler servers.json:",
                erro
            );
        }
    }

    const servidores = client.guilds.cache.map(guild => {

        const existente = servidoresExistentes.find(
            s => s.id === guild.id
        );

        return {
            id: guild.id,
            nome: guild.name,
            membros: guild.memberCount,

            license_status:
                existente?.license_status || "none"
        };
    });

    fs.writeFileSync(
        serversPath,
        JSON.stringify(servidores, null, 2)
    );

    console.log("📁 servers.json atualizado");
});

// ==========================
// INTERAÇÕES
// ==========================

client.on('interactionCreate', async interaction => {

    // ==========================
    // COMANDOS NORMAIS
    // ==========================
    if (interaction.isChatInputCommand()) {

        const FREE_COMMANDS = [
            "help",
            "request-license",
            "activate-license"
        ];

        // ==========================
        // VERIFICAÇÃO DE LICENÇA
        // ==========================

        if (!FREE_COMMANDS.includes(interaction.commandName)) {

            try {

                const serversPath = path.join(
                    __dirname,
                    "src",
                    "LicensingSystem",
                    "servers.json"
                );

                const servidores = JSON.parse(
                    fs.readFileSync(serversPath, "utf8")
                );

                const servidor = servidores.find(
                    s => s.id === interaction.guild.id
                );

                if (
                    !servidor ||
                    servidor.license_status !== "active"
                ) {

                    return interaction.reply({
                        content:
                            "❌ Este servidor não possui uma licença ativa.\n\n" +
                            "Use `/request-license` para solicitar uma licença.\n" +
                            "Use `/activate-license` para ativar uma licença já adquirida.",
                        ephemeral: true
                    });
                }

            } catch (erro) {

                console.error("Erro ao verificar licença:", erro);

                return interaction.reply({
                    content: "❌ Erro ao verificar a licença do servidor.",
                    ephemeral: true
                });
            }
        }

        const command = client.commands.get(
            interaction.commandName
        );

        if (!command) return;

        try {

            await command.execute(interaction);

        } catch (err) {

            console.error(err);

            if (
                interaction.replied ||
                interaction.deferred
            ) return;

            await interaction.reply({
                content: "❌ Erro ao executar comando.",
                ephemeral: true
            });
        }
    }
    console.log("==========");
    console.log("Comando:", interaction.commandName);
    console.log("Servidor:", interaction.guild.id);

    // ==========================
    // FORM (MODAL) - REQUEST LICENSE
    // ==========================
    if (interaction.isModalSubmit()) {

        if (interaction.customId === "license_request_form") {

            const email = interaction.fields.getTextInputValue("email");
            const username = interaction.fields.getTextInputValue("username");
            const serverName = interaction.fields.getTextInputValue("server_name");

            console.log("📩 Nova solicitação de licença:");
            console.log("Email:", email);
            console.log("Username:", username);
            console.log("Servidor:", interaction.guild.name);

            try {

                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASS
                    }
                });

                await transporter.sendMail({
                    from: process.env.EMAIL,
                    to: process.env.EMAIL,
                    subject: "Nova solicitação de licença",
                    text:
                        `Email: ${email}
Username: ${username}
Servidor: ${interaction.guild.name}
ID do servidor: ${interaction.guild.id}`
                });

                console.log("📧 E-mail enviado com sucesso!");

            } catch (erro) {

                console.error("❌ Erro ao enviar e-mail:");
                console.error(erro);
            }

            await interaction.reply({
                content: "📩 Sua solicitação foi enviada com sucesso!",
                ephemeral: true
            });
        }
    }
});

// ==========================
// WEB SERVER
// ==========================

app.get('/', (req, res) => {
    res.send('FiguVerse online!');
});

app.listen(3000, () => {
    console.log('🌐 Servidor web iniciado');
});

// ==========================
// LOGIN BOT
// ==========================

client.login(process.env.TOKEN);

// ==========================
// ANTI-CRASH
// ==========================

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);