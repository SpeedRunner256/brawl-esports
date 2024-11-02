import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
    StringSelectMenuOptionBuilder,
} from "discord.js";
import { StringSelectMenuBuilder } from "discord.js";
import { LiquidDB } from "../../modules/api.ts";
import type { Match } from "../../modules/moduleTypes.ts";
import { matchEmbedFields } from "../../modules/embeds.ts";

export const data = new SlashCommandBuilder()
    .setName("match")
    .setDescription("IMPORTANT: look at help if haven't already.")
    .addStringOption((option) =>
        option
            .setName("pagename")
            .setDescription("Page link for the match")
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const query = interaction.options.getString("pagename", true);
    const obj = await LiquidDB.get("match", query);
    const matchArray = <Match[]> obj.result;
    let matchNumber = 0;
    let gameNumber = 0; // My plans are measured in centuries motherfucker
    // Match Selection
    const matchSelectMenuFields: StringSelectMenuOptionBuilder[] = [];
    let matchMenuCounter = 1;
    for (const match of matchArray) {
        if (
            match.match2opponents[0].name == "TBD" ||
            match.match2opponents[1].name == "TBD"
        ) {
            continue; // match not played 
        }
        const matchName = `${matchMenuCounter}. ${
            match.match2opponents[0].name
        } vs ${match.match2opponents[1].name}`;
        matchSelectMenuFields.push(
            new StringSelectMenuOptionBuilder()
                .setLabel(matchName)
                .setValue(`${matchMenuCounter - 1}`),
        );
        matchMenuCounter += 1;
    }
    const selectMatch = new StringSelectMenuBuilder()
        .setCustomId("matchselect")
        .setPlaceholder("What match to show?")
        .addOptions(matchSelectMenuFields);
    const matchSelectionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            selectMatch,
        );
    const reply = await interaction.editReply({
        content: `Select the match to show for ${matchArray[0].tickername}`,
        components: [matchSelectionRow],
    });
    // Navigation buttons - to be used in relation with matchNagivationCounter
    const previous = new ButtonBuilder()
        .setCustomId("previous")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary);
    const home = new ButtonBuilder()
        .setCustomId("home")
        .setLabel("Home")
        .setStyle(ButtonStyle.Primary);
    const next = new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Secondary);
    const navigationRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        previous,
        home,
        next,
    );
    // Interactions for the match selection componenet
    const matchSelectCollector = reply.createMessageComponentCollector({
        time: 40_000,
        filter: (i) => i.user.id === interaction.user.id,
        componentType: ComponentType.StringSelect,
    });
    matchSelectCollector.on("collect", async (i) => {
        matchNumber = +i.values[0];
        const match = matchArray[matchNumber];
        const opp1 = match.match2opponents[0];
        const opp2 = match.match2opponents[1];
        try {
            const embed = new EmbedBuilder()
                .setTitle("Match Info")
                .setDescription(`Played at ${match.tickername}`)
                .setColor(0xd2eb34)
                .setThumbnail(match.icondarkurl)
                .addFields([
                    {
                        name:
                            "<:duels:1291683169569083392> Opponents <:duels:1291683169569083392>",
                        value: `1. **${opp1.name}**: ${
                            opp1.match2players[0].displayname
                        }, ${opp1.match2players[1].displayname}, ${
                            opp1.match2players[2].displayname
                        }\n2. **${opp2.name}**: ${
                            opp2.match2players[0].displayname
                        }, ${opp2.match2players[1].displayname}, ${
                            opp2.match2players[2].displayname
                        }`,
                    },
                    matchEmbedFields(matchArray, matchNumber, gameNumber),
                ]);
            await i.reply({
                content: "Edited embed.",
                ephemeral: true,
            });
            await interaction.editReply({
                content: "Updating...",
                embeds: [embed],
                components: [navigationRow],
            });
        } catch {
            console.log("Error in match.ts");
        }
    });
    const navigationButtonCollector = reply.createMessageComponentCollector({
        time: 40_000,
        filter: (i) => i.user.id === interaction.user.id,
        componentType: ComponentType.Button,
    });
    navigationButtonCollector.on("collect", async (i) => {
        const oldGameNumber = gameNumber;
        if (matchArray[matchNumber].match2games.length == 0) {
            await i.reply({
                content:
                    "Games are NOT logged for this set, the buttons do nothing at all.",
                ephemeral: true,
            });
            return;
        }
        if (i.customId == "previous") {
            if (gameNumber == 0) {
                await i.reply({
                    content: "You're already at zero.",
                    ephemeral: true,
                });
                return;
            }
            gameNumber -= 1;
        }
        if (i.customId == "next") {
            if (gameNumber == 4) {
                await interaction.reply({
                    content: "You're already at the last game.",
                    ephemeral: true,
                });
                return;
            }
            gameNumber += 1;
        }
        if (i.customId == "home") {
            gameNumber = 0;
        }
        if (
            matchArray[matchNumber].match2games[gameNumber].resulttype == "np"
        ) {
            gameNumber = oldGameNumber;
            await i.reply({
                content:
                    "Navigation button warning -> the match asked does not exist.",
                ephemeral: true,
            });
            return;
        }
        await i.reply({
            content: `Game changed to number ${gameNumber + 1}.`,
            ephemeral: true,
        });
        const opp1 = matchArray[matchNumber].match2opponents[0];
        const opp2 = matchArray[matchNumber].match2opponents[1];
        const newEmbed = new EmbedBuilder()
            .setTitle("Match Info")
            .setDescription(`Played at ${matchArray[0].tickername}`)
            .setColor(0xd2eb34)
            .setThumbnail(matchArray[0].icondarkurl)
            .addFields([
                {
                    name:
                        "<:duels:1291683169569083392> Opponents <:duels:1291683169569083392>",
                    value: `1. **${opp1.name}**: ${
                        opp1.match2players[0].displayname
                    }, ${opp1.match2players[1].displayname}, ${
                        opp1.match2players[2].displayname
                    }\n2. **${opp2.name}**: ${
                        opp2.match2players[0].displayname
                    }, ${opp2.match2players[1].displayname}, ${
                        opp2.match2players[2].displayname
                    }`,
                },
                matchEmbedFields(matchArray, matchNumber, gameNumber),
            ]);
        await interaction.editReply({
            content: "Navigation buttons clicked, updating.",
            embeds: [newEmbed],
        });
    });
}
