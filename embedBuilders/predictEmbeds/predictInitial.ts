import { EmbedBuilder } from "discord.js";

export function predictCreateInitial(
    question: string,
    choice1: string,
    choice2: string,
    time: string,
): EmbedBuilder {
    const answer = new EmbedBuilder()
        .setTitle(question)
        .setDescription(`Entries for this prediction **end in ${time}**`)
        .setColor(0x6441a5)
        .setFooter({ text: "Predict now!" })
        .setTimestamp()
        .setFooter({ text: "Voting requires 100 kash." })
        .addFields([
            {
                name: "Choice 1",
                value: choice1,
                inline: true,
            },
            {
                name: "Choice 2",
                value: choice2,
                inline: true,
            },
        ]);
    return answer;
}
