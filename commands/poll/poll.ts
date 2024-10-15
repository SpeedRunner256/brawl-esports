import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Config } from "../../modules/config.ts";
import "jsr:@std/dotenv/load";
export const data = new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll.")
    .addStringOption((option) =>
        option
            .setName("question")
            .setDescription("Question of the poll here.")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("answers")
            .setRequired(true)
            .setDescription("Set your answers here, separated by ;")
    )
    .addStringOption((option) =>
        option
            .setName("emojis")
            .setRequired(true)
            .setDescription(
                "Add emojis, nth emoji is for the nth answer. Seperate by ;",
            )
    )
    .addIntegerOption((option) =>
        option
            .setName("time")
            .setDescription("Time in hours.")
            .setMinValue(1)
            .setMaxValue(768)
            .setRequired(true)
    )
    .addBooleanOption((option) =>
        option
            .setName("allow_multi_select")
            .setRequired(false)
            .setDescription(
                "Allow multi-select or not. Auto-selected as false.",
            )
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    const question = interaction.options.getString("question")?.trim();
    let multiSelect = interaction.options.getBoolean("allow_multi_select");

    const guildId = process.env.GUILD_ID;
    if (!guildId) {
        throw new Error("Can't find guild ID");
    }
    const separator = await Config.separator(guildId);
    const answers = interaction.options
        .getString("answers")
        ?.split(separator)
        .map((choice) => choice.trim());
    const emojis = interaction.options
        .getString("emojis")
        ?.split(separator)
        .map((emoji) => emoji.trim());
    const time = interaction.options.getInteger("time");
    // typescript :sob: "Object is possibly null aah"
    if (!question || !answers || !time || !emojis) {
        throw new Error("How did this happen?");
    }
    if (emojis.length != answers.length) {
        await interaction.reply({
            content: "The amount of emojis do not match the amount of answers.",
            ephemeral: true,
        });
    }
    if (!multiSelect) {
        multiSelect = false;
    }
    const answerObj = [];
    for (let i = 0; i < emojis.length; i++) {
        answerObj.push({
            text: answers[i],
            emoji: emojis[i],
        });
    }
    try {
        await interaction.reply({
            poll: {
                question: { text: question },
                answers: answerObj,
                duration: time,
                allowMultiselect: multiSelect,
            },
        });
    } catch {
        await interaction.reply({
            content:
                "Something went wrong. Here are a few ways you could have gone wrong.\n1.No emojis.\n2. Number of emojis dont match number of answers\n3. You forgot to add a semi colon somewhere.",
            ephemeral: true,
        });
    }
}
