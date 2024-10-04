import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    Message,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "discord.js";
import { MatchInfo } from "../../modules/eSportsInfo/match";
import { matchEmbedFields } from "../../embedBuilders/infoEmbeds/matchEmbeds";

export const data = new SlashCommandBuilder()
    .setName("match")
    .setDescription("IMPORTANT: look at help if haven't already.")
    .addStringOption((option) =>
        option
            .setName("page_name")
            .setDescription("Page link for the match")
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString("page_name");
    if (!query) {
        await interaction.reply({
            content:
                "This actually cannot happen and im just using this to stop typescript-eslint from barking at me.",
        }); // Need more info.
        throw new Error("Can't find query.");
    }
    const matchObj = await MatchInfo.setMatch(query);
    // Menu for all the matches played on matchObj.matches[].
    const menuFields: StringSelectMenuOptionBuilder[] = [];
    let counter = 1;
    for (const match of matchObj.matches) {
        const matchName = `${counter}. ${match.match2opponents[0].name} vs ${match.match2opponents[1].name}`;
        menuFields.push(
            new StringSelectMenuOptionBuilder()
                .setLabel(matchName)
                .setValue(`${counter - 1}`)
        );
        counter += 1;
    }
    // Making the menu.
    const select = new StringSelectMenuBuilder()
        .setCustomId("matchselect")
        .addOptions(menuFields)
        .setPlaceholder("Select match here.");
    const selectRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    // Send menu.
    const reply = (await interaction.reply({
        content: `Match selection for ${matchObj.matches[0].tickername}`,
        components: [selectRow],
        ephemeral: true,
        fetchReply: true,
    })) as Message;
    // Collect responses for Menu and Buttons (buttons currently WIP)
    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id,
        time: 40_000,
    });
    collector.on("collect", async (i) => {
        // Sending Match Embed. Map embed handling is done ahead.
        const gameNumber = +i.values[0];
        const match = matchObj.matches[gameNumber];
        const opp1 = match.match2opponents[0];
        const opp2 = match.match2opponents[1];
        const embed = new EmbedBuilder()
            .setDescription(`Played on ${match.tickername}`)
            .setColor(0xd2eb34)
            .setThumbnail(match.icondarkurl)
            .addFields([
                {
                    name: "<:duels:1291683169569083392> Opponents <:duels:1291683169569083392>",
                    value: `1. **${opp1.name}**: ${opp1.match2players[0].displayname}, ${opp1.match2players[1].displayname}, ${opp1.match2players[2].displayname}\n2. **${opp2.name}**: ${opp2.match2players[0].displayname}, ${opp2.match2players[1].displayname}, ${opp2.match2players[2].displayname}`,
                },
                ...matchEmbedFields(match),
                {
                    name: "<:winner:1291683177605369906> Winner <:winner:1291683177605369906> ",
                    value: `${
                        match.match2opponents[match.winner - 1].name
                    } won with a score of **${opp1.score}**:**${opp2.score}**`,
                },
            ]);
        // Button WIP, will do perhaps tomorrow.
        const MapButtons = new ActionRowBuilder<ButtonBuilder>();
        for (const game of match.match2games) {
            if (Object.entries(game.participants).length === 0) {
                continue;
            }
            const map = game.map;
            MapButtons.addComponents(
                new ButtonBuilder()
                    .setCustomId(map.toLowerCase())
                    .setLabel(map)
                    .setStyle(ButtonStyle.Secondary)
            );
        }
        await i.reply({
            embeds: [embed],
            components: [MapButtons],
        });
    });
}
