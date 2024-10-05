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
        .setTitle(`<:duels:1291683169569083392> ${player.id}`)
        .setDescription(
            `${
                player.pagename
            } is a member (player/coach/analyst) at **${await findPrintableName(
                player?.teampagename
            )}**.`
        )
        .setColor(player?.status == "Active" ? 0x4287f5 : 0xf54254)
        .setURL(`https://liquipedia.net/brawlstars/${player?.pagename}`)
        .setFooter({ text: "We do not have licenses to use player images." })
        .addFields([
            {
                name: "<:game:1291684262910885918> Team",
                value: `[${await findPrintableName(
                    player?.teampagename
                )}](https://liquipedia.net/brawlstars/${player.teampagename})`,
                inline: true,
            },
            {
                name: "<:living:1292086781071593515> Living in",
                value: player.nationality,
                inline: true,
            },
            {
                name: "<:money:1292086783886233621> Earnings",
                value: "$" + player.earnings,
                inline: true,
            },
            {
                name: "<:score:1291686732621676605> Socials",
                value: `${Object.entries(player.links)
                    .map(
                        ([key, value]) =>
                            `[${
                                key.charAt(0).toUpperCase() + key.slice(1)
                            }](${value})`
                    )
                    .join(", ")}`,
                inline: true,
            },
        ]);
    return sendEmbed;
}
