import { EmbedBuilder } from "@discordjs/builders";
import {
    ChatInputCommandInteraction,
    Colors,
    SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help for any command on this bot.")
    .addStringOption((input) =>
        input
            .setName("command")
            .setDescription("Type the command name here.")
            .addChoices([
                { name: "start", value: "start" },
                { name: "match", value: "match" },
                { name: "picks", value: "picks" },
                { name: "poll", value: "poll" },
                { name: "predict", value: "predict" },
                { name: "result", value: "result" },
                { name: "search", value: "search" },
                { name: "sortby", value: "sortby" },
                { name: "group", value: "group" },
            ])
            .setRequired(true)
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    const command = interaction.options.getString("command");
    if (!command) {
        throw new Error("No command mentioned");
    }
    const embed = new EmbedBuilder()
        .setTitle("Help")
        .setTimestamp()
        .setColor(Colors.Blurple)
        .setFooter({ text: "For more questions, send a message at modmail." });
    switch (command) {
        case "start":
            embed.addFields([
                {
                    name: "Working",
                    value:
                        "Just type out /start, and you'll begin your account and will then be able to take part in predictions",
                },
            ]);
            break;
        case "match":
            embed.addFields([
                {
                    name: "Working - Event Organizer Only",
                    value:
                        "Given the link of a match, generate match summaries for it. To get link, just go to the liquipedia website and do a search.",
                },
            ]);
            break;
        case "picks":
            embed.addFields([
                {
                    name: "Working",
                    value:
                        "Competitively viable picks and bans with more detailed percentages for any map (which has been played before in a tournament) or gamemode.",
                },
            ]);
            break;
        case "poll":
            embed.addFields([
                {
                    name: "Working - Event Organizer Only",
                    value:
                        "1. **Channel**: Put the channel for the poll to be in\n2. **Question**: The question of the poll -> `Who wins the MVP vote based on this game?`\n3. **Answers**: Separated by ;, each answer represents a choice that the user can put in -> `The earth is round; The earth is flat; The earth is a rhombicosidodecahedron.`\n4. **Emojis**: Same format as answers, put your emoji in and add in a ; in between each one, no spaces -> :nerd:;:sob:;:cat:\n5. **Time**, put time in as an integer in hours, no decimal places. -> 1 = 1 hour, 5 = 5 hours, for a maximum time of 768 hours. (Do not try that though)\n6. (Optional) Allow Multi Select: Allow users to select multiple answers, auto-selected to false - users will not be able to multi select if you do not put this as a choice.",
                },
            ]);
            break;
        case "predict":
            embed.addFields([
                {
                    name: "Working - Event Organizer Only",
                    value:
                        "Similar to polls, but only 2 choices and a definite answer, given sometime later, at which point people get kash.",
                },
            ]);
            break;
        case "result":
            embed.addFields([
                {
                    name: "Working - Event Organizer Only",
                    value:
                        "When a prediction ends, the organizer who started the event gets a 'prediction number' that they have to save. This is the identification of the prediction and will be used to define the answer, and hence give out points.",
                },
            ]);
            break;
        case "search":
            embed.addFields([
                {
                    name: "Working",
                    value:
                        "Search summaries of teams, maps, brawlers or players. Player images are not availabe here because we cannot display them without facing legal action.",
                },
            ]);
            break;
        case "sortby":
            embed.addFields([
                {
                    name: "Working",
                    value:
                        "Sort matches based on date - the latest comes on top, and either a brawler, a player or a team. This will show as many as it can see, though the maximum amount is 20.",
                },
            ]);
            break;
        case "group":
            embed.addFields([
                {
                    name: "Working - Event Organizer Only",
                    value:
                        "Group A/B/C/D info for any event that has groups (think the LCQ or the world finals). Events like monthly finals don't have groups and this command is compeltely useless for that instance.",
                },
            ]);
            break;
    }
    await interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });
}
