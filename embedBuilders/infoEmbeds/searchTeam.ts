import { EmbedBuilder } from "discord.js";
import { TeamInfo } from "../../modules/eSportsInfo/team.ts";
import { stringUtils } from "../../utilities/stringUtils.ts";

export async function searchTeam(query: string): Promise<EmbedBuilder> {
    const team = await TeamInfo.setTeam(query);
    if (team.status == "disbanded") {
        console.log("Disbanded team, here's something else.");
        return new EmbedBuilder()
            .setTitle(`${getRandomTeamNameEmoji()} ${team.name}`)
            .setDescription(team.name + " is a disbanded team.")
            .setThumbnail(team.logo)
            .setColor(0xf54254)
            .addFields([
                {
                    name: "<:time:1292086778550812672> Creation Date",
                    value: stringUtils.formatDate(team.createdate),
                    inline: true,
                },
                {
                    name: "<:living:1292086781071593515>  Region",
                    value: team.region,
                    inline: true,
                },
                {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true,
                },
                {
                    name: "<:game:1291684262910885918> Members",
                    value: "Disbanded team, no active members.",
                },
                {
                    name: "<:coach:1292130323806556272> Staff",
                    value: "Disbanded team, no active staff members.",
                },
                {
                    name: "<:score:1291686732621676605> Links",
                    value: Object.entries(team.links)
                        .map(
                            ([key, value]) =>
                                `[${
                                    key.charAt(0).toUpperCase() + key.slice(1)
                                }](${value})`,
                        )
                        .join(", "),
                    inline: true,
                },
            ]);
    }
    let answer: EmbedBuilder = new EmbedBuilder()
        .setTitle("Cant find your query.")
        .setDescription("Maybe you typed something wrong? Who knows")
        .setColor(0xff0000);
    try {
        answer = new EmbedBuilder()
            .setTitle(`${getRandomTeamNameEmoji()} ${team.name}`)
            .setURL(`https://liquipedia.net/brawlstars/${team.pagename}`)
            .setThumbnail(team.textlesslogo)
            .setColor(team.status == "Active" ? 0x4287f5 : 0xf54254)
            .addFields([
                {
                    name: "<:time:1292086778550812672> Creation Date",
                    value: stringUtils.formatDate(team.createdate),
                    inline: true,
                },
                {
                    name: "<:living:1292086781071593515>  Region",
                    value: team.region,
                    inline: true,
                },
                {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true,
                },
                {
                    name: "<:game:1291684262910885918> Members",
                    value: stringUtils.formatSquadPlayerInfo(team.players),
                },
                {
                    name: "<:coach:1292130323806556272> Coaches",
                    value: stringUtils.formatStaff(team.staff),
                },
                {
                    name: "<:score:1291686732621676605> Links",
                    value: Object.entries(team.links)
                        .map(
                            ([key, value]) =>
                                `[${
                                    key.charAt(0).toUpperCase() + key.slice(1)
                                }](${value})`,
                        )
                        .join(", "),
                    inline: true,
                },
            ]);
    } catch (error) {
        console.log(error);
    }
    return answer;
}
export async function searchTeamPlayers(query: string) {
    const team = await TeamInfo.setTeam(query);
    return team.players.map((a) => a.link);
}
export function getRandomTeamNameEmoji(): string {
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
