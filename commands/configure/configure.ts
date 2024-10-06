import { EmbedBuilder } from "@discordjs/builders";
import {
    ChannelType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from "discord.js";
import { readFile, writeFile } from "fs/promises";
export const data = new SlashCommandBuilder()
    .setName("configure")
    .setDescription(
        "Follow the steps and configure/re-configure the bot for your server"
    )
    .addChannelOption((option) =>
        option
            .addChannelTypes(ChannelType.GuildText)
            .setName("log")
            .setDescription("Enter your log channel.")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("separator")
            .setRequired(false)
            .setDescription(
                "Add a separator for the entirety of the bot. Defaulted to ';;'"
            )
    );

/* 1. Set log channel for interactions.
   That's it for now? I can't think of anything more. 
*/
export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) {
        throw new Error("How is this in not a server?");
    }
    const log = interaction.options.getChannel("log");
    const data = await readFile("config.json", "utf-8");
    const configData = JSON.parse(data);
    let separator = interaction.options.getString("separator");
    if (!separator) {
        separator = ";;";
    }
    const configObj = {
        log,
        separator,
    };
    configData[interaction.guildId] = configObj;
    writeFile("config.json", JSON.stringify(configData, null, "    "));

    const configEmbed = new EmbedBuilder()
        .setTitle("Success!")
        .setDescription("This interaction resulted in a good time.")
        .setColor(0x44db90)
        .addFields([
            {
                name: "Server",
                value: `${interaction.guildId}`,
            },
            {
                name: "Log Channel",
                value: `${configObj.log}`,
            },
        ]);
    await interaction.reply({
        embeds: [configEmbed],
    });
}
