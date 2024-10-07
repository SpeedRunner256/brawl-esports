import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { readFile, writeFile } from "fs/promises";
import { Config } from "../../modules/config";
export const data = new SlashCommandBuilder()
    .setName("result")
    .setDescription("Result of a prediction given a prediction number.")
    .addIntegerOption((option) =>
        option
            .setName("prediction_number")
            .setDescription("Enter the prediction number you received here.")
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName("answer")
            .setDescription("The answer of the prediction.")
            .setChoices([
                { name: "Choice 1", value: 1 },
                { name: "Choice 2", value: 2 },
            ])
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    const predictionNumber =
        interaction.options.getInteger("prediction_number");
    const answer = interaction.options.getInteger("answer");
    const data = JSON.parse(await readFile("db/prediction.json", "utf8"));
    let predict;
    let found = false;
    for (const prediction of Object.keys(data)) {
        if (`${predictionNumber}` == prediction) {
            if (data[prediction].answer.hasAnswered) {
                await interaction.reply({
                    content: `This prediction has already been answered choice ${data[prediction].answer.answer}.`,
                    ephemeral: true,
                });
                return;
            }
            predict = data[prediction];
            predict.answer = { hasAnswered: true, answer };
            data[prediction] = predict;
            writeFile("db/prediction.json", JSON.stringify(data, null, "    "));
            found = true;
        }
    }
    if (!found) {
        await interaction.reply({
            content:
                "Unsuccessful. Did not find prediction number " +
                predictionNumber,
            ephemeral: true,
        });
        return;
    }
    // log
    const logThis = {
        question: predict.question,
        choice1: predict.choice1,
        choice2: predict.choice2,
        predictionNumber: predictionNumber,
        time: predict.time,
        answer: predict.answer,
    };
    Config.log(
        "Logging prediction from /result",
        JSON.stringify(logThis, null, "  ")
            .split("\n")
            .slice(1, 10)
            .map((str) => str.trim())
            .join("\n"),
        interaction
    );
    // Will make embed + give out points in due time.
    interaction.reply({
        content: "The result of the prediction is choice " + answer,
    });
}
