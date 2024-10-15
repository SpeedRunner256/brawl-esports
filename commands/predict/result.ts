import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { readFile, writeFile } from "node:fs/promises";
import { Config } from "../../modules/config.ts";
import { Economy } from "../../modules/economy/economy.ts";
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
            .setRequired(true)
            .setChoices([
                { name: "Choice 1", value: 1 },
                { name: "Choice 2", value: 2 },
            ])
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    const mult = await Config.mult(interaction.guildId);
    const predictionNumber = interaction.options.getInteger(
        "prediction_number",
    );
    const answer = interaction.options.getInteger("answer");
    const data = JSON.parse(await readFile("db/prediction.json", "utf8"));
    let predict;
    let found = false;
    for (const prediction of Object.keys(data)) {
        if (`${predictionNumber}` == prediction) {
            if (data[prediction].answer.hasAnswer) {
                await interaction.reply({
                    content:
                        `This prediction has already been answered choice ${
                            data[prediction].answer.answer
                        }.`,
                    ephemeral: true,
                });
                return;
            }
            predict = data[prediction];
            predict.answer = { hasAnswer: true, answer };
            data[prediction] = predict;
            writeFile("db/prediction.json", JSON.stringify(data, null, "    "));
            found = true;
        }
    }
    if (!found) {
        await interaction.reply({
            content: "Unsuccessful. Did not find prediction number " +
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
    // Finding percentage.
    const amount = predict.userChoices[1].length +
        predict.userChoices[2].length;
    const percent1 = (predict.userChoices[1].length / amount) * 100;
    const percent2 = (predict.userChoices[2].length / amount) * 100;
    let winnerPercent = 0;
    if (answer == 1) {
        winnerPercent = percent1;
    } else {
        winnerPercent = percent2;
    }
    Config.log(
        "Logging prediction from /result",
        JSON.stringify(logThis, null, "  ")
            .split("\n")
            .slice(1, 10)
            .map((str) => str.trim())
            .join("\n"),
        interaction,
    );
    // Make embed.
    const embed = new EmbedBuilder()
        .setTitle("Prediction results - " + logThis.question)
        .setDescription(`The results are out! It's choice ${answer}!`)
        .setColor(0x6441a5)
        .addFields([
            {
                name: ":one: " + logThis.choice1,
                value: `Votes: ${predict.userChoices[1].length}`,
                inline: true,
            },
            {
                name: ":two: " + logThis.choice2,
                value: `Votes: ${predict.userChoices[2].length}`,
                inline: true,
            },
            {
                name: "\u200b",
                value: "\u200b",
                inline: true,
            },
            {
                name: "Results",
                value: ` <:score:1291686743485059086> Total votes: ${amount}
                <:money:1292086783886233621> Total entry points: ${amount * 100}
                <:money:1292086783886233621> Total points given: ${
                    amount * winnerPercent * mult
                }
                \`\`\`Choice 1: ${
                    convertToAscii(
                        convertNumber(percent1),
                    )
                }: ${percent1}%\nChoice 2: ${
                    convertToAscii(
                        convertNumber(percent2),
                    )
                }: ${percent2}%\`\`\``,
                inline: false,
            },
        ]);
    // Give out points
    if (answer == 1) {
        const choices = predict.userChoices[1];
        for (const user of choices) {
            const ecoUser = await Economy.UserByID(user);
            if (!ecoUser) {
                throw new Error("User not in database.");
            }
            ecoUser.credit(100 * mult);
        }
    }
    if (answer == 2) {
        const choices = predict.userChoices[2];
        for (const user of choices) {
            const ecoUser = await Economy.UserByID(user);
            if (!ecoUser) {
                throw new Error("User not in database.");
            }
            ecoUser.credit(100 * mult);
        }
    }

    // Make Button
    const mineButton = new ButtonBuilder()
        .setCustomId("mine")
        .setLabel("My Balance")
        .setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(mineButton);

    const reply = await interaction.reply({
        embeds: [embed],
        components: [row],
    });

    // Do thing with "My Balance" button
    const collector = reply.createMessageComponentCollector({
        time: 40_000,
        componentType: ComponentType.Button,
    });
    collector.on("collect", async (i) => {
        const data = JSON.parse(await readFile("db/economy.json", "utf-8"));
        if (!Object.keys(data).includes(i.user.id)) {
            await i.reply({
                content:
                    "You aren't a part of the system yet. Consider typing /start.",
                ephemeral: true,
            });
            return;
        }
        const user = data[i.user.id];
        await i.reply({
            content: `You currently have ${user.balance} kash.`,
            ephemeral: true,
        });
    });
    collector.on("end", async () => {
        row.components[0].setDisabled(true);
        await interaction.editReply({
            components: [row],
        });
    });
}

// Helper
function convertNumber(number: number) {
    if (number >= 100) {
        return number;
    }

    const firstDigit = Math.floor(number / 10);
    return firstDigit * 10;
}
function convertToAscii(percentage: number) {
    percentage = percentage / 10;
    let answer = "";
    for (let i = 0; i < percentage; i++) {
        answer += "#";
    }
    return answer;
}
