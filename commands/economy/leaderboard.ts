import {
    ButtonStyle,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    ActionRowBuilder,
    ComponentType,
    ButtonInteraction,
} from "discord.js";
import { Economy } from "../../modules/economy/economy";
import type { User } from "../../modules/moduleTypes";
import { ButtonBuilder, EmbedBuilder } from "@discordjs/builders";

export const data = new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("See the leaderboard for this server");

export async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guildId;
    if (!guild) {
        await interaction.reply({
            content: "You are not in a server",
            ephemeral: true,
        });
        return;
    }
    const data = sortByBalance(await Economy.getData());
    displayLeaderboard(interaction, data);
}
function sortByBalance(data: User[]) {
    const entries = Object.entries(data);
    entries.sort(([, a], [, b]) => b.balance - a.balance);
    const sortedData = Object.fromEntries(entries);
    return sortedData;
}
async function displayLeaderboard(
    interaction: ChatInputCommandInteraction,
    leaderboardData: object,
) {
    // Convert object to array and sort by balance
    const sortedUsers = Object.entries(leaderboardData)
        .map(([userid, data]) => ({
            userid,
            ...data,
        }))
        .sort((a, b) => b.balance - a.balance);

    const itemsPerPage = 10;
    let currentPage = 0;
    const maxPages = Math.ceil(sortedUsers.length / itemsPerPage);

    // Create pagination buttons
    const createButtons = (disabled: boolean = false) => {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId("start")
                .setLabel("⏮️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled || currentPage === 0),
            new ButtonBuilder()
                .setCustomId("prev")
                .setLabel("◀️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled || currentPage === 0),
            new ButtonBuilder()
                .setCustomId("next")
                .setLabel("▶️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled || currentPage === maxPages - 1),
            new ButtonBuilder()
                .setCustomId("end")
                .setLabel("⏭️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled || currentPage === maxPages - 1),
        );
    };

    // Create embed for current page
    const createEmbed = () => {
        const start = currentPage * itemsPerPage;
        const end = Math.min(start + itemsPerPage, sortedUsers.length);
        const pageUsers = sortedUsers.slice(start, end);

        const embed = new EmbedBuilder()
            .setTitle("💰 Balance Leaderboard")
            .setColor(0xffd700)
            .setFooter({ text: `Page ${currentPage + 1}/${maxPages}` });

        const description = pageUsers
            .map((user, index) => {
                const position = start + index + 1;
                const medal =
                    position === 1
                        ? "🥇"
                        : position === 2
                          ? "🥈"
                          : position === 3
                            ? "🥉"
                            : "▫️";
                return `${medal} **${position}.** ${user.username}: ${user.balance.toLocaleString()} kash`;
            })
            .join("\n");

        embed.setDescription(description);
        return embed;
    };

    // Send initial message
    const response = await interaction.reply({
        embeds: [createEmbed()],
        components: [createButtons()],
        fetchReply: true,
    });

    // Create button collector
    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 5 * 60 * 1000, // 5 minutes
    });

    collector.on("collect", async (i: ButtonInteraction) => {
        // Update current page based on button pressed
        switch (i.customId) {
            case "start":
                currentPage = 0;
                break;
            case "prev":
                currentPage = Math.max(0, currentPage - 1);
                break;
            case "next":
                currentPage = Math.min(maxPages - 1, currentPage + 1);
                break;
            case "end":
                currentPage = maxPages - 1;
                break;
        }

        // Update message with new page
        await i.update({
            embeds: [createEmbed()],
            components: [createButtons()],
        });
    });

    collector.on("end", async () => {
        // Disable all buttons when collector expires
        try {
            await response.edit({
                components: [createButtons(true)],
            });
        } catch (error) {
            console.error("Failed to disable buttons:", error);
        }
    });
}
