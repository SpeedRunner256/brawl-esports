import {
    ChatInputCommandInteraction,
    Colors,
    SlashCommandBuilder,
} from "discord.js";
import { Economy } from "../../modules/economy/economy";
import type { User } from "../../modules/moduleTypes";
import { EmbedBuilder } from "@discordjs/builders";

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
    let answer = "";
    let counter = 1;
    for (const user of Object.keys(data)) {
        answer += `${counter}. ${data[user].username}: ${data[user].balance}\n`;
        if (counter == 10) {
            break;
        }
        counter += 1;
    }
    const embed = new EmbedBuilder()
        .setTitle("Leaderboard")
        .setColor(Colors.Navy)
        .setTimestamp()
        .setDescription(`\`\`\`${answer}\`\`\``);
    await interaction.reply({
        embeds: [embed],
    });
}
function sortByBalance(data: User[]) {
    // Convert the object into an array of entries (key-value pairs)
    const entries = Object.entries(data);

    // Sort the entries by balance in descending order
    entries.sort(([, a], [, b]) => b.balance - a.balance);

    // Convert the sorted entries back into an object
    const sortedData = Object.fromEntries(entries);

    return sortedData;
}
