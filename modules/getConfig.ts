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
}
