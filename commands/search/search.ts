import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
} from "discord.js";
import { searchBrawler } from "../../embedBuilders/infoEmbeds/searchBrawler";
import { searchMap } from "../../embedBuilders/infoEmbeds/searchMap";
import { searchPlayer } from "../../embedBuilders/infoEmbeds/searchPlayer";
import { searchTeam, searchTeamPlayers } from "../../embedBuilders/infoEmbeds/searchTeam";

// command declaration
export const data = new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search a query!")
    .addStringOption((option) =>
        option
            .setName("type")
            .setDescription("Type of the query")
            .setRequired(true)
            .addChoices([
                { name: "Brawler", value: "brawler" },
                { name: "Map", value: "map" },
                { name: "Player", value: "player" },
                { name: "Team", value: "team" },
            ])
    )
    .addStringOption((option) =>
        option.setName("query").setDescription("The query").setRequired(true)
    );
// command execution
export async function execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString("query");

    let sendEmbed: EmbedBuilder; // Embed to send in this interaction.reply

    const sendToChatButton = new ButtonBuilder()
        .setCustomId("sendtochat")
        .setLabel("Send to chat!")
        .setStyle(ButtonStyle.Primary);
    const Row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        sendToChatButton
    ); // Row to send in this interaction.reply
    if (!query) {
        return;
    } //eslint :p

    switch (interaction.options.getString("type")) {
        case "brawler":
            sendEmbed = await searchBrawler(query);
            break;
        case "map":
            sendEmbed = await searchMap(query);
            break;
        case "player":
            sendEmbed = await searchPlayer(query);
            break;
        case "team":
            sendEmbed = await searchTeam(query);
            for (const member of await searchTeamPlayers(query)) {
                Row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(member.toLowerCase())
                        .setLabel(member)
                        .setStyle(ButtonStyle.Secondary)
                ); // Make the "Player" Buttons for team.
            }

            break;
        default:
            sendEmbed = new EmbedBuilder()
                .setTitle("typescript-eslint")
                .setDescription(
                    "Only for eslint to stop barking at me, I think getting default is impossible. But who am I to say. If you're seeing this, come to me with a screenshot of how this happened."
                ); // Need to confirm.
    }

    const response = await interaction.reply({
        embeds: [sendEmbed],
        components: [Row],
        ephemeral: true,
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
            await i.reply({
                embeds: [sendEmbed],
            });
            return;
        }
        for (const member of await searchTeamPlayers(query)) {
            if (member.toLowerCase() === i.customId) {
                await i.reply({
                    embeds: [await searchPlayer(member)],
                    ephemeral: true,
                });
                return;
            }
        }
    });
}
