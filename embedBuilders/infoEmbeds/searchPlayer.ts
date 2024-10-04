import { EmbedBuilder } from "discord.js";
import { PlayerInfo } from "../../modules/eSportsInfo/player";
import { findPrintableName } from "../../modules/eSportsInfo/findPage";

export async function searchPlayer(query: string) {
    const player = await PlayerInfo.setPlayer(query);
    if (!player) {
        return new EmbedBuilder()
            .setTitle("Player not found")
            .setDescription("Are you searching correctly? Maybe check again.");
    }
    const sendEmbed = new EmbedBuilder()
        .setTitle(player.id)
        .setColor(player?.status == "Active" ? 0x4287f5 : 0xf54254)
        .setURL(`https://liquipedia.net/brawlstars/${player?.pagename}`)
        .addFields([
            {
                name: "Team",
                value: `[${await findPrintableName(
                    player?.teampagename
                )}](https://liquipedia.net/brawlstars/${player.teampagename})`,
                inline: true,
            },
            {
                name: "Living in",
                value: player.nationality,
                inline: true,
            },
            {
                name: "\u200b",
                value: "\u200b",
                inline: true,
            },
            {
                name: "Socials",
                value: Object.entries(player.links)
                    .map(
                        ([key, value]) =>
                            `[${
                                key.charAt(0).toUpperCase() + key.slice(1)
                            }](${value})`
                    )
                    .join("\n"),
                inline: true,
            },
            {
                name: "Earnings",
                value: "$" + player.earnings,
                inline: true,
            },
            {
                name: "\u200b",
                value: "\u200b",
                inline: true,
            },
        ]);
    return sendEmbed;
}
