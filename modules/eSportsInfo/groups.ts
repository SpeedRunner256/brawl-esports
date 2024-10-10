import type { Groups } from "../moduleTypes";

export class GroupsInfo {
    private currentObject: Groups[];
    constructor(data: Groups[]) {
        this.currentObject = data;
    }
    static async setGroups(query: string) {
        const headers = {
            Authorization: `Apikey ${process.env.LIQUID_TOKEN}`,
        };
        const params = new URLSearchParams({
            wiki: "brawlstars",
            conditions: `[[pagename::${query}]]`,
        }).toString();
        const data = (await fetch(
            `https://api.liquipedia.net/api/v3/standingsentry?${[params]}`,
            { headers },
        )
            .then((response) => response.json())
            .then((data) => {
                data = data["result"];
                const answer: Groups[] = [];
                for (const group of data) {
                    const {
                        pagename,
                        standingsindex,
                        opponentname,
                        placement,
                        scoreboard,
                    } = group;
                    answer.push({
                        pagename,
                        standingsindex,
                        opponentname,
                        placement,
                        scoreboard,
                    });
                }
                return answer;
            })) as Groups[];
        return new GroupsInfo(data);
    }
    get groupEntry() {
        return this.currentObject;
    }
}
