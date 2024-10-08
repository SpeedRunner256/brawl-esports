import { EmbedBuilder } from "@discordjs/builders";

export function gambleMakeEmbed(
    randomNum: number,
    win: boolean,
    bet: number,
    mult: number,
    balance: number,
): EmbedBuilder {
    const answer = new EmbedBuilder()
        .setTitle(win ? "You won!" : "You lost.")
        .setDescription("Results of your gambling.")
        .setColor(win ? 0x00ff00 : 0xff0000)
        .addFields([
            {
                name: "Bet",
                value: `${bet}`,
                inline: true,
            },
            {
                name: "Amount gained",
                value: win ? `${bet * mult}` : "0",
                inline: true,
            },
            {
                name: "\u200b",
                value: "\u200b",
                inline: true,
            },
            {
                name: "Old balance",
                value: `${balance},`,
                inline: true,
            },
            {
                name: "New Balance",
                value: win ? `${bet * mult + balance}` : `${balance - bet}`,
                inline: true,
            },
        ]);
    return answer;
}
