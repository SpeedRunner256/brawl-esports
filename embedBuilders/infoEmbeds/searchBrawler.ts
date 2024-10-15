import { EmbedBuilder } from "discord.js";
import { BrawlerInfo } from "../../modules/inGameInfo/brawlerInfo.ts";

export async function searchBrawler(query: string) {
    const brawler = await BrawlerInfo.setBrawler(query);
    let answer: EmbedBuilder = new EmbedBuilder()
        .setTitle("Cant find your query.")
        .setDescription("Maybe you typed something wrong? Who knows")
        .setColor(0xff0000);
    try {
        answer = new EmbedBuilder()
            .setTitle(
                `<:bsStar:1292082767848542208> ${brawler.name} <:bsStar:1292082767848542208>`,
            )
            .setDescription(brawler.description)
            .setColor(brawler.rarityColor)
            .setURL(
                (
                    "https://www.liquipedia.net/brawlstars/" + brawler.name
                ).replace(/\s/g, "%20"),
            )
            .setThumbnail(brawler.image)
            .setThumbnail(brawler.image)
            .addFields([
                {
                    name:
                        "<:star_power:1276418263911497810> " +
                        brawler.starPower1.name,
                    value: brawler.starPower1.description,
                    inline: true,
                },
                {
                    name:
                        "<:star_power:1276418263911497810> " +
                        brawler.starPower2.name,
                    value: brawler.starPower2.description,
                    inline: true,
                },
                {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true,
                },
                {
                    name: `<:gadget:1276418294592573460> ${brawler.gadget1.name}`,
                    value: brawler.gadget1.description,
                    inline: true,
                },
                {
                    name: `<:gadget:1276418294592573460> ${brawler.gadget2.name}`,
                    value: brawler.gadget2.description,
                    inline: true,
                },
                {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true,
                },
            ]);
    } catch (error) {
        console.log(error);
    }
    return answer;
}
