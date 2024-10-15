import "jsr:@std/dotenv/load";
import { DatabaseMatch } from "../../database/DatabaseMatch.ts";
import {
    type Match,
    type Match2Games,
    type Match2Opponents,
    type Match2Players,
} from "../moduleTypes.ts";
export class MatchInfo {
    private currentObject: Match[];
    constructor(data: Match[]) {
        this.currentObject = data;
    }
    static async setMatch(query: string) {
        const db = new DatabaseMatch();
        const matches = await db.getMatch(query);
        // if all not finished, fetch data again.
        if (matches.length != 0) {
            let allFin = true;
            for (const match of matches) {
                if (!match.finished) {
                    allFin = false;
                }
            }
            if (allFin) {
                return new MatchInfo(matches);
            }
        }
        const headers = { Authorization: `Apikey ${process.env.LIQUID_TOKEN}` };
        const param = new URLSearchParams({
            wiki: "brawlstars",
            conditions: `[[pagename::${query}]]`,
        });
        const data: Match[] = await fetch(
            `https://api.liquipedia.net/api/v3/match?${param.toString()}`,
            { headers: headers },
        )
            .then((response) => response.json())
            .then((data) => {
                const answer: Match[] = [];

                for (const result of data.result) {
                    const {
                        pagename,
                        objectname,
                        winner,
                        finished,
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
                            resulttype,
                        } = match;
                        match2games.push({
                            map,
                            scores,
                            winner,
                            participants,
                            date,
                            extradata,
                            resulttype,
                        });
                    }
                    answer.push({
                        pagename,
                        objectname,
                        winner,
                        stream,
                        tickername,
                        icondarkurl,
                        finished,
                        tiertype: liquipediatiertype,
                        match2opponents,
                        match2games,
                    });
                }
                return answer;
            });
        db.pushMatch(data);
        return new MatchInfo(data);
    }
    get matches() {
        return this.currentObject;
    }
}
