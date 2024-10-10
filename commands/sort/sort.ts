import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("sort")
    .setDescription("Get 10 results for a sort query.")
    .addSubcommand((input) =>
        input
            .setName("brawler")
            .setDescription("Last 10 matches this brawler was played in.")
            .addStringOption((input) =>
                input
                    .setName("name")
                    .setDescription("Name of the brawler")
                    .setRequired(true),
            ),
    )
    .addSubcommand((input) =>
        input
            .setName("team")
            .setDescription("Last 10 matches this team was in.")
            .addStringOption((input) =>
                input
                    .setName("name")
                    .setDescription("Name of the team")
                    .setRequired(true),
            ),
    )
    .addSubcommand((input) =>
        input
            .setName("player")
            .setDescription("Last 10 matches this player was in.")
            .addStringOption((input) =>
                input
                    .setName("name")
                    .setDescription("Name of the player")
                    .setRequired(true),
            ),
    );
export function execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    const name = interaction.options.getString("name");
    switch (sub) {
        case "brawler":
            break;
        case "team":
            break;
        case "player":
            break;
    }
}
