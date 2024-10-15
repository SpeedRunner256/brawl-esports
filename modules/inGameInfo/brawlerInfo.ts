import { readFile, writeFile } from "node:fs/promises";
import { type Brawler } from "../moduleTypes.ts";
export class BrawlerInfo {
    private isBrawler: boolean;
    currentBrawlerObject: Brawler | undefined;
    constructor(data: Brawler | undefined) {
        this.currentBrawlerObject = data;
        if (!this.currentBrawlerObject) {
            this.isBrawler = false;
        } else {
            this.isBrawler = true;
        }
    }
    static async setBrawler(name: string): Promise<BrawlerInfo> {
        const brawlers = JSON.parse(await readFile("db/brawler.json", "utf8"));
        for (const i of Object.keys(brawlers)) {
            if (i == name.toLowerCase()) {
                return new BrawlerInfo(brawlers[i]);
            }
        }
        const data = await fetch("https://api.brawlify.com/v1/brawlers")
            .then((response) => response.json())
            .then((data) => {
                for (const brawler of data.list) {
                    if (name.toLowerCase() == brawler.name.toLowerCase()) {
                        const info: Brawler | undefined = {
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
                        };
                        return info;
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                return undefined;
            });
        BrawlerInfo.writeData("db/brawler.json", data);
        return new BrawlerInfo(data);
    }
    get exist() {
        return this.isBrawler;
    }
    get name(): string {
        if (!this.currentBrawlerObject) {
            throw new Error("Can't find brawler.");
        }
        return this.currentBrawlerObject.name;
    }
    get description() {
        if (!this.currentBrawlerObject) {
            throw new Error("Can't find brawler.");
        }
        return this.currentBrawlerObject.description;
    }
    get ID() {
        if (!this.currentBrawlerObject) {
            throw new Error("Can't find brawler.");
        }
        return this.currentBrawlerObject.id;
    }
    get link() {
        if (!this.currentBrawlerObject) {
            throw new Error("Can't find brawler.");
        }
        return this.currentBrawlerObject.link;
    }
    get image() {
        if (!this.currentBrawlerObject) {
            throw new Error("Can't find brawler.");
        }
        return this.currentBrawlerObject.imageUrl;
    }
    get class() {
        if (!this.currentBrawlerObject) {
            throw new Error("Can't find brawler.");
        }
        return this.currentBrawlerObject.class;
    }
    get rarityName() {
        if (!this.currentBrawlerObject) {
            throw new Error("Can't find brawler.");
        }
        return this.currentBrawlerObject.rarity.name;
    }
    get rarityColor() {
        if (!this.currentBrawlerObject) {
            throw new Error("Can't find brawler.");
        }
        return Number(
            "0x" + this.currentBrawlerObject.rarity.color.split("#")[1],
        );
    }
    get starPower1() {
        if (!this.currentBrawlerObject) {
            throw new Error("Can't find brawler.");
        }
        return this.currentBrawlerObject.starPowers[0];
    }
    get starPower2() {
        if (!this.currentBrawlerObject) {
            throw new Error("Can't find brawler.");
        }
        return this.currentBrawlerObject.starPowers[1];
    }
    get gadget1() {
        if (!this.currentBrawlerObject) {
            throw new Error("Can't find brawler.");
        }
        return this.currentBrawlerObject.gadgets[0];
    }
    get gadget2() {
        if (!this.currentBrawlerObject) {
            throw new Error("Can't find brawler.");
        }
        return this.currentBrawlerObject.gadgets[1];
    }
    private static async writeData(file: string, data: Brawler | undefined) {
        if (!data) {
            return;
        }
        const a = await readFile(file, "utf8");
        const b = JSON.parse(a);
        b[data.name.toLowerCase()] = data;
        await writeFile(file, JSON.stringify(b, null, "  "));
    }
}
