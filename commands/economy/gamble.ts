import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { Economy } from "../../modules/economy/economy";
import { Config } from "../../modules/config";
import { gambleMakeEmbed } from "./gambleEmbed";
export const data = new SlashCommandBuilder()
    .setName("gamble")
    .setDescription("Gamble your life savings away.")
    .addStringOption((option) =>
        option
            .setName("amount")
            .setRequired(true)
            .setDescription(
                "Amount to gamble. May be amount or a percentage of your wealth",
            ),
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getString("amount")?.trim();
    if (!amount) {
        throw new Error("No amount set.");
    }

    const ecoUser = await Economy.UserByID(interaction.user.id);
    if (!ecoUser) {
        await interaction.reply({
            content: "You are not registered, consider typing /start.",
            ephemeral: true,
        });
        return;
    }
    if ((Date.now() - ecoUser.lastGambleTime) / 1000 < 120) {
        await interaction.reply({
            content: "You must wait for a while before you can gamble again.",
            ephemeral: true,
        });
        return;
    }
    ecoUser.time(Date.now());
    const balance = ecoUser.balance;
    const bet = amountSetting(amount, ecoUser.balance);
    ecoUser.debit(bet);
    const mult = await Config.mult(interaction.guildId);
    const randomNum = Math.random();
    let win = false;
    if (randomNum > 0.435) {
        win = true;
    }
    (() => (win ? ecoUser.credit(bet * mult) : ecoUser.credit(0)))();
    const embed = gambleMakeEmbed(randomNum, win, bet, mult, balance);
    await interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });
}

function amountSetting(amount: string, balance: number) {
    try {
        if (+amount) {
            return +amount;
        } else {
            return 0;
        }
    } catch {
        return 0;
    }
    if (amount.toLowerCase() === "all") {
        return balance;
    }
    if (amount.endsWith("%")) {
        return Math.floor((+amount.split("%")[0] / 100) * balance);
    }
}
