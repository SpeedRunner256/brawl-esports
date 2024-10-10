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
        .setDescription(
            `You may win ${mult}x your money if you win, or 0x if you lose.`,
        )
        .setColor(win ? 0x00ff00 : 0xff0000)
        .addFields([
            {
                name: "Bet",
                value: `${bet}`,
                inline: true,
            },
            {
                name: "Winnings",
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
                value: `${balance}`,
                inline: true,
            },
            {
                name: "New Balance",
                value: win ? `${bet * mult + balance}` : `${balance - bet}`,
                inline: true,
            },
            {
                name: "\u200b",
                value: "\u200b",
                inline: true,
            },
        ]);
    return answer;
}
