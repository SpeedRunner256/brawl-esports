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
import { Economy } from "../../modules/economy/economy";

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
    const predictionNumber = (Date.now() / 1000).toString().split(".")[0];
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
        const user = await Economy.UserByID(i.user.id);
        if (!user) {
            await i.reply({
                content: "You are not registered. Type /start.",
                ephemeral: true,
            });
            return;
        }
        if (i.customId === "choice1") {
            if (user.balance < 100) {
                await i.reply({
                    content: "You cannot vote - you do not enough kash.",
                    ephemeral: true,
                });
                return;
            }
            user.debit(100);
            await i.reply({
                content: `Predicted **${choice1} for 100 kash.`,
                ephemeral: true,
            });
            return;
        } else if (i.customId === "choice2") {
            if (user.balance < 100) {
                await i.reply({
                    content: "You cannot vote - you do not enough kash.",
                    ephemeral: true,
                });
                return;
            }
            user.debit(100);
            await i.reply({
                content: `Predicted **${choice2}** for 100 kash.`,
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
        await interaction.followUp({
            content: `/result for result. Your prediction number is \`\`${predictionNumber}\`\``,
            ephemeral: true,
        });
    });
}
