import { findPageName } from "./findPage.ts";
import { type Player } from "../moduleTypes.ts";
import { DatabasePlayer } from "../../database/DatabasePlayer.ts";
import "jsr:@std/dotenv/load";

export class PlayerInfo {
    private currentObject: Player;

    constructor(player: Player) {
        this.currentObject = player;
    }

    static async setPlayer(query: string): Promise<PlayerInfo | undefined> {
        const name = await findPageName(query);
        const db = new DatabasePlayer();
        const players = await db.getPlayer(null, null, name);
        if (players.length != 0) {
            return new PlayerInfo(players[0]);
        }
        const headers = {
            Authorization: `Apikey ${process.env.LIQUID_TOKEN}`,
        };
        const player = await fetch(
            `https://api.liquipedia.net/api/v3/player?wiki=brawlstars&conditions=%5B%5Bpagename%3A%3A${name}%5D%5D`,
            { headers },
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
                    twitter: links.twitter,
                    status,
                    earnings,
                };
                return answer;
            });
        db.pushPlayer(player);
        return new PlayerInfo(player);
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
    get twitter(): string {
        if (!this.currentObject) {
            throw new Error("Cant find player.");
        }
        return this.currentObject.twitter;
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
