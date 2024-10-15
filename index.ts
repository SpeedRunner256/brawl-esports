import * as fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "jsr:@std/dotenv/load";
import {
    ActivityType,
    Client,
    Collection,
    Events,
    GatewayIntentBits,
} from "discord.js";
import type { Interaction } from "discord.js";
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
// Setting status - maybe add in changing statuses over the years
client.on("ready", () => {
    client.user?.setStatus("dnd");
    client.user?.setPresence({
        activities: [
            {
                name: "kacky with the boys",
                type: ActivityType.Playing,
            },
        ],
        status: "dnd",
    });
    console.log("Bot has started as " + client.user?.username);
});

// Getting all commands from ./commands

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

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(
            `No command matching ${interaction.commandName} was found.`,
        );
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content:
                    "This set of parameters resulted in an error. If it shouldn't, please contact modmail.",
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: `This set of parameters resulted in an error. If it shouldn't, please contact modmail.`,
                ephemeral: true,
            });
        }
    }
});
client.login(process.env.DISCORD_TOKEN);
