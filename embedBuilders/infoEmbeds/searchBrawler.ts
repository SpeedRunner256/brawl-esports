import { EmbedBuilder } from "discord.js";
import { BrawlerInfo } from "../../modules/inGameInfo/brawlerInfo";

export async function searchBrawler(query: string) {
    const brawler = await BrawlerInfo.setBrawler(query);
    const sendEmbed = new EmbedBuilder()
        .setTitle(
            `<:bsStar:1292082767848542208> ${brawler.name} <:bsStar:1292082767848542208>`
        )
        .setDescription(brawler.description)
        .setColor(brawler.rarityColor)
        .setURL(
            ("https://www.liquipedia.net/brawlstars/" + brawler.name).replace(
                /\s/g,
                "%20"
            )
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
    return sendEmbed;
}
