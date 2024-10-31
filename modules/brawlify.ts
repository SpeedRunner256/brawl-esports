import { BrawlerNotFoundError, GameModeNotFoundError, MapNotFoundError } from "./errors.ts";
import type { Brawler, GameMode, Map } from "./moduleTypes.ts";
/**
 * @description Brawlify API wrapper class for ```Brawler || Map || GameMode```. Handle your own ``undefined`` please.
 * @use Use this format ```const bl = await Brawlify.create("gamemode", "Heist");```
 */
export class Brawlify {
    result: Brawler | Map | GameMode | undefined;
    queryExists: boolean = false;

    private constructor(
        data: Brawler | Map | GameMode | undefined,
        queryExists: boolean = false
    ) {
        this.result = data;
        this.queryExists = queryExists;
    }
    /**
     * @description Get the query of choice with the type of choice
     * @param query - Needs an exact match but is set to be case insensitive
     * @param type - Type of the query, be it gamemode, map, or brawler.
     */
    static async get(type: "brawler" | "map" | "gamemode", query: string) {
        let result: Brawler | GameMode | Map | undefined;
        let queryExists: boolean;
        switch (type) {
            case "brawler":
                result = await Brawlify.brawler(query);
                break;
            case "map":
                result = await Brawlify.map(query);
                break;
            case "gamemode":
                result = await Brawlify.gameMode(query);
                break;
        }
        if (result === undefined) {
            queryExists = false;
        } else {
            queryExists = true;
        }
        return new Brawlify(result, queryExists);
    }

    private static async brawler(query: string): Promise<Brawler | undefined> {
        const brawler = await fetch("https://api.brawlify.com/v1/brawlers")
            .then((response) => response.json())
            .then((data) => {
                for (const brawler of data.list) {
                    if (query.toLowerCase() == brawler.name.toLowerCase()) {
                        return {
                            id: brawler.id,
                            name: brawler.name,
                            description: brawler.description,
                            link: brawler.link,
                            imageUrl: brawler.imageUrl,
                            class: brawler.class.name,
                            rarity: {
                                name: brawler.rarity.name,
                                color: brawler.rarity.color,
                            },
                            starPowers: [
                                {
                                    name: brawler.starPowers[0].name,
                                    description:
                                        brawler.starPowers[0].description,
                                },
                                {
                                    name: brawler.starPowers[1].name,
                                    description:
                                        brawler.starPowers[1].description,
                                },
                            ],
                            gadgets: [
                                {
                                    name: brawler.gadgets[0].name,
                                    description: brawler.gadgets[0].description,
                                },
                                {
                                    name: brawler.gadgets[1].name,
                                    description: brawler.gadgets[1].description,
                                },
                            ],
                        } as Brawler;
                    }
                }
                // Cannot come here if brawler is found
                throw new BrawlerNotFoundError(query);
            });
        return brawler;
    }

    private static async map(query: string): Promise<Map | undefined> {
        const map = await fetch("https://api.brawlify.com/v1/maps")
            .then((response) => response.json())
            .then((data) => {
                for (const map of data.list) {
                    if (query.toLowerCase() == map.name.toLowerCase()) {
                        const { id, name, link, imageUrl, gameMode } = map;
                        return {
                            id: id,
                            name: name,
                            link: link,
                            imageUrl: imageUrl,
                            gamemode: {
                                name: gameMode.name,
                                color: gameMode.color,
                                link: gameMode.link,
                                imageUrl: gameMode.imageUrl,
                            },
                        } as Map;
                    }
                }
                throw new MapNotFoundError(query);
            });
        return map;
    }

    private static async gameMode(
        query: string
    ): Promise<GameMode | undefined> {
        const gameMode = await fetch("https://api.brawlify.com/v1/gamemodes")
            .then((response) => response.json())
            .then((data) => {
                for (const mode of data.list) {
                    if (query.toLowerCase() == mode.name.toLowerCase()) {
                        const {
                            name,
                            title,
                            color,
                            description,
                            shortDescription,
                            link,
                            imageUrl,
                        } = mode;
                        return {
                            name,
                            title,
                            color,
                            description,
                            shortDescription,
                            link,
                            imageUrl,
                        } as GameMode;
                    }
                }
                throw new GameModeNotFoundError(query);
            });
        return gameMode;
    }
}
