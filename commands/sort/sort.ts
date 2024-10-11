import {
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
    const reply = interaction.reply({
        content: `Found ${matches.length} results.`,
        components: [matchSelectRow],
        ephemeral: true,
    });
    const collector = (await reply).createMessageComponentCollector({
        time: 40_000,
        componentType: ComponentType.StringSelect,
    });
    collector.on("collect", async (i) => {
        const objname = i.values[0];
        const db = new DatabaseMatch();
        const match = (await db.getMatch(null, null, objname.split(" ")[1]))[0];
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
            ]);
        await i.reply({
            embeds: [embed],
            ephemeral: true,
        });
    });
}
