import type { APIEmbedField } from "discord.js";
import type { Match } from "../../modules/moduleTypes";

export function matchEmbedFields(match: Match) {
    const answer: APIEmbedField[] = [];
    let counter = 1;
    for (const game of match.match2games) {
        if (
            Object.values(game.participants).length !== 0 &&
            Object.values(game.scores).length !== 0
        ) {
            answer.push({
                name: `<:combat:1292086786872442973> Game ${counter}`,
                value: `<:bs_map:1291686752569921546> ${game.map}
                    <:score:1291686732621676605> **${game.scores[0]}**:**${
                        game.scores[1]
                    }**
                    <:brawlers:1291686735906078861> Picks: **${
                        game.participants["1_1"].brawler
                    }**, **${game.participants["1_2"].brawler}**, **${
                        game.participants["1_3"].brawler
                    }** vs **${game.participants["2_1"].brawler}**, **${
                        game.participants["2_2"].brawler
                    }**, **${game.participants["2_3"].brawler}**
                    <:bans:1291686740486131772> Bans: ${getBanList(
                        game.extradata,
                    )}`,
                inline: true,
            });
        }
        if (counter % 2 == 0) {
            answer.push({
                name: "\u200b",
                value: "\u200b",
                inline: true,
            });
        }
        counter += 1;
    }
    return answer;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getBanList(data: any): string {
    const team1Bans = Object.values(data.bans.team1);
    const team2Bans = Object.values(data.bans.team2);
    const uniqueBans = [...new Set([...team2Bans, ...team1Bans])];
    return uniqueBans.join(", ");
}
