import { readFile, writeFile } from "fs/promises";
import { ExtraData, Prediction, PunData, SquadPlayer, Team } from "./moduleTypes.ts";
import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import { Match } from "./moduleTypes.ts";

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
    async savePredictionToDatabase(prediction: Prediction): Promise<void> {
        const data = JSON.parse(await readFile("db/prediction.json", "utf-8"));
        data[prediction.predictionNumber] = prediction;
        writeFile("db/prediction.json", JSON.stringify(data, null, "    "));
    }
    getLatestGameDate(match: Match): Date {
        if (!match.match2games || match.match2games.length === 0) {
            return new Date(0); // Return earliest possible date if no games
        }

        // Convert all game dates to Date objects and find the latest one
        const dates = match.match2games.map((game) => new Date(game.date));
        return new Date(Math.max(...dates.map((date) => date.getTime())));
    }
    sortMatchesByDate(matches: Match[]): Match[] {
        return [...matches].sort((a, b) => {
            const dateA = this.getLatestGameDate(a);
            const dateB = this.getLatestGameDate(b);

            // Sort in descending order (latest first)
            return dateB.getTime() - dateA.getTime();
        });
    }
    async getGamemodeBans(name: string) {
        const unsorteddata = JSON.parse(
            await readFile("db/matches.json", "utf8")
        ) as Match[];
        const data = this.sortMatchesByDate(unsorteddata);
        const answer: string[] = [];
        for (const match of data) {
            for (const game of match.match2games) {
                if (game.resulttype == "np") {
                    continue;
                }
                if (
                    game.extradata.maptype.toLowerCase() == name.toLowerCase()
                ) {
                    for (const ban1 of Object.values(
                        game.extradata.bans.team1
                    )) {
                        answer.push(ban1);
                    }
                    for (const ban2 of Object.values(
                        game.extradata.bans.team2
                    )) {
                        answer.push(ban2);
                    }
                }
            }
        }
        return answer;
    }
    async getGamemodePicks(name: string) {
        const unsorteddata = JSON.parse(
            await readFile("db/matches.json", "utf8")
        ) as Match[];
        const data = this.sortMatchesByDate(unsorteddata);
        const answer: string[] = [];
        for (const match of data) {
            for (const game of match.match2games) {
                if (game.resulttype == "np") {
                    continue;
                }
                if (game.extradata.maptype == name) {
                    for (const brawler of Object.values(game.participants)) {
                        answer.push(Object.values(brawler)[0]);
                    }
                }
            }
        }
        return answer;
    }
    async getMapBans(name: string) {
        const unsorteddata = JSON.parse(
            await readFile("db/matches.json", "utf8")
        ) as Match[];
        const data = this.sortMatchesByDate(unsorteddata);
        const answer: string[] = [];
        for (const match of data) {
            for (const game of match.match2games) {
                if (game.resulttype == "np") {
                    continue;
                }
                if (game.map.toLowerCase() == name.toLowerCase()) {
                    for (const ban1 of Object.values(
                        game.extradata.bans.team1
                    )) {
                        answer.push(ban1);
                    }
                    for (const ban2 of Object.values(
                        game.extradata.bans.team2
                    )) {
                        answer.push(ban2);
                    }
                }
            }
        }
        return answer;
    }
    async getMapPicks(name: string) {
        const unsorteddata = JSON.parse(
            await readFile("db/matches.json", "utf8")
        ) as Match[];
        const data = this.sortMatchesByDate(unsorteddata);
        const answer: string[] = [];
        for (const match of data) {
            for (const game of match.match2games) {
                if (game.resulttype == "np") {
                    continue;
                }
                if (game.map.toLowerCase() == name.toLowerCase()) {
                    for (const brawler of Object.values(game.participants)) {
                        answer.push(Object.values(brawler)[0]);
                    }
                }
            }
        }
        return answer;
    }
    async sortByBrawler(name: string) {
        const unsorteddata = JSON.parse(
            await readFile("db/matches.json", "utf8")
        ) as Match[];
        const data = this.sortMatchesByDate(unsorteddata);
        const answer: Match[] = [];
        for (const match of data) {
            for (const game of match.match2games) {
                if (game.resulttype == "np") {
                    continue;
                }
                for (const brawler of Object.values(game.participants)) {
                    if (Object.values(brawler).length == 0) {
                        continue;
                    }
                    if (
                        Object.values(brawler)[0].toLowerCase() ==
                        name.toLowerCase()
                    ) {
                        answer.push(match);
                        if (answer.length == 20) {
                            return answer;
                        }
                    }
                }
            }
        }
        return answer;
    }
    async sortByPlayer(name: string) {
        const udata = JSON.parse(
            await readFile("db/matches.json", "utf8"),
        ) as Match[];
        const data = this.sortMatchesByDate(udata);
        const answer: Match[] = [];
        try {
            for (const match of data) {
                for (const players of match.match2opponents) {
                    for (const player of players.match2players) {
                        if (
                            player.displayname.toLowerCase() == name.toLowerCase()
                        ) {
                            answer.push(match);
                            if (answer.length == 20) {
                                return answer;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
        return answer;
    }
    async sortByTeam(name: string) {
        const udata = JSON.parse(
            await readFile("db/matches.json", "utf8"),
        ) as Match[];
        if (name.toLowerCase() == "navi") {
            name = "Natus Vincere";
        }
        const data = this.sortMatchesByDate(udata);
        const answer: Match[] = [];
        try {
            for (const match of data) {
                for (const o of match.match2opponents) {
                    if (o.name.toLowerCase() == name.toLowerCase()) {
                        answer.push(match);
                        if (answer.length == 20) {
                            return answer;
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
        return answer;
    }
    getBanList(data: ExtraData): string {
        const team1Bans = Object.values(data.bans.team1);
        const team2Bans = Object.values(data.bans.team2);
        const uniqueBans = [...new Set([...team2Bans, ...team1Bans])];
        return uniqueBans.join(", ");
    }
    async checkAllow(uid: string) {
        const file: PunData = JSON.parse(await readFile("db/puns.json", "utf-8"));
        for (const id of file.allow) {
            if (id == uid) {
                return true;
            }
        }
        return false;
    }
    async checkPun(pname: string) {
        const file: PunData = JSON.parse(await readFile("db/puns.json", "utf-8"));
        for (const pun of file.puns) {
            for (const name of pun.names) {
                if (name == pname) {
                    return pun;
                }
            }
        }
        throw new Error(`No pun found - trying ${pname}`);
    }
    async hasPun(pname: string) {
        const file: PunData = JSON.parse(await readFile("db/puns.json", "utf-8"));
        for (const pun of file.puns) {
            for (const name of pun.names) {
                if (name == pname) {
                    return true;
                }
            }
        }
        return false;
    }
}

export class Config {
    async separator(guildID: string): Promise<string> {
        try {
            const configData = await readFile("./config.json", "utf-8");
            const config = JSON.parse(configData);

            if (!(guildID in config)) {
                throw new Error(`Guild ID ${guildID} not found in config`);
            }

            return config[guildID].separator;
        } catch (error) {
            throw new Error(`Error reading separator: ${error}`);
        }
    }
    async balance(guildID: string | null): Promise<number> {
        try {
            if (!guildID) {
                throw new Error("Guild ID is null.");
            }
            const config = JSON.parse(await readFile("./config.json", "utf-8"));
            if (!(guildID in config)) {
                throw new Error("Guild not found in config.");
            }
            return config[guildID].startBal;
        } catch (err) {
            throw new Error(`Error: ${err}`);
        }
    }
    async userAlreadyVoted(
        predictionNumber: string,
        ID: string
    ): Promise<boolean> {
        const data = JSON.parse(await readFile("db/prediction.json", "utf8"));
        const prediction = data[predictionNumber];
        return (
            prediction.userChoices[1].includes(ID) ||
            prediction.userChoices[2].includes(ID)
        );
    }
    async mult(guildId: string | null) {
        if (!guildId) {
            throw new Error("Guild is null");
        }
        const data = JSON.parse(await readFile("./config.json", "utf-8"));
        return data[guildId].mult;
    }
    async log(
        logMessage: string,
        logContent: string,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const data = JSON.parse(await readFile("config.json", "utf8"));
        const guildId = interaction.guildId;
        if (!guildId) {
            throw new Error("Not in a guild.");
        }
        const log = data[guildId].log.id;
        (interaction.client.channels.cache.get(log) as TextChannel).send(
            `${logMessage}\`\`\`json\n${logContent}\`\`\``
        );
    }
}

export class stringUtils {
    formatStaff(players: SquadPlayer[]): string {
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
    formatSquadPlayerInfo(players: SquadPlayer[]): string {
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
}
