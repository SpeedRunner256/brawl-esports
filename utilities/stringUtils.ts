import { type SquadPlayer } from "../modules/moduleTypes.ts";
export class stringUtils {
    static formatStaff(players: SquadPlayer[]): string {
        return players
            .map(
                (player) =>
                    `**[${player.id}](https://liquipedia.net/brawlstars/${
                        new URLSearchParams(
                            player.link,
                        ).toString()
                    })**: ${player.role} - ${
                        this.formatDate(
                            player.joindate,
                        )
                    }`,
            )
            .join("\n");
    }
    static duration(durationString: string): number {
        const regex = /(\d+d)?(\d+h)?(\d+m)?(\d+s)?/;
        const match = durationString.replace(/\s+/g, "").match(regex);

        if (!match) {
            throw new Error("Invalid duration string format");
        }

        const now = new Date();
        const futureDate = new Date(now);

        const [, days, hours, minutes, seconds] = match;

        if (days) futureDate.setDate(futureDate.getDate() + parseInt(days));
        if (hours) futureDate.setHours(futureDate.getHours() + parseInt(hours));
        if (minutes) {
            futureDate.setMinutes(futureDate.getMinutes() + parseInt(minutes));
        }
        if (seconds) {
            futureDate.setSeconds(futureDate.getSeconds() + parseInt(seconds));
        }

        return futureDate.getTime() - Date.now();
    }
    static formatSquadPlayerInfo(players: SquadPlayer[]): string {
        const abc = players.map((player) => {
            const date = new Date(player.joindate);
            const formattedDate = date.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });

            const day = date.getDate();
            const suffix = ["th", "st", "nd", "rd"][
                day % 10 > 3 ? 0 : (day % 100) - (day % 10) != 10 ? day % 10 : 0
            ];
            const link = encodeURI(player.link)
            const finalDate = formattedDate.replace(/(\d+)/, `$1${suffix}`);
            return `[**${player.link}**](https://liquipedia.net/brawlstars/${link}): ${player.nationality} - ${finalDate}`;
        });
        let answer = "";
        for (const info of abc) {
            answer += info + "\n";
        }
        return answer;
    }
    static formatDate(joinDate: string) {
        const date = new Date(joinDate);
        const formattedDate = date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        const day = date.getDate();
        const suffix = ["th", "st", "nd", "rd"][
            day % 10 > 3 ? 0 : (day % 100) - (day % 10) != 10 ? day % 10 : 0
        ];

        return formattedDate.replace(/(\d+)/, `$1${suffix}`);
    }
}
