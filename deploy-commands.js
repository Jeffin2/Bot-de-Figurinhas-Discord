const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [];

// 📂 caminho base dos comandos
const commandsPath = path.join(__dirname, 'src', 'commands');

// 🔁 função recursiva para pegar arquivos
function getCommandFiles(dir) {
    let results = [];

    const files = fs.readdirSync(dir);

    for (const file of files) {

        const fullPath = path.join(dir, file);

        if (fs.lstatSync(fullPath).isDirectory()) {
            results = results.concat(getCommandFiles(fullPath));
        } else if (file.endsWith('.js')) {
            results.push(fullPath);
        }
    }

    return results;
}

const commandFiles = getCommandFiles(commandsPath);

// 📦 carregar comandos
for (const file of commandFiles) {

    try {
        const command = require(file);

        if (!command || !command.data || !command.data.name) {
            console.log(`❌ Ignorado (sem data.name): ${path.basename(file)}`);
            continue;
        }

        commands.push(command.data.toJSON());
        console.log(`✅ Carregado: ${command.data.name}`);

    } catch (err) {
        console.log(`❌ Erro ao carregar ${path.basename(file)}:`, err.message);
    }
}

// 🚀 REST
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {

        console.log('🔄 Registrando comandos globais...');

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(`✅ ${data.length} comandos registrados com sucesso!`);

    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
})();