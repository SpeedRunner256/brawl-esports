import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { readFile } from "fs/promises";
import { Pun, PunData } from "../../modules/moduleTypes";
import { writeFile } from "fs/promises";

export const data = new SlashCommandBuilder()
    .setName("description")
    .setDescription("Add someone's description! (or edit it idk)")
    .addSubcommand((input) =>
        input
            .setName("add")
            .setDescription("New description for user")
            .addStringOption((input) =>
                input
                    .setName("names")
                    .setDescription(
                        "Names that trigger this embed, separated by ;"
                    )
                    .setRequired(true)
            )
            .addStringOption((input) =>
                input
                    .setName("id")
                    .setDescription("Discord ID of the user")
                    .setRequired(true)
            )
            .addStringOption((input) =>
                input
                    .setName("title")
                    .setDescription("title of the embed")
                    .setRequired(true)
            )
            .addStringOption((input) =>
                input
                    .setName("description")
                    .setDescription("description of the embed")
                    .setRequired(true)
            )
            .addStringOption((input) =>
                input
                    .setName("quotes")
                    .setDescription(
                        "Things this user says (their catchphrases), each separated by ;"
                    )
                    .setRequired(true)
            )
            .addIntegerOption((input) =>
                input
                    .setName("color")
                    .setDescription(
                        "Optionally, get a color here; format -> integer value string (8 digits)"
                    )
                    .setMinValue(0) // 0x00_00_00
                    .setMaxValue(16777215) // 0xff_ff_ff
                    .setRequired(false)
            )
    )
    .addSubcommand((input) =>
        input
            .setName("edit")
            .setDescription("Edit a pre-existing description")
            .addStringOption((input) =>
                input
                    .setName("id")
                    .setDescription("id of the user")
                    .setRequired(true)
            )
            .addStringOption((input) =>
                input
                    .setName("title")
                    .setDescription("Title of the embed")
                    .setRequired(false)
            )
            .addStringOption((input) =>
                input
                    .setName("description")
                    .setDescription("Description of the embed")
                    .setRequired(false)
            )
            .addStringOption((input) =>
                input
                    .setName("quotes")
                    .setDescription("Add more quotes from this guy")
                    .setRequired(false)
            )
            .addIntegerOption((input) =>
                input
                    .setName("color")
                    .setDescription("Color of embed")
                    .setMinValue(0)
                    .setMaxValue(16777215)
                    .setRequired(false)
            )
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    switch (sub) {
        case "add": {
            const names = interaction.options
                .getString("names", true)
                .split(";");
            const quotes = interaction.options
                .getString("quotes", true)
                .split(";");
            const id = interaction.options.getString("id", true);
            const title = interaction.options.getString("title", true);
            const color = interaction.options.getInteger("color", true);
            const description = interaction.options.getString(
                "description",
                true
            );
            const send = {
                names,
                id,
                random_quotes: quotes,
                embed: {
                    title,
                    description,
                    color,
                    footer: {
                        text: "Made for staff, by staff",
                        icon_url:
                            "https://cdn.discordapp.com/avatars/606080832750485527/f98e18c72ab0a728a915a9e93aa17354?size=1024",
                    },
                },
            } as Pun;
            const data: PunData = JSON.parse(
                await readFile("db/puns.json", "utf-8")
            );
            data.puns.push(send);
            await writeFile("db/puns.json", JSON.stringify(data, null, "    "));
            await interaction.reply({ content: "Done.", ephemeral: true });
            break;
        }
        case "edit": {
            const quote = interaction.options.getString("quotes");
            let quotes: string[] | undefined = undefined;
            if (quote) {
                quotes = quote.split(";");
            }
            const id = interaction.options.getString("id", true);
            const title = interaction.options.getString("title");
            const color = interaction.options.getInteger("color");
            const description = interaction.options.getString("description");
            const data: PunData = JSON.parse(
                await readFile("db/puns.json", "utf-8")
            );
            for (const pun in data.puns) {
                if (data.puns[pun].id === id) {
                    data.puns[pun].embed.title =
                        title ?? data.puns[pun].embed.title;
                    data.puns[pun].embed.color =
                        color ?? data.puns[pun].embed.color;
                    data.puns[pun].embed.description =
                        description ?? data.puns[pun].embed.description;
                    data.puns[pun].random_quotes =
                        quotes ?? data.puns[pun].random_quotes;
                }
            }
            await writeFile("db/puns.json", JSON.stringify(data, null, "    "));
            await interaction.reply({ content: "Done.", ephemeral: true });
            break;
        }
    }
}
