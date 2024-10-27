import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;
// fucking typescript-eslint
if (!token || !clientId || !guildId) {
    throw new Error("Can't find necessary files in .env... Mind a recheck?");
}
console.log(
    `- clientId -> ${clientId}\n- guildId -> ${guildId}\n- token -> ${token}`,
);

const commands = [];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file: string) => file.endsWith(".ts"));
    for (const file of commandFiles) {
        const filePath = "file://" + path.join(commandsPath, file);
        const command = await import(filePath);
        if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`,
        );
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands,
        });
        console.log("Done.");
    } catch (error) {
        console.log(error);
    }
})();
