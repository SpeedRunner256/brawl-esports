import { EmbedBuilder } from "discord.js";

export function predictEndEmbed(question: string, time: string): EmbedBuilder {
    const answer = new EmbedBuilder()
        .setTitle("Predictions Closed")
        .setDescription(
            `This prediction has received all the votes it could. Please come back for the next one!\nPrediction entries ran for ${time}.`,
        )
        .setColor(0xf5428d)
        .setTimestamp();
    return answer;
}
