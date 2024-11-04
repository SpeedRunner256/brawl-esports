import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { LiquidDB } from "../../lib/api.ts";
import { Match } from "../../lib/moduleTypes.ts";

export const data = new SlashCommandBuilder()
    .setName("match_two")
    .setDescription("new_match thingy")
    .addStringOption((input) =>
        input
            .setName("link")
            .setDescription("Link of the tournament")
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const pageName = interaction.options.getString("link", true);
    const obj = await LiquidDB.get("match", pageName);
    const matches = <Match[]>obj.result;
    await interaction.editReply({
        embeds: [embedMatch(matches[0])],
    });
}

const embedMatch = (match: Match) => {
    const t1 = match.match2opponents[0];
    const t2 = match.match2opponents[1];
    const winner = match.match2opponents[+match.winner - 1];
    let playedMaps = "";
    for (const game of match.match2games) {
        playedMaps += `${game.map}\n`;
    }
    return new EmbedBuilder()
        .setTitle(match.tickername)
        .setColor(Colors.DarkGold)
        .setDescription(`Match info - ${match.tickername}`)
        .setThumbnail(match.icondarkurl)
        .addFields([
            {
                name: "<:duels:1291683169569083392> Opponenets",
                value: `**${t1.name}** vs **${t2.name}** - ${t1.score}:${t2.score}`,
            },
            {
                name: "<:bs_map:1291686752569921546> Maps played",
                value: playedMaps,
                inline: true,
            },
            {
                name: "Summary",
                value: "\u200b",
            },
            {
                name: "Scores",
                value: "",
                inline: true,
            },
            {
                name: "Picks",
                value: "",
                inline: true,
            },
            {
                name: "Bans",
                value: "",
                inline: true,
            },
        ]);
};
