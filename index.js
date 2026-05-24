const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.commands = new Collection();

console.log("🔄 Carregando comandos...");

// 📁 Carrega comandos automaticamente
const commandsPath = path.join(__dirname, "src/commands");

const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {

    const folderPath = path.join(commandsPath, folder);

    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {

        const filePath = path.join(folderPath, file);

        const command = require(filePath);

        if (!command.name || !command.execute) {
            console.log(`⚠️ Comando inválido: ${file}`);
            continue;
        }

        client.commands.set(command.name, command);
        console.log(`✅ Comando carregado: ${command.name}`);
    }
}

// 🎯 Quando bot inicia
client.once("ready", () => {
    console.log(`🤖 Bot online como ${client.user.tag}`);
});

// ⚡ Interactions (SLASH COMMANDS SIMPLES)
client.on("interactionCreate", async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        return interaction.reply({
            content: "❌ Comando não encontrado.",
            ephemeral: true
        });
    }

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error("❌ Erro no comando:", err);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "❌ Erro ao executar comando.",
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: "❌ Erro ao executar comando.",
                ephemeral: true
            });
        }
    }
});

client.login(process.env.TOKEN);