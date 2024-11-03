import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Economy } from "../../lib/economy.ts";
import { EmbedBuilder } from "@discordjs/builders";
export const data = new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start your account");

export async function execute(interaction: ChatInputCommandInteraction) {
    const username = interaction.user.displayName;
    const userID = interaction.user.id;
    const guildID = interaction.guildId;
    if (!guildID) {
        throw new Error("Not used in a guild.");
    }
    if (await Economy.userExist(userID)) {
        await interaction.reply({
            content: "You are already registered in our database.",
            ephemeral: true,
        });
        return;
    }
    const ecoUser = await Economy.initUser(username, userID, guildID);

    const embed = new EmbedBuilder()
        .setTitle("Player successfully registered!")
        .setDescription(
            "Your data has been added to the database. Have fun playing!",
        )
        .setColor(0x34eb7d)
        .setThumbnail(interaction.user.avatarURL())
        .addFields([
            {
                name: "Username",
                value: ecoUser.username,
                inline: true,
            },
            {
                name: "Balance",
                value: `${ecoUser.balance} Kash`,
                inline: true,
            },
            {
                name: "\u200b",
                value: "\u200b",
                inline: true,
            },
        ])
        .setFooter({ text: "Now we wait for predictions :p" });

    await interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });
}
