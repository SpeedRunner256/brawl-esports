import { readFile, writeFile } from "fs/promises";

import { type Map } from "../moduleTypes";
export class MapInfo {
    private currentMapObject: Map | undefined;
    private isMap: boolean;
    constructor(data: Map | undefined) {
        this.currentMapObject = data;
        if (!this.currentMapObject) {
            this.isMap = true;
        } else {
            this.isMap = false;
        }
    }
    static async setMap(name: string): Promise<MapInfo> {
        const a = await readFile("db/map.json", "utf8");
        const b = JSON.parse(a);
        for (const i of Object.keys(b)) {
            if (name.toLowerCase() == i) {
                return new MapInfo(b[i]);
            }
        }
        const data = await fetch("https://api.brawlify.com/v1/maps")
            .then((response) => response.json())
            .then((data) => {
                for (const map of data.list) {
                    if (map.name.toLowerCase() === name.toLowerCase()) {
                        const { id, name, link, imageUrl, gameMode } = map;
                        const a: Map | undefined = {
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
                        };
                        return a;
                    }
                }
            })
            .catch(() => {
                return undefined;
            });
        MapInfo.writeData("db/map.json", data);
        return new MapInfo(data);
    }
    private static async writeData(file: string, data: Map | undefined) {
        if (!data) {
            return;
        }
        const a = await readFile(file, "utf8");
        const b = JSON.parse(a);
        b[data.name.toLowerCase()] = data;
        await writeFile(file, JSON.stringify(b, null, "  "));
    }
    get exist() {
        return this.isMap;
    }
    get ID() {
        if (!this.currentMapObject) {
            throw new Error("Cant find object");
        }
        return this.currentMapObject.id;
    }
    get color() {
        if (!this.currentMapObject) {
            throw new Error("Cant find object");
        }
        return Number(
            "0x" + this.currentMapObject.gamemode.color.split("#")[1]
        );
    }
    get name() {
        if (!this.currentMapObject) {
            throw new Error("Cant find object");
        }
        return this.currentMapObject.name;
    }
    get link() {
        if (!this.currentMapObject) {
            throw new Error("Cant find object");
        }
        return this.currentMapObject.link;
    }
    get imageUrl() {
        if (!this.currentMapObject) {
            throw new Error("Cant find object");
        }
        return this.currentMapObject.imageUrl;
    }
    get gameMode() {
        if (!this.currentMapObject) {
            throw new Error("Cant find object");
        }
        return this.currentMapObject.gamemode;
    }
}
