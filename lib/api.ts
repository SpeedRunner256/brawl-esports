import type {
    Brawler,
    GameMode,
    Groups,
    Map,
    Match,
    Match2Games,
    Match2Opponents,
    Match2Players,
    Player,
    SquadPlayer,
    Team,
} from "./moduleTypes.ts";
import {
    BrawlerNotFoundError,
    GameModeNotFoundError,
    GroupNotFoundError,
    MapNotFoundError,
    MatchNotFoundError,
    PlayerNotFoundError,
    TeamMemberNotFoundError,
    TeamNotFoundError,
} from "./errors.ts";
import process from "node:process";
import { Database } from "./database.ts";
const db = new Database();
db.get("match", "db/matches.json");
type Result =
    | Player
    | Team
    | Match[]
    | Groups[]
    | SquadPlayer[]
    | Brawler
    | GameMode
    | Map
    | undefined;
export class LiquidDB {
    result: Result;
    queryExists: boolean = false;

    private constructor(result: Result, queryExists: boolean) {
        this.result = result;
        this.queryExists = queryExists;
    }
    /**
     * @description Get information from the LiquipediaDB API
     * @param query - Enter your query - this just has to be close enough, though exact matches are more than welcome.
     * @param type - Type of the result you intend to recieve.
     */
    static async get(
        type:
            | "brawler"
            | "gamemode"
            | "map"
            | "player"
            | "team"
            | "match"
            | "teammember"
            | "group",
        query: string,
    ) {
        // Do DB later, first get this working nice.
        let result: Result;
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
            case "brawler":
                result = await LiquidDB.brawler(query);
                break;
            case "gamemode":
                result = await LiquidDB.gameMode(query);
                break;
            case "map":
                result = await LiquidDB.map(query);
                break;
        }
        if (result) {
            queryExists = true;
        }
        return new LiquidDB(result, queryExists);
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
        query: string,
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

    private static async player(name: string): Promise<Player | undefined> {
        for (const player of await db.getPlayer(null, null, name)) {
            if (player.pagename.toLowerCase() == name.toLowerCase()) {
                console.log(`Found ${player.id} in database.`);
                return player;
            }
        }
        const { headers, params } = LiquidDB.queryHeadersParams(name);
        const Player = await fetch(
            `https://api.liquipedia.net/api/v3/player?${params}`,
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
                if (!pagename) {
                    throw new PlayerNotFoundError(name);
                }
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
        const teams = await db.getTeam(null, name);
        for (const team of teams) {
            if (team.pagename.toLowerCase() == name.toLowerCase()) {
                console.log(`Found ${team.pagename} in database.`);
                return team;
            }
        }
        const { headers, params } = LiquidDB.queryHeadersParams(name);
        const Team = await fetch(
            `https://api.liquipedia.net/api/v3/team?${params}`,
            { headers },
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
                if (!returnable.pagename) {
                    throw new TeamNotFoundError(name);
                }
                return returnable;
            });
        // Get SquadPlayers (different endpoint but intended to be in the same embed.)
        const param = new URLSearchParams({
            wiki: "brawlstars",
            conditions: `[[pagename::${name}]] AND [[status::active]]`,
        });
        await fetch(
            `https://api.liquipedia.net/api/v3/squadplayer?${param.toString()}`,
            { headers: headers },
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
        const matches = await db.getMatch(name);
        for (const match of matches) {
            if (match.pagename == name) {
                console.log(`Found ${match.pagename} in database.`);
                // If match isnt yet complete but needs to be played soon then rerun
                if (
                    match.match2games[0].scores.length == 0 &&
                    match.match2games[0].resulttype != "np"
                ) {
                    break;
                }
                return matches;
            }
        }
        const { headers, params } = LiquidDB.queryHeadersParams(name);
        const Match = await fetch(
            `https://api.liquipedia.net/api/v3/match?${params}`,
            { headers },
        )
            .then((response) => response.json())
            .then((data) => {
                const answer: Match[] = [];
                if (!data.result) {
                    throw new MatchNotFoundError(name);
                }
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
            { headers },
        )
            .then((response) => response.json())
            .then((data) => {
                data = data["result"];
                const answer: Groups[] = [];
                if (!data) {
                    return new GroupNotFoundError(name);
                }
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
        name: string,
    ): Promise<SquadPlayer[] | undefined> {
        const { headers } = LiquidDB.queryHeadersParams(name);
        const param = new URLSearchParams({
            wiki: "brawlstars",
            conditions: `[[pagename::${name}]] AND [[status::active]]`,
        });
        const answer: SquadPlayer[] = [];
        await fetch(
            `https://api.liquipedia.net/api/v3/squadplayer?${param.toString()}`,
            { headers: headers },
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
                    if (!link) {
                        throw new TeamMemberNotFoundError(name);
                    }
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
