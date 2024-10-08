import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "discord.js";
import { matchEmbedFields } from "../../embedBuilders/infoEmbeds/matchEmbeds";
import { MatchInfo } from "../../modules/eSportsInfo/match";
import { MapInfo } from "../../modules/inGameInfo/mapInfo";

export const data = new SlashCommandBuilder()
    .setName("match")
    .setDescription("IMPORTANT: look at help if haven't already.")
    .addStringOption((option) =>
        option
            .setName("page_name")
            .setDescription("Page link for the match")
            .setRequired(true),
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString("page_name");

    if (!query) {
        throw new Error("Can't find query.");
    }
    const matchObj = await MatchInfo.setMatch(query);

    // Menu for all the matches played on matchObj.matches[].
    const menuFields: StringSelectMenuOptionBuilder[] = [];

    let counter = 1;
    for (const match of matchObj.matches) {
        if (
            match.match2opponents[0].name == "TBD" ||
            match.match2opponents[1].name == "TBD"
        ) {
            continue;
        }
        const matchName = `${counter}. ${match.match2opponents[0].name} vs ${match.match2opponents[1].name}`;
        menuFields.push(
            new StringSelectMenuOptionBuilder()
                .setLabel(matchName)
                .setValue(`${counter - 1}`),
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
    const reply = await interaction.reply({
        content: `Match selection for ${matchObj.matches[0].tickername}`,
        components: [selectRow],
        ephemeral: true,
    });

    // Collect responses for Menu and Buttons
    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id,
        time: 40_000,
    });

    collector.on("collect", async (i) => {
        // Sending Match Embed.
        const gameNumber = +i.values[0];
        const match = matchObj.matches[gameNumber];
        const opp1 = match.match2opponents[0];
        const opp2 = match.match2opponents[1];
        try {
            const embed = new EmbedBuilder()
                .setTitle("Match Info")
                .setDescription(`Played  ${match.tickername}`)
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
                        } won with a score of **${opp1.score}**:**${
                            opp2.score
                        }**`,
                    },
                ]);

            // Buttons
            const MapButtons = new ActionRowBuilder<ButtonBuilder>();
            for (const game of match.match2games) {
                if (Object.entries(game.participants).length === 0) {
                    continue;
                }
                const map = game.map;
                const mapObj = await MapInfo.setMap(map);
                MapButtons.addComponents(
                    new ButtonBuilder()
                        .setURL(mapObj.link)
                        .setLabel(map)
                        .setStyle(ButtonStyle.Link),
                );
            }

            await i.reply({
                embeds: [embed],
                components: [MapButtons],
            });
        } catch (error) {
            await i.reply({
                content: `A fetching error has occured. One of the following things have happened:
                1. The bot is dead.\n2. More likely, the bot cannot read data from liquipedia.\n3. Most likely, the match was just not played/played _yet_. `,
                ephemeral: true,
            });
            console.log(error);
        }
    });
}
