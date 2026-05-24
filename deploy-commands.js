const fs = require("fs");
const path = require("path");

const commands = [];

const foldersPath = path.join(__dirname, "src/commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {

    const commandsPath = path.join(foldersPath, folder);

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {

        const filePath = path.join(commandsPath, file);

        const command = require(filePath);

        // 🔥 VALIDAÇÃO FORTE (isso resolve seu erro)
        if (!command.name || typeof command.name !== "string") {
            console.log(`❌ Ignorado (sem name): ${file}`);
            continue;
        }

        if (!command.description) {
            command.description = "Sem descrição";
        }

        commands.push({
            name: command.name,
            description: command.description
        });
    }
}

console.log("🔄 Registrando comandos globais...");
console.log(commands);

// aqui continua seu REST request normalmente