const express = require('express');
const app = express();

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

client.once("ready", () => {

    console.log(`🤖 Bot online como ${client.user.tag}`);

    const servidores = client.guilds.cache.map(guild => ({

        id: guild.id,
        nome: guild.name,
        membros: guild.memberCount,

        license_status: "none"
    }));

    fs.writeFileSync(
        path.join(__dirname, "src", "LicensingSystem", "servers.json"),
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

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);

            if (interaction.replied || interaction.deferred) return;

            await interaction.reply({
                content: "❌ Erro ao executar comando.",
                ephemeral: true
            });
        }
    }

    // ==========================
    // FORM (MODAL) - REQUEST LICENSE
    // ==========================
    if (interaction.isModalSubmit()) {

        if (interaction.customId === "license_request_form") {

            const email = interaction.fields.getTextInputValue("email");
            const username = interaction.fields.getTextInputValue("username");

            console.log("📩 Nova solicitação de licença:");
            console.log("Email:", email);
            console.log("Username:", username);
            console.log("Servidor:", interaction.guild.name);

            // aqui depois você pode:
            // - enviar email pra você
            // - salvar no banco
            // - gerar fila de aprovação

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