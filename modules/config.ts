import type { ChatInputCommandInteraction, TextChannel } from "discord.js";
import { readFile } from "fs/promises";
export class Config {
    static async separator(guildID: string): Promise<string> {
        try {
            const configData = await readFile("./config.json", "utf-8");
            const config = JSON.parse(configData);

            if (!(guildID in config)) {
                throw new Error(`Guild ID ${guildID} not found in config`);
            }

            return config[guildID].separator;
        } catch (error) {
            throw new Error(`Error reading separator: ${error}`);
        }
    }
    static async balance(guildID: string | null): Promise<number> {
        try {
            if (!guildID) {
                throw new Error("Guild ID is null.");
            }
            const config = JSON.parse(await readFile("./config.json", "utf-8"));
            if (!(guildID in config)) {
                throw new Error("Guild not found in config.");
            }
            return config[guildID].startBal;
        } catch (err) {
            throw new Error(`Error: ${err}`);
        }
    }
    static async log(
        logMessage: string,
        logContent: string,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const data = JSON.parse(await readFile("config.json", "utf8"));
        const guildId = interaction.guildId;
        if (!guildId) {
            throw new Error("Not in a guild.");
        }
        const log = data[guildId].log.id;
        (interaction.client.channels.cache.get(log) as TextChannel).send(
            `${logMessage}\`\`\`json\n${logContent}\`\`\``
        );
    }
}
