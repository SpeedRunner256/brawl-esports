import {
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
    StringSelectMenuOptionBuilder,
} from "discord.js";
import { sortByBrawler } from "./sortBrawler";
import { sortByTeam } from "./sortTeam";
import { sortByPlayer } from "./sortPlayer";
import type { Match } from "../../modules/moduleTypes";
import { findPrintableName } from "../../modules/eSportsInfo/findPage";
import { StringSelectMenuBuilder } from "discord.js";
import { ActionRowBuilder } from "discord.js";
import { DatabaseMatch } from "../../database/DatabaseMatch";
import { Colors } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("sortby")
    .setDescription("Get top 20 results for a sort query.")
    .addSubcommand((input) =>
        input
            .setName("brawler")
            .setDescription("Last 20 matches this brawler was played in.")
            .addStringOption((input) =>
                input
                    .setName("name")
                    .setDescription("Name of the brawler")
                    .setRequired(true),
            ),
    )
    .addSubcommand((input) =>
        input
            .setName("team")
            .setDescription("Last 20 matches this team was in.")
            .addStringOption((input) =>
                input
                    .setName("name")
                    .setDescription("Name of the team")
                    .setRequired(true),
            ),
    )
    .addSubcommand((input) =>
        input
            .setName("player")
            .setDescription("Last 20 matches this player was in.")
            .addStringOption((input) =>
                input
                    .setName("name")
                    .setDescription("Name of the player")
                    .setRequired(true),
            ),
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    const query = interaction.options.getString("name");
    if (!query) {
        throw new Error("Name not found.");
    }
    // Get the <=10 matches
    const name = await findPrintableName(query);
    let matches: Match[] = [];
    switch (sub) {
        case "brawler":
            matches = await sortByBrawler(name);
            break;
        case "team":
            matches = await sortByTeam(name);
            break;
        case "player":
            matches = await sortByPlayer(name);
            break;
    }
    // Check if result is zero. (brawler/team/player doesn't exist)
    if (matches.length == 0) {
        await interaction.reply({
            content: "No results found.",
            ephemeral: true,
        });
        return;
    }
    // Make it a StringSelectMenu
    const matchSelectMenuFields: StringSelectMenuOptionBuilder[] = [];
    let matchMenuCounter = 1;
    let matchNumber = "";
    let gameNumber = 0;
    for (const match of matches) {
        const matchName = `${matchMenuCounter}. ${match.match2opponents[0].name} vs ${match.match2opponents[1].name}`;
        matchSelectMenuFields.push(
            new StringSelectMenuOptionBuilder()
                .setLabel(matchName)
                .setValue(`${matchMenuCounter} ${match.objectname}`),
        );
        matchMenuCounter += 1;
    }
    if (matchSelectMenuFields.length == 0) {
        await interaction.reply({
            content:
                "One of the following things happened.\n1. Your query has a spelling error\n2. The bot can't find this data in the database.\n * If you think its number 2 and you know it exists, please contact the owners.",
            ephemeral: true,
        });
    }
    // Create the StringSelectMenu
    const matchSelector = new StringSelectMenuBuilder()
        .setCustomId("matchselect")
        .setPlaceholder("Select any one")
        .setOptions(matchSelectMenuFields);
    const matchSelectRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            matchSelector,
        );
    const reply = await interaction.reply({
        content: `Found ${matches.length} results.`,
        components: [matchSelectRow],
        ephemeral: true,
    });
    // Make navigation buttons
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
    // Interaction StringSelect
    const collector = reply.createMessageComponentCollector({
        time: 40_000,
        componentType: ComponentType.StringSelect,
    });
    collector.on("collect", async (i) => {
        matchNumber = i.values[0];
        const db = new DatabaseMatch();
        const match = (
            await db.getMatch(null, null, matchNumber.split(" ")[1])
        )[0];
        const game = match.match2games[gameNumber];
        const opp1 = match.match2opponents[0];
        const opp2 = match.match2opponents[1];
        const embed = new EmbedBuilder()
            .setTitle("Match Info")
            .setColor(Colors.DarkVividPink)
            .setThumbnail(match.icondarkurl)
            .addFields([
                {
                    name: "<:duels:1291683169569083392> Opponents <:duels:1291683169569083392>",
                    value: `1. **${opp1.name}**: ${opp1.match2players[0].displayname}, ${opp1.match2players[1].displayname}, ${opp1.match2players[2].displayname}\n2. **${opp2.name}**: ${opp2.match2players[0].displayname}, ${opp2.match2players[1].displayname}, ${opp2.match2players[2].displayname}`,
                },
                {
                    name: `<:combat:1292086786872442973> Game ${gameNumber + 1}`,
                    value: `<:bs_map:1291686752569921546> **Played On** ${game.map}\n<:score:1291686732621676605> **Game Score**: ${game.scores[0]}:${game.scores[1]} - **${match.match2opponents[game.winner - 1].name}** won\n<:brawlers:1291686735906078861> **Picks**\n1. **${game.participants["1_1"].brawler}**, **${game.participants["1_2"].brawler}**, **${game.participants["1_3"].brawler}**\n2. **${game.participants["2_1"].brawler}**, **${game.participants["2_2"].brawler}**, **${game.participants["2_3"].brawler}**\n<:bans:1291686740486131772> **Bans**: ${getBanList(game.extradata)}`,
                },
            ]);
        await interaction.editReply({
            embeds: [embed],
            components: [navigationRow, matchSelectRow],
        });
        await i.reply({
            content: "Embed added.",
            ephemeral: true,
        });
    });
    // Button interaction collector
    const buttonCollect = reply.createMessageComponentCollector({
        time: 40_000,
    });
    buttonCollect.on("collect", async (i) => {
        const oldGameNumber = gameNumber;
        if (i.customId === "previous") {
            if (gameNumber == 0) {
                await i.reply({
                    content: "You're already on the first game.",
                    ephemeral: true,
                });
                return;
            }
            gameNumber -= 1;
        }
        if (i.customId === "next") {
            if (gameNumber == 4) {
                await i.reply({
                    content: "You're already on the last game.",
                    ephemeral: true,
                });
                return;
            }
            gameNumber += 1;
        }
        if (i.customId === "home") {
            gameNumber = 0;
        }

        const db = new DatabaseMatch();
        const match = (
            await db.getMatch(null, null, matchNumber.split(" ")[1])
        )[0];
        // if game info not complete, then dont do it.
        if (Object.entries(match.match2games[gameNumber].scores).length == 0) {
            gameNumber = oldGameNumber;
            await i.reply({
                content:
                    "Navigation button warning -> the match asked does not exist.",
                ephemeral: true,
            });
            return;
        }
        const game = match.match2games[gameNumber];
        const opp1 = match.match2opponents[0];
        const opp2 = match.match2opponents[1];
        const embed = new EmbedBuilder()
            .setTitle("Match Info")
            .setColor(Colors.DarkVividPink)
            .setThumbnail(match.icondarkurl)
            .addFields([
                {
                    name: "<:duels:1291683169569083392> Opponents <:duels:1291683169569083392>",
                    value: `1. **${opp1.name}**: ${opp1.match2players[0].displayname}, ${opp1.match2players[1].displayname}, ${opp1.match2players[2].displayname}\n2. **${opp2.name}**: ${opp2.match2players[0].displayname}, ${opp2.match2players[1].displayname}, ${opp2.match2players[2].displayname}`,
                },
                {
                    name: `<:combat:1292086786872442973> Game ${gameNumber + 1}`,
                    value: `<:bs_map:1291686752569921546> **Played On** ${game.map}\n<:score:1291686732621676605> **Game Score**: ${game.scores[0]}:${game.scores[1]} - **${match.match2opponents[game.winner - 1].name}** won\n<:brawlers:1291686735906078861> **Picks**\n1. **${game.participants["1_1"].brawler}**, **${game.participants["1_2"].brawler}**, **${game.participants["1_3"].brawler}**\n2. **${game.participants["2_1"].brawler}**, **${game.participants["2_2"].brawler}**, **${game.participants["2_3"].brawler}**\n<:bans:1291686740486131772> **Bans**: ${getBanList(game.extradata)}`,
                },
            ]);
        await interaction.editReply({
            embeds: [embed],
        });
    });
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getBanList(data: any): string {
    const team1Bans = Object.values(data.bans.team1);
    const team2Bans = Object.values(data.bans.team2);
    const uniqueBans = [...new Set([...team2Bans, ...team1Bans])];
    return uniqueBans.join(", ");
}
