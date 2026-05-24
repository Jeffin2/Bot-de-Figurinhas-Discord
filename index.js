require('dotenv').config();

const fs = require('fs');

const {
    Client,
    GatewayIntentBits,
    Collection
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.commands = new Collection();

const commandFolders = fs.readdirSync('./src/commands');

for (const folder of commandFolders) {

    const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {

        const command = require(`./src/commands/${folder}/${file}`);

        client.commands.set(command.data.name, command);

        console.log(`✅ Comando carregado: ${command.data.name}`);
    }
}

client.once('ready', () => {

    console.log(`🚀 ${client.user.tag} está online!`);
});

client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {

        await command.execute(interaction);

    } catch (error) {

        console.error(error);

        if (interaction.replied || interaction.deferred) {

            await interaction.followUp({
                content: '❌ Erro ao executar comando.',
                ephemeral: true
            });

        } else {

            await interaction.reply({
                content: '❌ Erro ao executar comando.',
                ephemeral: true
            });
        }
    }
});

client.login(process.env.TOKEN);