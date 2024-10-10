import { readFile, writeFile } from "fs/promises";
import type { Player } from "../modules/moduleTypes";
export class DatabasePlayer {
    private filePath = "db/players.json";
    constructor(filePath?: string) {
        if (filePath) {
            this.filePath = filePath;
        }
    }
    /**
     *  Push a Player object into the database if not already present
     * @param playerObject - Player object to send
     * @returns void
     */
    async pushPlayer(playerObject: Player): Promise<void> {
        const data = JSON.parse(
            await readFile(this.filePath, "utf-8"),
        ) as Player[];
        let existsInDb = false;
        for (const player of data) {
            if (player.id === playerObject.id) {
                existsInDb = true;
                break;
            }
        }
        if (!existsInDb) {
            data.push(playerObject);
            writeFile(this.filePath, JSON.stringify(data, null, "    "));
        }
    }
    /**
     * Get Player[] from database given a few optional parameters - all case insensitive.
     * @param id - Id of the player
     * @param nationality - Nationality of the player
     * @param pagename - Name of page
     * @returns Promise<Player[]>
     */
    async getPlayer(
        Id: string | null = null,
        Nationality: string | null = null,
        Pagename: string | null = null,
    ): Promise<Player[]> {
        const playerArray: Player[] = [];
        const data = JSON.parse(
            await readFile(this.filePath, "utf-8"),
        ) as Player[];
        for (const player of data) {
            const { id, nationality, pagename } = player;
            if (Id && id == Id.toLowerCase()) {
                playerArray.push(player);
            }
            if (Nationality && Nationality == nationality.toLowerCase()) {
                playerArray.push(player);
            }
            if (Pagename && Pagename == pagename.toLowerCase()) {
                playerArray.push(player);
            }
        }
        return playerArray;
    }
}
