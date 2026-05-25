require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

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

// 🔥 BOT ONLINE EVENT (ESSENCIAL)
client.once('ready', () => {
    console.log(`🤖 Bot online como ${client.user.tag}`);
});

// 🎯 INTERAÇÕES (SLASH COMMANDS)
client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

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
});

// 🔑 LOGIN
client.login(process.env.TOKEN);