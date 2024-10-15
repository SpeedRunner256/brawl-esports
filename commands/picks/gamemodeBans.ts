import { readFile } from "node:fs/promises";
import type { Match } from "../../modules/moduleTypes.ts";

export async function getGamemodeBans(name: string) {
    const unsorteddata = JSON.parse(
        await readFile("db/matches.json", "utf8"),
    ) as Match[];
    const data = sortMatchesByDate(unsorteddata);
    const answer: string[] = [];
    for (const match of data) {
        for (const game of match.match2games) {
            if (game.resulttype == "np") {
                continue;
            }
            if (game.extradata.maptype.toLowerCase() == name.toLowerCase()) {
                for (const ban1 of Object.values(game.extradata.bans.team1)) {
                    answer.push(ban1);
                }
                for (const ban2 of Object.values(game.extradata.bans.team2)) {
                    answer.push(ban2);
                }
            }
        }
    }
    return answer;
}
function getLatestGameDate(match: Match): Date {
    if (!match.match2games || match.match2games.length === 0) {
        return new Date(0); // Return earliest possible date if no games
    }

    // Convert all game dates to Date objects and find the latest one
    const dates = match.match2games.map((game) => new Date(game.date));
    return new Date(Math.max(...dates.map((date) => date.getTime())));
}

// Main sorting function
function sortMatchesByDate(matches: Match[]): Match[] {
    return [...matches].sort((a, b) => {
        const dateA = getLatestGameDate(a);
        const dateB = getLatestGameDate(b);

        // Sort in descending order (latest first)
        return dateB.getTime() - dateA.getTime();
    });
}
