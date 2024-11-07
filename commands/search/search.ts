import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { MyEmbeds } from "../../lib/embeds.ts";
import { findPageName } from "../../lib/mediawiki.ts";
import { LiquidDB } from "../../lib/api.ts";
import type { SquadPlayer } from "../../lib/moduleTypes.ts";
import { Helper } from "../../lib/helper.ts";
const helper = new Helper();
const e = new MyEmbeds();
export const data = new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search a query!")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("brawler")
            .setDescription("Query a brawler")
            .addStringOption((option) =>
                option
                    .setName("query")
                    .setDescription("Type your query here.")
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("map")
            .setDescription("Query a map")
            .addStringOption((option) =>
                option
                    .setName("query")
                    .setDescription("Type your query here.")
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("player")
            .setDescription("Query a player")
            .addStringOption((option) =>
                option
                    .setName("query")
                    .setDescription("Type your query here.")
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("team")
            .setDescription("Query a team")
            .addStringOption((option) =>
                option
                    .setName("query")
                    .setDescription("Type your query here.")
                    .setRequired(true)
            )
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    let query = interaction.options.getString("query");
    if (!query) {
        throw new Error("No name (cant even happen)");
    }
    await interaction.deferReply({ ephemeral: true });
    let sendEmbed: EmbedBuilder;

    const sendToChatButton = new ButtonBuilder()
        .setCustomId("sendtochat")
        .setLabel("Send to chat!")
        .setStyle(ButtonStyle.Primary);
    const Row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        sendToChatButton,
    );

    switch (interaction.options.getSubcommand()) {
        case "brawler":
            sendEmbed = await e.searchBrawler(query);
            break;
        case "map":
            sendEmbed = await e.searchMap(query);
            break;
        case "player":
            if (
                (await helper.checkAllow(interaction.user.id)) &&
                (await helper.hasPun(query))
            ) {
                sendEmbed = await e.makePun(
                    await helper.checkPun(query),
                    interaction.client,
                );
                break;
            }
            console.log("Not a member of checkPun");
            query = await findPageName(query);
            sendEmbed = await e.searchPlayer(query);
            break;
        case "team":
            {
                query = await findPageName(query);
                sendEmbed = await e.searchTeam(query);
                const obj = await LiquidDB.get("teammember", query);
                const teamMem = <SquadPlayer[]> obj.result;
                if (teamMem.length == 0) {
                    // Disbanded team
                    await interaction.editReply({
                        embeds: [sendEmbed],
                        components: [Row],
                    });
                    return;
                } else {
                    for (const member of teamMem) {
                        if (member.type != "player") {
                            continue;
                        }
                        Row.addComponents(
                            new ButtonBuilder()
                                .setCustomId(member.id.toLowerCase())
                                .setLabel(member.id)
                                .setEmoji("<:bounty:1291683164758212668>")
                                .setStyle(ButtonStyle.Secondary),
                        ); // Make the "Player" Buttons for team.
                    }
                }
            }
            break;
        default:
            sendEmbed = new EmbedBuilder()
                .setTitle("typescript-eslint")
                .setDescription(
                    "Only for eslint to stop barking at me, I think getting default is impossible. But who am I to say. If you're seeing this, come to me with a screenshot of how this happened.",
                ); // Need to confirm.
    }

    const response = await interaction.editReply({
        embeds: [sendEmbed],
        components: [Row],
    });
    // 40 seconds to get a reply, afterwards interaction fails.
    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 40_000,
        filter: (i) => i.user.id === interaction.user.id,
    });
    // All button interactions. Too bad I have to redo the for loop, maybe there's something better.
    collector.on("collect", async (i) => {
        if (i.customId === "sendtochat") {
            Row.components[0].setDisabled(true);
            await i.reply({
                embeds: [sendEmbed],
            });
            await interaction.editReply({
                components: [Row],
            });
            return;
        }
        const obj = await LiquidDB.get("teammember", query);
        const teamMem = <SquadPlayer[]> obj.result;
        for (const member of teamMem) {
            if (member.id.toLowerCase() === i.customId) {
                await i.reply({
                    embeds: [await e.searchPlayer(member.id)],
                    ephemeral: true,
                });
                return;
            }
        }
    });
    collector.on("end", async () => {
        for (const item of Row.components) {
            item.setDisabled(true);
        }
        await interaction.editReply({
            components: [Row],
        });
    });
}
