import type { Interaction } from "discord.js";
import { Events } from "discord.js";

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(
            `No command matching ${interaction.commandName} was found.`
        );
        return;
    }
    try {
        await command.execute(interaction);
    } catch (error) {
        console.log("Some error");
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: `${error.name}: ${error.message}`,
                ephemeral:true,
            });
        } else {
            await interaction.reply({
                content: `${error.name}: ${error.message}`,
                ephemeral: true,
            });
        }
    }
}
