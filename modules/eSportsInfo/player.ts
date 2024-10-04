import { readFile, writeFile } from "fs/promises";
import { findPageName } from "./findPage";
import {type Player } from "../moduleTypes"
export class PlayerInfo {
    private currentObject: Player;

    constructor(player: Player) {
        this.currentObject = player;
    }

    static async setPlayer(query: string): Promise<PlayerInfo | undefined> {
        const name = await findPageName(query);
        const data = await readFile("db/player.json", "utf8");
        const parsedData = JSON.parse(data);
        for (const i of Object.keys(parsedData)) {
            if (i == name.toLowerCase()) {
                return new PlayerInfo(parsedData[i]);
            }
        }
        const headers = { Authorization: `Apikey ${process.env.LIQUID_TOKEN}` };
        const fetchedData = await fetch(
            `https://api.liquipedia.net/api/v3/player?wiki=brawlstars&conditions=%5B%5Bpagename%3A%3A${name}%5D%5D`,
            { headers }
        )
            .then((response) => response.json())
            .then((data) => {
                const {
                    pagename,
                    id,
                    nationality,
                    region,
                    teampagename,
                    links,
                    status,
                    earnings,
                } = data.result[0];
                const answer: Player = {
                    pagename,
                    id,
                    nationality,
                    region,
                    teampagename,
                    links,
                    status,
                    earnings,
                };
                return answer;
            })
        PlayerInfo.writeData("db/player.json", fetchedData);
        return new PlayerInfo(fetchedData);
    }
    static async writeData(file: string, data: Player | void) {
        if (!data) {
            return;
        }
        const a = await readFile(file, "utf8");
        const b = JSON.parse(a);
        b[data.id.toLowerCase()] = data;
        await writeFile(file, JSON.stringify(b, null, "  "));
    }
    get object() {
        if (!this.currentObject) {
            throw new Error("Can't find player.");
        }
        return this.currentObject;
    }
    get pagename() {
        if (!this.currentObject) {
            throw new Error("Can't find player.");
        }
        return this.currentObject.pagename;
    }
    get id() {
        if (!this.currentObject) {
            throw new Error("Can't find player.");
        }
        return this.currentObject.id;
    }
    get nationality() {
        if (!this.currentObject) {
            throw new Error("Can't find player.");
        }
        return this.currentObject.nationality;
    }
    get region() {
        if (!this.currentObject) {
            throw new Error("Can't find player.");
        }
        return this.currentObject.region;
    }
    get teampagename() {
        if (!this.currentObject) {
            throw new Error("Can't find player.");
        }
        return this.currentObject.teampagename;
    }
    get links(): object {
        if (!this.currentObject) {
            return {};
        }
        return this.currentObject.links;
    }
    get status() {
        if (!this.currentObject) {
            throw new Error("Can't find player.");
        }
        return this.currentObject.status;
    }
    get earnings() {
        if (!this.currentObject) {
            throw new Error("Can't find player.");
        }
        return this.currentObject.earnings;
    }
}
