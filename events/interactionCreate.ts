import chalk from "chalk";
import type { Interaction } from "discord.js";
import { Events } from "discord.js";

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction) {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {
		console.log(
			`[${chalk.blueBright(new Date().toLocaleString())}]: Command ${chalk.yellowBright(
				interaction.commandName + " " + interaction.options.getSubcommandGroup() + " " + interaction.options.getSubcommand()
			)} was run by ${chalk.green(interaction.user.displayName)} (${interaction.user.username}, ${chalk.cyan(interaction.user.id)})`
		);
		await command.execute(interaction);
	} catch (err) {
		const error: Error = err as Error;
		console.log("Some error");
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: `${error.name}: ${error.message}`,
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				content: `${error.name}: ${error.message}`,
				ephemeral: true,
			});
		}
	}
}
