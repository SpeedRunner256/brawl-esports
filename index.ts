import * as fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "jsr:@std/dotenv/load";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import type { Interaction } from "discord.js";
import process from "node:process";
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessagePolls],
});
interface Command {
    data: string;
    execute: (interaction: Interaction) => Promise<void>;
}
declare module "discord.js" {
    export interface Client {
        commands: Collection<string, Command>;
    }
}
// Commands
client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".ts"));
    for (const file of commandFiles) {
        const filePath = "file://" + path.join(commandsPath, file);
        const command = await import(filePath);
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            continue;
        }
    }
}
// Events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".ts"));

for (const file of eventFiles) {
    const filePath = "file://" + path.join(eventsPath, file);
    const event = await import(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
client.login(process.env.DISCORD_TOKEN);
