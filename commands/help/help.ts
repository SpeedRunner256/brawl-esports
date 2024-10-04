import {
    EmbedBuilder,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
} from "discord.js";
import { helpHelpEmbed } from "../../embedBuilders/helpEmbeds/helpHelp";
import { helpPollEmbed } from "../../embedBuilders/helpEmbeds/helpPoll";
import { helpPredictEmbed } from "../../embedBuilders/helpEmbeds/helpPredict";
import { helpSearchEmbed } from "../../embedBuilders/helpEmbeds/helpSearch";
import { helpInlineEmbed } from "../../embedBuilders/helpEmbeds/helpInline";
import { helpMatchEmebd } from "../../embedBuilders/helpEmbeds/helpMatch";

export const data = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Help for this bot.")
    .addStringOption((option) =>
        option
            .setName("command")
            .setDescription("Name of the command.")
            .setRequired(true)
            .addChoices([
                { name: "Help", value: "help" },
                { name: "Poll", value: "poll" },
                { name: "Predict", value: "predict" },
                { name: "Search", value: "search" },
                { name: "Inline", value: "inline" },
                { name: "Match", value: "search/match" },
            ])
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    let sendEmbed: EmbedBuilder;
    switch (interaction.options.getString("command")) {
        case "help":
            sendEmbed = await helpHelpEmbed();
            break;
        case "poll":
            sendEmbed = await helpPollEmbed();
            break;
        case "predict":
            sendEmbed = await helpPredictEmbed();
            break;
        case "search":
            sendEmbed = await helpSearchEmbed();
            break;
        case "inline":
            sendEmbed = await helpInlineEmbed();

            break;
        case "search/match":
            sendEmbed = await helpMatchEmebd();
            break;
        default:
            sendEmbed = new EmbedBuilder()
                .setTitle("typescript-eslint")
                .setDescription(
                    "Only for eslint to stop barking at me, I think getting default is impossible. But who am I to say. If you're seeing this, come to me with a screenshot of how this happened."
                );
    }
    await interaction.reply({
        embeds: [sendEmbed],
        ephemeral: true,
    });
}
