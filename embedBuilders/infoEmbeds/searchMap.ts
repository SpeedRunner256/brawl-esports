import { EmbedBuilder } from "discord.js";
import { MapInfo } from "../../modules/inGameInfo/mapInfo";

export async function searchMap(query: string) {
    const map = await MapInfo.setMap(query);
    let answer = new EmbedBuilder();
    try {
        answer = new EmbedBuilder()
            .setTitle(
                `<:bs_map:1291686752569921546> ${map.name} <:bs_map:1291686752569921546>`,
            )
            .setDescription(
                `> Gamemode: [${map.gameMode?.name}](${map.gameMode?.link})`,
            )
            .setImage(map.imageUrl)
            .setURL(map.link)
            .setColor(map.color);
    } catch (error) {
        console.log(error);
    }
    return answer;
}
