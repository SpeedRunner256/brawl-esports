import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { LiquidDB } from "../../lib/api.ts";
import { Map } from "../../lib/types.ts";

export const data = new SlashCommandBuilder()
    .setName("draft")
    .setDescription("Play a draft game")
    .addSubcommand((play) =>
        play.setName("play").setDescription("Start a drafting routine")
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.user;
    const map = await fetch("https://api.brawlify.com/v1/maps")
        .then((r) => r.json())
        .then(async (d) => {
            const data = d.list;
            let randomIndex = Math.floor(Math.random() * data.length);
            let mapObj = await LiquidDB.get("map", data[randomIndex].name);
            let name = (mapObj.result as Map).gamemode.name;
            while (
                ![
                    "Bounty",
                    "Heist",
                    "Brawl Ball",
                    "Hot Zone",
                    "Knockout",
                ].includes(name)
            ) {
                randomIndex = Math.floor(Math.random() * data.length);
                mapObj = await LiquidDB.get("map", data[randomIndex].name);
                name = (mapObj.result as Map).gamemode.name;
            }
            return mapObj;
        });
    const embed = new EmbedBuilder()
        .setTimestamp()
        .setTitle(`Draft start for ${user.displayName}`)
        .setDescription(
            `Battle against bot on <:BS_Map:1306225191482818600>**${
                (map.result as Map).name
            }** on ${(map.result as Map).gamemode.name}`
        )
        .setThumbnail((map.result as Map).imageUrl)
        .setColor(parseInt("0x" + (map.result as Map).gamemode.color.slice(1)));
    await interaction.editReply({
        embeds: [embed],
    });
}
