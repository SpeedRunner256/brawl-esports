//Get data using the /match endpoint of the v3 wiki.
const headers = { Authorization: `Apikey ${process.env.LIQUID_TOKEN}` };
import { readFile, writeFile } from "fs/promises";
import {
    type Match,
    type Match2Games,
    type Match2Opponents,
    type Match2Players,
} from "../moduleTypes";
export class MatchInfo {
    private currentObject: Match[];
    constructor(data: Match[]) {
        this.currentObject = data;
    }
    static async setMatch(query: string) {
        const fetchedData = await readFile("db/match.json", "utf-8");
        const json = JSON.parse(fetchedData);
        for (const i of Object.keys(json)) {
            if (i == query.toLowerCase()) {
                return new MatchInfo(json[i]);
            }
        }
        const param = new URLSearchParams({
            wiki: "brawlstars",
            conditions: `[[pagename::${query}]]`,
        });
        const data: Match[] = await fetch(
            `https://api.liquipedia.net/api/v3/match?${param.toString()}`,
            { headers: headers }
        )
            .then((response) => response.json())
            .then((data) => {
                const answer: Match[] = [];

                for (const result of data.result) {
                    const {
                        pagename,
                        objectname,
                        winner,
                        stream,
                        tickername,
                        icondarkurl,
                        liquipediatiertype,
                    } = result;
                    const match2opponents: Match2Opponents[] = [];
                    for (const opp of result.match2opponents) {
                        const { id, name, score, placement } = opp;
                        const match2players: Match2Players[] = [];
                        for (const player of opp.match2players) {
                            const { id, displayname, country } = player;
                            match2players.push({ id, displayname, country });
                        }
                        match2opponents.push({
                            id,
                            name,
                            score,
                            placement,
                            match2players,
                        });
                    }
                    const match2games: Match2Games[] = [];
                    for (const match of result.match2games) {
                        const {
                            map,
                            scores,
                            participants,
                            winner,
                            date,
                            extradata,
                        } = match;
                        match2games.push({
                            map,
                            scores,
                            winner,
                            participants,
                            date,
                            extradata,
                        });
                    }
                    answer.push({
                        pagename,
                        objectname,
                        winner,
                        stream,
                        tickername,
                        icondarkurl,
                        tiertype: liquipediatiertype,
                        match2opponents,
                        match2games,
                    });
                }
                return answer;
            });
        await MatchInfo.writeData("db/match.json", data);
        return new MatchInfo(data);
    }
    get matches() {
        return this.currentObject;
    }
    static async writeData(file: string, data: Match[] | void) {
        if (!data) {
            return;
        }
        const a = await readFile(file, "utf8");
        const b = JSON.parse(a);
        b[data[0].pagename.toLowerCase()] = data;
        await writeFile(file, JSON.stringify(b, null, "  "));
    }
}
