import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import type { Groups } from "../../modules/moduleTypes.ts";
import { getRandomTeamNameEmoji } from "../../modules/embeds.ts";
import { LiquidDB } from "../../modules/liquid.ts";

export const data = new SlashCommandBuilder()
    .setName("groups")
    .setDescription("Get group tables.")
    .addStringOption((input) =>
        input
            .setName("tournament")
            .setRequired(true)
            .setDescription("Enter tournament page link here.")
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString("tournament");
    if (!query) {
        throw new Error("Did not get tournamentQuery");
    }
    // Get Groups
    const obj = await LiquidDB.get("group", query);
    const groups = <Groups[]> obj.result;
    const groupA = groups.slice(0, 3);
    const groupB = groups.slice(3, 6);
    const groupC = groups.slice(6, 9);
    const groupD = groups.slice(9, 12);
    if (groupField(groupA).length == 0) {
        await interaction.reply({
            content: "This game did not have groups.",
            ephemeral: true,
        });
        return;
    }
    const embed = new EmbedBuilder()
        .setTitle(`<:time:1292086778550812672> Groups`)
        .setTimestamp()
        .setColor(Colors.DarkPurple)
        .addFields([
            {
                name: `${getRandomTeamNameEmoji()} Group A`,
                value: groupField(groupA),
                inline: true,
            },
            {
                name: `${getRandomTeamNameEmoji()}  Group B`,
                value: groupField(groupB),
                inline: true,
            },
            {
                name: "\u200b",
                value: "\u200b",
                inline: true,
            },
            {
                name: `${getRandomTeamNameEmoji()}  Group C`,
                value: groupField(groupC),
                inline: true,
            },
            {
                name: `${getRandomTeamNameEmoji()}  Group D`,
                value: groupField(groupD),
                inline: true,
            },
            {
                name: "\u200b",
                value: "\u200b",
                inline: true,
            },
        ]);

    // Send to chat button :3
    const sendToChat = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("Send to chat")
        .setCustomId("stc");
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(sendToChat);
    const reply = await interaction.reply({
        content: "Send this?",
        embeds: [embed],
        components: [row],
        ephemeral: true,
    });
    const collector = reply.createMessageComponentCollector({
        time: 40_000,
    });
    collector.on("collect", async (i) => {
        await i.reply({
            embeds: [embed],
        });
    });
}
function groupField(group: Groups[]) {
    let answer = "";
    for (const team of group) {
        answer +=
            `${team.placement}. **${team.opponentname}** - ${team.scoreboard.game.w}W/${team.scoreboard.game.l}L\n`;
    }
    return answer;
}
