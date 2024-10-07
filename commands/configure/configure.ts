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
    )
    .addIntegerOption((option) =>
        option
            .setName("starting_balance")
            .setRequired(false)
            .setDescription("Starting balance for the user. Defaulted to 500.")
    )
    .addNumberOption((option) =>
        option
            .setName("mult")
            .setRequired(false)
            .setDescription(
                "Multiplier for every gain of balance from the bot. Defaulted to 1.5x "
            )
    );

/* 1. Set log channel for interactions.
   2. Set separator for /poll and /predict (among others)
   3. Initiate balance for user in the case you want a smaller number or a larger number based economy.
   That's it for now? I can't think of anything more. 
*/
export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) {
        throw new Error("How is this in not a server?");
    }
    
    let mult = interaction.options.getNumber("mult");
    let startBal = interaction.options.getInteger("starting_balance");
    const log = interaction.options.getChannel("log");
    const data = await readFile("config.json", "utf-8");
    const configData = JSON.parse(data);
    let separator = interaction.options.getString("separator");

    if (!separator) {
        separator = ";;";
    }
    if (!startBal) {
        startBal = 500;
    }
    if (!mult) {
        mult = 1.5;
    }

    const configObj = {
        log,
        separator,
        startBal,
        mult,
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
            {
                name: "Starting balance",
                value: `${startBal}`,
            },
        ]);
    await interaction.reply({
        embeds: [configEmbed],
    });
}
