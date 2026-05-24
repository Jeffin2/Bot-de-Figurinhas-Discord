require('dotenv').config();

const fs = require('fs');

const {
    REST,
    Routes
} = require('discord.js');

const commands = [];

const commandFolders = fs.readdirSync('./src/commands');

for (const folder of commandFolders) {

    const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {

        const command = require(`./src/commands/${folder}/${file}`);

        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' })
    .setToken(process.env.TOKEN);

(async () => {

    try {

        console.log('🔄 Registrando comandos globais...');

        await rest.put(
            Routes.applicationCommands(
                process.env.CLIENT_ID
            ),
            { body: commands }
        );

        console.log('✅ Comandos globais registrados com sucesso!');

    } catch (error) {

        console.error(error);
    }
})();