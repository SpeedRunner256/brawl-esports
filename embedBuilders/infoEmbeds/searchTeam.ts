import { EmbedBuilder } from "discord.js";
import { TeamInfo } from "../../modules/eSportsInfo/team";
import { stringUtils } from "../../utilities/stringUtils";

export async function searchTeam(query: string): Promise<EmbedBuilder> {
    const team = await TeamInfo.setTeam(query);
    const sendEmbed = new EmbedBuilder()
        .setTitle(team.name)
        .setURL(`https://liquipedia.net/brawlstars/${team.pagename}`)
        .setThumbnail(team.textlesslogo)
        .setColor(team.status == "Active" ? 0x4287f5 : 0xf54254)
        .addFields([
            {
                name: "Creation Date",
                value: stringUtils.formatDate(team.createdate),
                inline: true,
            },
            {
                name: "Region",
                value: team.region,
                inline: true,
            },
            {
                name: "\u200b",
                value: "\u200b",
                inline: true,
            },
            {
                name: "Links",
                value: Object.entries(team.links)
                    .map(
                        ([key, value]) =>
                            `[${
                                key.charAt(0).toUpperCase() + key.slice(1)
                            }](${value})`
                    )
                    .join(", "),
                inline: true,
            },
            {
                name: "Members",
                value: stringUtils.formatSquadPlayerInfo(team.players),
            },
        ]);
    return sendEmbed;
}
export async function searchTeamPlayers(query: string) {
    const team = await TeamInfo.setTeam(query);
    return team.players.map((a) => a.link);
}
