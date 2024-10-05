import { EmbedBuilder } from "discord.js";
import { MapInfo } from "../../modules/inGameInfo/mapInfo";

export async function searchMap(query: string) {
    const map = await MapInfo.setMap(query);
    const sendEmbed = new EmbedBuilder()
        .setTitle(
            `<:bs_map:1291686752569921546> ${map.name} <:bs_map:1291686752569921546>`
        )
        .setDescription(
            `> Gamemode: [${map.gameMode?.name}](${map.gameMode?.link})`
        )
        .setImage(map.imageUrl)
        .setURL(map.link)
        .setColor(map.color);
    return sendEmbed;
}
