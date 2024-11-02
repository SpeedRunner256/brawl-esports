import { readFile, writeFile } from "fs/promises";
import { Prediction, SquadPlayer, Team } from "./moduleTypes";

export class Helper {
    activePlayers(team: Team) {
        const answer: SquadPlayer[] = [];
        for (const player of team.players) {
            if (player.type == "player") {
                answer.push(player);
            }
        }
        return this.playerFmt(answer);
    }
    activeStaff(team: Team) {
        const answer: SquadPlayer[] = [];
        for (const player of team.players) {
            if (player.type == "staff") {
                answer.push(player);
            }
        }
        return this.staffFmt(answer);
    }
    randomShieldEmoji(): string {
        const emojiArray = [
            "<:badge1:1292091475823300670>",
            "<:badge2:1292091479262629958>",
            "<:badge3:1292091482035195946>",
            "<:badge4:1292091484472082502>",
            "<:badge5:1292091486946590793>",
            "<:badge6:1292091489697927228>",
            "<:badge7:1292091492269297676>",
            "<:badge8:1292091494865305622>",
            "<:badge9:1292091497210056745>",
            "<:badge10:1292091500532076627>",
        ];
        const randomIndex = Math.floor(Math.random() * emojiArray.length);
        return emojiArray[randomIndex];
    }
    private staffFmt(players: SquadPlayer[]): string {
        return players
            .map(
                (player) =>
                    `**[${
                        player.id
                    }](https://liquipedia.net/brawlstars/${new URLSearchParams(
                        player.link
                    ).toString()})**: ${player.role} - ${this.formatDate(
                        player.joindate
                    )}`
            )
            .join("\n");
    }
    private playerFmt(players: SquadPlayer[]): string {
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
            const link = encodeURI(player.link);
            const finalDate = formattedDate.replace(/(\d+)/, `$1${suffix}`);
            return `[**${player.link}**](https://liquipedia.net/brawlstars/${link}): ${player.nationality} - ${finalDate}`;
        });
        let answer = "";
        for (const info of abc) {
            answer += info + "\n";
        }
        return answer;
    }
    formatDate(joinDate: string) {
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
    duration(durationString: string): number {
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
    async savePredictionToDatabase(
        prediction: Prediction,
    ): Promise<void> {
        const data = JSON.parse(await readFile("db/prediction.json", "utf-8"));
        data[prediction.predictionNumber] = prediction;
        writeFile("db/prediction.json", JSON.stringify(data, null, "    "));
    }
}
