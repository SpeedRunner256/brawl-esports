import type {
    Groups,
    Match,
    Match2Games,
    Match2Opponents,
    Match2Players,
    Player,
    SquadPlayer,
    Team,
} from "./moduleTypes.ts";
import process from "node:process";
import { DatabasePlayer } from "../database/DatabasePlayer.ts";
import { DatabaseTeam } from "../database/DatabaseTeam.ts";
import { DatabaseMatch } from "../database/DatabaseMatch.ts";

export class LiquidDB {
    result: Player | Team | Match[] | Groups[] | SquadPlayer[] | undefined;
    queryExists: boolean = false;

    private constructor(
        result: Player | Team | Match[] | Groups[] | SquadPlayer[] | undefined,
        queryExists: boolean
    ) {
        this.result = result;
        this.queryExists = queryExists;
    }
    /**
     * @description Get information from the LiquipediaDB API
     * @param query - Enter your query - this just has to be close enough, though exact matches are more than welcome.
     * @param type - Type of the result you intend to recieve.
     */
    static async get(
        type: "player" | "team" | "match" | "teammember" | "group",
        query: string
    ) {
        // Do DB later, first get this working nice.
        let result:
            | Player
            | Team
            | Match[]
            | Groups[]
            | SquadPlayer[]
            | undefined;
        let queryExists: boolean = false;
        switch (type) {
            case "player":
                result = await LiquidDB.player(query);
                break;
            case "team":
                result = await LiquidDB.team(query);
                break;
            case "teammember":
                result = await LiquidDB.teammember(query);
                break;
            case "match":
                result = await LiquidDB.match(query);
                break;
            case "group":
                result = await LiquidDB.group(query);
                break;
        }
        if (result) {
            queryExists = true;
        }
        return new LiquidDB(result, queryExists);
    }
    private static async player(name: string): Promise<Player | undefined> {
        const db = new DatabasePlayer();
        for (const player of await db.getPlayer(name)) {
            if (player.pagename.toLowerCase() == name.toLowerCase()) {
                console.log(`Found ${player.id} in database.`);
                return player;
            }
        }
        const { headers, params } = LiquidDB.queryHeadersParams(name);
        const Player = await fetch(
            `https://api.liquipedia.net/api/v3/player?${params}`,
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
                return {
                    pagename,
                    id,
                    nationality,
                    region,
                    teampagename,
                    twitter: links.twitter,
                    status,
                    earnings,
                } as Player;
            });
        db.pushPlayer(Player);
        return Player;
    }
    private static async team(name: string): Promise<Team | undefined> {
        const db = new DatabaseTeam();
        for (const team of await db.getTeam(name)) {
            if (team.pagename.toLowerCase() == name.toLowerCase()) {
                console.log(`Found ${team.pagename} in database.`);
                return team;
            }
        }
        const { headers, params } = LiquidDB.queryHeadersParams(name);
        const Team = await fetch(
            `https://api.liquipedia.net/api/v3/team?${params}`,
            { headers }
        )
            .then((response) => response.json())
            .then((data) => {
                // Get team
                const {
                    pagename,
                    name,
                    region,
                    logodarkurl,
                    textlesslogodarkurl,
                    status,
                    createdate,
                    disbanddate,
                    links,
                } = data.result[0];
                const returnable: Team = {
                    pagename,
                    name,
                    region,
                    logodarkurl,
                    textlesslogodarkurl,
                    status,
                    createdate,
                    disbanddate,
                    links,
                    players: [],
                };

                return returnable;
            });
        // Get SquadPlayers (different endpoint but intended to be in the same embed.)
        const param = new URLSearchParams({
            wiki: "brawlstars",
            conditions: `[[pagename::${name}]] AND [[status::active]]`,
        });
        await fetch(
            `https://api.liquipedia.net/api/v3/squadplayer?${param.toString()}`,
            { headers: headers }
        )
            .then((response) => response.json())
            .then((data) => {
                for (const memberNumber in Object.values(data.result)) {
                    const {
                        id,
                        role,
                        link,
                        type,
                        status,
                        joindate,
                        nationality,
                    } = data.result[memberNumber];
                    Team.players.push({
                        id: id == "" ? "Unknown Person" : id,
                        role,
                        link: link == "" ? "404" : link,
                        type,
                        status,
                        joindate,
                        nationality,
                    } as SquadPlayer);
                }
            });
        db.pushTeam(Team);
        return Team;
    }
    private static async match(name: string): Promise<Match[] | undefined> {
        const db = new DatabaseMatch();
        const matches = await db.getMatch(name);
        for (const match of matches) {
            if (match.pagename == name) {
                console.log(`Found ${match.pagename} in database.`);

                return matches;
            }
        }
        const { headers, params } = LiquidDB.queryHeadersParams(name);
        const Match = await fetch(
            `https://api.liquipedia.net/api/v3/match?${params}`,
            { headers }
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
                db.pushMatch(answer);
                return answer;
            });
        return Match;
    }
    private static async group(name: string): Promise<Groups[] | undefined> {
        const { headers, params } = LiquidDB.queryHeadersParams(name);
        const Group = (await fetch(
            `https://api.liquipedia.net/api/v3/standingsentry?${[params]}`,
            { headers }
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
        return Group;
    }
    private static async teammember(
        name: string
    ): Promise<SquadPlayer[] | undefined> {
        const { headers } = LiquidDB.queryHeadersParams(name);
        const param = new URLSearchParams({
            wiki: "brawlstars",
            conditions: `[[pagename::${name}]] AND [[status::active]]`,
        });
        const answer: SquadPlayer[] = [];
        await fetch(
            `https://api.liquipedia.net/api/v3/squadplayer?${param.toString()}`,
            { headers: headers }
        )
            .then((response) => response.json())
            .then((data) => {
                for (const memberNumber in Object.values(data.result)) {
                    const {
                        id,
                        role,
                        link,
                        type,
                        status,
                        joindate,
                        nationality,
                    } = data.result[memberNumber];
                    answer.push({
                        id,
                        role,
                        link,
                        type,
                        status,
                        joindate,
                        nationality,
                    });
                }
            });
        return answer;
    }
    private static queryHeadersParams(name: string) {
        const headers = {
            Authorization: `Apikey ${process.env.LIQUID_TOKEN}`,
        };
        const params = new URLSearchParams({
            wiki: "brawlstars",
            conditions: `[[pagename::${name}]]`,
        }).toString();
        return { headers, params };
    }
}
