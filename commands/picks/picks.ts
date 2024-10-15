import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { getGamemodePicks } from "./gamemodePicks.ts";
import { getMapPicks } from "./mapPicks.ts";
import { findPrintableName } from "../../modules/eSportsInfo/findPage.ts";
import {
    makeFields,
    makeGamemodeEmbed,
    makeGamemodeEmbedNerdy,
    makeMapEmbed,
    makeMapEmbedNerdy,
} from "./picksEmbed.ts";

export const data = new SlashCommandBuilder()
    .setName("picks")
    .setDescription("Top competitive picks")
    .addSubcommand((input) =>
        input
            .setName("map")
            .setDescription("Top picks for a given map")
            .addStringOption((input) =>
                input
                    .setName("name")
                    .setDescription("Name of the map")
                    .setRequired(true)
            )
    )
    .addSubcommand((input) =>
        input
            .setName("gamemode")
            .setDescription("Top picks for a given gamemode")
            .addStringOption((input) =>
                input
                    .setName("name")
                    .setDescription("Name of the gamemode")
                    .setRequired(true)
                    .setChoices([
                        {
                            name: "Gem Grab",
                            value: "Gem Grab",
                        },
                        {
                            name: "Brawl Ball",
                            value: "Brawl Ball",
                        },
                        {
                            name: "Bounty",
                            value: "Bounty",
                        },
                        {
                            name: "Heist",
                            value: "Heist",
                        },
                        {
                            name: "Hot Zone",
                            value: "Hot Zone",
                        },
                        {
                            name: "Knockout",
                            value: "Knockout",
                        },
                    ])
            )
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const reply = await interaction.deferReply({
        ephemeral: true,
    });
    const command = interaction.options.getSubcommand();
    const givenName = interaction.options.getString("name");
    if (!givenName) {
        throw new Error("picks - no name given");
    }
    const name = await findPrintableName(givenName);
    if (!name) {
        await interaction.reply({
            content:
                "Map not found. Possible causes:\n1. Map not in databse\n2. Map not played in tournament before\n3. Spelly error\n4. Map does not exist.",
            ephemeral: true,
        });
        return;
    }
    let stats: string[] = [];
    switch (command) {
        case "map":
            stats = await getMapPicks(name);
            break;
        case "gamemode":
            stats = await getGamemodePicks(name);
            break;
    }
    // Computation for stats
    const total = stats.length;
    const occurance = countOccurrences(stats);
    const field = makeFields(occurance, total);
    if (field.length == 0) {
        await interaction.reply("Map not found/wrong name");
    }
    let embed = new EmbedBuilder()
        .setTitle("404 - Not Found")
        .setDescription("Just doesn't exist yet :-(");
    switch (command) {
        case "gamemode":
            embed = await makeGamemodeEmbed(occurance, name, total);
            break;
        case "map":
            embed = await makeMapEmbed(occurance, name, total);
            break;
    }
    // Stats for nerds button
    const nerdButt = new ButtonBuilder()
        .setCustomId("nerd")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("Percentages");
    const nerdRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        nerdButt,
    );
    await interaction.editReply({
        embeds: [embed],
        components: [nerdRow],
    });
    // Nerd button interaction
    const nerdCollector = reply.createMessageComponentCollector({
        time: 40_000,
        componentType: ComponentType.Button,
    });
    nerdCollector.on("end", async () => {
        nerdRow.components[0].setDisabled(true);
        await interaction.editReply({
            embeds: [embed],
            components: [nerdRow],
        });
    });
    nerdCollector.on("collect", async (i) => {
        await i.deferReply({
            ephemeral: true,
        });
        switch (command) {
            case "map":
                embed = await makeMapEmbedNerdy(occurance, field, name, total);
                break;
            case "gamemode":
                embed = await makeGamemodeEmbedNerdy(
                    occurance,
                    field,
                    name,
                    total,
                );
                break;
        }
        await interaction.editReply({
            embeds: [embed],
        });
        await i.editReply(
            "Now shows complete percentage info for top 15 brawlers.",
        );
    });
}
export function countOccurrences(arr: string[]): { [key: string]: number } {
    // First count occurrences
    const counts = arr.reduce(
        (acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
        },
        {} as { [key: string]: number },
    );

    // Convert to entries, sort, and convert back to object
    return Object.fromEntries(
        Object.entries(counts).sort(([, a], [, b]) => b - a),
    );
}
