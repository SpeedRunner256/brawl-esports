import { readFile } from "fs/promises";
import type { Match } from "../../modules/moduleTypes";
export async function sortByBrawler(name: string) {
    const unsorteddata = JSON.parse(
        await readFile("db/matches.json", "utf8"),
    ) as Match[];
    const data = sortMatchesByDate(unsorteddata);
    const answer: Match[] = [];
    for (const match of data) {
        for (const game of match.match2games) {
            if (Object.values(game.participants).length == 0) {
                continue;
            }
            try {
                if (
                    game.participants["1_1"].brawler.toLowerCase() ==
                        name.toLowerCase() ||
                    game.participants["1_2"].brawler.toLowerCase() ==
                        name.toLowerCase() ||
                    game.participants["1_3"].brawler.toLowerCase() ==
                        name.toLowerCase() ||
                    game.participants["2_1"].brawler.toLowerCase() ==
                        name.toLowerCase() ||
                    game.participants["2_2"].brawler.toLowerCase() ==
                        name.toLowerCase() ||
                    game.participants["2_3"].brawler.toLowerCase() ==
                        name.toLowerCase()
                ) {
                    answer.push(match);
                    if (answer.length == 20) {
                        console.log("Found 20");
                        return answer;
                    }
                }
            } catch {
                continue;
            }
        }
    }
    console.log("Found ", answer.length);
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
