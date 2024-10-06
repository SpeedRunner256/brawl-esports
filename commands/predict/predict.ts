import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    SlashCommandBuilder,
} from "discord.js";
import { predictCreateInitial } from "../../embedBuilders/predictEmbeds/predictInitial";
import { stringUtils } from "../../utilities/stringUtils";
import { predictEndEmbed } from "../../embedBuilders/predictEmbeds/predictEnd";

export const data = new SlashCommandBuilder()
    .setName("prediction")
    .setDescription("Startup a prediction")
    .addStringOption((option) =>
        option
            .setName("question")
            .setDescription("The title of the prediction")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("choice1")
            .setDescription("Enter choice 1 here.")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("choice2")
            .setDescription("Enter choice 2 here.")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("time")
            .setDescription("Set the time in 1d2h3m4s format")
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const question = interaction.options.getString("question")?.trim();
    const choice1 = interaction.options.getString("choice1")?.trim();
    const choice2 = interaction.options.getString("choice2")?.trim();
    const time = interaction.options.getString("time")?.trim();
    // eslint aah
    if (!question || !choice1 || !choice2 || !time) {
        throw new Error("How does this even happen?");
    }
    //create embed
    const initialEmbed = predictCreateInitial(question, choice1, choice2, time);

    const choiceRow = new ActionRowBuilder<ButtonBuilder>();

    const button1 = new ButtonBuilder()
        .setCustomId("choice1")
        .setStyle(ButtonStyle.Primary)
        .setLabel(choice1);
    const button2 = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId("choice2")
        .setLabel(choice2);

    choiceRow.addComponents(...[button1, button2]);
    const reply = await interaction.reply({
        embeds: [initialEmbed],
        components: [choiceRow],
    });

    const collector = reply.createMessageComponentCollector({
        time: stringUtils.duration(time),
        componentType: ComponentType.Button,
    });
    collector.on("collect", async (i) => {
        if (i.customId === "choice1") {
            await i.reply({
                content: `You have predicted choice 1 - ${choice1}.\nPlease wait for the event organizer to enter the answer.`,
                ephemeral: true,
            });
            return;
        } else if (i.customId === "choice2") {
            await i.reply({
                content: `You have predicted choice 2 - ${choice2}.\n Please wait for the event orgaizer to enter the answer.`,
                ephemeral: true,
            });
        }
    });
    collector.on("end", async () => {
        choiceRow.components[0].setDisabled(true);
        choiceRow.components[1].setDisabled(true);
        const endEmbed = predictEndEmbed(question, time);
        await interaction.editReply({
            embeds: [endEmbed],
            components: [choiceRow],
        });
    });
}
